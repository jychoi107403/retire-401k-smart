// =========================================================================
// 미국 401(k)·Traditional IRA 중도인출 실수령액(Early Withdrawal Penalty & Taxes)
// 및 은퇴 복리 자산 성장(Compound Growth + Employer Match) 계산 엔진
// =========================================================================

export type PenaltyExceptionType =
  | 'none'             // 일반 59.5세 미만 중도인출 (10% IRS 페널티 부과)
  | 'age_59_half'      // 59.5세 이상 정규 인출 (페널티 면제)
  | 'rule_of_55'       // 55세 이상 퇴직/이직 시 해당 직장 401(k) 인출 (Rule of 55 면제)
  | 'hardship_medical';// 적격 의료비·장애·출산/입양($5,000 한도) 등 IRS 예외 사유 (페널티 면제)

export interface EarlyWithdrawalInput {
  withdrawalAmount: number;          // 인출 희망 금액 ($)
  currentAge: number;                // 현재 나이 (만 나이)
  targetRetirementAge: number;       // 목표 은퇴 나이 (기본 65세)
  annualSalaryIncome: number;        // 현재 연간 급여/기타 과세 소득 ($ - 한계 세율 구간 산정용)
  filingStatus: 'single' | 'married';// 세금 신고 유형
  stateTaxPct: number;               // 선택한 주의 소득세율 (%)
  stateEarlyPenaltyPct: number;      // 주 정부 추가 조기인출 페널티율 (예: CA 2.5%, %)
  exceptionType: PenaltyExceptionType;
  expectedAnnualReturnPct: number;   // 인출하지 않고 두었을 때 예상 연평균 투자수익률 (기본 7.5%)
}

export interface EarlyWithdrawalResult {
  grossWithdrawal: number;
  federalMarginalRatePct: number;    // 적용된 연방 한계 소득세율 (%)
  federalTaxAmount: number;          // 연방 소득세 ($)
  mandatory20PctWithholding: number; // 금융기관이 즉시 원천징수하는 20% 연방세 ($)
  irs10PctPenalty: number;           // 10% IRS 조기 인출 페널티 ($)
  stateTaxAmount: number;            // 주 소득세 ($)
  statePenaltyAmount: number;        // 주 정부 추가 조기 인출 페널티 ($)
  totalTaxesAndPenalties: number;    // 총 세금 + 페널티 합계 ($)
  effectiveLossPct: number;          // 인출액 대비 세금·페널티 손실 비율 (%)
  netCashInHand: number;             // 최종 손에 쥐는 실수령액 ($)
  yearsToRetirement: number;         // 은퇴까지 남은 연수
  lostFutureRetirementValue: number; // 인출하지 않고 은퇴(65세)까지 복리 투자했을 때의 미래 가치 ($)
}

// 2026 연방 한계 세율 추정 함수
export function estimateFederalMarginalRate(
  annualIncome: number,
  withdrawal: number,
  filingStatus: 'single' | 'married'
): number {
  const stdDeduction = filingStatus === 'married' ? 30000 : 15000;
  const taxableWithWithdrawal = Math.max(0, annualIncome + withdrawal - stdDeduction);

  if (filingStatus === 'married') {
    if (taxableWithWithdrawal <= 23850) return 10;
    if (taxableWithWithdrawal <= 96950) return 12;
    if (taxableWithWithdrawal <= 206700) return 22;
    if (taxableWithWithdrawal <= 394600) return 24;
    if (taxableWithWithdrawal <= 501050) return 32;
    if (taxableWithWithdrawal <= 751600) return 35;
    return 37;
  } else {
    if (taxableWithWithdrawal <= 11925) return 10;
    if (taxableWithWithdrawal <= 48475) return 12;
    if (taxableWithWithdrawal <= 103350) return 22;
    if (taxableWithWithdrawal <= 197300) return 24;
    if (taxableWithWithdrawal <= 250525) return 32;
    if (taxableWithWithdrawal <= 626350) return 35;
    return 37;
  }
}

