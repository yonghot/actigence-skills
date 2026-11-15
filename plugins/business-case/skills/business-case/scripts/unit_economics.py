#!/usr/bin/env python3
"""단위 경제 계산기 — 기여이익 · 손익분기 CAC · 필요 CPC 역산.

대부분의 소비자 사업은 원가가 아니라 획득비용으로 죽는다. 그래서 이 스크립트의
결론은 마진율이 아니라 마지막 두 표(손익분기 CAC, 전환율별 필요 CPC)다.

실행: python3 --version 이 동작하면 python3, 아니면 python(Windows 는 py -3). 표준 라이브러리만 쓴다.

예시:
  # 9,900원 상품, 부가세 포함, PG 3%, 변동원가 260~960원
  python3 unit_economics.py --price 9900 --vat-included --pg-rate 0.03 \\
      --variable 260 380 964 --variable-labels "텍스트" "스캔1장" "사진3장+재시도"

  # PG 수수료를 부가세 제외 순매출 기준으로 볼 때 (기본은 결제금액 전체 기준)
  python3 unit_economics.py --price 9900 --vat-included --pg-on net --variable 380

  # LLM API 원가부터 계산 (입력 $5 / 출력 $25 per MTok, 환율 1400)
  python3 unit_economics.py --price 9900 --vat-included --pg-rate 0.03 \\
      --llm-in-tok 9000 --llm-out-tok 12000 --llm-in-usd 5 --llm-out-usd 25 --fx 1400
"""
import argparse
import sys

# Windows Korean consoles default to cp949, which cannot encode em-dash or ₩.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")


def fmt(n, unit="원"):
    return f"{round(n):,}{unit}"


