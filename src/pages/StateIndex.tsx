import { Link } from 'react-router-dom';
import { RETIRE_STATES } from '../data/retireStates';
import { usePageSeo } from '../lib/seo';

// =========================================================================
// 51개 주(50개 주 + DC) 401(k) 인출 세율, 주 추가 페널티, 은퇴 소득 면세 여부 비교 페이지
// =========================================================================

export default function StateIndex() {
  usePageSeo({
    title: '401(k) Early Withdrawal & Retirement Tax Calculator by State (2026) | Retire401kSmart',
    description:
      'Compare 2026 state income tax rates on 401(k) distributions, state early withdrawal penalties, and retirement-friendly tax-free states across all 50 US states and DC.',
    path: '/401k-state',
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-bold text-slate-900">
          US 401(k) Early Withdrawal &amp; Retirement Tax Calculator by State (2026)
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Select your state below to calculate your net 401(k) cash-out payout after the 10% IRS
          early withdrawal penalty, 20% mandatory withholding, and state income taxes.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-semibold">
                <th className="p-3">State</th>
                <th className="p-3">401(k) State Tax</th>
                <th className="p-3">Extra State Penalty</th>
                <th className="p-3">401(k) Exempt at 59½+?</th>
                <th className="p-3">Social Security Taxed?</th>
                <th className="p-3">Calculator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {RETIRE_STATES.map((st) => (
                <tr key={st.slug} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">
                    <Link to={`/401k-state/${st.slug}`} className="text-blue-600 hover:underline">
                      {st.name} ({st.abbr})
                    </Link>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">
                    {st.state401kTaxPct.toFixed(2)}%
                  </td>
                  <td className="p-3">
                    {st.stateEarlyPenaltyPct > 0 ? (
                      <span className="inline-block rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                        +{st.stateEarlyPenaltyPct}% Penalty
                      </span>
                    ) : (
                      <span className="text-slate-500">None (0%)</span>
                    )}
                  </td>
                  <td className="p-3">
                    {st.exempts401kAtRetirement ? (
                      <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        Tax-Free (0%)
                      </span>
                    ) : (
                      <span className="text-slate-600">Taxed</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-700">
                    {st.taxesSocialSecurity ? 'Partial/Yes' : 'No (Exempt)'}
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/401k-state/${st.slug}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Calculate Payout &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

