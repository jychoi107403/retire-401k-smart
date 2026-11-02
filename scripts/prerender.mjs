// =========================================================================
// 57개 전체 페이지 정적 HTML 사전 생성(Pre-rendering / SSG) 스크립트 (Retire401kSmart)
// =========================================================================

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const STATES_TS = join(ROOT, 'src', 'data', 'retireStates.ts');

const SITE_ORIGIN = 'https://401k.bangjang.net';

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const baseHtml = readFileSync(join(DIST, 'index.html'), 'utf8');

const stateRegex =
  /\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)',\s*abbr:\s*'([^']+)',\s*state401kTaxPct:\s*([0-9.]+),\s*stateEarlyPenaltyPct:\s*([0-9.]+),\s*exempts401kAtRetirement:\s*(true|false),\s*taxesSocialSecurity:\s*(true|false),\s*retireRuleNote:\s*'([^']+)'\s*\}/g;

const states = [...readFileSync(STATES_TS, 'utf8').matchAll(stateRegex)].map((m) => ({
  slug: m[1],
  name: m[2],
  abbr: m[3],
  state401kTaxPct: Number(m[4]),
  stateEarlyPenaltyPct: Number(m[5]),
  exempts401kAtRetirement: m[6] === 'true',
  taxesSocialSecurity: m[7] === 'true',
  retireRuleNote: m[8],
}));

if (states.length !== 51) {
  console.error(`주 데이터 파싱 실패: ${states.length}개`);
  process.exit(1);
}

function writePageHtml({ routePath, title, description, heading, summaryHtml, faqItems }) {
  const canonical = `${SITE_ORIGIN}${routePath}`;
  let html = baseHtml;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/>/,
    `<meta name="title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${esc(canonical)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${esc(canonical)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="twitter:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="twitter:description" content="${esc(description)}" />`
  );

  if (faqItems && faqItems.length > 0) {
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    };
    const scriptTag = `    <script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>\n  </head>`;
    html = html.replace('</head>', scriptTag);
  }

  const seoBody = `<div id="root"><main class="mx-auto max-w-5xl p-6"><h1 class="text-3xl font-bold text-slate-900">${esc(heading)}</h1>${summaryHtml}</main></div>`;
  html = html.replace('<div id="root"></div>', seoBody);

  const outDir = routePath === '/' ? DIST : join(DIST, ...routePath.replace(/^\//, '').split('/'));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
}

let count = 0;

const fixedPages = [
  {
    routePath: '/',
    title: '401(k) Early Withdrawal & Retirement Tax Calculator 2026 | Retire401kSmart',
    description:
      'Free US 401(k) early withdrawal penalty, cash-out net payout, and retirement growth calculator for all 50 states and DC. Calculate the 10% IRS penalty, federal/state taxes, and lost compound growth.',
    heading: '401(k) Early Withdrawal & Cash-Out Net Payout Calculator',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Calculate how much cash you actually keep when withdrawing from a 401(k) or Traditional IRA before age 59½ after the 10% IRS penalty, federal taxes, and state taxes across all 50 US states.</p>',
  },
  {
    routePath: '/401k-state',
    title: '401(k) Early Withdrawal & Retirement Tax Calculator by State (2026) | Retire401kSmart',
    description:
      'Compare 2026 state income tax rates on 401(k) distributions, state early withdrawal penalties, and retirement-friendly tax-free states across all 50 US states and DC.',
    heading: 'US 401(k) Early Withdrawal & Retirement Tax Calculator by State',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Select your state to estimate your net 401(k) cash-out payout after federal and state income taxes and early withdrawal penalties.</p>',
  },
  {
    routePath: '/growth',
    title: '401(k) Retirement Growth & Employer Match Calculator (2026) | Retire401kSmart',
    description:
      'Project your future 401(k) retirement balance with compound interest, 2026 IRS contribution limits ($23,500), employer matching, and the 4% safe withdrawal rule.',
    heading: '401(k) Retirement Growth & Employer Match Calculator',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Project your future 401(k) nest egg with compound investment returns, free employer match, and 4% safe withdrawal retirement income.</p>',
  },
  {
    routePath: '/about',
    title: 'About Retire401kSmart & 401(k) Tax Methodology | Retire401kSmart',
    description:
      'Learn how Retire401kSmart calculates 401(k) early withdrawal penalties, 20% mandatory federal withholding, state retirement taxes, and compound growth.',
    heading: 'About Retire401kSmart & Methodology',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Retire401kSmart combines IRC Section 72(t) penalty rules with 50-state retirement tax data and compound interest projections.</p>',
  },
  {
    routePath: '/privacy',
    title: 'Privacy Policy | Retire401kSmart',
    description:
      'Privacy Policy for Retire401kSmart. Learn how we protect your retirement data with client-side browser calculations, AES-256 encryption, and cookie disclosures.',
    heading: 'Privacy Policy',
    summaryHtml:
      '<p class="mt-2 text-slate-600">All 401(k) and retirement calculations run locally in your browser with client-side AES-256 encryption for saved notes.</p>',
  },
  {
    routePath: '/terms',
    title: 'Terms of Use & Financial Disclaimer | Retire401kSmart',
    description:
      'Terms of Use and Financial Disclaimer for Retire401kSmart. All 401(k) early withdrawal, penalty, and retirement growth figures are estimates for educational purposes only.',
    heading: 'Terms of Use & Financial Disclaimer',
    summaryHtml:
      '<p class="mt-2 text-slate-600">All calculators and tax figures on Retire401kSmart are estimates for educational purposes only.</p>',
  },
];

for (const p of fixedPages) {
  writePageHtml(p);
  count++;
}

for (const state of states) {
  writePageHtml({
    routePath: `/401k-state/${state.slug}`,
    title: `${state.name} 401(k) Early Withdrawal & Retirement Tax Calculator (2026)`,
    description: `Calculate how much cash you keep from a 401(k) early withdrawal in ${state.name}. Includes the 10% IRS penalty, ${state.state401kTaxPct}% ${state.abbr} state tax${state.stateEarlyPenaltyPct > 0 ? `, plus ${state.stateEarlyPenaltyPct}% extra state penalty` : ''}.`,
    heading: `${state.name} (${state.abbr}) 401(k) Early Withdrawal & Cash-Out Calculator`,
    summaryHtml: `<p class="mt-2 text-slate-600">Estimate your net 401(k) cash-out payout in ${esc(state.name)}. ${esc(state.retireRuleNote)}</p>`,
    faqItems: [
      {
        q: `How are 401(k) early withdrawals taxed in ${state.name}?`,
        a: `${state.retireRuleNote} In addition, early distributions before age 59½ face the 10% federal IRS penalty plus ordinary federal income tax.`,
      },
      {
        q: `Does ${state.name} tax Social Security or 401(k) retirement income after age 59½?`,
        a: `${state.name} ${state.taxesSocialSecurity ? 'may partially tax Social Security benefits depending on income' : 'does not tax Social Security benefits'}, and ${state.exempts401kAtRetirement ? 'exempts qualified 401(k) retirement distributions from state income tax' : `taxes 401(k) distributions at an average rate around ${state.state401kTaxPct}%`}.`,
      },
    ],
  });
  count++;
}

console.log(`정적 HTML 사전 생성(SSG) 완료: 총 ${count}개 페이지 생성됨`);

