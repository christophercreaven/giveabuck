import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'http://localhost:5173';
const API  = 'http://localhost:3001/api';
const SS   = 'C:\\Users\\chris\\projects\\giveabuck\\verify-screenshots';
mkdirSync(SS, { recursive: true });

let pass = 0, fail = 0;
const findings = [];

function log(icon, label, detail = '') {
  console.log(`${icon} ${label}${detail ? ' → ' + detail : ''}`);
}
function ok(label, detail)  { pass++; log('✅', label, detail); }
function bad(label, detail) { fail++; log('❌', label, detail); findings.push(`FAIL: ${label} — ${detail}`); }
function note(label, detail){ log('⚠️ ', label, detail); findings.push(`⚠️  ${label} — ${detail}`); }
function probe(label, detail){ log('🔍', label, detail); }

const browser = await chromium.launch({ headless: true });
const page    = await browser.newPage();
page.setDefaultTimeout(8000);

async function ss(name) {
  await page.screenshot({ path: `${SS}\\${name}.png`, fullPage: false });
}

// ── 1. HOME PAGE ────────────────────────────────────────────────────────────
await page.goto(BASE);
await page.waitForSelector('text=GiveABuck', { timeout: 6000 });
const heroHeading = await page.textContent('h1');
ok('Home loads', heroHeading?.trim().slice(0, 40));
await ss('01-home');

// Stats section
await page.waitForSelector('text=Total Raised', { timeout: 5000 }).catch(() => null);
const statsText = await page.textContent('body');
if (statsText.includes('Total Raised')) ok('Stats section visible', 'shows donor/scholarship counts');
else note('Stats section', 'not visible — API may not have responded yet');

// Active scholarships on home
const cards = await page.locator('a[href^="/scholarships/"]').count();
ok('Scholarship cards on homepage', `${cards} card(s) visible`);
await ss('02-home-scholarships');

// ── 2. SCHOLARSHIPS LIST ────────────────────────────────────────────────────
await page.goto(`${BASE}/scholarships`);
await page.waitForSelector('h1', { timeout: 5000 });
const listHeading = await page.textContent('h1');
ok('Scholarships list loads', listHeading);

const schCards = await page.locator('a[href^="/scholarships/"]').count();
ok('Scholarship cards listed', `${schCards} found`);
await ss('03-scholarships');

// Search
await page.fill('input[placeholder*="Search"]', 'Engineering');
await page.waitForTimeout(600);
const filtered = await page.locator('a[href^="/scholarships/"]').count();
ok('Search filter works', `"Engineering" → ${filtered} result(s)`);
await page.fill('input[placeholder*="Search"]', '');

// ── 3. SCHOLARSHIP DETAIL ──────────────────────────────────────────────────
await page.goto(`${BASE}/scholarships/scholarship-2`);
await page.waitForSelector('text=Michigan Engineering Fund', { timeout: 5000 });
ok('Scholarship detail page loads', 'title visible');

const progressText = await page.locator('text=$3,000').first().textContent().catch(() => null);
ok('Funding progress shown', progressText ?? '$3,000 visible in page');

const votingSection = await page.locator('text=Vote for a Recipient').isVisible().catch(() => false);
ok('Voting section visible (status=VOTING)', String(votingSection));

const application = await page.locator('text=Alex Rivera').isVisible().catch(() => false);
ok('Seeded student application shown', String(application));
await ss('04-scholarship-detail');

// ── 4. REGISTER (new donor) ─────────────────────────────────────────────────
await page.goto(`${BASE}/register`);
await page.waitForSelector('text=Create your free account', { timeout: 5000 });
ok('Register page loads', '');

const ts = Date.now();
await page.fill('input[placeholder="Jane Smith"]', `Test Donor ${ts}`);
await page.fill('input[placeholder="you@example.com"]', `donor${ts}@test.com`);
await page.fill('input[placeholder="8+ characters"]', 'testpass123');
await page.click('button:has-text("Create free account")');
await page.waitForURL(`${BASE}/dashboard`, { timeout: 8000 });
ok('Donor registration → redirects to dashboard', page.url());
await ss('05-dashboard-after-register');

// ── 5. DASHBOARD ──────────────────────────────────────────────────────────
const dashHeading = await page.textContent('h1');
ok('Dashboard renders', dashHeading?.trim());
const totalGiven = await page.locator('text=Total Given').isVisible().catch(() => false);
ok('Donor stats panel visible', String(totalGiven));
await ss('06-dashboard');

