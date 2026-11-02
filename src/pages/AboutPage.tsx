import { usePageSeo } from '../lib/seo';

// =========================================================================
// 사이트 소개 및 401(k) 중도인출·은퇴 세금 계산 공식 안내 페이지 (/about)
// =========================================================================

export default function AboutPage() {
  usePageSeo({
    title: 'About Retire401kSmart & 401(k) Tax Methodology | Retire401kSmart',
    description:
      'Learn how Retire401kSmart calculates 401(k) early withdrawal penalties, 20% mandatory federal withholding, state retirement taxes, and compound growth.',
    path: '/about',
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-slate-900">
        About Retire401kSmart &amp; Methodology
      </h1>
      <p>
        <strong>Retire401kSmart</strong> is a free, privacy-first US retirement and 401(k) early
        withdrawal calculator designed to show workers the exact tax, penalty, and opportunity cost
        of cashing out a retirement plan before age 59½.
      </p>
      <h2 className="text-lg font-bold text-slate-900 pt-2">
        How We Calculate 401(k) Cash-Out Net Payouts
      </h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <strong>10% IRS Early Withdrawal Penalty:</strong> Under Internal Revenue Code Section
          72(t), distributions before age 59½ are subject to a 10% federal penalty unless an
          exception applies (such as the IRS Rule of 55 or qualified hardship).
        </li>
        <li>
          <strong>State Early Withdrawal Penalties &amp; Income Taxes:</strong> Certain states (like
          California at 2.5% and Wisconsin) impose an additional state-level early withdrawal
          penalty on top of ordinary state income taxes.
        </li>
        <li>
          <strong>Opportunity Cost Compounding:</strong> We project what your withdrawn balance
          would have grown into by your target retirement age so you can compare cashing out vs. a
          401(k) loan or IRA rollover.
        </li>
      </ul>
    </div>
  );
}

