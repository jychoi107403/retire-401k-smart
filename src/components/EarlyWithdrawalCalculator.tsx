import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RETIRE_STATES, RetireStateInfo } from '../data/retireStates';
import {
  calculate401kEarlyWithdrawal,
  PenaltyExceptionType,
} from '../lib/retire401kCalc';
import { save401kScenario } from '../lib/supabase';

// =========================================================================
// 미국 401(k)·Traditional IRA 중도인출 실수령액 & 페널티 메인 계산기
// - 10% IRS 조기 인출 페널티, 캘리포니아 등 주 정부 추가 페널티,
//   연방/주 소득세, 그리고 은퇴 시점의 기회비용 손실액까지 즉시 계산합니다.
// =========================================================================

interface EarlyWithdrawalCalculatorProps {
  initialState?: RetireStateInfo;
  initialWithdrawal?: number;
}

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function EarlyWithdrawalCalculator({
  initialState,
  initialWithdrawal = 25000,
}: EarlyWithdrawalCalculatorProps) {
  const defaultState =
    initialState || RETIRE_STATES.find((s) => s.slug === 'california') || RETIRE_STATES[0];

  const [selectedStateSlug, setSelectedStateSlug] = useState<string>(defaultState.slug);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(initialWithdrawal);
  const [currentAge, setCurrentAge] = useState<number>(38);
  const [targetRetirementAge, setTargetRetirementAge] = useState<number>(65);
  const [annualSalaryIncome, setAnnualSalaryIncome] = useState<number>(75000);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [stateTaxPct, setStateTaxPct] = useState<number>(defaultState.state401kTaxPct);
  const [stateEarlyPenaltyPct, setStateEarlyPenaltyPct] = useState<number>(
    defaultState.stateEarlyPenaltyPct
  );
  const [exceptionType, setExceptionType] = useState<PenaltyExceptionType>('none');
  const [expectedAnnualReturnPct, setExpectedAnnualReturnPct] = useState<number>(7.5);

  const [scenarioNote, setScenarioNote] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const currentStateInfo = useMemo(
    () => RETIRE_STATES.find((s) => s.slug === selectedStateSlug) || defaultState,
    [selectedStateSlug, defaultState]
  );

  const handleStateChange = (newSlug: string) => {
    setSelectedStateSlug(newSlug);
    const st = RETIRE_STATES.find((s) => s.slug === newSlug);
    if (st) {
      setStateTaxPct(st.state401kTaxPct);
      setStateEarlyPenaltyPct(st.stateEarlyPenaltyPct);
    }
  };

  const result = useMemo(
    () =>
      calculate401kEarlyWithdrawal({
        withdrawalAmount,
        currentAge,
        targetRetirementAge,
        annualSalaryIncome,
        filingStatus,
        stateTaxPct,
        stateEarlyPenaltyPct,
        exceptionType,
        expectedAnnualReturnPct,
      }),
    [
      withdrawalAmount,
      currentAge,
      targetRetirementAge,
      annualSalaryIncome,
      filingStatus,
      stateTaxPct,
      stateEarlyPenaltyPct,
      exceptionType,
      expectedAnnualReturnPct,
    ]
  );

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    const res = await save401kScenario({
      state_slug: selectedStateSlug,
      withdrawal_amount: withdrawalAmount,
      federal_tax_amount: result.federalTaxAmount,
      state_tax_amount: result.stateTaxAmount,
      penalty_amount: result.irs10PctPenalty + result.statePenaltyAmount,
      net_payout_cash: result.netCashInHand,
      lost_future_value: result.lostFutureRetirementValue,
      note: scenarioNote,
    });
    setIsSaving(false);
    if (res.success) {
      setSaveMessage('401(k) scenario encrypted & saved!');
      setScenarioNote('');
    } else {
      setSaveMessage('Saved locally to browser.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              2026 IRS 10% Penalty, 20% Withholding &amp; State Tax Rules
            </span>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              401(k) Early Withdrawal &amp; Cash-Out Net Payout Calculator
            </h2>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-slate-500">Selected State 401(k) Rules</div>
            <Link
              to={`/401k-state/${currentStateInfo.slug}`}
              className="text-sm font-bold text-blue-600 underline hover:text-blue-800"
            >
              {currentStateInfo.name} ({currentStateInfo.state401kTaxPct}% Avg State Tax) &rarr;
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 왼쪽 입력 영역 (7칸) */}
          <div className="space-y-5 lg:col-span-7">
            {/* 1. 거주 주(State) 및 신고 유형 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  1. Select Your State
                </label>
                <select
                  value={selectedStateSlug}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
                >
                  {RETIRE_STATES.map((st) => (
                    <option key={st.slug} value={st.slug}>
                      {st.name} ({st.abbr}) — {st.state401kTaxPct}% Tax
                      {st.stateEarlyPenaltyPct > 0
                        ? ` + ${st.stateEarlyPenaltyPct}% State Penalty`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  2. IRS Filing Status
                </label>
                <select
                  value={filingStatus}
                  onChange={(e) => setFilingStatus(e.target.value as 'single' | 'married')}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
                >
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                </select>
              </div>
            </div>

            <p className="rounded-lg bg-blue-50/70 border border-blue-100 p-3 text-xs text-slate-700">
              <strong>{currentStateInfo.name} 401(k) Tax Rule:</strong>{' '}
              {currentStateInfo.retireRuleNote}
            </p>

            {/* 2. 인출 금액 및 현재 연봉 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  401(k) / IRA Withdrawal Amount ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {[10000, 25000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWithdrawalAmount(preset)}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                      ${(preset / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Your Current Annual Salary / Income ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={2500}
                  value={annualSalaryIncome}
                  onChange={(e) => setAnnualSalaryIncome(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
                <span className="mt-1 block text-[11px] text-slate-500">
                  Determines your federal marginal tax bracket ({result.federalMarginalRatePct}%).
                </span>
              </div>
            </div>

            {/* 3. 현재 나이, 은퇴 목표 나이, IRS 페널티 예외 조건 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Your Current Age
                </label>
                <input
                  type="number"
                  min={18}
                  max={85}
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Target Retirement Age
                </label>
                <input
                  type="number"
                  min={50}
                  max={85}
                  value={targetRetirementAge}
                  onChange={(e) => setTargetRetirementAge(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Est. Annual Growth (%)
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

            {/* 4. 조기 인출 페널티 예외 사유 선택 */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                IRS 10% Early Withdrawal Penalty Exception Status
              </label>
              <select
                value={exceptionType}
                onChange={(e) => setExceptionType(e.target.value as PenaltyExceptionType)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="none">
                  Standard Cash-Out Under Age 59½ (10% IRS Penalty Applies)
                </option>
                <option value="age_59_half">
                  Age 59½ or Older (0% Penalty - Normal Retirement Distribution)
                </option>
                <option value="rule_of_55">
                  IRS Rule of 55 (Left Employer at Age 55+ — 0% Penalty)
                </option>
                <option value="hardship_medical">
                  Qualified IRS Exception (Birth/Adoption $5k, Disability, Medical &gt;7.5% AGI)
                </option>
              </select>
            </div>
          </div>

          {/* 오른쪽 실시간 결과 영역 (5칸) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-slate-900 p-6 text-white">
            <div className="space-y-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Net Cash You Actually Take Home
                </div>
                <div className="mt-1 text-4xl font-extrabold tracking-tight text-white">
                  {usd(result.netCashInHand)}
                </div>
                <div className="mt-1 text-xs text-rose-300 font-medium">
                  You lose <strong>{usd(result.totalTaxesAndPenalties)}</strong> (
                  {result.effectiveLossPct.toFixed(1)}% of your withdrawal) to taxes &amp; penalties!
                </div>
              </div>

              {/* 공제 상세 내역 */}
              <div className="rounded-xl bg-slate-800/90 p-4 space-y-2 text-xs">
                <div className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-700 pb-1.5">
                  401(k) Cash-Out Tax &amp; Penalty Breakdown
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross 401(k) Withdrawal:</span>
                  <span className="font-semibold text-white">{usd(result.grossWithdrawal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    10% IRS Early Withdrawal Penalty:
                  </span>
                  <span className="font-semibold text-rose-300">
                    -{usd(result.irs10PctPenalty)}
                  </span>
                </div>
                {result.statePenaltyAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      {currentStateInfo.name} Extra Early Penalty ({stateEarlyPenaltyPct}%):
                    </span>
                    <span className="font-semibold text-rose-300">
                      -{usd(result.statePenaltyAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Est. Federal Income Tax ({result.federalMarginalRatePct}% bracket):
                  </span>
                  <span className="font-semibold text-amber-300">
                    -{usd(result.federalTaxAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    {currentStateInfo.name} State Tax ({stateTaxPct.toFixed(2)}%):
                  </span>
                  <span className="font-semibold text-amber-300">
                    -{usd(result.stateTaxAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 text-sm font-bold">
                  <span className="text-emerald-400">Net Payout After Taxes &amp; Penalties:</span>
                  <span className="text-emerald-400">{usd(result.netCashInHand)}</span>
                </div>
              </div>

              {/* 은퇴 시점 복리 기회비용 경고 박스 */}
              <div className="rounded-xl bg-rose-950/60 border border-rose-700/60 p-4 space-y-1.5 text-xs">
                <div className="font-bold text-rose-300 uppercase tracking-wider">
                  True Retirement Opportunity Cost at Age {targetRetirementAge}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  If left invested for <strong>{result.yearsToRetirement} years</strong> at{' '}
                  {expectedAnnualReturnPct}% annual return, this {usd(withdrawalAmount)} would grow
                  to{' '}
                  <strong className="text-white text-sm">
                    {usd(result.lostFutureRetirementValue)}
                  </strong>
                  ! Consider a <strong>401(k) Loan</strong> or <strong>Direct Rollover IRA</strong>{' '}
                  to avoid the penalty.
                </p>
              </div>
            </div>

            {/* Supabase 암호화 시나리오 저장 */}
            <div className="mt-6 border-t border-slate-800 pt-4">
              <label className="block text-[11px] font-medium text-slate-400">
                Save 401(k) Payout Scenario (Client-Side AES-256 Encrypted)
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., $25k Cash-Out vs 401k Loan"
                  value={scenarioNote}
                  onChange={(e) => setScenarioNote(e.target.value)}
                  className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
              {saveMessage && (
                <p className="mt-1.5 text-[11px] font-medium text-emerald-400">{saveMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