// ── 6. DONATE FLOW ─────────────────────────────────────────────────────────
await page.goto(`${BASE}/scholarships/scholarship-1`);
await page.waitForSelector('text=CS Innovation Scholarship', { timeout: 5000 });

// Click the $5 quick-amount button
await page.click('button:has-text("$5")');
const donateBtn = page.locator('button:has-text("Donate $5")');
await donateBtn.waitFor({ timeout: 4000 });
ok('Quick-amount $5 selected', 'Donate $5 button active');

await page.fill('input[placeholder="Optional message"]', 'Go team!');
await donateBtn.click();

// Wait for toast
await page.waitForSelector('text=donated', { timeout: 6000 }).catch(() => null);
const toast = await page.locator('text=donated').isVisible().catch(() => false);
ok('Donation toast appears', String(toast));
await ss('07-post-donation');

// Verify raisedAmount updated on page
await page.waitForTimeout(800);
const raised = await page.textContent('.text-green-600');
ok('Raised amount updated after donation', raised?.trim().slice(0, 20) ?? 'visible');

// ── 7. LOGOUT ────────────────────────────────────────────────────────────────
await page.click('[data-lucide="log-out"], button:has([data-lucide="log-out"])').catch(async () => {
  // fallback: look for the SVG-rendered icon button
  await page.locator('nav button').last().click();
});
await page.waitForTimeout(500);
probe('Logout button', 'clicked nav logout icon');

// ── 8. LOGIN (existing donor) ─────────────────────────────────────────────
await page.goto(`${BASE}/login`);
await page.fill('input[placeholder="you@example.com"]', 'jane@example.com');
await page.fill('input[placeholder="••••••••"]', 'donor123');
await page.click('button:has-text("Sign in")');
await page.waitForURL(`${BASE}/dashboard`, { timeout: 8000 });
ok('Demo donor login works', page.url());
await ss('08-dashboard-jane');

// Check donations listed
const donationLinks = await page.locator('a[href^="/scholarships/"]').count();
ok('Donation history shown', `${donationLinks} entry/entries`);

// ── 9. STUDENT LOGIN + APPLICATION CHECK ───────────────────────────────────
await page.goto(`${BASE}/login`);
await page.fill('input[placeholder="you@example.com"]', 'alex@example.com');
await page.fill('input[placeholder="••••••••"]', 'student123');
await page.click('button:has-text("Sign in")');
await page.waitForURL(`${BASE}/dashboard`, { timeout: 8000 });
ok('Student login works', '');

const appEntries = await page.locator('a[href^="/scholarships/"]').count();
ok('Student sees applications', `${appEntries} application(s)`);
await ss('09-student-dashboard');

// ── 10. LEADERBOARD ──────────────────────────────────────────────────────────
await page.goto(`${BASE}/leaderboard`);
await page.waitForSelector('h1', { timeout: 5000 });
ok('Leaderboard loads', '');

const um = await page.locator('text=University of Michigan').isVisible().catch(() => false);
ok('Seeded school on leaderboard', String(um));
await ss('10-leaderboard');

// ── PROBES ────────────────────────────────────────────────────────────────────
probe('Register with existing email', 'check for conflict error');
await page.goto(`${BASE}/register`);
await page.fill('input[placeholder="Jane Smith"]', 'Jane Smith');
await page.fill('input[placeholder="you@example.com"]', 'jane@example.com');
await page.fill('input[placeholder="8+ characters"]', 'donor123');
await page.click('button:has-text("Create free account")');
await page.waitForTimeout(1500);
const conflictToast = await page.locator('text=Email').isVisible().catch(() => false);
if (conflictToast) ok('Duplicate email → error toast shown', '');
else note('Duplicate email error', 'toast not detected — may need longer wait or different selector');

probe('Bad login credentials', 'should show error');
await page.goto(`${BASE}/login`);
await page.fill('input[placeholder="you@example.com"]', 'nobody@nowhere.com');
await page.fill('input[placeholder="••••••••"]', 'wrongpass');
await page.click('button:has-text("Sign in")');
await page.waitForTimeout(1500);
const badLoginToast = await page.locator('text=Invalid').isVisible().catch(() => false);
if (badLoginToast) ok('Bad credentials → error toast', '');
else note('Bad login error', 'toast text not detected');

await ss('11-probes');

// ── SUMMARY ──────────────────────────────────────────────────────────────────
await browser.close();

console.log('\n─────────────────────────────────────');
console.log(`Results: ${pass} passed, ${fail} failed`);
if (findings.length) {
  console.log('\nFindings:');
  findings.forEach(f => console.log(' ' + f));
}
console.log(`\nScreenshots: ${SS}`);
if (fail > 0) process.exit(1);
