const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const { getClinicPageHtml, getGroceryPageHtml, getCivicPageHtml } = require('./demo-sites');

const PORT = process.env.PORT || 3847;
const VIEWPORT = { width: 1280, height: 800 };

let browser = null;
let context = null;
let page = null;
let actionHistory = [];
let browserLock = Promise.resolve();

function withLock(fn) {
  const next = browserLock.then(fn, fn);
  browserLock = next.catch(() => {});
  return next;
}

async function ensureBrowser() {
  if (page && !page.isClosed()) return page;
  if (!browser) {
    browser = await chromium.launch({
      executablePath: '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none'
      ]
    });
  }
  context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1
  });
  page = await context.newPage();
  await page.goto(`http://localhost:${PORT}/sites/clinic`, { waitUntil: 'domcontentloaded' });
  return page;
}

/**
 * Scans the live DOM inside Playwright and tags every visible interactive element
 * with a numeric Set-of-Mark ID (data-a11y-id="1..N"), returning bounding boxes,
 * accessible labels, roles, current values, and live status alerts.
 */
async function scanPageAndCapture(activeHighlightId = null) {
  const p = await ensureBrowser();

  const domData = await p.evaluate((highlightId) => {
    // Remove previous temporary visual rings if any
    document.querySelectorAll('.__a11y_pilot_ring').forEach(el => el.remove());

    const selector = [
      'a[href]',
      'button',
      'input:not([type="hidden"])',
      'select',
      'textarea',
      '[role="button"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[role="tab"]',
      '[onclick]'
    ].join(',');

    const candidates = Array.from(document.querySelectorAll(selector));
    const elements = [];
    let nextId = 1;

    function getAccessibleLabel(el) {
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

      const ariaLabelledBy = el.getAttribute('aria-labelledby');
      if (ariaLabelledBy) {
        const ref = document.getElementById(ariaLabelledBy);
        if (ref && ref.innerText.trim()) return ref.innerText.trim();
      }

      if (el.id) {
        const explicitLabel = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (explicitLabel && explicitLabel.innerText.trim()) {
          return explicitLabel.innerText.trim();
        }
      }

      const parentLabel = el.closest('label');
      if (parentLabel && parentLabel.innerText.trim()) {
        return parentLabel.innerText.trim();
      }

      const placeholder = el.getAttribute('placeholder');
      if (placeholder && placeholder.trim()) return placeholder.trim();

      const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) return text.slice(0, 90);

      const val = el.value;
      if (val && typeof val === 'string' && val.trim()) return val.trim().slice(0, 60);

      const title = el.getAttribute('title') || el.getAttribute('name') || el.id || el.tagName.toLowerCase();
      return String(title).trim();
    }

    function getCategory(tag, type, role) {
      if (tag === 'input' && (type === 'checkbox' || type === 'radio')) return 'toggle';
      if (tag === 'input' && (type === 'submit' || type === 'button')) return 'action';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return 'input';
      if (tag === 'a' || role === 'link') return 'navigation';
      return 'action';
    }

    for (const el of candidates) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
        continue;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width < 6 || rect.height < 6) continue;
      // Check if within or near viewport
      if (rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight + 200) continue;

      const id = nextId++;
      el.setAttribute('data-a11y-id', String(id));

      const tag = el.tagName.toLowerCase();
      const type = (el.getAttribute('type') || (tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : 'text')).toLowerCase();
      const role = el.getAttribute('role') || (tag === 'a' ? 'link' : tag === 'button' ? 'button' : tag === 'select' ? 'combobox' : type === 'checkbox' ? 'checkbox' : 'textbox');
      const label = getAccessibleLabel(el);

      let value = '';
      if (type === 'checkbox' || type === 'radio') {
        value = el.checked ? 'checked' : 'unchecked';
      } else if (tag === 'select' || tag === 'input' || tag === 'textarea') {
        value = el.value || '';
      }

      let options = undefined;
      if (tag === 'select') {
        options = Array.from(el.options).map(o => ({ text: o.text.trim(), value: o.value, selected: o.selected }));
      }

      elements.push({
        id,
        tag,
        type,
        role,
        category: getCategory(tag, type, role),
        label,
        placeholder: el.getAttribute('placeholder') || '',
        value,
        options,
        rect: {
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        }
      });

      if (highlightId && id === Number(highlightId)) {
        const ring = document.createElement('div');
        ring.className = '__a11y_pilot_ring';
        ring.style.cssText = `
          position: fixed;
          left: ${Math.max(0, rect.left - 5)}px;
          top: ${Math.max(0, rect.top - 5)}px;
          width: ${rect.width + 10}px;
          height: ${rect.height + 10}px;
          border: 3px solid #f59e0b;
          background: rgba(245, 158, 11, 0.14);
          border-radius: 10px;
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.28);
          pointer-events: none;
          z-index: 2147483647;
        `;
        document.body.appendChild(ring);
      }
    }

    // Collect any visible live alerts / status messages on the page
    const alerts = [];
    document.querySelectorAll('[role="status"], [aria-live], .banner-success.visible, .order-msg.visible, .status-box.visible').forEach(node => {
      const s = window.getComputedStyle(node);
      if (s.display !== 'none' && s.visibility !== 'hidden') {
        const txt = (node.innerText || '').trim();
        if (txt) alerts.push(txt);
      }
    });

    const headings = Array.from(document.querySelectorAll('h1, h2')).map(h => h.innerText.trim()).filter(Boolean).slice(0, 4);

    return {
      url: window.location.href,
      title: document.title || window.location.hostname,
      headings,
      alerts,
      elements
    };
  }, activeHighlightId);

  const screenshotBuffer = await p.screenshot({ type: 'jpeg', quality: 84 });

  // Clean up temporary highlight ring after screenshot
  if (activeHighlightId) {
    await p.evaluate(() => {
      document.querySelectorAll('.__a11y_pilot_ring').forEach(el => el.remove());
    }).catch(() => {});
  }

  return {
    url: domData.url,
    title: domData.title,
    headings: domData.headings,
    alerts: domData.alerts,
    viewport: VIEWPORT,
    elements: domData.elements,
    screenshot: `data:image/jpeg;base64,${screenshotBuffer.toString('base64')}`,
    history: actionHistory.slice(-15)
  };
}

