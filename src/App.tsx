import { Link, Route, Routes } from 'react-router-dom';
import EarlyWithdrawalCalculator from './components/EarlyWithdrawalCalculator';
import { SisterSitesTopBar, SisterSitesFooterHub } from './components/SisterSitesBar';
import StateIndex from './pages/StateIndex';
import State401kPage from './pages/State401kPage';
import RetirementGrowthPage from './pages/RetirementGrowthPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import { RETIRE_STATES } from './data/retireStates';
import { usePageSeo } from './lib/seo';

// =========================================================================
// 홈 화면 컴포넌트 (SEO 메타태그 + 메인 401k 인출 계산기 + 51개 주 빠른 이동 그리드)
// =========================================================================
function HomePage() {
  usePageSeo({
    title: '401(k) Early Withdrawal & Retirement Tax Calculator 2026 | Retire401kSmart',
    description:
      'Free US 401(k) early withdrawal penalty, cash-out net payout, and retirement growth calculator for all 50 states and DC. Calculate the 10% IRS penalty, federal/state taxes, and lost compound growth.',
    path: '/',
  });

  return (
    <div className="space-y-8">
      <EarlyWithdrawalCalculator />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              401(k) Early Withdrawal &amp; Retirement Tax Calculator by State
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Click your state to load 2026 state 401(k) tax rates, state early withdrawal
              penalties, and retirement exemptions:
            </p>
          </div>
          <div className="flex gap-3 text-xs font-semibold">
            <Link to="/401k-state" className="text-blue-600 underline">
              Compare All 50 States &rarr;
            </Link>
            <Link to="/growth" className="text-emerald-700 underline">
              401(k) Growth &amp; Match Calculator &rarr;
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 text-xs">
          {RETIRE_STATES.map((st) => (
            <Link
              key={st.slug}
              to={`/401k-state/${st.slug}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-800 hover:border-blue-500 hover:bg-white hover:text-blue-600"
            >
              <span>
                {st.name} ({st.abbr})
              </span>
              <span
                className={`font-bold ${
                  st.state401kTaxPct === 0 ? 'text-emerald-600' : 'text-slate-600'
                }`}
              >
                {st.state401kTaxPct === 0 ? '0% Tax' : `${st.state401kTaxPct}%`}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 전체 앱 레이아웃 (상단 7개 자매 사이트 네트워크 바 + 헤더 + 라우터 + 하단 푸터 허브)
// =========================================================================
export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 최상단 7개 자매 사이트 상호 이동 네트워크 바 */}
      <SisterSitesTopBar currentSiteId="retire-401k-smart" />

      {/* 상단 네비게이션 헤더 */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-blue-600">
            🏦 Retire401k<span className="text-slate-900">Smart</span>
          </Link>
          <nav className="flex flex-wrap gap-5 text-sm font-semibold text-slate-700">
            <Link to="/" className="hover:text-blue-600">
              Early Withdrawal Calculator
            </Link>
            <Link to="/401k-state" className="hover:text-blue-600">
              By State
            </Link>
            <Link to="/growth" className="hover:text-blue-600">
              401(k) Growth &amp; Match
            </Link>
            <Link to="/about" className="hover:text-blue-600">
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* 본문 영역 */}
      <main className="mx-auto w-full max-w-5xl flex-1 p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/401k-state" element={<StateIndex />} />
          <Route path="/401k-state/:state" element={<State401kPage />} />
          <Route path="/growth" element={<RetirementGrowthPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="*"
            element={
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
                <Link to="/" className="mt-4 inline-block text-blue-600 underline">
                  Back to 401(k) Calculator
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      {/* 하단 푸터 (면책 문구 + 7개 자매 사이트 전체 링크 허브 + 법적 고지) */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-slate-500 space-y-4">
          <p>
            Disclaimer: For informational and educational purposes only. Estimates do not constitute
            financial, investment, legal, or tax advice. Consult a licensed financial advisor or CPA
            before taking a 401(k) or IRA distribution.
          </p>

          {/* 7개 자매 사이트 전체 네트워크 허브 */}
          <SisterSitesFooterHub currentSiteId="retire-401k-smart" />

          <div className="flex flex-wrap justify-between gap-4 border-t border-slate-200 pt-4">
            <span>&copy; {new Date().getFullYear()} Retire401kSmart. All rights reserved.</span>
            <nav className="flex flex-wrap gap-4 font-medium">
              <Link to="/about" className="underline hover:text-slate-800">
                About &amp; Methodology
              </Link>
              <Link to="/privacy" className="underline hover:text-slate-800">
                Privacy Policy
              </Link>
              <Link to="/terms" className="underline hover:text-slate-800">
                Terms &amp; Disclaimer
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