def main():
    p = argparse.ArgumentParser(
        description="단위 경제 · 손익분기 CAC · 필요 CPC 계산",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    p.add_argument("--price", type=float, required=True, help="판매가")
    p.add_argument("--vat-rate", type=float, default=0.10, help="부가세율 (기본 0.10)")
    p.add_argument("--vat-included", action="store_true",
                   help="판매가에 부가세가 포함돼 있으면 지정. 미지정이면 별도로 본다")
    p.add_argument("--pg-rate", type=float, default=0.03, help="결제 수수료율 (기본 0.03)")
    p.add_argument("--pg-on", choices=["gross", "net"], default="gross",
                   help="수수료율을 곱할 기준. gross=결제금액 전체(부가세 포함, 기본), net=부가세 제외 순매출")
    p.add_argument("--pg-fixed", type=float, default=0.0,
                   help="결제 건당 정액 수수료. 소액 상품에서 비중이 커진다")
    p.add_argument("--variable", type=float, nargs="+", default=[0.0],
                   help="변동원가 시나리오들 (최선 전형 최악 순 권장)")
    p.add_argument("--variable-labels", nargs="+", default=None, help="각 시나리오 이름")
    p.add_argument("--infra", type=float, default=0.0, help="건당 인프라 비용")
    p.add_argument("--refund-rate", type=float, default=0.0,
                   help="환불률 (0~1). 환불은 소액 상품 마진을 직접 갉아먹는다")
    p.add_argument("--support", type=float, default=0.0, help="건당 고객지원 기대비용")
    p.add_argument("--conversions", type=float, nargs="+",
                   default=[0.01, 0.02, 0.03, 0.05, 0.10], help="필요 CPC 역산에 쓸 전환율들")
    p.add_argument("--currency", default="원")
    # LLM 원가를 직접 계산할 때
    p.add_argument("--llm-in-tok", type=float, help="입력 토큰 수")
    p.add_argument("--llm-out-tok", type=float, help="출력 토큰 수 (사고 토큰 포함)")
    p.add_argument("--llm-in-usd", type=float, help="입력 USD per MTok")
    p.add_argument("--llm-out-usd", type=float, help="출력 USD per MTok")
    p.add_argument("--fx", type=float, default=1.0, help="USD→현지통화 환율")
    p.add_argument("--retries", type=int, default=1, help="최악의 경우 총 호출 횟수")
    a = p.parse_args()

    cur = a.currency
    variables = list(a.variable)
    labels = a.variable_labels or [f"시나리오{i+1}" for i in range(len(variables))]

    if a.llm_in_tok and a.llm_out_tok and a.llm_in_usd and a.llm_out_usd:
        if a.variable != [0.0]:
            print("경고: --llm-* 가 --variable 값을 덮어쓴다. --variable 은 무시된다.", file=sys.stderr)
        one = (a.llm_in_tok * a.llm_in_usd + a.llm_out_tok * a.llm_out_usd) / 1_000_000 * a.fx
        print("=" * 62)
        print("LLM API 원가")
        print("=" * 62)
        print(f"  입력 {a.llm_in_tok:,.0f} tok × ${a.llm_in_usd}/MTok")
        print(f"  출력 {a.llm_out_tok:,.0f} tok × ${a.llm_out_usd}/MTok")
        print(f"  1회 호출 원가 : {fmt(one, cur)}")
        print(f"  {a.retries}회 호출 시  : {fmt(one * a.retries, cur)}")
        print()
        variables = [one, one * a.retries]
        labels = ["1회 호출", f"{a.retries}회 호출(재시도)"]

    net = a.price / (1 + a.vat_rate) if a.vat_included else a.price
    vat = a.price - net if a.vat_included else a.price * a.vat_rate
    gross = a.price if a.vat_included else a.price + vat
    pg = (gross if a.pg_on == "gross" else net) * a.pg_rate + a.pg_fixed
    refund = a.price * a.refund_rate

    print("=" * 62)
    print("단위 경제 — 매출 1건의 해부")
    print("=" * 62)
    print(f"  판매가{' (부가세 포함)' if a.vat_included else ' (부가세 별도)':<18}{fmt(a.price, cur):>16}")
    print(f"  {'− 부가세':<24}{fmt(-vat, cur):>16}")
    print(f"  {'= 순매출':<24}{fmt(net, cur):>16}")
    print(f"  {'− 결제 수수료':<24}{fmt(-pg, cur):>16}"
          f"   ({a.pg_rate*100:.1f}% of {'결제금액' if a.pg_on == 'gross' else '순매출'}" + (f" + 정액 {fmt(a.pg_fixed, cur)}" if a.pg_fixed else "") + ")")
    if a.infra:
        print(f"  {'− 인프라':<24}{fmt(-a.infra, cur):>16}")
    if a.support:
        print(f"  {'− 고객지원':<24}{fmt(-a.support, cur):>16}")
    if refund:
        print(f"  {'− 환불 기대비용':<24}{fmt(-refund, cur):>16}   (환불률 {a.refund_rate*100:.1f}%)")
    print()

    fixed_costs = pg + a.infra + a.support + refund
    results = []
    print(f"  {'변동원가 시나리오':<26}{'변동원가':>12}{'기여이익':>13}{'마진율':>9}")
    print("  " + "-" * 58)
    for label, v in zip(labels, variables):
        contrib = net - fixed_costs - v
        pct = contrib / net * 100 if net else 0
        results.append((label, v, contrib, pct))
        print(f"  {label:<26}{fmt(-v, cur):>12}{fmt(contrib, cur):>13}{pct:>8.1f}%")

    print()
    print("=" * 62)
    print("손익분기 CAC — 기여이익을 넘으면 팔수록 손해다")
    print("=" * 62)
    for label, _v, contrib, _pct in results:
        verdict = "" if contrib > 0 else "   ← 이미 적자. CAC 와 무관하게 성립 불가"
        print(f"  {label:<26}CAC {fmt(contrib, cur):>12} 이하{verdict}")

    print()
    print("=" * 62)
    print("전환율별 감당 가능한 최대 CPC")
    print("=" * 62)
    print("  이 값을 해당 카테고리의 '실측 CPC' 와 나란히 놓아라.")
    print("  실측 CPC 가 크게 높으면 유료 검색은 구조적으로 불가능하고,")
    print("  사업 성립 여부는 무료 채널·업셀·제휴로만 결정된다.")
    print()
    header = f"  {'방문→결제 전환율':<20}" + "".join(f"{l[:14]:>16}" for l, _, _, _ in results)
    print(header)
    print("  " + "-" * (len(header) - 2))
    for cr in a.conversions:
        row = f"  {cr*100:>17.1f}%  "
        for _l, _v, contrib, _p in results:
            row += f"{fmt(max(contrib, 0) * cr, cur):>16}"
        print(row)

    print()
    print("  참고: LTV/CAC ≥ 3 이 통상 건강 기준이다. 1회성 구매라 LTV ≈ 기여이익이면")
    print("        감당 가능한 CAC 는 위 값의 1/3 로 봐야 성장 자금을 만들 수 있다.")


if __name__ == "__main__":
    main()
