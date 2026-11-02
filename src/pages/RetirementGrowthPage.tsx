import { useState, useMemo } from 'react';
import { calculate401kGrowth } from '../lib/retire401kCalc';
import { usePageSeo } from '../lib/seo';

// =========================================================================
// 401(k) & 고용주 매칭(Employer Match) 복리 은퇴 자산 성장 계산기 페이지 (/growth)
// =========================================================================

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function RetirementGrowthPage() {
  usePageSeo({
    title: '401(k) Retirement Growth & Employer Match Calculator (2026) | Retire401kSmart',
    description:
      'Project your future 401(k) retirement balance with compound interest, 2026 IRS contribution limits ($23,500), employer matching, and the 4% safe withdrawal rule.',
    path: '/growth',
  });

  const [currentAge, setCurrentAge] = useState<number>(32);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [current401kBalance, setCurrent401kBalance] = useState<number>(45000);
  const [annualSalary, setAnnualSalary] = useState<number>(90000);
  const [employeeContributionPct, setEmployeeContributionPct] = useState<number>(10);
  const [employerMatchPct, setEmployerMatchPct] = useState<number>(100);
  const [employerMatchCapPct, setEmployerMatchCapPct] = useState<number>(4);
  const [expectedAnnualReturnPct, setExpectedAnnualReturnPct] = useState<number>(8.0);

  const result = useMemo(
    () =>
      calculate401kGrowth({
        currentAge,
        retirementAge,
        current401kBalance,
        annualSalary,
        employeeContributionPct,
        employerMatchPct,
        employerMatchCapPct,
        expectedAnnualReturnPct,
      }),
    [
      currentAge,
      retirementAge,
      current401kBalance,
      annualSalary,
      employeeContributionPct,
      employerMatchPct,
      employerMatchCapPct,
      expectedAnnualReturnPct,
    ]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Compound Interest &amp; Free Employer Match
        </span>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          401(k) Retirement Growth &amp; Employer Match Calculator
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          See how your current 401(k) balance, personal contributions, and free employer matching
          compound over time—and estimate your monthly retirement paycheck using the{' '}
          <strong>4% Safe Withdrawal Rule</strong>.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Current Age
                </label>
                <input
                  type="number"
                  min={18}
                  max={80}
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Target Retirement Age
                </label>
                <input
                  type="number"
                  min={45}
                  max={85}
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Current 401(k) Balance ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={2500}
                  value={current401kBalance}
                  onChange={(e) => setCurrent401kBalance(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Annual Gross Salary ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={2500}
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Your Contrib (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={1}
                  value={employeeContributionPct}
                  onChange={(e) => setEmployeeContributionPct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Employer Match (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  step={25}
                  value={employerMatchPct}
                  onChange={(e) => setEmployerMatchPct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Match Cap (% Salary)
                </label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  step={0.5}
                  value={employerMatchCapPct}
                  onChange={(e) => setEmployerMatchCapPct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Annual Return (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  step={0.5}
                  value={expectedAnnualReturnPct}
                  onChange={(e) => setExpectedAnnualReturnPct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-slate-900 p-6 text-white space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Projected 401(k) Balance at Age {retirementAge}
              </div>
              <div className="mt-1 text-4xl font-extrabold text-white">
                {usd(result.projectedRetirementBalance)}
              </div>
              <div className="mt-1 text-xs text-blue-300 font-medium">
                4% Rule Monthly Retirement Income:{' '}
                <strong>{usd(result.monthlyIncome4PctRule)} / mo</strong>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Employee Contribution:</span>
                <span className="font-semibold text-white">
                  {usd(result.annualEmployeeContribution)} / yr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Free Annual Employer Match:</span>
                <span className="font-semibold text-emerald-300">
                  +{usd(result.annualEmployerMatch)} / yr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">
                  Total Employer Match Over {result.yearsInvested} Yrs:
                </span>
                <span className="font-semibold text-emerald-300">
                  {usd(result.totalEmployerMatchReceived)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Compound Investment Growth:</span>
                <span className="font-semibold text-blue-300">
                  {usd(result.totalInvestmentGrowth)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