export function calculate401kEarlyWithdrawal(
  input: EarlyWithdrawalInput
): EarlyWithdrawalResult {
  const gross = Math.max(0, input.withdrawalAmount);
  const age = Math.max(18, Math.min(90, input.currentAge));
  const retireAge = Math.max(age, input.targetRetirementAge);

  const fedMarginalPct = estimateFederalMarginalRate(
    Math.max(0, input.annualSalaryIncome),
    gross,
    input.filingStatus
  );

  // 페널티 부과 여부 판정 (59.5세 이상이거나 예외 사유 선택 시 페널티 0원)
  const isPenaltyExempt =
    age >= 60 || input.exceptionType !== 'none';

  const irs10PctPenalty = isPenaltyExempt ? 0 : gross * 0.10;
  const statePenaltyAmount = isPenaltyExempt
    ? 0
    : gross * (Math.max(0, input.stateEarlyPenaltyPct) / 100);

  const federalTaxAmount = gross * (fedMarginalPct / 100);
  const mandatory20PctWithholding = gross * 0.20;
  const stateTaxAmount = gross * (Math.max(0, input.stateTaxPct) / 100);

  const totalTaxesAndPenalties =
    federalTaxAmount + stateTaxAmount + irs10PctPenalty + statePenaltyAmount;
  const effectiveLossPct = gross > 0 ? (totalTaxesAndPenalties / gross) * 100 : 0;
  const netCashInHand = Math.max(0, gross - totalTaxesAndPenalties);

  const yearsToRetirement = Math.max(0, retireAge - age);
  const r = Math.max(0, input.expectedAnnualReturnPct) / 100;
  const lostFutureRetirementValue = gross * Math.pow(1 + r, yearsToRetirement);

  return {
    grossWithdrawal: gross,
    federalMarginalRatePct: fedMarginalPct,
    federalTaxAmount,
    mandatory20PctWithholding,
    irs10PctPenalty,
    stateTaxAmount,
    statePenaltyAmount,
    totalTaxesAndPenalties,
    effectiveLossPct,
    netCashInHand,
    yearsToRetirement,
    lostFutureRetirementValue,
  };
}

// =========================================================================
// 401(k) & 고용주 매칭(Employer Match) 은퇴 자산 복리 성장 계산기
// =========================================================================
export interface RetirementGrowthInput {
  currentAge: number;
  retirementAge: number;
  current401kBalance: number;
  annualSalary: number;
  employeeContributionPct: number;   // 본인 급여 대비 납입 비율 (%)
  employerMatchPct: number;          // 회사 매칭 비율 (예: 100% 또는 50%)
  employerMatchCapPct: number;       // 회사 매칭 상한 급여 비율 (예: 급여의 4% 또는 6%까지)
  expectedAnnualReturnPct: number;   // 예상 연평균 수익률 (%)
}

export interface RetirementGrowthResult {
  yearsInvested: number;
  annualEmployeeContribution: number;
  annualEmployerMatch: number;
  totalAnnualAddition: number;
  projectedRetirementBalance: number;
  totalEmployeeContributions: number;
  totalEmployerMatchReceived: number;
  totalInvestmentGrowth: number;
  monthlyIncome4PctRule: number;     // 4% 안전 인출 법칙 기준 은퇴 후 월 수령 가능액 ($)
}

export function calculate401kGrowth(input: RetirementGrowthInput): RetirementGrowthResult {
  const years = Math.max(1, Math.round(input.retirementAge - input.currentAge));
  const salary = Math.max(0, input.annualSalary);
  const empPct = Math.max(0, input.employeeContributionPct);
  const matchRate = Math.max(0, input.employerMatchPct) / 100;
  const matchCap = Math.max(0, input.employerMatchCapPct);

  // 2026 IRS 401(k) 개인 납입 한도 ($23,500 기본, 50세 이상 $31,000) 반영
  const irsLimit = input.currentAge >= 50 ? 31000 : 23500;
  const annualEmployeeContribution = Math.min(irsLimit, salary * (empPct / 100));

  const matchedSalaryPct = Math.min(empPct, matchCap);
  const annualEmployerMatch = salary * (matchedSalaryPct / 100) * matchRate;
  const totalAnnualAddition = annualEmployeeContribution + annualEmployerMatch;

  const r = Math.max(0, input.expectedAnnualReturnPct) / 100;
  let balance = Math.max(0, input.current401kBalance);

  for (let y = 1; y <= years; y++) {
    balance = (balance + totalAnnualAddition) * (1 + r);
  }

  const totalEmployeeContributions =
    Math.max(0, input.current401kBalance) + annualEmployeeContribution * years;
  const totalEmployerMatchReceived = annualEmployerMatch * years;
  const totalInvestmentGrowth = Math.max(
    0,
    balance - totalEmployeeContributions - totalEmployerMatchReceived
  );

  // 4% Safe Withdrawal Rule
  const monthlyIncome4PctRule = (balance * 0.04) / 12;

  return {
    yearsInvested: years,
    annualEmployeeContribution,
    annualEmployerMatch,
    totalAnnualAddition,
    projectedRetirementBalance: balance,
    totalEmployeeContributions,
    totalEmployerMatchReceived,
    totalInvestmentGrowth,
    monthlyIncome4PctRule,
  };
}

