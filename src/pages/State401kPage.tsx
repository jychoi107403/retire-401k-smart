import { Link, useParams } from 'react-router-dom';
import EarlyWithdrawalCalculator from '../components/EarlyWithdrawalCalculator';
import { RETIRE_STATES, findRetireStateBySlug } from '../data/retireStates';
import { calculate401kEarlyWithdrawal } from '../lib/retire401kCalc';
import { usePageSeo } from '../lib/seo';

// =========================================================================
// 주(State)별 401(k) 중도인출 실수령액 & 은퇴 세금 전용 SEO 페이지 (/401k-state/:state)
// =========================================================================

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function State401kPage() {
  const { state = '' } = useParams<{ state: string }>();
  const stateInfo = findRetireStateBySlug(state);

  usePageSeo({
    title: stateInfo
      ? `${stateInfo.name} 401(k) Early Withdrawal & Retirement Tax Calculator (2026)`
      : 'State 401(k) Calculator | Retire401kSmart',
    description: stateInfo
      ? `Calculate how much cash you keep from a 401(k) early withdrawal in ${stateInfo.name}. Includes the 10% IRS penalty, ${stateInfo.state401kTaxPct}% ${stateInfo.abbr} state tax${stateInfo.stateEarlyPenaltyPct > 0 ? `, plus ${stateInfo.stateEarlyPenaltyPct}% extra state penalty` : ''}.`
      : 'State 401(k) early withdrawal and retirement tax calculator.',
    path: stateInfo ? `/401k-state/${stateInfo.slug}` : '/401k-state',
  });

  if (!stateInfo) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">State Not Found</h1>
        <Link to="/401k-state" className="mt-4 inline-block font-semibold text-blue-600 underline">
          Browse all 50 US states &rarr;
        </Link>
      </div>
    );
  }

  const sampleAmounts = [10000, 25000, 50000, 100000];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-xs text-slate-500">
          <Link to="/" className="hover:underline">
            Home
          </Link>{' '}
          &rsaquo;{' '}
          <Link to="/401k-state" className="hover:underline">
            States
          </Link>{' '}
          &rsaquo; <span className="font-semibold text-slate-700">{stateInfo.name}</span>
        </div>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {stateInfo.name} ({stateInfo.abbr}) 401(k) Early Withdrawal &amp; Cash-Out Calculator
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Thinking about cashing out your 401(k) or Traditional IRA in{' '}
          <strong>{stateInfo.name}</strong>? {stateInfo.retireRuleNote}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">{stateInfo.abbr} 401(k) State Tax</div>
            <div className="mt-1 text-xl font-bold text-slate-900">
              {stateInfo.state401kTaxPct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">IRS Early Penalty</div>
            <div className="mt-1 text-xl font-bold text-rose-600">10.0%</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">{stateInfo.abbr} Extra Early Penalty</div>
            <div className="mt-1 text-xl font-bold text-slate-900">
              {stateInfo.stateEarlyPenaltyPct.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">Social Security Taxed?</div>
            <div className="mt-1 text-xl font-bold text-emerald-700">
              {stateInfo.taxesSocialSecurity ? 'Yes (Partial)' : 'No (0%)'}
            </div>
          </div>
        </div>
      </div>

      <EarlyWithdrawalCalculator key={stateInfo.slug} initialState={stateInfo} />

      {/* 인출 금액별 실수령액 예시 표 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">
          {stateInfo.name} 401(k) Early Withdrawal Net Payout Examples (Under Age 59½)
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Assumes a 38-year-old Single filer earning $75,000/year in {stateInfo.name}:
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-semibold">
                <th className="p-3">401(k) Cash-Out</th>
                <th className="p-3">IRS + {stateInfo.abbr} Penalty</th>
                <th className="p-3">Fed + {stateInfo.abbr} Tax</th>
                <th className="p-3">Net Cash in Hand</th>
                <th className="p-3">Lost Value at Age 65</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sampleAmounts.map((amt) => {
                const sample = calculate401kEarlyWithdrawal({
                  withdrawalAmount: amt,
                  currentAge: 38,
                  targetRetirementAge: 65,
                  annualSalaryIncome: 75000,
                  filingStatus: 'single',
                  stateTaxPct: stateInfo.state401kTaxPct,
                  stateEarlyPenaltyPct: stateInfo.stateEarlyPenaltyPct,
                  exceptionType: 'none',
                  expectedAnnualReturnPct: 7.5,
                });
                return (
                  <tr key={amt} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{usd(amt)}</td>
                    <td className="p-3 text-rose-600 font-medium">
                      -{usd(sample.irs10PctPenalty + sample.statePenaltyAmount)}
                    </td>
                    <td className="p-3 text-slate-700">
                      -{usd(sample.federalTaxAmount + sample.stateTaxAmount)}
                    </td>
                    <td className="p-3 font-bold text-emerald-700">{usd(sample.netCashInHand)}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      {usd(sample.lostFutureRetirementValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 주별 자주 묻는 질문 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          {stateInfo.name} 401(k) Withdrawal &amp; Retirement Tax FAQs
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">
              How much tax do I pay on an early 401(k) withdrawal in {stateInfo.name}?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              {stateInfo.retireRuleNote} When combined with the 10% IRS early distribution penalty
              and federal income tax (typically 12% to 24%), most workers in {stateInfo.name} lose
              between 25% and 40% of an early 401(k) cash-out.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">
              How can I avoid the 10% 401(k) penalty in {stateInfo.name}?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Instead of cashing out, you can request a <strong>Direct Rollover</strong> to a
              Traditional IRA or new employer&apos;s 401(k) with $0 tax and $0 penalty, take a{' '}
              <strong>401(k) Loan</strong> (up to 50% of your vested balance, capped at $50,000), or
              qualify under the <strong>IRS Rule of 55</strong> if you leave your job during or
              after the calendar year you turn 55.
            </p>
          </div>
        </div>
      </div>

      {/* 다른 주 빠른 이동 링크 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">
          Compare 401(k) Withdrawal Taxes in Other US States
        </h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {RETIRE_STATES.map((s) => (
            <Link
              key={s.slug}
              to={`/401k-state/${s.slug}`}
              className={`rounded-md border px-2.5 py-1 font-medium ${
                s.slug === stateInfo.slug
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-400'
              }`}
            >
              {s.name} ({s.state401kTaxPct}%)
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