/**
 * Executes a single atomic action on the Playwright page and returns metadata about the action.
 */
async function performSingleAction(step) {
  const p = await ensureBrowser();
  // Ensure current page has fresh data-a11y-id attributes
  const preState = await scanPageAndCapture();
  const elements = preState.elements;

  const { action, elementId, value, x, y, direction, key } = step;
  const targetEl = elementId ? elements.find(e => e.id === Number(elementId)) : null;

  let summary = '';
  let highlightCoords = targetEl ? targetEl.rect : null;

  if (action === 'navigate') {
    let targetUrl = String(value || '').trim();
    if (targetUrl.startsWith('/sites/')) {
      targetUrl = `http://localhost:${PORT}${targetUrl}`;
    } else if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }
    await p.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await p.waitForTimeout(250);
    summary = `Navigated to ${targetUrl}`;
  } else if (action === 'click') {
    if (targetEl) {
      const locator = p.locator(`[data-a11y-id="${targetEl.id}"]`).first();
      await locator.scrollIntoViewIfNeeded().catch(() => {});
      await locator.click({ timeout: 5000 });
      await p.waitForTimeout(280);
      summary = `Clicked #${targetEl.id} "${targetEl.label}"`;
    } else if (typeof x === 'number' && typeof y === 'number') {
      await p.mouse.click(x, y);
      await p.waitForTimeout(280);
      highlightCoords = { x: x - 18, y: y - 18, width: 36, height: 36 };
      summary = `Clicked at coordinates (${Math.round(x)}, ${Math.round(y)})`;
    } else {
      throw new Error(`Element #${elementId} not found on current page.`);
    }
  } else if (action === 'type') {
    if (!targetEl) throw new Error(`Input element #${elementId} not found.`);
    const locator = p.locator(`[data-a11y-id="${targetEl.id}"]`).first();
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    await locator.click({ timeout: 4000 });
    await locator.fill(String(value ?? ''));
    if (step.pressEnter) {
      await locator.press('Enter');
    }
    await p.waitForTimeout(220);
    summary = `Typed "${value}" into #${targetEl.id} (${targetEl.label})`;
  } else if (action === 'select') {
    if (!targetEl) throw new Error(`Dropdown element #${elementId} not found.`);
    const locator = p.locator(`[data-a11y-id="${targetEl.id}"]`).first();
    // Match option by value or partial text
    let matchedValue = String(value ?? '');
    if (targetEl.options && targetEl.options.length) {
      const q = matchedValue.toLowerCase();
      const found = targetEl.options.find(
        o => o.value.toLowerCase() === q || o.text.toLowerCase() === q || o.text.toLowerCase().includes(q)
      );
      if (found) matchedValue = found.value;
    }
    await locator.selectOption(matchedValue);
    await p.waitForTimeout(220);
    summary = `Selected "${matchedValue}" in #${targetEl.id} (${targetEl.label})`;
  } else if (action === 'scroll') {
    const dir = (direction || value || 'down').toLowerCase();
    const delta = dir === 'up' ? -420 : dir === 'top' ? -5000 : 420;
    await p.mouse.wheel(0, delta);
    await p.waitForTimeout(250);
    summary = `Scrolled page ${dir}`;
  } else if (action === 'key') {
    const k = key || value || 'Enter';
    await p.keyboard.press(k);
    await p.waitForTimeout(220);
    summary = `Pressed keyboard key "${k}"`;
  } else if (action === 'back') {
    await p.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
    summary = 'Navigated back';
  } else if (action === 'reload') {
    await p.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
    summary = 'Reloaded current page';
  } else if (action === 'narrate') {
    summary = String(value || step.explanation || 'Page narration ready.');
  }

  const record = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    action,
    elementId: targetEl ? targetEl.id : elementId || null,
    targetLabel: targetEl ? targetEl.label : null,
    value: value || null,
    rect: highlightCoords,
    summary
  };
  actionHistory.push(record);
  return { record, activeHighlightId: targetEl ? targetEl.id : null };
}

