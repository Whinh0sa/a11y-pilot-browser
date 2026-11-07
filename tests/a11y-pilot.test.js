const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright-core');

const APP_URL = `file://${path.resolve(__dirname, '..', 'index.html')}`;

describe('A11yPilot Accessible AI Browser — End-to-End & Regression Test Suite', () => {
  let browser;

  before(async () => {
    browser = await chromium.launch({
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  });

  after(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('1. Desktop 3-Step User Flow: Load Site -> Fill Form -> Submit & Verify', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);

    // Step 1: Verify CareBridge Clinic portal loaded and scanned 7 form inputs
    const titleText = await page.locator('#live-page-title').textContent();
    assert.match(titleText, /CareBridge Health/i);

    const inputCountText = await page.locator('#count-inputs').textContent();
    assert.equal(Number(inputCountText), 7, 'Expected 7 fillable form inputs on CareBridge Clinic');

    const somBadgesCount = await page.locator('#som-overlay .som-box').count();
    assert.ok(somBadgesCount >= 10, `Expected Set-of-Mark badges on viewport, found ${somBadgesCount}`);

    // Step 2: Live 2-way typing in Form Inputs tab + Fill button confirmation
    const firstDeckInput = page.locator('#deck-input-1');
    await firstDeckInput.click();
    await firstDeckInput.fill('Maya Lin');

    // Verify live sync updated the iframe input immediately even before clicking Fill
    const liveValBeforeClick = await page.evaluate(() => {
      const doc = document.getElementById('viewport-iframe').contentDocument;
      return doc.getElementById('patient-name').value;
    });
    assert.equal(liveValBeforeClick, 'Maya Lin', 'Live typing in Form Inputs should sync to iframe immediately');

    // Click the Fill button and verify button stays visible and shows confirmation
    const firstFillBtn = page.locator('#deck-panel-inputs .apply-btn').first();
    await firstFillBtn.click();
    const fillBtnText = await firstFillBtn.textContent();
    assert.equal(fillBtnText.trim(), '✓ Filled');

    // Verify Auto-Fill Form button populates all remaining text inputs
    await page.click('#quick-autofill-cta');
    await page.waitForTimeout(1800);

    const emailVal = await page.evaluate(() => {
      const doc = document.getElementById('viewport-iframe').contentDocument;
      return doc.getElementById('patient-email').value;
    });
    assert.ok(emailVal.includes('@'), `Expected auto-filled email address, got "${emailVal}"`);

    // Step 3: Click Step 3 Submit button at bottom of Form Inputs tab
    const step3SubmitBtn = page.locator('#deck-panel-inputs .primary-btn');
    assert.equal(await step3SubmitBtn.isVisible(), true, 'Step 3 submit CTA should be visible at bottom of Form Inputs');
    await step3SubmitBtn.click();
    await page.waitForTimeout(250);

    // Verify Step 3 indicator is active and live confirmation alert is shown
    const step3Active = await page.locator('#flow-step-3').evaluate(el => el.classList.contains('active'));
    assert.equal(step3Active, true, 'Flow Step 3 should become active after submission');

    const alertVisible = await page.locator('#live-alert-strip').evaluate(el => el.classList.contains('visible'));
    assert.equal(alertVisible, true, 'Confirmation alert strip should be visible after form submit');

    const alertText = await page.locator('#live-alert-text').textContent();
    assert.match(alertText, /Appointment Confirmed/i);

    await context.close();
  });

  test('2. Mobile 2nd Nav ("Fill Form") Regression: Form inputs & Fill button never disappear on click or keyboard resize', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);

    // Verify mobile bottom navigation bar is visible on <960px screens
    const mobileNavVisible = await page.locator('.mobile-bottom-nav').isVisible();
    assert.equal(mobileNavVisible, true, 'Mobile bottom navigation bar should be visible at 390px width');

    // Click the 2nd mobile nav button ("Fill Form")
    const secondNavBtn = page.locator('.mobile-nav-btn[data-mobile-target="inputs"]');
    await secondNavBtn.click();
    await page.waitForTimeout(100);

    const mobileViewAttr = await page.locator('#main-workspace').getAttribute('data-mobile-view');
    assert.equal(mobileViewAttr, 'inputs');

    const cardsBefore = await page.locator('#deck-panel-inputs .a11y-control-card').count();
    assert.equal(cardsBefore, 7, 'Should display 7 form input cards in mobile Fill Form view');

    // Click the first form input and simulate mobile virtual keyboard shrinking viewport height
    await page.click('#deck-input-1');
    await page.setViewportSize({ width: 390, height: 460 });
    await page.waitForTimeout(150);

    const cardsAfterKeyboard = await page.locator('#deck-panel-inputs .a11y-control-card').count();
    assert.equal(cardsAfterKeyboard, 7, 'Form input cards must NOT disappear when mobile keyboard resizes viewport');

    const fillBtn = page.locator('#deck-panel-inputs .apply-btn').first();
    assert.equal(await fillBtn.isVisible(), true, 'Fill button must remain visible when form input is clicked');

    // Type value and click Fill while in mobile 2nd nav
    await page.fill('#deck-input-1', 'Jordan Rivera');
    await fillBtn.click();
    await page.waitForTimeout(200);

    const cardsAfterFill = await page.locator('#deck-panel-inputs .a11y-control-card').count();
    assert.equal(cardsAfterFill, 7, 'Form input cards must remain rendered after clicking Fill on mobile');

    const iframePatientName = await page.evaluate(() => {
      const doc = document.getElementById('viewport-iframe').contentDocument;
      return doc.getElementById('patient-name').value;
    });
    assert.equal(iframePatientName, 'Jordan Rivera', 'Clicking Fill in mobile 2nd nav must update the live webpage field');

    await context.close();
  });

  test('3. AI Model Settings Modal: Gemini 3.8 Flash default (no 2.5) and DeepSeek V3/R1 support', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);

    // Open AI Settings Modal
    await page.click('#open-ai-modal-btn');
    const modalOpen = await page.locator('#ai-settings-modal').evaluate(el => el.classList.contains('open'));
    assert.equal(modalOpen, true, 'AI settings modal should open on pill click');

    // Check Gemini models list: must default to gemini-3.8-flash and not include 2.5
    const defaultGeminiModel = await page.locator('#gemini-model-select').inputValue();
    assert.equal(defaultGeminiModel, 'gemini-3.8-flash', 'Default Gemini model must be gemini-3.8-flash');

    const geminiOptions = await page.locator('#gemini-model-select option').allTextContents();
    const geminiValues = await page.locator('#gemini-model-select option').evaluateAll(opts => opts.map(o => o.value));
    assert.ok(geminiValues.includes('gemini-3.8-flash'), 'Must include gemini-3.8-flash');
    assert.ok(geminiValues.includes('gemini-3.8-pro'), 'Must include gemini-3.8-pro');
    assert.ok(geminiValues.includes('gemini-3.8-flash-lite'), 'Must include gemini-3.8-flash-lite');
    assert.ok(!geminiValues.some(v => v.includes('2.5')), `Deprecated 2.5 models should be removed, found: ${geminiOptions.join(', ')}`);

    // Switch to DeepSeek provider tab and verify DeepSeek V3 & R1 models
    await page.click('.provider-card[data-provider="deepseek"]');
    const deepseekPanelVisible = await page.locator('#provider-panel-deepseek').isVisible();
    assert.equal(deepseekPanelVisible, true, 'DeepSeek configuration panel should be visible when selected');

    const deepseekValues = await page.locator('#deepseek-model-select option').evaluateAll(opts => opts.map(o => o.value));
    assert.deepEqual(deepseekValues, ['deepseek-chat', 'deepseek-reasoner']);

    // Test connection validator with Local Semantic Engine
    await page.click('.provider-card[data-provider="local"]');
    await page.click('#test-api-btn');
    const statusText = await page.locator('#api-test-status').textContent();
    assert.match(statusText, /Built-in Local Semantic Engine verified/i);

    await page.click('#ai-modal-save');
    const badgeText = await page.locator('#active-engine-badge').textContent();
    assert.equal(badgeText.trim(), 'Local Semantic');

    await context.close();
  });

  test('4. Natural Language Agent Commands, Portal Switching & Set-of-Mark Quick Modal', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);

    // Switch to Civic Paratransit Portal
    await page.click('#preset-civic');
    await page.waitForTimeout(200);

    const civicTitle = await page.locator('#live-page-title').textContent();
    assert.match(civicTitle, /CivicAccess/i);

    // Run a multi-step natural language command on Civic Paratransit portal
    await page.fill(
      '#agent-command-input',
      'Type Jordan Rivera in Rider Pass Name, type 240 Oak Street in Pickup Location, and click Request Accessible Van'
    );
    await page.click('#run-agent-btn');
    await page.waitForTimeout(1600);

    const alertText = await page.locator('#live-alert-text').textContent();
    assert.match(alertText, /Van Dispatched for Jordan Rivera/i);

    // Verify action history log recorded the steps
    const traceCount = Number(await page.locator('#trace-count').textContent());
    assert.ok(traceCount >= 3, `Expected at least 3 logged actions, got ${traceCount}`);

    // Click a Set-of-Mark input badge (#1) on the viewport to open Quick Field Modal
    const firstInputBadge = page.locator('#som-overlay .som-box.category-input .som-badge').first();
    await firstInputBadge.click();
    const quickModalOpen = await page.locator('#quick-field-modal').evaluate(el => el.classList.contains('open'));
    assert.equal(quickModalOpen, true, 'Clicking an input #badge on the viewport should open Quick Field Modal');

    await page.fill('#quick-modal-active-input', 'Alex Chen (#ADA-900)');
    await page.click('#quick-field-submit');
    await page.waitForTimeout(200);

    const updatedRiderVal = await page.evaluate(() => {
      const doc = document.getElementById('viewport-iframe').contentDocument;
      return doc.getElementById('rider-id').value;
    });
    assert.equal(updatedRiderVal, 'Alex Chen (#ADA-900)');

    await context.close();
  });

  test('5. External Portal Login (elearn.nou.edu.ng): Clicking Log In transitions to Authenticated Student Dashboard', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Intercept external proxy fetches so test runs deterministically offline/CI and returns realistic Moodle login HTML
    await page.route('**/*', async (route) => {
      const reqUrl = route.request().url();
      if (reqUrl.includes('allorigins.win') || reqUrl.includes('codetabs.com') || reqUrl.includes('corsproxy.io') || reqUrl.includes('elearn.nou.edu.ng')) {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: `<!DOCTYPE html><html><head><title>NOUN eLearn Portal: Log in to the site</title></head><body>
            <form id="login" method="post" action="https://elearn.nou.edu.ng/login/index.php">
              <label for="username">Username</label>
              <input type="text" name="username" id="username" placeholder="Username" />
              <label for="password">Password</label>
              <input type="password" name="password" id="password" placeholder="Password" />
              <button type="submit" id="loginbtn">Log in</button>
            </form>
            <form id="guestlogin" method="post" action="https://elearn.nou.edu.ng/login/index.php">
              <button type="submit">Access as a guest</button>
            </form>
          </body></html>`
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);

    // Navigate to elearn.nou.edu.ng
    await page.fill('#url-input', 'elearn.nou.edu.ng');
    await page.click('#btn-go');
    await page.waitForTimeout(500);

    // Verify login inputs are scanned (#1 Username, #2 Password)
    const loginInputsCount = await page.locator('#deck-panel-inputs .a11y-control-card').count();
    assert.equal(loginInputsCount, 2, 'Should detect Username and Password fields on NOUN login page');

    // Fill Username and Password via Accessible Form Deck
    await page.fill('#deck-input-1', 'NOU23104928');
    await page.fill('#deck-input-2', 'Pass2026!');
    await page.waitForTimeout(100);

    // Click Step 3 CTA ("Step 3: Log in") or the Log in button
    await page.click('#deck-submit-cta-btn');
    await page.waitForTimeout(500);

    // Verify URL bar and page title transitioned to Authenticated Student Dashboard
    const currentUrlValue = await page.locator('#url-input').inputValue();
    assert.equal(currentUrlValue, 'https://elearn.nou.edu.ng/my/dashboard', 'URL bar should update to /my/dashboard after login');

    const dashboardState = await page.evaluate(() => {
      const doc = document.getElementById('viewport-iframe').contentDocument;
      return {
        title: doc.title,
        bannerText: doc.getElementById('dash-live-banner') ? doc.getElementById('dash-live-banner').innerText : '',
        coursesCount: doc.querySelectorAll('.course-card').length,
        hasTmaForm: Boolean(doc.getElementById('dash-tma-form'))
      };
    });

    assert.match(dashboardState.title, /Dashboard/i, 'Iframe should render the Student Dashboard');
    assert.match(dashboardState.bannerText, /NOU23104928/i, 'Dashboard banner should display the logged-in Matric/Username');
    assert.equal(dashboardState.coursesCount, 4, 'Dashboard should display 4 enrolled NOUN courses (CIT101, GST101, MTH101, CMP201)');
    assert.equal(dashboardState.hasTmaForm, true, 'Dashboard should include the interactive TMA submission form');

    // Verify the Accessible Form Deck updated to show the Dashboard's own inputs (Search Filter, Semester Select, TMA Course, TMA Answer, Accommodation)
    const dashboardInputsCount = await page.locator('#deck-panel-inputs .a11y-control-card').count();
    assert.equal(dashboardInputsCount, 5, 'Accessible Form Deck should now list the 5 interactive Dashboard form fields');

    await context.close();
  });
});