/**
 * Fuzzy matcher that finds the best interactive DOM element for a natural language target phrase.
 */
function findBestElement(elements, phrase, preferredFilter = null) {
  if (!phrase) return null;
  const clean = phrase.toLowerCase().trim();

  // Check explicit #ID reference like "#4" or "element 4" or "number 4" or bare number "4"
  const idMatch = clean.match(/^(?:#|element\s+#?|badge\s+#?|item\s+#?|number\s+#?)?(\d+)$/);
  if (idMatch) {
    const num = Number(idMatch[1]);
    const exact = elements.find(e => e.id === num);
    if (exact) return exact;
  }

  const tokens = clean.split(/[^a-z0-9]+/).filter(t => t.length > 1);
  let best = null;
  let bestScore = 0;

  for (const el of elements) {
    if (preferredFilter && !preferredFilter(el)) continue;

    const hayLabel = (el.label || '').toLowerCase();
    const hayPlaceholder = (el.placeholder || '').toLowerCase();
    const hayOptions = (el.options || []).map(o => o.text.toLowerCase()).join(' ');
    const hayAll = `${hayLabel} ${hayPlaceholder} ${hayOptions} ${el.type} ${el.role}`;

    let score = 0;
    if (hayLabel === clean) score += 100;
    else if (hayLabel.includes(clean)) score += 65;
    else if (clean.includes(hayLabel) && hayLabel.length > 3) score += 55;

    if (hayOptions && hayOptions.includes(clean)) score += 60;

    for (const tok of tokens) {
      if (hayLabel.includes(tok)) score += 18;
      else if (hayPlaceholder.includes(tok)) score += 12;
      else if (hayOptions.includes(tok)) score += 14;
      else if (hayAll.includes(tok)) score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      best = el;
    }
  }

  return bestScore >= 14 ? best : null;
}

/**
 * Builds the structured Set-of-Mark DOM prompt for LLM agents.
 */
function buildAgentSystemPrompt(command, state) {
  const elementLines = state.elements.map(e => {
    const optStr = e.options ? ` options=[${e.options.map(o => `"${o.text}"`).join(', ')}]` : '';
    const valStr = e.value ? ` currentValue="${e.value}"` : '';
    return `#${e.id} [${e.tag}/${e.type}] label="${e.label}"${valStr}${optStr} bbox=(${e.rect.x},${e.rect.y},${e.rect.width}x${e.rect.height})`;
  }).join('\n');

  return `You are A11yPilot, an accessibility browser agent helping a person with a disability interact with a live webpage.
Current Page Title: "${state.title}"
Current URL: "${state.url}"
Visible Page Alerts: ${JSON.stringify(state.alerts)}

Interactive Elements on Page (Set-of-Mark IDs #1..#${state.elements.length}):
${elementLines}

User Command: "${command}"

Return ONLY a valid JSON object with:
1. "spokenResponse": A warm, clear, concise 1-2 sentence accessibility announcement of what you are doing or what is on the page.
2. "steps": An array of ordered actions to fulfill the user's request. Each step must have:
   - "action": one of "click", "type", "select", "scroll", "navigate", "narrate"
   - "elementId": integer ID from the list above (required for click, type, select)
   - "value": string text to type, option text to select, or URL to navigate to
   - "explanation": short human-readable description of this step.`;
}

/**
 * Calls Gemini Multimodal API (gemini-3.8-flash default + automatic cascade fallback) when an API key is provided.
 */
async function planWithGemini(command, state, apiKey, requestedModel = 'gemini-3.8-flash') {
  const prompt = buildAgentSystemPrompt(command, state);
  const base64Image = state.screenshot.replace(/^data:image\/\w+;base64,/, '');

  const candidateModels = Array.from(new Set([
    requestedModel || 'gemini-3.8-flash',
    'gemini-3.8-flash',
    'gemini-3.8-pro',
    'gemini-3.0-flash',
    'gemini-2.0-flash'
  ]));

  let lastErr = null;
  for (const modelId of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: base64Image
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        lastErr = new Error(`Gemini (${modelId}) HTTP ${response.status}: ${errText.slice(0, 160)}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        engine: `Google ${modelId}`,
        spokenResponse: parsed.spokenResponse || 'Executing your requested browser actions.',
        steps: Array.isArray(parsed.steps) ? parsed.steps : []
      };
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error('Gemini API request failed.');
}

/**
 * Calls DeepSeek API (deepseek-chat / DeepSeek-V3 or deepseek-reasoner / DeepSeek-R1).
 */
async function planWithDeepSeek(command, state, apiKey, requestedModel = 'deepseek-chat') {
  const prompt = buildAgentSystemPrompt(command, state);
  const modelId = requestedModel || 'deepseek-chat';

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: 'You are A11yPilot, an accessibility web browser agent. Always respond with valid JSON containing "spokenResponse" and "steps".'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek (${modelId}) HTTP ${response.status}: ${errText.slice(0, 180)}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content || '{}';
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(cleaned);
  return {
    engine: `DeepSeek (${modelId})`,
    spokenResponse: parsed.spokenResponse || 'Executing your requested browser actions.',
    steps: Array.isArray(parsed.steps) ? parsed.steps : []
  };
}

/**
 * Built-in Semantic DOM Grounding Planner (works immediately with zero configuration,
 * supports multi-step compound instructions, badge numbers, form filling, and page narration).
 */
function planWithLocalGrounding(command, state) {
  const elements = state.elements;
  const steps = [];
  const raw = String(command || '').trim();
  const lower = raw.toLowerCase();

  // 1. Check if the user is asking for a screen-reader summary / "what is on this page"
  if (/^(what|describe|summarize|read|where am i|help|list)/.test(lower) && !/click|type|fill|select|book|add|order/.test(lower)) {
    const inputCount = elements.filter(e => e.category === 'input').length;
    const actionCount = elements.filter(e => e.category === 'action' || e.category === 'toggle').length;
    const alertPart = state.alerts.length ? ` Active alert: ${state.alerts.join(' ')}` : '';
    const summary = `You are on "${state.title}". There are ${elements.length} interactive controls: ${inputCount} form fields and ${actionCount} buttons or toggles.${alertPart}`;
    return {
      engine: 'A11yPilot Semantic DOM Grounding',
      spokenResponse: summary,
      steps: [{ action: 'narrate', value: summary, explanation: 'Summarized page structure and interactive controls' }]
    };
  }

  // Split compound commands separated by ", then ", " and then ", ";", or ", " when followed by an action verb
  const clauses = raw
    .split(/\s*(?:;|,\s+and\s+|\s+then\s+|,\s*(?=(?:click|press|tap|type|enter|fill|set|select|choose|check|toggle|scroll|go|open|switch|book|confirm|submit|add|place|request|enroll)\b)|\s+and\s+(?=(?:click|press|tap|type|enter|fill|set|select|choose|check|toggle|scroll|go|open|switch|book|confirm|submit|add|place|request|enroll)\b))\s*/i)
    .map(c => c.trim())
    .filter(Boolean);

  for (const clause of clauses) {
    const cLow = clause.toLowerCase();

    // Scroll commands
    if (/^scroll\s+(down|up|top|bottom)/i.test(cLow)) {
      const dir = cLow.match(/^scroll\s+(down|up|top|bottom)/i)[1];
      steps.push({ action: 'scroll', direction: dir, value: dir, explanation: `Scroll ${dir} on the page` });
      continue;
    }

    // Direct badge command: "click #5", "tap 5", "#5", "5"
    const badgeClick = clause.match(/^(?:click|press|tap|select|check|toggle)?\s*(?:#|badge\s*|element\s*|number\s*)?(\d+)$/i);
    if (badgeClick) {
      const id = Number(badgeClick[1]);
      const el = elements.find(e => e.id === id);
      if (el) {
        steps.push({
          action: 'click',
          elementId: el.id,
          explanation: `Click #${el.id} (${el.label})`
        });
        continue;
      }
    }

    // Direct badge typing: "type Maya Lin in #4" or "in #4 type Maya Lin"
    const badgeType = clause.match(/^(?:type|enter|write|fill)\s+["']?(.+?)["']?\s+(?:in|into|on|to)\s+#?(\d+)$/i);
    if (badgeType) {
      const val = badgeType[1].trim();
      const id = Number(badgeType[2]);
      const el = elements.find(e => e.id === id);
      if (el) {
        steps.push({
          action: el.tag === 'select' ? 'select' : 'type',
          elementId: el.id,
          value: val,
          explanation: `Enter "${val}" into #${el.id} (${el.label})`
        });
        continue;
      }
    }

    // Natural language typing:
    // Patterns:
    // A) "type/enter X in/into Field"
    // B) "fill/set Field with/to X"
    let typeMatch =
      clause.match(/^(?:type|enter|write|input)\s+["']?(.+?)["']?\s+(?:in|into|for|on)\s+(?:the\s+)?(.+?)(?:\s+field|\s+box|\s+input)?$/i);
    let fieldPhrase = null;
    let textValue = null;

    if (typeMatch) {
      textValue = typeMatch[1].trim();
      fieldPhrase = typeMatch[2].trim();
    } else {
      const fillWithMatch = clause.match(/^(?:fill(?:\s+in|\s+out)?|set|enter)\s+(?:the\s+)?(.+?)\s+(?:with|to|as)\s+["']?(.+?)["']?$/i);
      if (fillWithMatch) {
        fieldPhrase = fillWithMatch[1].trim();
        textValue = fillWithMatch[2].trim();
      }
    }

    if (fieldPhrase && textValue !== null) {
      const inputEl = findBestElement(
        elements,
        fieldPhrase,
        e => e.tag === 'input' || e.tag === 'textarea' || e.tag === 'select'
      );
      if (inputEl) {
        steps.push({
          action: inputEl.tag === 'select' ? 'select' : 'type',
          elementId: inputEl.id,
          value: textValue,
          explanation: `${inputEl.tag === 'select' ? 'Select' : 'Type'} "${textValue}" in #${inputEl.id} (${inputEl.label})`
        });
        continue;
      }
    }

    // Dropdown selection: "select Afternoon" or "select Dr. Elena Chen in Specialist"
    const selectMatch = clause.match(/^(?:select|choose|pick)\s+["']?(.+?)["']?(?:\s+(?:from|in|under)\s+(.+))?$/i);
    if (selectMatch) {
      const optionQuery = selectMatch[1].trim();
      const selectFieldQuery = (selectMatch[2] || '').trim();

      // First check if optionQuery matches an option inside any <select> element
      const selectElements = elements.filter(e => e.tag === 'select' && Array.isArray(e.options));
      let matchedSelect = null;
      let matchedOption = null;

      for (const sEl of selectElements) {
        if (selectFieldQuery && !sEl.label.toLowerCase().includes(selectFieldQuery.toLowerCase())) continue;
        const opt = sEl.options.find(o =>
          o.text.toLowerCase().includes(optionQuery.toLowerCase()) ||
          optionQuery.toLowerCase().includes(o.text.toLowerCase())
        );
        if (opt) {
          matchedSelect = sEl;
          matchedOption = opt;
          break;
        }
      }

      if (matchedSelect && matchedOption) {
        steps.push({
          action: 'select',
          elementId: matchedSelect.id,
          value: matchedOption.value,
          explanation: `Select "${matchedOption.text}" in #${matchedSelect.id} (${matchedSelect.label})`
        });
        continue;
      }

      // Or maybe "Select Dr. Elena Chen" matches a button on the page!
      const btnEl = findBestElement(elements, clause);
      if (btnEl) {
        steps.push({
          action: 'click',
          elementId: btnEl.id,
          explanation: `Click #${btnEl.id} (${btnEl.label})`
        });
        continue;
      }
    }

    // Navigation: "go to https://..." or "switch to FreshMarket Grocery"
    const navUrlMatch = clause.match(/^(?:go\s+to|navigate\s+to|open|visit)\s+(https?:\/\/\S+|[a-z0-9.-]+\.[a-z]{2,}\S*)$/i);
    if (navUrlMatch) {
      steps.push({
        action: 'navigate',
        value: navUrlMatch[1],
        explanation: `Navigate browser to ${navUrlMatch[1]}`
      });
      continue;
    }

    // Click / Check / Add / Confirm / Submit / Switch
    const cleanedTarget = clause
      .replace(/^(?:please\s+)?(?:click|press|tap|check|uncheck|toggle|hit|activate|switch\s+to|go\s+to|open)\s+(?:on\s+)?(?:the\s+)?/i, '')
      .trim();

    const targetEl = findBestElement(elements, cleanedTarget) || findBestElement(elements, clause);
    if (targetEl) {
      steps.push({
        action: 'click',
        elementId: targetEl.id,
        explanation: `Click #${targetEl.id} (${targetEl.label})`
      });
    }
  }

  if (steps.length === 0) {
    // Final fallback: try matching the entire command against all elements
    const anyEl = findBestElement(elements, raw);
    if (anyEl) {
      steps.push({
        action: 'click',
        elementId: anyEl.id,
        explanation: `Click #${anyEl.id} (${anyEl.label})`
      });
    } else {
      return {
        engine: 'A11yPilot Semantic DOM Grounding',
        spokenResponse: `I couldn't match "${raw}" to an element on this page. Try referencing a badge number like "Click #3" or naming a visible button or field.`,
        steps: []
      };
    }
  }

  const spokenResponse = steps.map(s => s.explanation).join(', then ') + '.';
  return {
    engine: 'A11yPilot Semantic DOM Grounding',
    spokenResponse,
    steps
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e6) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  try {
    // 1. Built-in realistic demo portals loaded by Playwright Chromium
    if (req.method === 'GET' && pathname === '/sites/clinic') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(getClinicPageHtml());
    }
    if (req.method === 'GET' && pathname === '/sites/grocery') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(getGroceryPageHtml());
    }
    if (req.method === 'GET' && pathname === '/sites/civic') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(getCivicPageHtml());
    }

    // 2. API: Get live Playwright state + Set-of-Mark elements + screenshot
    if (req.method === 'GET' && pathname === '/api/state') {
      const highlightId = parsedUrl.searchParams.get('highlight');
      const state = await withLock(() => scanPageAndCapture(highlightId ? Number(highlightId) : null));
      return sendJson(res, 200, { ok: true, state });
    }

    // 3. API: Direct browser action (click badge, type in field, coordinate click, scroll, navigate)
    if (req.method === 'POST' && pathname === '/api/action') {
      const body = await readJsonBody(req);
      const result = await withLock(async () => {
        const { record, activeHighlightId } = await performSingleAction(body);
        const state = await scanPageAndCapture(activeHighlightId);
        return { record, state };
      });
      return sendJson(res, 200, { ok: true, ...result });
    }

    // 4. API: Natural Language Visual Click/Type Agent (Gemini 3.8 + DeepSeek + Local DOM Grounding)
    if (req.method === 'POST' && pathname === '/api/agent') {
      const body = await readJsonBody(req);
      const command = String(body.command || '').trim();
      const provider = String(body.provider || 'local').trim();
      const model = String(body.model || '').trim();
      const apiKey = String(body.apiKey || process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY || '').trim();

      if (!command) {
        return sendJson(res, 400, { ok: false, error: 'Please provide a command.' });
      }

      const outcome = await withLock(async () => {
        const initialState = await scanPageAndCapture();
        let plan = null;

        if (provider === 'deepseek' && apiKey) {
          try {
            plan = await planWithDeepSeek(command, initialState, apiKey, model || 'deepseek-chat');
          } catch (dsErr) {
            console.warn('DeepSeek API fallback to local grounding:', dsErr.message);
            plan = planWithLocalGrounding(command, initialState);
            plan.engine = `Semantic DOM Grounding (DeepSeek fallback: ${dsErr.message.slice(0, 80)})`;
          }
        } else if (apiKey && provider !== 'local') {
          try {
            plan = await planWithGemini(command, initialState, apiKey, model || 'gemini-3.8-flash');
          } catch (geminiErr) {
            console.warn('Gemini API fallback to local grounding:', geminiErr.message);
            plan = planWithLocalGrounding(command, initialState);
            plan.engine = `Semantic DOM Grounding (Gemini fallback: ${geminiErr.message.slice(0, 80)})`;
          }
        } else {
          plan = planWithLocalGrounding(command, initialState);
        }

        const executedSteps = [];
        let lastHighlightId = null;

        for (const step of plan.steps) {
          if (step.action === 'narrate') {
            executedSteps.push({
              action: 'narrate',
              summary: step.explanation || step.value,
              elementId: null,
              rect: null
            });
            continue;
          }
          const { record, activeHighlightId } = await performSingleAction(step);
          lastHighlightId = activeHighlightId;
          executedSteps.push(record);
        }

        const finalState = await scanPageAndCapture(lastHighlightId);
        // If new page alerts appeared after the action, append them to the spoken response
        let spoken = plan.spokenResponse;
        if (finalState.alerts && finalState.alerts.length > 0) {
          spoken += ` Page alert: ${finalState.alerts.join(' ')}`;
        }

        return {
          engine: plan.engine,
          spokenResponse: spoken,
          executedSteps,
          state: finalState
        };
      });

      return sendJson(res, 200, { ok: true, ...outcome });
    }

    // 5. Serve Frontend Static Assets (index.html, styles.css, app.js)
    let filePath = pathname === '/' ? '/index.html' : pathname;
    const safePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
    const fullPath = path.join(__dirname, 'public', safePath);

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.json': 'application/json'
      };
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      return fs.createReadStream(fullPath).pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (err) {
    console.error('Server error:', err);
    sendJson(res, 500, { ok: false, error: err.message || 'Internal server error' });
  }
});

server.listen(PORT, async () => {
  console.log(`A11yPilot Accessible Agent Browser running at http://localhost:${PORT}`);
  try {
    await ensureBrowser();
    console.log('Playwright headless Chromium initialized and ready.');
  } catch (err) {
    console.error('Failed to pre-warm Chromium:', err);
  }
});
