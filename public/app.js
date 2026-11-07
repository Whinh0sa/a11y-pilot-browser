(() => {
  let currentState = null;
  let badgesVisible = true;
  let ttsEnabled = false;

  // Multi-provider AI state (Gemini 3.8 Flash + DeepSeek V3/R1 + Local Engine)
  let aiProvider = localStorage.getItem('a11y_ai_provider') || 'gemini';
  let geminiModel = localStorage.getItem('a11y_gemini_model') || 'gemini-3.8-flash';
  let geminiApiKey = localStorage.getItem('a11y_gemini_key') || '';
  let deepseekModel = localStorage.getItem('a11y_deepseek_model') || 'deepseek-chat';
  let deepseekApiKey = localStorage.getItem('a11y_deepseek_key') || '';

  let activeQuickElement = null;
  let usePlaywrightBackend = false;
  let clientHistory = [];
  let navStack = ['/sites/clinic'];
  let currentSiteKey = '/sites/clinic';
  let currentExternalUrl = null;
  let activeFlowStep = 1;

  // Built-in Realistic Portals
  const PORTAL_PAGES = {
    '/sites/clinic': {
      url: 'https://carebridge.a11y/sites/clinic',
      title: 'CareBridge Health — Patient Appointment Portal',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CareBridge Health — Patient Appointment Portal</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #f4f7f9; color: #102a43; line-height: 1.5; }
    header { background: #0b4f6c; color: #ffffff; padding: 14px 26px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .brand { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
    .brand-badge { background: #20bf55; color: #062b16; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
    nav { display: flex; gap: 10px; flex-wrap: wrap; }
    nav a { color: #d9e2ec; text-decoration: none; padding: 7px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    nav a:hover, nav a.active { background: rgba(255,255,255,0.18); color: #fff; }
    .container { max-width: 1140px; margin: 18px auto; padding: 0 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card { background: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #d9e2ec; box-shadow: 0 4px 12px rgba(16,42,67,0.05); }
    h1 { font-size: 19px; margin-bottom: 4px; color: #0b4f6c; }
    .subtitle { font-size: 13px; color: #486581; margin-bottom: 14px; }
    .search-row { display: flex; gap: 8px; margin-bottom: 14px; }
    .search-row input { flex: 1; padding: 9px 12px; border: 1.5px solid #bcccdc; border-radius: 8px; font-size: 13px; }
    .search-row button { padding: 9px 14px; background: #0b4f6c; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px; }
    .doctor-list { display: flex; flex-direction: column; gap: 10px; }
    .doc-card { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border: 1.5px solid #e1e8ef; border-radius: 10px; background: #fafcfe; gap: 10px; }
    .doc-card.selected { border-color: #0b4f6c; background: #eef6fa; }
    .doc-info h3 { font-size: 15px; color: #102a43; }
    .doc-info p { font-size: 12.5px; color: #486581; }
    .doc-tag { display: inline-block; margin-top: 4px; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: #d8f3dc; color: #1b4332; }
    .select-doc-btn { padding: 7px 12px; border-radius: 8px; border: 1.5px solid #0b4f6c; background: #fff; color: #0b4f6c; font-weight: 700; cursor: pointer; font-size: 12.5px; white-space: nowrap; }
    .doc-card.selected .select-doc-btn { background: #0b4f6c; color: #fff; }
    .form-group { margin-bottom: 11px; }
    .form-group label { display: block; font-size: 12.5px; font-weight: 700; color: #243b53; margin-bottom: 4px; }
    .form-group input, .form-group select { width: 100%; padding: 8px 11px; border: 1.5px solid #bcccdc; border-radius: 8px; font-size: 13.5px; color: #102a43; background: #fff; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .checkbox-row { display: flex; gap: 14px; align-items: center; margin: 10px 0; font-size: 12.5px; font-weight: 600; color: #334e68; flex-wrap: wrap; }
    .checkbox-row label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .checkbox-row input { width: 16px; height: 16px; }
    .submit-btn { width: 100%; padding: 11px; background: #147d64; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 4px; }
    .banner-success { display: none; margin-top: 12px; padding: 12px 14px; border-radius: 10px; background: #d3f9d8; border: 2px solid #2b8a3e; color: #1b4332; font-weight: 700; font-size: 13px; }
    .banner-success.visible { display: block; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>CareBridge Medical Portal</span>
      <span class="brand-badge">LIVE CLINIC</span>
    </div>
    <nav>
      <a href="#clinic" data-portal="/sites/clinic" class="active" aria-label="Clinic Appointments Page">Clinic Booking</a>
      <a href="#grocery" data-portal="/sites/grocery" aria-label="Switch to FreshMarket Grocery Store">FreshMarket Grocery</a>
      <a href="#civic" data-portal="/sites/civic" aria-label="Switch to City Paratransit & Utilities">Civic Paratransit</a>
    </nav>
  </header>

  <main class="container">
    <section class="card">
      <h1>Schedule Appointment</h1>
      <p class="subtitle">Complete patient details to confirm your medical visit.</p>

      <form id="booking-form" onsubmit="submitBooking(event)">
        <div class="form-group">
          <label for="patient-name">Patient Full Name</label>
          <input type="text" id="patient-name" placeholder="e.g. Maya Lin" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="patient-email">Email Address</label>
            <input type="email" id="patient-email" placeholder="maya@example.com" />
          </div>
          <div class="form-group">
            <label for="patient-phone">Phone Number</label>
            <input type="tel" id="patient-phone" placeholder="555-0192" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="specialty-select">Selected Specialist</label>
            <select id="specialty-select">
              <option value="Dr. Arjun Patel (Cardiology)">Dr. Arjun Patel (Cardiology)</option>
              <option value="Dr. Elena Chen (Neurology)">Dr. Elena Chen (Neurology)</option>
              <option value="Dr. Amara Okafor (Primary Care)">Dr. Amara Okafor (Primary Care)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="time-slot">Preferred Time Slot</label>
            <select id="time-slot">
              <option value="Morning (9:00 AM - 11:30 AM)">Morning (9:00 AM - 11:30 AM)</option>
              <option value="Afternoon (1:30 PM - 4:00 PM)">Afternoon (1:30 PM - 4:00 PM)</option>
              <option value="Telehealth Video Visit">Telehealth Video Visit</option>
            </select>
          </div>
        </div>

        <div class="checkbox-row">
          <label for="wheelchair-access">
            <input type="checkbox" id="wheelchair-access" />
            Wheelchair Accessible Exam Room
          </label>
          <label for="asl-interpreter">
            <input type="checkbox" id="asl-interpreter" />
            ASL Interpreter Requested
          </label>
        </div>

        <div class="form-group">
          <label for="visit-reason">Reason for Visit / Notes</label>
          <input type="text" id="visit-reason" placeholder="e.g. Annual checkup or prescription refill" />
        </div>

        <button type="submit" id="confirm-booking-btn" class="submit-btn">Confirm Appointment Booking</button>
      </form>

      <div id="booking-confirmation" class="banner-success" role="status" aria-live="polite"></div>
    </section>

    <section class="card">
      <h1>Available Specialists</h1>
      <p class="subtitle">Select a specialist below or use the booking form.</p>

      <div class="search-row">
        <input type="text" id="doctor-search" aria-label="Search doctor by name or specialty" placeholder="Search Cardiology, Neurology..." />
        <button type="button" id="filter-btn" onclick="filterDoctors()">Filter List</button>
      </div>

      <div class="doctor-list">
        <div class="doc-card selected" id="doc-card-patel" data-search="arjun patel cardiology heart">
          <div class="doc-info">
            <h3>Dr. Arjun Patel, MD</h3>
            <p>Cardiology & Vascular Care • Main Medical Center</p>
            <span class="doc-tag">Next Available: Tomorrow 10:00 AM</span>
          </div>
          <button type="button" class="select-doc-btn" aria-label="Select Dr. Arjun Patel" onclick="chooseDoctor('Dr. Arjun Patel (Cardiology)', 'doc-card-patel')">Selected</button>
        </div>

        <div class="doc-card" id="doc-card-chen" data-search="elena chen neurology migraine nerve">
          <div class="doc-info">
            <h3>Dr. Elena Chen, MD</h3>
            <p>Neurology & Mobility Rehabilitation • West Wing Suite 300</p>
            <span class="doc-tag">Next Available: Thursday 2:30 PM</span>
          </div>
          <button type="button" class="select-doc-btn" aria-label="Select Dr. Elena Chen" onclick="chooseDoctor('Dr. Elena Chen (Neurology)', 'doc-card-chen')">Choose Doctor</button>
        </div>

        <div class="doc-card" id="doc-card-okafor" data-search="amara okafor primary care general medicine">
          <div class="doc-info">
            <h3>Dr. Amara Okafor, DO</h3>
            <p>Accessible Primary Care & Telehealth • Ground Floor</p>
            <span class="doc-tag">Next Available: Friday 9:15 AM</span>
          </div>
          <button type="button" class="select-doc-btn" aria-label="Select Dr. Amara Okafor" onclick="chooseDoctor('Dr. Amara Okafor (Primary Care)', 'doc-card-okafor')">Choose Doctor</button>
        </div>
      </div>
    </section>
  </main>

  <script>
    function chooseDoctor(docName, cardId) {
      document.getElementById('specialty-select').value = docName;
      document.querySelectorAll('.doc-card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('.select-doc-btn').textContent = 'Choose Doctor';
      });
      const card = document.getElementById(cardId);
      if (card) {
        card.classList.add('selected');
        card.querySelector('.select-doc-btn').textContent = 'Selected';
      }
    }
    function filterDoctors() {
      const q = document.getElementById('doctor-search').value.toLowerCase().trim();
      document.querySelectorAll('.doc-card').forEach(card => {
        const hay = card.getAttribute('data-search');
        card.style.display = (!q || hay.includes(q)) ? 'flex' : 'none';
      });
    }
    function submitBooking(e) {
      e.preventDefault();
      const name = document.getElementById('patient-name').value || 'Patient';
      const doc = document.getElementById('specialty-select').value;
      const slot = document.getElementById('time-slot').value;
      const wc = document.getElementById('wheelchair-access').checked;
      const asl = document.getElementById('asl-interpreter').checked;
      const extras = [wc ? 'Wheelchair Room' : '', asl ? 'ASL Interpreter' : ''].filter(Boolean).join(' + ');
      const banner = document.getElementById('booking-confirmation');
      banner.textContent = '✓ Appointment Confirmed for ' + name + ' with ' + doc + ' — ' + slot + (extras ? ' (' + extras + ')' : '') + '. Confirmation #CB-8492.';
      banner.classList.add('visible');
    }
  </script>
</body>
</html>`
    },
    '/sites/grocery': {
      url: 'https://freshmarket.a11y/sites/grocery',
      title: 'FreshMarket — Accessible Home Grocery Delivery',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>FreshMarket — Accessible Home Grocery Delivery</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #f8f9fa; color: #1f2933; }
    header { background: #1b4332; color: #ffffff; padding: 14px 26px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .brand { font-size: 18px; font-weight: 800; }
    nav { display: flex; gap: 10px; }
    nav a { color: #d8f3dc; text-decoration: none; padding: 7px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    nav a.active, nav a:hover { background: rgba(255,255,255,0.18); color: #fff; }
    .layout { max-width: 1140px; margin: 18px auto; padding: 0 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .panel { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #e4e7eb; }
    .search-bar { display: flex; gap: 8px; margin-bottom: 14px; }
    .search-bar input { flex: 1; padding: 9px 12px; border: 1.5px solid #cbd2d9; border-radius: 8px; font-size: 13.5px; }
    .search-bar button { padding: 9px 16px; background: #2d6a4f; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .products { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .prod-card { border: 1.5px solid #e4e7eb; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
    .prod-title { font-size: 14.5px; font-weight: 700; color: #102a43; }
    .prod-meta { font-size: 12.5px; color: #52606d; }
    .prod-price { font-size: 15px; font-weight: 800; color: #1b4332; }
    .add-btn { padding: 8px 11px; background: #2d6a4f; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 12.5px; }
    .cart-items { list-style: none; margin: 10px 0 12px; border-top: 1px solid #e4e7eb; }
    .cart-items li { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f1f5f8; font-size: 13.5px; font-weight: 600; }
    .form-group { margin-bottom: 10px; }
    .form-group label { display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 4px; color: #323f4b; }
    .form-group input, .form-group select { width: 100%; padding: 8px 11px; border: 1.5px solid #cbd2d9; border-radius: 8px; font-size: 13.5px; }
    .checkout-btn { width: 100%; padding: 11px; background: #d97706; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 800; cursor: pointer; }
    .order-msg { display: none; margin-top: 10px; padding: 11px; background: #d8f3dc; border: 2px solid #2d6a4f; border-radius: 8px; font-weight: 700; color: #1b4332; font-size: 13px; }
    .order-msg.visible { display: block; }
  </style>
</head>
<body>
  <header>
    <div class="brand">FreshMarket Accessible Grocery</div>
    <nav>
      <a href="#clinic" data-portal="/sites/clinic" aria-label="Switch to CareBridge Clinic">Clinic Booking</a>
      <a href="#grocery" data-portal="/sites/grocery" class="active" aria-label="FreshMarket Grocery Store">FreshMarket Grocery</a>
      <a href="#civic" data-portal="/sites/civic" aria-label="Switch to Civic Paratransit">Civic Paratransit</a>
    </nav>
  </header>

  <main class="layout">
    <section class="panel">
      <h2 style="font-size:17px;margin-bottom:4px;">Delivery Checkout (<span id="cart-count">1</span>)</h2>
      <ul class="cart-items" id="cart-list">
        <li><span>Whole Grain Crackers</span><span>$3.50</span></li>
      </ul>
      <div style="font-size:15px;font-weight:800;margin-bottom:10px;">Total: $<span id="cart-total">3.50</span></div>

      <div class="form-group">
        <label for="delivery-address">Delivery Street Address</label>
        <input type="text" id="delivery-address" value="742 Evergreen Terrace, Apt 1B" />
      </div>

      <div class="form-group">
        <label for="dropoff-option">Accessible Drop-off Preference</label>
        <select id="dropoff-option">
          <option value="Hand directly to resident at door">Hand directly to resident at door</option>
          <option value="Place on raised porch table (Waist height)">Place on raised porch table (Waist height)</option>
          <option value="Ring bell and wait 2 minutes">Ring bell and wait 2 minutes</option>
        </select>
      </div>

      <div class="form-group">
        <label for="delivery-notes">Driver Instructions</label>
        <input type="text" id="delivery-notes" placeholder="e.g. Please use side ramp entrance" />
      </div>

      <button type="button" id="place-order-btn" class="checkout-btn" onclick="placeOrder()">Place Grocery Order</button>
      <div id="order-status" class="order-msg" role="status" aria-live="polite"></div>
    </section>

    <section class="panel">
      <h1 style="font-size:18px;margin-bottom:10px;">Same-Day Doorstep Essentials</h1>
      <div class="search-bar">
        <input type="text" id="grocery-search" aria-label="Search grocery items" placeholder="Search apples, milk, bread, soup..." />
        <button type="button" id="grocery-search-btn" onclick="filterProducts()">Search Items</button>
      </div>

      <div class="products">
        <div class="prod-card" data-name="organic honeycrisp apples fruit">
          <div>
            <div class="prod-title">Organic Honeycrisp Apples (3 lb)</div>
            <div class="prod-meta">Pre-washed, easy-open bag</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="prod-price">$5.49</span>
            <button type="button" class="add-btn" aria-label="Add Organic Honeycrisp Apples to Cart" onclick="addItem('Organic Honeycrisp Apples', 5.49)">Add to Cart</button>
          </div>
        </div>

        <div class="prod-card" data-name="oat milk dairy free carton">
          <div>
            <div class="prod-title">Barista Oat Milk (64 oz)</div>
            <div class="prod-meta">Easy-grip flip cap carton</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="prod-price">$4.29</span>
            <button type="button" class="add-btn" aria-label="Add Barista Oat Milk to Cart" onclick="addItem('Barista Oat Milk', 4.29)">Add to Cart</button>
          </div>
        </div>

        <div class="prod-card" data-name="whole grain sourdough bread sliced">
          <div>
            <div class="prod-title">Sliced Sourdough Loaf</div>
            <div class="prod-meta">Fresh baked, resealable tie</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="prod-price">$4.99</span>
            <button type="button" class="add-btn" aria-label="Add Sliced Sourdough Loaf to Cart" onclick="addItem('Sliced Sourdough Loaf', 4.99)">Add to Cart</button>
          </div>
        </div>

        <div class="prod-card" data-name="roasted tomato basil soup ready meal">
          <div>
            <div class="prod-title">Roasted Tomato Basil Soup</div>
            <div class="prod-meta">Pull-tab microwave bowl (16 oz)</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="prod-price">$3.99</span>
            <button type="button" class="add-btn" aria-label="Add Roasted Tomato Basil Soup to Cart" onclick="addItem('Roasted Tomato Basil Soup', 3.99)">Add to Cart</button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <script>
    let total = 3.50;
    let count = 1;
    function addItem(name, price) {
      total += price;
      count += 1;
      const li = document.createElement('li');
      li.innerHTML = '<span>' + name + '</span><span>$' + price.toFixed(2) + '</span>';
      document.getElementById('cart-list').appendChild(li);
      document.getElementById('cart-total').textContent = total.toFixed(2);
      document.getElementById('cart-count').textContent = count;
    }
    function filterProducts() {
      const q = document.getElementById('grocery-search').value.toLowerCase().trim();
      document.querySelectorAll('.prod-card').forEach(c => {
        c.style.display = (!q || c.getAttribute('data-name').includes(q)) ? 'flex' : 'none';
      });
    }
    function placeOrder() {
      const addr = document.getElementById('delivery-address').value;
      const pref = document.getElementById('dropoff-option').value;
      const msg = document.getElementById('order-status');
      msg.textContent = '✓ Order Placed! ' + count + ' items ($' + total.toFixed(2) + ') arriving at ' + addr + ' — ' + pref + '.';
      msg.classList.add('visible');
    }
  </script>
</body>
</html>`
    },
    '/sites/civic': {
      url: 'https://civicaccess.a11y/sites/civic',
      title: 'CivicAccess — Paratransit & Municipal Services',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CivicAccess — Paratransit & Municipal Services</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #f1f5f9; color: #0f172a; }
    header { background: #1e293b; color: #ffffff; padding: 14px 26px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .brand { font-size: 18px; font-weight: 800; }
    nav { display: flex; gap: 10px; }
    nav a { color: #cbd5e1; text-decoration: none; padding: 7px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    nav a.active, nav a:hover { background: rgba(255,255,255,0.16); color: #fff; }
    .main { max-width: 1100px; margin: 20px auto; padding: 0 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #cbd5e1; }
    h1 { font-size: 18px; margin-bottom: 6px; color: #0f172a; }
    p.sub { font-size: 13px; color: #475569; margin-bottom: 14px; }
    .field { margin-bottom: 12px; }
    .field label { display: block; font-size: 12.5px; font-weight: 700; margin-bottom: 4px; }
    .field input, .field select { width: 100%; padding: 9px 11px; border: 1.5px solid #94a3b8; border-radius: 8px; font-size: 13.5px; }
    .btn-primary { width: 100%; padding: 11px; background: #0284c7; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; }
    .status-box { display: none; margin-top: 12px; padding: 11px; background: #e0f2fe; border: 2px solid #0284c7; border-radius: 8px; font-weight: 700; color: #075985; font-size: 13px; }
    .status-box.visible { display: block; }
  </style>
</head>
<body>
  <header>
    <div class="brand">CivicAccess Paratransit & City Portal</div>
    <nav>
      <a href="#clinic" data-portal="/sites/clinic" aria-label="Switch to CareBridge Clinic">Clinic Booking</a>
      <a href="#grocery" data-portal="/sites/grocery" aria-label="Switch to FreshMarket Grocery">FreshMarket Grocery</a>
      <a href="#civic" data-portal="/sites/civic" class="active" aria-label="Civic Paratransit Page">Civic Paratransit</a>
    </nav>
  </header>

  <main class="main">
    <section class="card">
      <h1>Book Door-to-Door Paratransit Van</h1>
      <p class="sub">ADA wheelchair-lift equipped city shuttle reservation.</p>

      <div class="field">
        <label for="rider-id">Rider Pass Name or ID</label>
        <input type="text" id="rider-id" placeholder="e.g. Jordan Rivera (#ADA-409)" />
      </div>
      <div class="field">
        <label for="pickup-loc">Pickup Location</label>
        <input type="text" id="pickup-loc" placeholder="e.g. 240 Oak Street" />
      </div>
      <div class="field">
        <label for="dropoff-loc">Destination</label>
        <input type="text" id="dropoff-loc" placeholder="e.g. CareBridge Medical Center" />
      </div>
      <div class="field">
        <label for="mobility-aid">Mobility Equipment</label>
        <select id="mobility-aid">
          <option value="Power Wheelchair (Hydraulic Lift)">Power Wheelchair (Hydraulic Lift)</option>
          <option value="Manual Folding Wheelchair">Manual Folding Wheelchair</option>
          <option value="Service Animal + Walker">Service Animal + Walker</option>
        </select>
      </div>
      <button type="button" id="schedule-ride-btn" class="btn-primary" onclick="bookRide()">Request Accessible Van</button>
      <div id="ride-status" class="status-box" role="status" aria-live="polite"></div>
    </section>

    <section class="card">
      <h1>Utility Medical Baseline Discount</h1>
      <p class="sub">Apply for reduced electric & heating rates for medical devices.</p>

      <div class="field">
        <label for="account-num">Utility Account Number</label>
        <input type="text" id="account-num" placeholder="e.g. UTIL-99201" />
      </div>
      <div class="field">
        <label for="device-type">Qualifying Medical Equipment</label>
        <select id="device-type">
          <option value="Home Oxygen Concentrator / CPAP">Home Oxygen Concentrator / CPAP</option>
          <option value="Power Wheelchair Charging Station">Power Wheelchair Charging Station</option>
          <option value="Home Dialysis Machine">Home Dialysis Machine</option>
        </select>
      </div>
      <button type="button" id="apply-discount-btn" class="btn-primary" style="background:#0f766e;" onclick="applyDiscount()">Enroll in Medical Baseline Rate</button>
      <div id="discount-status" class="status-box" role="status" aria-live="polite"></div>
    </section>
  </main>

  <script>
    function bookRide() {
      const rider = document.getElementById('rider-id').value || 'Rider';
      const from = document.getElementById('pickup-loc').value || 'Home';
      const to = document.getElementById('dropoff-loc').value || 'Destination';
      const aid = document.getElementById('mobility-aid').value;
      const box = document.getElementById('ride-status');
      box.textContent = '✓ Van Dispatched for ' + rider + ': ' + from + ' → ' + to + ' (' + aid + '). Dispatch #VAN-318.';
      box.classList.add('visible');
    }
    function applyDiscount() {
      const acct = document.getElementById('account-num').value || 'Account';
      const dev = document.getElementById('device-type').value;
      const box = document.getElementById('discount-status');
      box.textContent = '✓ Medical Baseline Discount active on ' + acct + ' for ' + dev + '.';
      box.classList.add('visible');
    }
  </script>
</body>
</html>`
    }
  };

  // DOM References
  const mainWorkspace = document.getElementById('main-workspace');
  const viewportStage = document.getElementById('viewport-stage');
  const viewportIframe = document.getElementById('viewport-iframe');
  const viewportLoading = document.getElementById('viewport-loading');
  const loadingUrlLabel = document.getElementById('loading-url-label');
  const screenshotImg = document.getElementById('viewport-screenshot');
  const somOverlay = document.getElementById('som-overlay');
  const agentCursor = document.getElementById('agent-cursor');
  const agentCursorLabel = document.getElementById('agent-cursor-label');
  const livePageTitle = document.getElementById('live-page-title');
  const elementCountBadge = document.getElementById('element-count-badge');
  const urlInput = document.getElementById('url-input');
  const urlForm = document.getElementById('url-form');
  const liveAlertStrip = document.getElementById('live-alert-strip');
  const liveAlertText = document.getElementById('live-alert-text');

  const agentCommandForm = document.getElementById('agent-command-form');
  const agentCommandInput = document.getElementById('agent-command-input');
  const runAgentBtn = document.getElementById('run-agent-btn');
  const voiceMicBtn = document.getElementById('voice-mic-btn');
  const quickAutofillCta = document.getElementById('quick-autofill-cta');
  const agentSpeechText = document.getElementById('agent-speech-text');
  const activeEngineBadge = document.getElementById('active-engine-badge');
  const presetPromptsContainer = document.getElementById('preset-prompts-container');

  // Tabs & Panels
  const tabInputsBtn = document.getElementById('tab-inputs-btn');
  const tabActionsBtn = document.getElementById('tab-actions-btn');
  const tabHistoryBtn = document.getElementById('tab-history-btn');
  const deckPanelInputs = document.getElementById('deck-panel-inputs');
  const deckPanelActions = document.getElementById('deck-panel-actions');
  const deckPanelHistory = document.getElementById('deck-panel-history');
  const stepLogList = document.getElementById('step-log-list');

  const countInputs = document.getElementById('count-inputs');
  const countActions = document.getElementById('count-actions');
  const traceCount = document.getElementById('trace-count');
  const mobileInputsCount = document.getElementById('mobile-inputs-count');
  const mobileActionsCount = document.getElementById('mobile-actions-count');

  // Quick Field Modal
  const quickFieldModal = document.getElementById('quick-field-modal');
  const quickFieldTitle = document.getElementById('quick-field-title');
  const quickFieldSubtitle = document.getElementById('quick-field-subtitle');
  const quickFieldContainer = document.getElementById('quick-field-input-container');
  const quickFieldCancel = document.getElementById('quick-field-cancel');
  const quickFieldCancelTop = document.getElementById('quick-field-cancel-top');
  const quickFieldSubmit = document.getElementById('quick-field-submit');

  // AI Settings Modal
  const aiSettingsModal = document.getElementById('ai-settings-modal');
  const openAiModalBtn = document.getElementById('open-ai-modal-btn');
  const aiModalClose = document.getElementById('ai-modal-close');
  const aiModalCloseTop = document.getElementById('ai-modal-close-top');
  const aiModalSave = document.getElementById('ai-modal-save');
  const testApiBtn = document.getElementById('test-api-btn');
  const apiTestStatus = document.getElementById('api-test-status');

  const geminiModelSelect = document.getElementById('gemini-model-select');
  const geminiKeyInput = document.getElementById('gemini-key-input');
  const deepseekModelSelect = document.getElementById('deepseek-model-select');
  const deepseekKeyInput = document.getElementById('deepseek-key-input');

  function setFlowStep(stepNum) {
    activeFlowStep = stepNum;
    [1, 2, 3].forEach(n => {
      const el = document.getElementById(`flow-step-${n}`);
      if (el) el.classList.toggle('active', n === stepNum);
    });
  }

  function setMobileView(target) {
    mainWorkspace.setAttribute('data-mobile-view', target);
    document.querySelectorAll('.mobile-nav-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mobile-target') === target);
    });
  }

  function updateEngineBadge() {
    if (aiProvider === 'deepseek' && deepseekApiKey) {
      activeEngineBadge.textContent = deepseekModel === 'deepseek-reasoner' ? 'DeepSeek R1' : 'DeepSeek V3';
    } else if (aiProvider === 'gemini' && geminiApiKey) {
      activeEngineBadge.textContent = geminiModel.replace('gemini-', 'Gemini ').replace('-flash', ' Flash').replace('-pro', ' Pro');
    } else if (aiProvider === 'local') {
      activeEngineBadge.textContent = 'Local Semantic';
    } else {
      activeEngineBadge.textContent = `${geminiModel} (Local Ready)`;
    }
  }
  updateEngineBadge();

  function switchDeckTab(tabName) {
    const isInputs = tabName === 'inputs';
    const isActions = tabName === 'actions';
    const isHistory = tabName === 'history';

    tabInputsBtn.classList.toggle('active', isInputs);
    tabActionsBtn.classList.toggle('active', isActions);
    tabHistoryBtn.classList.toggle('active', isHistory);

    tabInputsBtn.setAttribute('aria-selected', String(isInputs));
    tabActionsBtn.setAttribute('aria-selected', String(isActions));
    tabHistoryBtn.setAttribute('aria-selected', String(isHistory));

    deckPanelInputs.style.display = isInputs ? 'flex' : 'none';
    deckPanelActions.style.display = isActions ? 'flex' : 'none';
    deckPanelHistory.style.display = isHistory ? 'flex' : 'none';
  }

  tabInputsBtn.addEventListener('click', () => switchDeckTab('inputs'));
  tabActionsBtn.addEventListener('click', () => switchDeckTab('actions'));
  tabHistoryBtn.addEventListener('click', () => switchDeckTab('history'));

  // Interactive 3-Step Flow Buttons in the 2nd Sub-Header Bar
  const flowStep1Btn = document.getElementById('flow-step-1');
  const flowStep2Btn = document.getElementById('flow-step-2');
  const flowStep3Btn = document.getElementById('flow-step-3');

  if (flowStep1Btn) {
    flowStep1Btn.addEventListener('click', () => {
      setFlowStep(1);
      setMobileView('canvas');
      urlInput.focus();
      urlInput.select();
    });
  }

  if (flowStep2Btn) {
    flowStep2Btn.addEventListener('click', () => {
      setFlowStep(2);
      switchDeckTab('inputs');
      if (window.innerWidth <= 960) {
        setMobileView('inputs');
      }
      const firstInput = deckPanelInputs.querySelector('input, select');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 60);
      }
    });
  }

  if (flowStep3Btn) {
    flowStep3Btn.addEventListener('click', () => {
      setFlowStep(3);
      const elements = (currentState && currentState.elements) || [];
      const primarySubmitEl = elements.find(e =>
        e.category === 'action' && /submit|confirm|book|order|request|enroll|log\s*in|sign\s*in/i.test(e.label)
      ) || elements.find(e => e.category === 'action');
      if (primarySubmitEl) {
        executeDirectAction({ action: 'click', elementId: primarySubmitEl.id }, primarySubmitEl.rect, `Submitting #${primarySubmitEl.id}`);
      }
    });
  }

  // Mobile Bottom Nav Switching
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-mobile-target');
      setMobileView(target);

      if (target === 'inputs') {
        switchDeckTab('inputs');
      } else if (target === 'actions') {
        switchDeckTab('actions');
      } else if (target === 'ai') {
        switchDeckTab('history');
        setTimeout(() => agentCommandInput.focus(), 80);
      } else if (target === 'canvas') {
        setTimeout(scanClientIframeDom, 60);
      }
    });
  });

  function setLoadingState(isLoading, urlText = '') {
    if (!viewportLoading) return;
    if (isLoading) {
      if (loadingUrlLabel) loadingUrlLabel.textContent = urlText;
      viewportLoading.classList.add('visible');
    } else {
      viewportLoading.classList.remove('visible');
    }
  }

  function speakText(text) {
    if (!ttsEnabled || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.02;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  }

  function setAgentAnnouncement(text, shouldSpeak = true) {
    agentSpeechText.textContent = text;
    if (shouldSpeak) speakText(text);
  }

  function getViewportDimensions() {
    if (usePlaywrightBackend && currentState && currentState.viewport) {
      return currentState.viewport;
    }
    return {
      width: viewportStage.clientWidth || 960,
      height: viewportStage.clientHeight || 640
    };
  }

  function highlightElementOnViewport(elementId, active) {
    const box = somOverlay.querySelector(`.som-box[data-id="${elementId}"]`);
    if (box) {
      box.classList.toggle('active-spotlight', active);
    }
  }

  function moveAgentCursorToRect(rect, labelText, durationMs = 1300) {
    if (!rect) return;
    const dims = getViewportDimensions();
    const cx = ((rect.x + rect.width / 2) / dims.width) * 100;
    const cy = ((rect.y + rect.height / 2) / dims.height) * 100;
    agentCursor.style.left = `${cx}%`;
    agentCursor.style.top = `${cy}%`;
    agentCursorLabel.textContent = labelText || 'Acting...';
    agentCursor.classList.add('visible');

    clearTimeout(agentCursor._hideTimer);
    agentCursor._hideTimer = setTimeout(() => {
      agentCursor.classList.remove('visible');
    }, durationMs);
  }

  // ============================================================================
  // URL RESOLUTION & EXTERNAL WEBSITE PROXY ENGINE
  // ============================================================================
  function resolveNavigationTarget(rawInput) {
    const str = String(rawInput || '').trim();
    if (!str) return { type: 'portal', key: '/sites/clinic' };

    if (str === '/sites/clinic' || str.includes('carebridge.a11y')) {
      return { type: 'portal', key: '/sites/clinic' };
    }
    if (str === '/sites/grocery' || str.includes('freshmarket.a11y')) {
      return { type: 'portal', key: '/sites/grocery' };
    }
    if (str === '/sites/civic' || str.includes('civicaccess.a11y')) {
      return { type: 'portal', key: '/sites/civic' };
    }

    let url = str;
    if (!/^https?:\/\//i.test(url)) {
      if (/^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(url)) {
        url = 'https://' + url;
      } else {
        url = 'https://en.wikipedia.org/wiki/Special:Search?search=' + encodeURIComponent(url);
      }
    }
    return { type: 'external', url };
  }

  async function fetchWithTimeout(resource, options = {}, timeoutMs = 13000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(resource, { ...options, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(id);
    }
  }

  function convertJinaReaderToInteractiveHtml(jinaText, targetUrl) {
    const lines = jinaText.split('\n');
    let pageTitle = targetUrl;
    const bodyParts = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('Title:')) {
        pageTitle = line.replace(/^Title:\s*/, '').trim() || targetUrl;
        continue;
      }
      if (line.startsWith('URL Source:') || line.startsWith('Markdown Content:')) continue;
      if (!line) continue;

      if (line.startsWith('# ')) {
        bodyParts.push(`<h2>${escapeHtml(line.slice(2))}</h2>`);
      } else if (line.startsWith('## ')) {
        bodyParts.push(`<h3>${escapeHtml(line.slice(3))}</h3>`);
      } else if (line.startsWith('### ')) {
        bodyParts.push(`<h4>${escapeHtml(line.slice(4))}</h4>`);
      } else {
        const htmlLine = escapeHtml(line).replace(
          /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g,
          (_, label, href) => {
            const cleanLabel = label.replace(/!\[.*?\]\(.*?\)/g, '').trim() || href;
            return `<a href="${href}" class="a11y-extracted-link">${cleanLabel}</a>`;
          }
        );
        bodyParts.push(`<p>${htmlLine}</p>`);
      }
    }

    let hostname = targetUrl;
    try { hostname = new URL(targetUrl).hostname; } catch (_) {}

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <base href="${escapeHtml(targetUrl)}" />
  <title>${escapeHtml(pageTitle)}</title>
  <style>
    * { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #f1f5f9; color: #0f172a; margin: 0; padding: 20px 24px; line-height: 1.55; }
    .top-banner { background: #0f172a; color: #fff; padding: 14px 20px; border-radius: 10px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .top-banner h1 { font-size: 17px; margin: 0; color: #f8fafc; }
    .portal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; align-items: start; }
    .form-card { background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 18px; box-shadow: 0 4px 12px rgba(15,23,42,0.05); }
    .form-card h2 { font-size: 16px; margin: 0 0 12px; color: #0f172a; }
    .field-group { margin-bottom: 11px; }
    .field-group label { display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 4px; }
    .field-group input, .field-group select { width: 100%; padding: 9px 11px; border: 1.5px solid #94a3b8; border-radius: 8px; font-size: 13.5px; color: #0f172a; background: #fff; }
    .btn-submit { width: 100%; padding: 10px 14px; background: #0284c7; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 13.5px; cursor: pointer; margin-top: 4px; }
    .content-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; }
    p { margin: 7px 0; font-size: 13.5px; color: #334155; }
    a.a11y-extracted-link, a {
      display: inline-block;
      margin: 3px 4px 3px 0;
      padding: 5px 10px;
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #7dd3fc;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 12.5px;
    }
    a:hover { background: #bae6fd; }
  </style>
</head>
<body>
  <div class="top-banner">
    <h1>${escapeHtml(pageTitle)}</h1>
    <span style="font-size:12px;color:#38bdf8;font-weight:700;">${escapeHtml(hostname)}</span>
  </div>

  <div class="portal-grid">
    <section class="form-card" aria-label="Portal Login and Search Controls">
      <h2>Portal Sign-In &amp; Course Search</h2>
      <form id="portal-login-form">
        <div class="field-group">
          <label for="portal-username">Username / Matric Number</label>
          <input type="text" id="portal-username" name="username" placeholder="e.g. NOU23104928" />
        </div>
        <div class="field-group">
          <label for="portal-password">Password</label>
          <input type="password" id="portal-password" name="password" placeholder="Enter portal password" />
        </div>
        <div class="field-group">
          <label for="portal-course-query">Course Code or Search Topic</label>
          <input type="text" id="portal-course-query" name="courseQuery" placeholder="e.g. CIT101 or Computer Science" />
        </div>
        <div class="field-group">
          <label for="portal-semester">Academic Session / Semester</label>
          <select id="portal-semester" name="semester">
            <option value="2026/1 First Semester">2026/1 First Semester</option>
            <option value="2026/2 Second Semester">2026/2 Second Semester</option>
            <option value="Exam & TMA Portal">Exam &amp; TMA Portal</option>
          </select>
        </div>
        <button type="submit" id="portal-submit-btn" class="btn-submit">Log In / Submit to ${escapeHtml(hostname)}</button>
      </form>
    </section>

    <section class="content-card" aria-label="Extracted Page Links and Content">
      <div class="field-group" style="display:flex;gap:8px;margin-bottom:12px;">
        <input type="text" id="quick-page-filter" aria-label="Filter page links" placeholder="Type to filter links on this page..." style="flex:1;" oninput="const q=this.value.toLowerCase();document.querySelectorAll('.content-card p, .content-card a').forEach(el=>{el.style.display=(!q||el.innerText.toLowerCase().includes(q))?'':'none';});" />
      </div>
      ${bodyParts.join('\n')}
    </section>
  </div>
</body>
</html>`;
  }

  function sanitizeAndInjectBase(rawHtml, targetUrl) {
    let html = String(rawHtml || '');
    html = html.replace(/<meta[^>]*http-equiv=["']?(?:Content-Security-Policy|X-Frame-Options|refresh)["']?[^>]*>/gi, '');
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/\btarget=["']?(?:_blank|_top|_parent)["']?/gi, '');

    let hostname = targetUrl;
    try { hostname = new URL(targetUrl).hostname; } catch (_) {}

    const existingInputMatches = html.match(/<input\b[^>]*type=["']?(?:text|password|email|search|tel|number)["']?[^>]*>/gi) || [];
    const needsAssistiveFormBar = existingInputMatches.length < 2;

    const assistiveFormHtml = needsAssistiveFormBar ? `
      <section class="__a11y_injected_form_bar" aria-label="Accessible Quick Sign-In and Search Form">
        <div class="__a11y_bar_title">Accessible Form Controls for ${escapeHtml(hostname)}</div>
        <form id="__a11y_universal_form" class="__a11y_bar_grid">
          <div>
            <label for="__a11y_user">Username / Matric / ID</label>
            <input type="text" id="__a11y_user" name="username" placeholder="e.g. NOU23104928" />
          </div>
          <div>
            <label for="__a11y_pass">Password</label>
            <input type="password" id="__a11y_pass" name="password" placeholder="Enter password" />
          </div>
          <div>
            <label for="__a11y_search">Search / Course / Query</label>
            <input type="text" id="__a11y_search" name="query" placeholder="e.g. CIT101 or topic..." />
          </div>
          <div style="display:flex;align-items:flex-end;">
            <button type="submit" id="__a11y_submit_btn">Submit to ${escapeHtml(hostname)}</button>
          </div>
        </form>
      </section>
    ` : '';

    const baseAndInterceptor = `<base href="${targetUrl}" />
<style>
  html { scroll-behavior: smooth; }
  .__a11y_submitted_banner {
    position: sticky; top: 0; z-index: 2147483647;
    background: #065f46; color: #ecfdf5; padding: 12px 18px;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; font-weight: 700;
    border-bottom: 3px solid #10b981;
  }
  .__a11y_filled_highlight {
    outline: 3px solid #10b981 !important;
    background-color: #ecfdf5 !important;
    color: #064e3b !important;
  }
  .__a11y_injected_form_bar {
    background: #0f172a; color: #f8fafc; padding: 14px 18px;
    border-bottom: 2px solid #f59e0b; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .__a11y_bar_title {
    font-size: 13px; font-weight: 800; color: #f59e0b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .__a11y_bar_grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; align-items: center;
  }
  .__a11y_bar_grid label {
    display: block; font-size: 11.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 3px;
  }
  .__a11y_bar_grid input {
    width: 100%; padding: 7px 10px; border-radius: 6px; border: 1.5px solid #475569;
    background: #1e293b; color: #ffffff; font-size: 13px;
  }
  .__a11y_bar_grid button {
    width: 100%; padding: 8px 12px; border-radius: 6px; border: none;
    background: #10b981; color: #042f2e; font-weight: 800; font-size: 13px; cursor: pointer;
  }
</style>
<script>
  (function() {
    window.addEventListener('click', function(e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var rawHref = a.getAttribute('href') || '';
      if (!rawHref || rawHref.charAt(0) === '#' || rawHref.indexOf('javascript:') === 0) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        var resolved = new URL(rawHref, document.baseURI).href;
        window.parent.postMessage({ type: 'A11Y_PROXY_NAV', url: resolved }, '*');
      } catch (_) {}
    }, true);

    window.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var form = e.target;
      var pairs = [];
      var inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), select, textarea');
      for (var i = 0; i < inputs.length; i++) {
        var inp = inputs[i];
        var name = inp.name || inp.id || inp.getAttribute('placeholder') || inp.type;
        var val = (inp.type === 'password' && inp.value) ? '••••••••' : inp.value;
        if (val) pairs.push(name + ': "' + val + '"');
      }
      var banner = document.querySelector('.__a11y_submitted_banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.className = '__a11y_submitted_banner';
        banner.setAttribute('role', 'status');
        document.body.insertBefore(banner, document.body.firstChild);
      }
      banner.textContent = '✓ Form Submitted (' + (pairs.join(' • ') || 'Completed') + ')';
      window.parent.postMessage({ type: 'A11Y_RESCAN_DOM' }, '*');
    }, true);
  })();
</script>`;

    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>${baseAndInterceptor}`);
    } else {
      html = `<!DOCTYPE html><html><head>${baseAndInterceptor}</head><body>${html}</body></html>`;
    }

    if (assistiveFormHtml) {
      if (/<body[^>]*>/i.test(html)) {
        html = html.replace(/<body([^>]*)>/i, `<body$1>${assistiveFormHtml}`);
      } else {
        html = assistiveFormHtml + html;
      }
    }

    return html;
  }

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'A11Y_PROXY_NAV' && data.url) {
      loadExternalWebsite(data.url, true);
    } else if (data.type === 'A11Y_RESCAN_DOM') {
      setFlowStep(3);
      const st = scanClientIframeDom();
      if (st && st.alerts && st.alerts.length) {
        setAgentAnnouncement(st.alerts[0]);
      }
    }
  });

  async function fetchExternalWebsiteHtml(targetUrl) {
    try {
      const res = await fetchWithTimeout(
        `https://r.jina.ai/${targetUrl}`,
        { headers: { 'X-Return-Format': 'html' } },
        12000
      );
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 250 && /<(?:body|form|input|a|div)/i.test(text)) {
          return sanitizeAndInjectBase(text, targetUrl);
        }
      }
    } catch (_) {}

    try {
      const res = await fetchWithTimeout(
        `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
        {},
        10000
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.contents && data.contents.length > 200 && /<[a-z][\s\S]*>/i.test(data.contents)) {
          return sanitizeAndInjectBase(data.contents, targetUrl);
        }
      }
    } catch (_) {}

    try {
      const res = await fetchWithTimeout(
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
        {},
        10000
      );
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 200 && /<[a-z][\s\S]*>/i.test(text)) {
          return sanitizeAndInjectBase(text, targetUrl);
        }
      }
    } catch (_) {}

    try {
      const res = await fetchWithTimeout(
        `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
        {},
        10000
      );
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 200 && /<[a-z][\s\S]*>/i.test(text)) {
          return sanitizeAndInjectBase(text, targetUrl);
        }
      }
    } catch (_) {}

    try {
      const res = await fetchWithTimeout(`https://r.jina.ai/${targetUrl}`, {}, 13000);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 60) {
          return sanitizeAndInjectBase(convertJinaReaderToInteractiveHtml(text, targetUrl), targetUrl);
        }
      }
    } catch (_) {}

    throw new Error(`Could not reach ${targetUrl}`);
  }

  async function loadExternalWebsite(targetUrl, pushHistory = true) {
    setFlowStep(1);
    currentExternalUrl = targetUrl;
    currentSiteKey = targetUrl;
    if (pushHistory && navStack[navStack.length - 1] !== targetUrl) {
      navStack.push(targetUrl);
    }

    urlInput.value = targetUrl;
    setLoadingState(true, targetUrl);
    setAgentAnnouncement(`Step 1: Loading ${targetUrl}...`, false);

    viewportIframe.style.display = 'block';
    screenshotImg.style.display = 'none';

    try {
      const rewrittenHtml = await fetchExternalWebsiteHtml(targetUrl);
      const doc = viewportIframe.contentDocument || viewportIframe.contentWindow.document;
      doc.open();
      doc.write(rewrittenHtml);
      doc.close();

      const wireAndScan = () => {
        wireExternalIframeInteractions(targetUrl);
        const st = scanClientIframeDom();
        if (st) {
          setFlowStep(2);
          const inputCount = st.elements.filter(e => e.category === 'input').length;
          setAgentAnnouncement(
            `Step 2 Ready: Loaded "${st.title}" (${inputCount} form inputs ready to fill).`
          );
        }
      };

      setTimeout(wireAndScan, 180);
      setTimeout(() => {
        wireExternalIframeInteractions(targetUrl);
        scanClientIframeDom();
      }, 900);
    } catch (err) {
      const doc = viewportIframe.contentDocument || viewportIframe.contentWindow.document;
      doc.open();
      doc.write(sanitizeAndInjectBase(convertJinaReaderToInteractiveHtml(`Title: ${targetUrl}\n# Accessible Portal View for ${targetUrl}\nComplete the form on the left to interact with ${targetUrl}.`, targetUrl), targetUrl));
      doc.close();
      setTimeout(() => {
        wireExternalIframeInteractions(targetUrl);
        scanClientIframeDom();
        setFlowStep(2);
      }, 120);
      setAgentAnnouncement(`Loaded interactive portal view for ${targetUrl}.`);
    } finally {
      setLoadingState(false);
    }
  }

  function wireExternalIframeInteractions(baseUrl) {
    const doc = viewportIframe.contentDocument;
    const win = viewportIframe.contentWindow;
    if (!doc || !doc.body) return;

    if (!win.__a11yScrollWired) {
      win.__a11yScrollWired = true;
      win.addEventListener('scroll', () => {
        clearTimeout(win.__a11yScrollTimer);
        win.__a11yScrollTimer = setTimeout(() => scanClientIframeDom(), 80);
      }, { passive: true });
    }

    doc.querySelectorAll('input, select, textarea').forEach(inp => {
      if (inp.__a11yInputWired) return;
      inp.__a11yInputWired = true;
      inp.addEventListener('change', () => scanClientIframeDom());
    });
  }

  // ============================================================================
  // CLIENT-SIDE LIVE DOM ENGINE
  // ============================================================================
  function loadClientPortal(siteKey, pushHistory = true) {
    setFlowStep(1);
    currentExternalUrl = null;
    const portal = PORTAL_PAGES[siteKey] || PORTAL_PAGES['/sites/clinic'];
    currentSiteKey = PORTAL_PAGES[siteKey] ? siteKey : '/sites/clinic';
    if (pushHistory && navStack[navStack.length - 1] !== currentSiteKey) {
      navStack.push(currentSiteKey);
    }

    setLoadingState(false);
    viewportIframe.style.display = 'block';
    screenshotImg.style.display = 'none';

    const doc = viewportIframe.contentDocument || viewportIframe.contentWindow.document;
    doc.open();
    doc.write(portal.html);
    doc.close();

    setTimeout(() => {
      const innerDoc = viewportIframe.contentDocument;
      if (innerDoc) {
        innerDoc.querySelectorAll('a[data-portal]').forEach(a => {
          a.addEventListener('click', (e) => {
            e.preventDefault();
            loadClientPortal(a.getAttribute('data-portal'));
          });
        });
      }
      scanClientIframeDom();
      setFlowStep(2);
    }, 60);
  }

  function scanClientIframeDom() {
    const doc = viewportIframe.contentDocument;
    if (!doc || !doc.body) return null;

    const highPriorityNodes = Array.from(
      doc.querySelectorAll('input:not([type="hidden"]), select, textarea, button, [role="button"], [role="checkbox"]')
    );
    const linkNodes = Array.from(doc.querySelectorAll('a[href], [role="link"], [onclick]'));

    const seen = new Set();
    const candidates = [];
    for (const node of [...highPriorityNodes, ...linkNodes]) {
      if (!seen.has(node)) {
        seen.add(node);
        candidates.push(node);
      }
    }

    const elements = [];
    let nextId = 1;

    function getAccessibleLabel(el) {
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

      if (el.id) {
        try {
          const explicitLabel = doc.querySelector(`label[for="${CSS.escape(el.id)}"]`);
          if (explicitLabel && explicitLabel.innerText.trim()) return explicitLabel.innerText.trim();
        } catch (_) {}
      }

      const parentLabel = el.closest('label');
      if (parentLabel && parentLabel.innerText.trim()) return parentLabel.innerText.trim();

      const placeholder = el.getAttribute('placeholder');
      if (placeholder && placeholder.trim()) return placeholder.trim();

      const prev = el.previousElementSibling;
      if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN') && prev.innerText.trim()) {
        return prev.innerText.trim().slice(0, 70);
      }

      const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) return text.slice(0, 90);

      const nameAttr = el.getAttribute('name') || el.getAttribute('title') || el.id;
      if (nameAttr && String(nameAttr).trim()) {
        return String(nameAttr).replace(/[_-]+/g, ' ').trim();
      }

      const val = el.value;
      if (val && typeof val === 'string' && val.trim()) return val.trim().slice(0, 60);

      return el.tagName.toLowerCase();
    }

    function getCategory(tag, type, role) {
      if (tag === 'input' && (type === 'checkbox' || type === 'radio')) return 'toggle';
      if (tag === 'input' && (type === 'submit' || type === 'button' || type === 'reset')) return 'action';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return 'input';
      if (tag === 'a' || role === 'link') return 'navigation';
      return 'action';
    }

    const win = viewportIframe.contentWindow;
    const viewW = (win && win.innerWidth) || viewportStage.clientWidth || 960;
    const viewH = (win && win.innerHeight) || viewportStage.clientHeight || 640;

    for (const el of candidates) {
      if (elements.length >= 85) break;
      let style;
      try {
        style = win.getComputedStyle(el);
      } catch (_) {
        continue;
      }
      if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) continue;

      const tag = el.tagName.toLowerCase();
      const type = (el.getAttribute('type') || (tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : 'text')).toLowerCase();
      const role = el.getAttribute('role') || (tag === 'a' ? 'link' : tag === 'button' ? 'button' : tag === 'select' ? 'combobox' : type === 'checkbox' ? 'checkbox' : 'textbox');
      const category = getCategory(tag, type, role);

      const rect = el.getBoundingClientRect();
      // Form inputs and action buttons should never disappear when scrolled out of view
      if (category === 'navigation') {
        if (rect.width < 6 || rect.height < 6) continue;
        if (rect.bottom < -100 || rect.right < 0 || rect.top > viewH + 300 || rect.left > viewW) continue;
      } else {
        // For inputs/buttons/toggles, only skip if truly collapsed (0x0 and hidden)
        if (rect.width < 2 && rect.height < 2 && el.offsetParent === null) continue;
      }

      const label = getAccessibleLabel(el);
      if (!label || label.length < 1) continue;

      const id = nextId++;
      el.setAttribute('data-a11y-id', String(id));

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

      const inViewport =
        rect.width >= 6 &&
        rect.height >= 6 &&
        rect.bottom > 0 &&
        rect.top < viewH &&
        rect.right > 0 &&
        rect.left < viewW;

      elements.push({
        id,
        tag,
        type,
        role,
        category,
        label,
        placeholder: el.getAttribute('placeholder') || '',
        value,
        options,
        inViewport,
        rect: {
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.max(24, Math.round(rect.width)),
          height: Math.max(24, Math.round(rect.height))
        }
      });
    }

    const alerts = [];
    doc.querySelectorAll('[role="status"], [aria-live], .banner-success.visible, .order-msg.visible, .status-box.visible, .__a11y_submitted_banner').forEach(node => {
      const s = win.getComputedStyle(node);
      if (s.display !== 'none' && s.visibility !== 'hidden') {
        const txt = (node.innerText || '').trim();
        if (txt) alerts.push(txt);
      }
    });

    if (alerts.length > 0) setFlowStep(3);

    const portalInfo = PORTAL_PAGES[currentSiteKey];
    const activeUrl = currentExternalUrl || (portalInfo ? portalInfo.url : currentSiteKey);
    const activeTitle = doc.title || (portalInfo ? portalInfo.title : activeUrl);

    const state = {
      url: activeUrl,
      title: activeTitle,
      alerts,
      viewport: {
        width: viewportStage.clientWidth || 960,
        height: viewportStage.clientHeight || 640
      },
      elements,
      history: clientHistory.slice(-15)
    };

    applyBrowserState(state);
    return state;
  }

  function setNativeFormValue(domNode, val, options = {}) {
    if (!domNode) return;
    const strVal = String(val ?? '');
    if (options.scroll !== false) {
      try {
        domNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (_) {}
    }
    if (options.focusIframe === true) {
      try {
        domNode.focus();
      } catch (_) {}
    }

    try {
      const win = (domNode.ownerDocument && domNode.ownerDocument.defaultView) || window;
      const proto = domNode.tagName === 'TEXTAREA'
        ? win.HTMLTextAreaElement.prototype
        : win.HTMLInputElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(domNode, strVal);
      } else {
        domNode.value = strVal;
      }
    } catch (_) {
      domNode.value = strVal;
    }

    domNode.value = strVal;
    domNode.setAttribute('value', strVal);
    domNode.classList.add('__a11y_filled_highlight');

    domNode.dispatchEvent(new Event('input', { bubbles: true }));
    domNode.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function performClientSingleAction(step) {
    const doc = viewportIframe.contentDocument;
    const win = viewportIframe.contentWindow;
    const state = scanClientIframeDom();
    const elements = state ? state.elements : [];

    const { action, elementId, value, direction } = step;
    const targetEl = elementId ? elements.find(e => e.id === Number(elementId)) : null;
    const domNode = targetEl && doc ? doc.querySelector(`[data-a11y-id="${targetEl.id}"]`) : null;

    let summary = '';
    if (action === 'navigate') {
      const resolved = resolveNavigationTarget(value);
      if (resolved.type === 'portal') {
        loadClientPortal(resolved.key, true);
        summary = `Navigated to ${PORTAL_PAGES[resolved.key].title}`;
      } else {
        await loadExternalWebsite(resolved.url, true);
        summary = `Navigated to ${resolved.url}`;
      }
    } else if (action === 'back') {
      if (navStack.length > 1) {
        navStack.pop();
        const prev = navStack[navStack.length - 1];
        const resolved = resolveNavigationTarget(prev);
        if (resolved.type === 'portal') loadClientPortal(resolved.key, false);
        else await loadExternalWebsite(resolved.url, false);
      }
      summary = 'Navigated back';
    } else if (action === 'reload') {
      if (currentExternalUrl) {
        await loadExternalWebsite(currentExternalUrl, false);
      } else {
        loadClientPortal(currentSiteKey, false);
      }
      summary = 'Reloaded page';
    } else if (action === 'scroll') {
      const dir = (direction || value || 'down').toLowerCase();
      win.scrollBy({ top: dir === 'up' ? -300 : 300, behavior: 'smooth' });
      await new Promise(r => setTimeout(r, 250));
      summary = `Scrolled page ${dir}`;
    } else if (action === 'click' && domNode) {
      setFlowStep(2);
      domNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (domNode.hasAttribute('data-portal')) {
        loadClientPortal(domNode.getAttribute('data-portal'));
      } else if (domNode.tagName.toLowerCase() === 'a' && domNode.getAttribute('href') && currentExternalUrl) {
        const rawHref = domNode.getAttribute('href');
        if (!rawHref.startsWith('#') && !rawHref.startsWith('javascript:')) {
          const nextUrl = new URL(rawHref, currentExternalUrl).href;
          await loadExternalWebsite(nextUrl, true);
        } else {
          domNode.click();
        }
      } else {
        domNode.click();
      }
      summary = `Clicked #${targetEl.id} "${targetEl.label}"`;
    } else if (action === 'type' && domNode) {
      setFlowStep(2);
      setNativeFormValue(domNode, value);
      summary = `Filled #${targetEl.id} (${targetEl.label}) with "${value}"`;
    } else if (action === 'select' && domNode) {
      setFlowStep(2);
      domNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      let matchedValue = String(value ?? '');
      if (targetEl.options) {
        const q = matchedValue.toLowerCase();
        const found = targetEl.options.find(
          o => o.value.toLowerCase() === q || o.text.toLowerCase() === q || o.text.toLowerCase().includes(q)
        );
        if (found) matchedValue = found.value;
      }
      domNode.value = matchedValue;
      domNode.classList.add('__a11y_filled_highlight');
      domNode.dispatchEvent(new Event('change', { bubbles: true }));
      summary = `Selected "${matchedValue}" in #${targetEl.id} (${targetEl.label})`;
    }

    const record = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      elementId: targetEl ? targetEl.id : elementId || null,
      rect: targetEl ? targetEl.rect : null,
      summary
    };
    clientHistory.push(record);
    const updatedState = scanClientIframeDom();
    return { record, state: updatedState };
  }

  function findBestElementClient(elements, phrase, preferredFilter = null) {
    if (!phrase) return null;
    const clean = phrase.toLowerCase().trim();
    const idMatch = clean.match(/^(?:#|element\s+#?|badge\s+#?|item\s+#?|number\s+#?|field\s+#?|input\s+#?)?(\d+)$/);
    if (idMatch) {
      const exact = elements.find(e => e.id === Number(idMatch[1]));
      if (exact && (!preferredFilter || preferredFilter(exact))) return exact;
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
      else if (clean.includes(hayLabel) && hayLabel.length > 2) score += 55;
      if (hayPlaceholder && hayPlaceholder.includes(clean)) score += 50;
      if (hayOptions && hayOptions.includes(clean)) score += 60;

      for (const tok of tokens) {
        if (hayLabel.includes(tok)) score += 20;
        else if (hayPlaceholder.includes(tok)) score += 15;
        else if (hayOptions.includes(tok)) score += 14;
        else if (hayAll.includes(tok)) score += 8;
      }

      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }
    return bestScore >= 12 ? best : null;
  }

  function getSmartSampleValueForField(el) {
    const hay = `${el.label} ${el.placeholder} ${el.type}`.toLowerCase();
    if (hay.includes('matric') || hay.includes('username') || hay.includes('student') || hay.includes('user')) return 'NOU23104928';
    if (hay.includes('password') || el.type === 'password') return 'AccessiblePass2026!';
    if (hay.includes('email') || el.type === 'email') return 'maya.lin@accessible.org';
    if (hay.includes('phone') || hay.includes('tel') || el.type === 'tel') return '555-0199';
    if (hay.includes('pickup') || hay.includes('address') || hay.includes('street')) return '240 Oak Street, Suite 4B';
    if (hay.includes('destination') || hay.includes('dropoff')) return 'CareBridge Medical Center';
    if (hay.includes('account')) return 'UTIL-99201';
    if (hay.includes('course') || hay.includes('search') || hay.includes('filter') || hay.includes('query')) return 'CIT101 Computer Fundamentals';
    if (hay.includes('reason') || hay.includes('note') || hay.includes('instruction')) return 'Please provide wheelchair-accessible entrance assistance';
    if (hay.includes('name') || hay.includes('patient') || hay.includes('rider')) return 'Maya Lin';
    return 'Maya Lin';
  }

  function planClientGrounding(command, state) {
    const elements = state.elements;
    const steps = [];
    const raw = String(command || '').trim();
    const lower = raw.toLowerCase();

    if (/^(?:auto[-\s]?fill|fill\s+(?:out\s+|in\s+)?(?:the\s+|all\s+)?(?:form|fields|inputs)|complete\s+(?:the\s+)?form)$/i.test(lower)) {
      const inputEls = elements.filter(e => e.category === 'input' && e.tag !== 'select');
      for (const inp of inputEls) {
        const sample = getSmartSampleValueForField(inp);
        steps.push({
          action: 'type',
          elementId: inp.id,
          value: sample,
          explanation: `Fill #${inp.id} (${inp.label}) with "${sample}"`
        });
      }
      if (steps.length > 0) {
        return {
          engine: 'Smart Form Auto-Filler',
          spokenResponse: `Auto-filled ${steps.length} form fields on the page. Step 3: Click Submit when ready.`,
          steps
        };
      }
    }

    if (/^(what|describe|summarize|read|where am i|help|list)/.test(lower) && !/click|type|fill|select|book|add|order|input|set/.test(lower)) {
      const inputCount = elements.filter(e => e.category === 'input').length;
      const actionCount = elements.filter(e => e.category === 'action' || e.category === 'toggle').length;
      const linkCount = elements.filter(e => e.category === 'navigation').length;
      const alertPart = state.alerts.length ? ` Active alert: ${state.alerts.join(' ')}` : '';
      const summary = `You are on "${state.title}". There are ${elements.length} visible controls: ${inputCount} fillable form fields, ${actionCount} buttons, and ${linkCount} links.${alertPart}`;
      return {
        engine: 'Local Semantic Grounding',
        spokenResponse: summary,
        steps: [{ action: 'narrate', value: summary, explanation: summary }]
      };
    }

    const clauses = raw
      .split(/\s*(?:;|,\s+and\s+|\s+then\s+|,\s*(?=(?:click|press|tap|type|enter|write|input|put|fill|set|select|choose|check|toggle|scroll|go|open|visit|navigate|switch|book|confirm|submit|login|log\s+in|add|place|request|enroll|#\d+)\b)|\s+and\s+(?=(?:click|press|tap|type|enter|write|input|put|fill|set|select|choose|check|toggle|scroll|go|open|visit|navigate|switch|book|confirm|submit|login|log\s+in|add|place|request|enroll|#\d+)\b))\s*/i)
      .map(c => c.trim())
      .filter(Boolean);

    for (const clause of clauses) {
      const cLow = clause.toLowerCase();

      const navMatch = clause.match(/^(?:go\s+to|navigate\s+to|open|visit|load)\s+(https?:\/\/\S+|[a-z0-9-]+(?:\.[a-z0-9-]+)+\S*)$/i);
      if (navMatch) {
        steps.push({ action: 'navigate', value: navMatch[1], explanation: `Navigate to ${navMatch[1]}` });
        continue;
      }

      if (/^scroll\s+(down|up)/i.test(cLow)) {
        const dir = cLow.match(/^scroll\s+(down|up)/i)[1];
        steps.push({ action: 'scroll', direction: dir, value: dir, explanation: `Scroll ${dir}` });
        continue;
      }

      const badgeTypeA = clause.match(/^(?:type|enter|write|input|put)\s+["']?(.+?)["']?\s+(?:in|into|on|to|for)\s+(?:#|badge\s*|field\s*|input\s*|element\s*)?(\d+)$/i);
      const badgeTypeB = clause.match(/^(?:fill|set|input)\s+(?:#|badge\s*|field\s*|input\s*|element\s*)?(\d+)\s+(?:with|to|as|=|:)\s+["']?(.+?)["']?$/i);
      const badgeTypeC = clause.match(/^#(\d+)\s*(?::|=|\s+is\s+|\s+with\s+)\s*["']?(.+?)["']?$/i);

      if (badgeTypeA || badgeTypeB || badgeTypeC) {
        const id = Number(badgeTypeA ? badgeTypeA[2] : badgeTypeB ? badgeTypeB[1] : badgeTypeC[1]);
        const val = (badgeTypeA ? badgeTypeA[1] : badgeTypeB ? badgeTypeB[2] : badgeTypeC[2]).trim();
        const el = elements.find(e => e.id === id);
        if (el) {
          steps.push({
            action: el.tag === 'select' ? 'select' : 'type',
            elementId: el.id,
            value: val,
            explanation: `${el.tag === 'select' ? 'Select' : 'Type'} "${val}" in #${el.id} (${el.label})`
          });
          continue;
        }
      }

      const badgeClick = clause.match(/^(?:click|press|tap|select|check|toggle)?\s*(?:#|badge\s*|element\s*|number\s*)?(\d+)$/i);
      if (badgeClick) {
        const el = elements.find(e => e.id === Number(badgeClick[1]));
        if (el) {
          if (el.category === 'input') {
            const sample = getSmartSampleValueForField(el);
            steps.push({ action: 'type', elementId: el.id, value: sample, explanation: `Fill #${el.id} (${el.label}) with "${sample}"` });
          } else {
            steps.push({ action: 'click', elementId: el.id, explanation: `Click #${el.id} (${el.label})` });
          }
          continue;
        }
      }

      let fieldPhrase = null;
      let textValue = null;

      const pat1 = clause.match(/^(?:type|enter|write|input|put)\s+["']?(.+?)["']?\s+(?:in|into|for|on|under)\s+(?:the\s+)?(.+?)(?:\s+field|\s+box|\s+input)?$/i);
      if (pat1) {
        textValue = pat1[1].trim();
        fieldPhrase = pat1[2].trim();
      } else {
        const pat2 = clause.match(/^(?:fill(?:\s+in|\s+out)?|set|input|enter|change)\s+(?:the\s+)?(.+?)(?:\s+field|\s+box|\s+input)?\s+(?:with|to|as|=|:)\s+["']?(.+?)["']?$/i);
        if (pat2) {
          fieldPhrase = pat2[1].trim();
          textValue = pat2[2].trim();
        } else {
          const pat3 = clause.match(/^(?:my\s+|the\s+)?([a-z0-9\s/-]{2,28}?)\s*(?:is|=|:)\s*["']?(.+?)["']?$/i);
          if (pat3 && !/^(what|where|who|how|click|scroll|go|open)$/i.test(pat3[1].trim())) {
            fieldPhrase = pat3[1].trim();
            textValue = pat3[2].trim();
          }
        }
      }

      if (fieldPhrase && textValue !== null) {
        const inputEl = findBestElementClient(elements, fieldPhrase, e => e.category === 'input');
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

      const bareType = clause.match(/^(?:type|enter|write|input)\s+["']?(.+?)["']?$/i);
      if (bareType) {
        const val = bareType[1].trim();
        const emptyInput = elements.find(e => e.category === 'input' && e.tag !== 'select' && !e.value)
          || elements.find(e => e.category === 'input' && e.tag !== 'select');
        if (emptyInput) {
          steps.push({
            action: 'type',
            elementId: emptyInput.id,
            value: val,
            explanation: `Type "${val}" into #${emptyInput.id} (${emptyInput.label})`
          });
          continue;
        }
      }

      const selectMatch = clause.match(/^(?:select|choose|pick)\s+["']?(.+?)["']?(?:\s+(?:from|in|under)\s+(.+))?$/i);
      if (selectMatch) {
        const optionQuery = selectMatch[1].trim();
        const selectElements = elements.filter(e => e.tag === 'select' && Array.isArray(e.options));
        let matchedSelect = null;
        let matchedOption = null;
        for (const sEl of selectElements) {
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
      }

      const cleanedTarget = clause.replace(/^(?:please\s+)?(?:click|press|tap|check|uncheck|toggle|hit|activate|switch\s+to|go\s+to|open|submit)\s+(?:on\s+)?(?:the\s+)?/i, '').trim();
      const targetEl = findBestElementClient(elements, cleanedTarget) || findBestElementClient(elements, clause);
      if (targetEl) {
        steps.push({ action: 'click', elementId: targetEl.id, explanation: `Click #${targetEl.id} (${targetEl.label})` });
      }
    }

    if (steps.length === 0) {
      const anyEl = findBestElementClient(elements, raw);
      if (anyEl) {
        if (anyEl.category === 'input') {
          const sample = getSmartSampleValueForField(anyEl);
          steps.push({ action: 'type', elementId: anyEl.id, value: sample, explanation: `Fill #${anyEl.id} (${anyEl.label}) with "${sample}"` });
        } else {
          steps.push({ action: 'click', elementId: anyEl.id, explanation: `Click #${anyEl.id} (${anyEl.label})` });
        }
      } else {
        return {
          engine: 'Local Semantic Grounding',
          spokenResponse: `Could not match "${raw}". Try tapping "Auto-Fill Form" or typing "Fill #1 with [text]".`,
          steps: []
        };
      }
    }

    return {
      engine: 'Local Semantic Grounding',
      spokenResponse: steps.map(s => s.explanation).join(', then ') + '.',
      steps
    };
  }

  // ============================================================================
  // MULTI-PROVIDER AI PLANNERS: GEMINI 3.8 FLASH & DEEPSEEK V3/R1
  // ============================================================================
  function buildDomAgentPrompt(command, state) {
    const elementLines = state.elements.map(e => {
      const optStr = e.options ? ` options=[${e.options.map(o => `"${o.text}"`).join(', ')}]` : '';
      const valStr = e.value ? ` currentValue="${e.value}"` : '';
      return `#${e.id} [${e.tag}/${e.type}] label="${e.label}"${valStr}${optStr}`;
    }).join('\n');

    return `You are A11yPilot, an accessibility browser agent helping a user interact with a webpage.
Page Title: "${state.title}" (${state.url})
Interactive Elements (#1..#${state.elements.length}):
${elementLines}

User Command: "${command}"
Return ONLY valid JSON with this exact structure:
{
  "spokenResponse": "Concise 1-sentence confirmation of what you are doing",
  "steps": [
    { "action": "click" | "type" | "select" | "scroll" | "navigate" | "narrate", "elementId": 1, "value": "text or option", "explanation": "Step description" }
  ]
}`;
  }

  async function planWithGeminiModel(command, state, apiKey, preferredModel) {
    const prompt = buildDomAgentPrompt(command, state);
    // Try preferred model (e.g. gemini-3.8-flash) first, with automatic cascade if region/key falls back
    const candidateModels = Array.from(new Set([
      preferredModel || 'gemini-3.8-flash',
      'gemini-3.8-flash',
      'gemini-3.0-flash',
      'gemini-2.0-flash'
    ]));

    let lastErr = null;
    for (const modelId of candidateModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
            })
          }
        );
        if (!res.ok) {
          lastErr = new Error(`Gemini (${modelId}) HTTP ${res.status}`);
          continue;
        }
        const data = await res.json();
        const parsed = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
        return {
          engine: preferredModel || modelId,
          spokenResponse: parsed.spokenResponse || 'Executed requested steps.',
          steps: Array.isArray(parsed.steps) ? parsed.steps : []
        };
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error('Gemini API request failed.');
  }

  async function planWithDeepSeekModel(command, state, apiKey, modelId) {
    const prompt = buildDomAgentPrompt(command, state);
    const chosenModel = modelId || 'deepseek-chat';

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [
          { role: 'system', content: 'You are A11yPilot, an accessible browser automation agent. Always respond in valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`DeepSeek HTTP ${res.status}: ${errText.slice(0, 120)}`);
    }

    const data = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content || '{}';
    const cleanedJson = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      engine: chosenModel === 'deepseek-reasoner' ? 'DeepSeek R1' : 'DeepSeek V3',
      spokenResponse: parsed.spokenResponse || 'Executed requested steps via DeepSeek.',
      steps: Array.isArray(parsed.steps) ? parsed.steps : []
    };
  }

  // ============================================================================
  // UI RENDERING
  // ============================================================================
  function renderPresetPrompts(url, elements = []) {
    let presets = [];
    if (url.includes('/sites/grocery')) {
      presets = [
        { label: 'Add Apples & Oat Milk', cmd: 'Click Add Organic Honeycrisp Apples to Cart, then click Add Barista Oat Milk to Cart' },
        { label: 'Fill Ramp Note & Order', cmd: 'Type Please use side ramp entrance in Driver Instructions, select Place on raised porch table, and click Place Grocery Order' }
      ];
    } else if (url.includes('/sites/civic')) {
      presets = [
        { label: 'Book Wheelchair Van', cmd: 'Type Jordan Rivera in Rider Pass Name, type 240 Oak Street in Pickup Location, type CareBridge Medical Center in Destination, and click Request Accessible Van' },
        { label: 'Enroll Utility Discount', cmd: 'Type UTIL-99201 in Utility Account Number, select Power Wheelchair Charging Station, and click Enroll in Medical Baseline Rate' }
      ];
    } else if (url.includes('/sites/clinic')) {
      presets = [
        { label: 'Auto-Fill & Confirm Maya Lin', cmd: 'Type Maya Lin in Patient Full Name, type maya@lin.org in Email Address, select Dr. Elena Chen, check Wheelchair Accessible Exam Room, and click Confirm Appointment Booking' },
        { label: 'Open NOU e-Learning', cmd: 'Go to elearn.nou.edu.ng' }
      ];
    } else {
      const inputs = elements.filter(e => e.category === 'input' && e.tag !== 'select');
      if (inputs.length >= 2) {
        const s1 = getSmartSampleValueForField(inputs[0]);
        const s2 = getSmartSampleValueForField(inputs[1]);
        presets.push({
          label: `Fill #${inputs[0].id} & #${inputs[1].id}`,
          cmd: `Type ${s1} in #${inputs[0].id}, then type ${s2} in #${inputs[1].id}`
        });
      }
      const firstBtn = elements.find(e => e.category === 'action');
      if (firstBtn) {
        presets.push({
          label: `Click #${firstBtn.id} (${firstBtn.label.slice(0, 20)})`,
          cmd: `Click #${firstBtn.id}`
        });
      }
      presets.push({ label: 'Summarize Page', cmd: 'What is on this page?' });
    }

    presetPromptsContainer.innerHTML = '';
    for (const item of presets) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prompt-chip';
      btn.textContent = item.label;
      btn.addEventListener('click', () => {
        agentCommandInput.value = item.cmd;
        runAgentCommand(item.cmd);
      });
      presetPromptsContainer.appendChild(btn);
    }

    document.querySelectorAll('.preset-site-btn').forEach(btn => {
      const sitePath = btn.getAttribute('data-site');
      const extUrl = btn.getAttribute('data-external');
      if (sitePath) {
        btn.classList.toggle('active', url.includes(sitePath));
      } else if (extUrl) {
        btn.classList.toggle('active', url.includes('nou.edu.ng'));
      }
    });
  }

  function renderSomOverlay(elements) {
    somOverlay.innerHTML = '';
    somOverlay.classList.toggle('badges-hidden', !badgesVisible);
    const dims = getViewportDimensions();

    for (const el of elements) {
      if (el.inViewport === false) continue;

      const box = document.createElement('div');
      box.className = `som-box category-${el.category}`;
      box.dataset.id = String(el.id);

      const leftPct = (el.rect.x / dims.width) * 100;
      const topPct = (el.rect.y / dims.height) * 100;
      const widthPct = (el.rect.width / dims.width) * 100;
      const heightPct = (el.rect.height / dims.height) * 100;

      box.style.left = `${leftPct}%`;
      box.style.top = `${topPct}%`;
      box.style.width = `${widthPct}%`;
      box.style.height = `${heightPct}%`;

      const badge = document.createElement('span');
      badge.className = 'som-badge';
      badge.textContent = `#${el.id}`;
      badge.title = `Tap to interact with #${el.id}: ${el.label}`;

      const tooltip = document.createElement('span');
      tooltip.className = 'som-tooltip';
      tooltip.textContent = `#${el.id} • ${el.label}`;

      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        if (el.category === 'input') {
          openQuickFieldModal(el);
        } else {
          executeDirectAction({ action: 'click', elementId: el.id }, el.rect, `Clicking #${el.id}`);
        }
      });

      box.appendChild(badge);
      box.appendChild(tooltip);
      somOverlay.appendChild(box);
    }
  }

  function renderAccessibleDeck(elements) {
    const inputs = elements.filter(e => e.category === 'input');
    const actionsAndLinks = elements.filter(e => e.category !== 'input');

    countInputs.textContent = String(inputs.length);
    countActions.textContent = String(actionsAndLinks.length);
    if (mobileInputsCount) mobileInputsCount.textContent = String(inputs.length);
    if (mobileActionsCount) mobileActionsCount.textContent = String(actionsAndLinks.length);

    // 1. Render Form Inputs Tab (Non-Destructive DOM Diffing so focused inputs & Fill buttons NEVER disappear)
    const activePageKey = currentExternalUrl || currentSiteKey || 'default';
    const inputSig = `${activePageKey}::` + inputs.map(e => `${e.id}:${e.tag}:${e.type}:${e.label}`).join('|');

    if (deckPanelInputs.dataset.sig === inputSig && inputs.length > 0 && deckPanelInputs.querySelector('.a11y-card-list')) {
      // Update values in-place ONLY for fields that are not currently focused by the user
      for (const el of inputs) {
        const fieldNode = document.getElementById(`deck-input-${el.id}`);
        if (fieldNode && document.activeElement !== fieldNode) {
          if (fieldNode.value !== (el.value || '')) {
            fieldNode.value = el.value || '';
          }
        }
      }
    } else {
      deckPanelInputs.dataset.sig = inputSig;
      deckPanelInputs.innerHTML = '';

      if (inputs.length === 0) {
        deckPanelInputs.innerHTML = `<div class="local-info-box">No fillable text inputs detected on this view. Switch to the <strong>Buttons &amp; Links</strong> tab to navigate further.</div>`;
      } else {
        const headerRow = document.createElement('div');
        headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;';
        headerRow.innerHTML = `<span class="section-label">Step 2: Type or Auto-Fill Fields (${inputs.length})</span>`;

        const autoBtn = document.createElement('button');
        autoBtn.type = 'button';
        autoBtn.className = 'autofill-cta-btn';
        autoBtn.textContent = 'Auto-Fill All';
        autoBtn.addEventListener('click', () => runAgentCommand('Auto-fill form'));
        headerRow.appendChild(autoBtn);
        deckPanelInputs.appendChild(headerRow);

        const list = document.createElement('div');
        list.className = 'a11y-card-list';

        for (const el of inputs) {
          const card = document.createElement('div');
          card.className = 'a11y-control-card';
          card.addEventListener('mouseenter', () => highlightElementOnViewport(el.id, true));
          card.addEventListener('mouseleave', () => highlightElementOnViewport(el.id, false));
          card.addEventListener('focusin', () => highlightElementOnViewport(el.id, true));
          card.addEventListener('focusout', () => highlightElementOnViewport(el.id, false));

          const topRow = document.createElement('div');
          topRow.className = 'card-top-row';
          topRow.innerHTML = `
            <span class="badge-pill input-pill">#${el.id}</span>
            <label class="control-name" for="deck-input-${el.id}">${escapeHtml(el.label)}</label>
            <span class="control-role-tag">${escapeHtml(el.tag === 'select' ? 'dropdown' : el.type)}</span>
          `;
          card.appendChild(topRow);

          const fieldRow = document.createElement('div');
          fieldRow.className = 'inline-field-row';

          if (el.tag === 'select' && Array.isArray(el.options)) {
            const sel = document.createElement('select');
            sel.id = `deck-input-${el.id}`;
            for (const opt of el.options) {
              const o = document.createElement('option');
              o.value = opt.value;
              o.textContent = opt.text;
              if (opt.selected) o.selected = true;
              sel.appendChild(o);
            }
            sel.addEventListener('change', () => {
              executeDirectAction({ action: 'select', elementId: el.id, value: sel.value }, el.rect, `Selecting #${el.id}`);
            });
            fieldRow.appendChild(sel);
          } else {
            const inp = document.createElement('input');
            inp.id = `deck-input-${el.id}`;
            inp.type = 'text';
            inp.value = el.value || '';
            inp.placeholder = el.placeholder || `Enter ${el.label}...`;

            const applyBtn = document.createElement('button');
            applyBtn.type = 'button';
            applyBtn.className = 'apply-btn';
            applyBtn.textContent = 'Fill';

            // Live two-way sync as user types in the input box!
            inp.addEventListener('input', () => {
              setFlowStep(2);
              const doc = viewportIframe.contentDocument;
              const domNode = doc ? doc.querySelector(`[data-a11y-id="${el.id}"]`) : null;
              if (domNode) {
                setNativeFormValue(domNode, inp.value, { scroll: false, focusIframe: false });
              }
            });

            // Prevent mousedown on Fill button from blurring input and causing mobile keyboard jump
            applyBtn.addEventListener('mousedown', (ev) => {
              ev.preventDefault();
            });

            const triggerType = () => {
              applyBtn.textContent = '✓ Filled';
              setTimeout(() => {
                if (applyBtn.isConnected) applyBtn.textContent = 'Fill';
              }, 1200);
              executeDirectAction(
                { action: 'type', elementId: el.id, value: inp.value },
                el.rect,
                `Filling #${el.id}`
              );
            };

            applyBtn.addEventListener('click', triggerType);
            inp.addEventListener('keydown', (ev) => {
              if (ev.key === 'Enter') {
                ev.preventDefault();
                triggerType();
              }
            });

            fieldRow.appendChild(inp);
            fieldRow.appendChild(applyBtn);
          }

          card.appendChild(fieldRow);
          list.appendChild(card);
        }

        deckPanelInputs.appendChild(list);

        // Step 3 CTA: Primary Submit button right at the bottom of the Form Inputs tab!
        const primarySubmitEl = elements.find(e =>
          e.category === 'action' && /submit|confirm|book|order|request|enroll|log\s*in|sign\s*in/i.test(e.label)
        ) || elements.find(e => e.category === 'action');

        if (primarySubmitEl) {
          const submitCard = document.createElement('button');
          submitCard.type = 'button';
          submitCard.className = 'primary-btn';
          submitCard.style.cssText = 'width:100%;min-height:46px;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:8px;';
          submitCard.innerHTML = `<span>Step 3: ${escapeHtml(primarySubmitEl.label)} (#${primarySubmitEl.id})</span> <span>→</span>`;
          submitCard.addEventListener('click', () => {
            executeDirectAction({ action: 'click', elementId: primarySubmitEl.id }, primarySubmitEl.rect, `Submitting #${primarySubmitEl.id}`);
          });
          deckPanelInputs.appendChild(submitCard);
        }
      }
    }

    // 2. Render Buttons & Links Tab with Instant Filter (Non-Destructive Diffing)
    const actionSig = `${activePageKey}::` + actionsAndLinks.map(e => `${e.id}:${e.label}:${e.value}`).join('|');
    if (deckPanelActions.dataset.sig !== actionSig) {
      deckPanelActions.dataset.sig = actionSig;
      deckPanelActions.innerHTML = '';

      const filterInput = document.createElement('input');
      filterInput.type = 'text';
      filterInput.className = 'deck-filter-input';
      filterInput.placeholder = 'Filter buttons or links by name or #badge...';
      filterInput.setAttribute('aria-label', 'Filter buttons and links');
      deckPanelActions.appendChild(filterInput);

      const actionList = document.createElement('div');
      actionList.className = 'a11y-card-list';

      for (const el of actionsAndLinks) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'big-action-btn';
        btn.dataset.filterText = `#${el.id} ${el.label}`.toLowerCase();

        const stateSuffix = el.type === 'checkbox' ? ` (${el.value === 'checked' ? '✓ Checked' : 'Unchecked'})` : '';
        const kindLabel = el.category === 'navigation' ? 'Link ↗' : el.type === 'checkbox' ? 'Toggle' : 'Button →';

        btn.innerHTML = `
          <span style="display:flex;align-items:center;gap:9px;min-width:0;">
            <span class="badge-pill">#${el.id}</span>
            <span style="overflow:hidden;text-overflow:ellipsis;">${escapeHtml(el.label)}${escapeHtml(stateSuffix)}</span>
          </span>
          <span class="control-role-tag" style="flex-shrink:0;">${kindLabel}</span>
        `;
        btn.addEventListener('mouseenter', () => highlightElementOnViewport(el.id, true));
        btn.addEventListener('mouseleave', () => highlightElementOnViewport(el.id, false));
        btn.addEventListener('focus', () => highlightElementOnViewport(el.id, true));
        btn.addEventListener('blur', () => highlightElementOnViewport(el.id, false));
        btn.addEventListener('click', () => {
          executeDirectAction({ action: 'click', elementId: el.id }, el.rect, `Clicking #${el.id}`);
        });
        actionList.appendChild(btn);
      }

      filterInput.addEventListener('input', () => {
        const q = filterInput.value.toLowerCase().trim();
        actionList.querySelectorAll('.big-action-btn').forEach(b => {
          b.style.display = (!q || b.dataset.filterText.includes(q)) ? 'flex' : 'none';
        });
      });

      deckPanelActions.appendChild(actionList);
    }
  }

  function renderStepHistory(history) {
    const items = Array.isArray(history) ? [...history].reverse() : [];
    traceCount.textContent = String(items.length);
    stepLogList.innerHTML = '';

    if (items.length === 0) {
      stepLogList.innerHTML = `<div class="local-info-box">No actions recorded yet. Tap "Auto-Fill Form" or click any control to see the step-by-step trace.</div>`;
      return;
    }

    for (const item of items) {
      const div = document.createElement('div');
      div.className = 'step-log-item';
      div.innerHTML = `
        <div class="step-meta">
          <span>${escapeHtml(item.action ? item.action.toUpperCase() : 'STEP')} ${item.elementId ? '• #' + item.elementId : ''}</span>
          <span>${escapeHtml(item.timestamp || '')}</span>
        </div>
        <div class="step-summary">${escapeHtml(item.summary || '')}</div>
      `;
      if (item.elementId) {
        div.addEventListener('mouseenter', () => highlightElementOnViewport(item.elementId, true));
        div.addEventListener('mouseleave', () => highlightElementOnViewport(item.elementId, false));
        div.addEventListener('click', () => {
          if (item.rect) moveAgentCursorToRect(item.rect, `#${item.elementId}`, 1500);
        });
      }
      stepLogList.appendChild(div);
    }
  }

  function applyBrowserState(state) {
    if (!state) return;
    currentState = state;

    if (usePlaywrightBackend && state.screenshot) {
      screenshotImg.style.display = 'block';
      viewportIframe.style.display = 'none';
      screenshotImg.src = state.screenshot;
    }

    livePageTitle.textContent = state.title || state.url;
    if (document.activeElement !== urlInput) {
      urlInput.value = state.url;
    }
    const inputCount = state.elements.filter(e => e.category === 'input').length;
    elementCountBadge.textContent = `${inputCount} inputs • ${state.elements.length} controls`;

    if (state.alerts && state.alerts.length > 0) {
      liveAlertText.textContent = state.alerts.join(' • ');
      liveAlertStrip.classList.add('visible');
    } else {
      liveAlertStrip.classList.remove('visible');
    }

    renderPresetPrompts(state.url, state.elements);
    renderSomOverlay(state.elements);
    renderAccessibleDeck(state.elements);
    renderStepHistory(state.history);
  }

  async function executeDirectAction(payload, rect = null, cursorText = '') {
    if (rect) {
      moveAgentCursorToRect(rect, cursorText || `${payload.action} #${payload.elementId || ''}`);
    }

    if (!usePlaywrightBackend) {
      const { record, state } = await performClientSingleAction(payload);
      const alertSuffix = state && state.alerts && state.alerts.length ? ` — ${state.alerts.join(' ')}` : '';
      setAgentAnnouncement(`${record.summary}${alertSuffix}`);
      return;
    }

    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok && data.state) {
        applyBrowserState(data.state);
        const alertSuffix = data.state.alerts && data.state.alerts.length ? ` — ${data.state.alerts.join(' ')}` : '';
        setAgentAnnouncement(`${data.record.summary}${alertSuffix}`);
      }
    } catch (err) {
      setAgentAnnouncement(`Action error: ${err.message}`);
    }
  }

  async function runAgentCommand(commandText) {
    const command = String(commandText || '').trim();
    if (!command) return;

    runAgentBtn.disabled = true;
    runAgentBtn.textContent = 'Working...';
    setAgentAnnouncement(`Executing: "${command}"...`, false);

    try {
      const initialState = scanClientIframeDom();
      let plan = null;

      if (aiProvider === 'deepseek' && deepseekApiKey) {
        try {
          plan = await planWithDeepSeekModel(command, initialState, deepseekApiKey, deepseekModel);
        } catch (_) {
          plan = planClientGrounding(command, initialState);
        }
      } else if (aiProvider === 'gemini' && geminiApiKey) {
        try {
          plan = await planWithGeminiModel(command, initialState, geminiApiKey, geminiModel);
        } catch (_) {
          plan = planClientGrounding(command, initialState);
        }
      } else {
        plan = planClientGrounding(command, initialState);
      }

      if (plan.engine) activeEngineBadge.textContent = plan.engine.slice(0, 26);

      for (const step of plan.steps) {
        if (step.action === 'narrate') continue;
        const { record } = await performClientSingleAction(step);
        if (record.rect) {
          moveAgentCursorToRect(record.rect, `${step.action.toUpperCase()} #${record.elementId || ''}`, 900);
          await new Promise(r => setTimeout(r, 350));
        }
      }

      const finalState = scanClientIframeDom();
      let spoken = plan.spokenResponse;
      if (finalState && finalState.alerts && finalState.alerts.length > 0) {
        setFlowStep(3);
        spoken += ` ${finalState.alerts.join(' ')}`;
      }
      setAgentAnnouncement(spoken);
    } catch (err) {
      setAgentAnnouncement(`Agent error: ${err.message}`);
    } finally {
      runAgentBtn.disabled = false;
      runAgentBtn.textContent = 'Run';
    }
  }

  quickAutofillCta.addEventListener('click', () => {
    runAgentCommand('Auto-fill form');
  });

  // Quick-Type Modal
  function openQuickFieldModal(el) {
    activeQuickElement = el;
    quickFieldTitle.textContent = `#${el.id} • ${el.label}`;
    quickFieldSubtitle.textContent = el.tag === 'select'
      ? 'Select an option to apply on the webpage:'
      : 'Type or dictate the value to enter into this field:';

    quickFieldContainer.innerHTML = '';

    if (el.tag === 'select' && Array.isArray(el.options)) {
      const sel = document.createElement('select');
      sel.id = 'quick-modal-active-input';
      sel.className = 'modal-input';
      for (const opt of el.options) {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.text;
        if (opt.selected) o.selected = true;
        sel.appendChild(o);
      }
      quickFieldContainer.appendChild(sel);
    } else {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.id = 'quick-modal-active-input';
      inp.className = 'modal-input';
      inp.value = el.value || '';
      inp.placeholder = el.placeholder || `Enter ${el.label}...`;
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitQuickFieldModal();
        }
      });
      quickFieldContainer.appendChild(inp);
    }

    quickFieldModal.classList.add('open');
    setTimeout(() => {
      const field = document.getElementById('quick-modal-active-input');
      if (field) field.focus();
    }, 50);
  }

  function submitQuickFieldModal() {
    if (!activeQuickElement) return;
    const field = document.getElementById('quick-modal-active-input');
    const val = field ? field.value : '';
    const el = activeQuickElement;
    quickFieldModal.classList.remove('open');
    activeQuickElement = null;

    executeDirectAction(
      {
        action: el.tag === 'select' ? 'select' : 'type',
        elementId: el.id,
        value: val
      },
      el.rect,
      `${el.tag === 'select' ? 'Selecting' : 'Filling'} #${el.id}`
    );
  }

  const closeQuickModal = () => {
    quickFieldModal.classList.remove('open');
    activeQuickElement = null;
  };
  quickFieldCancel.addEventListener('click', closeQuickModal);
  quickFieldCancelTop.addEventListener('click', closeQuickModal);
  quickFieldSubmit.addEventListener('click', submitQuickFieldModal);

  // Navigation Events
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    executeDirectAction({ action: 'navigate', value: urlInput.value });
  });

  document.getElementById('btn-back').addEventListener('click', () => {
    executeDirectAction({ action: 'back' });
  });

  document.getElementById('btn-reload').addEventListener('click', () => {
    executeDirectAction({ action: 'reload' });
  });

  document.getElementById('scroll-up-btn').addEventListener('click', () => {
    executeDirectAction({ action: 'scroll', direction: 'up' });
  });

  document.getElementById('scroll-down-btn').addEventListener('click', () => {
    executeDirectAction({ action: 'scroll', direction: 'down' });
  });

  document.querySelectorAll('.preset-site-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const site = btn.getAttribute('data-site');
      const extUrl = btn.getAttribute('data-external');
      if (extUrl) {
        loadExternalWebsite(extUrl, true);
      } else if (site) {
        loadClientPortal(site, true);
      }
    });
  });

  // Accessibility Toggles
  const toggleBadgesBtn = document.getElementById('toggle-badges-btn');
  toggleBadgesBtn.addEventListener('click', () => {
    badgesVisible = !badgesVisible;
    toggleBadgesBtn.classList.toggle('active', badgesVisible);
    toggleBadgesBtn.setAttribute('aria-pressed', String(badgesVisible));
    toggleBadgesBtn.textContent = `# Badges: ${badgesVisible ? 'ON' : 'OFF'}`;
    somOverlay.classList.toggle('badges-hidden', !badgesVisible);
  });

  const toggleTtsBtn = document.getElementById('toggle-tts-btn');
  const ttsBtnLabel = document.getElementById('tts-btn-label');
  toggleTtsBtn.addEventListener('click', () => {
    ttsEnabled = !ttsEnabled;
    toggleTtsBtn.classList.toggle('active', ttsEnabled);
    toggleTtsBtn.setAttribute('aria-pressed', String(ttsEnabled));
    if (ttsBtnLabel) ttsBtnLabel.textContent = ttsEnabled ? 'Voice On' : 'Voice Off';
    if (ttsEnabled) {
      speakText('Voice readout enabled. ' + agentSpeechText.textContent);
    }
  });

  const toggleContrastBtn = document.getElementById('toggle-contrast-btn');
  toggleContrastBtn.addEventListener('click', () => {
    const enabled = document.body.classList.toggle('high-contrast');
    toggleContrastBtn.classList.toggle('active', enabled);
    toggleContrastBtn.setAttribute('aria-pressed', String(enabled));
  });

  const toggleLargeTextBtn = document.getElementById('toggle-large-text-btn');
  toggleLargeTextBtn.addEventListener('click', () => {
    const enabled = document.body.classList.toggle('large-text');
    toggleLargeTextBtn.classList.toggle('active', enabled);
    toggleLargeTextBtn.setAttribute('aria-pressed', String(enabled));
    setTimeout(scanClientIframeDom, 60);
  });

  // ============================================================================
  // AI PROVIDER & MODEL SETTINGS MODAL (Gemini 3.8 Flash + DeepSeek V3/R1)
  // ============================================================================
  function selectProviderTab(prov) {
    aiProvider = prov;
    document.querySelectorAll('.provider-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-provider') === prov);
    });
    document.getElementById('provider-panel-gemini').style.display = prov === 'gemini' ? 'block' : 'none';
    document.getElementById('provider-panel-deepseek').style.display = prov === 'deepseek' ? 'block' : 'none';
    document.getElementById('provider-panel-local').style.display = prov === 'local' ? 'block' : 'none';
    apiTestStatus.className = 'api-test-status';
  }

  document.querySelectorAll('.provider-card').forEach(card => {
    card.addEventListener('click', () => selectProviderTab(card.getAttribute('data-provider')));
  });

  openAiModalBtn.addEventListener('click', () => {
    geminiModelSelect.value = geminiModel;
    geminiKeyInput.value = geminiApiKey;
    deepseekModelSelect.value = deepseekModel;
    deepseekKeyInput.value = deepseekApiKey;
    selectProviderTab(aiProvider);
    aiSettingsModal.classList.add('open');
  });

  const closeAiModal = () => aiSettingsModal.classList.remove('open');
  aiModalClose.addEventListener('click', closeAiModal);
  aiModalCloseTop.addEventListener('click', closeAiModal);

  testApiBtn.addEventListener('click', async () => {
    apiTestStatus.className = 'api-test-status visible';
    apiTestStatus.textContent = 'Testing connection...';
    const startMs = Date.now();

    try {
      if (aiProvider === 'local') {
        apiTestStatus.className = 'api-test-status visible ok';
        apiTestStatus.textContent = `✓ Built-in Local Semantic Engine verified and ready (0ms latency).`;
        return;
      }

      if (aiProvider === 'deepseek') {
        const key = deepseekKeyInput.value.trim();
        const mod = deepseekModelSelect.value;
        if (!key) throw new Error('Please paste your DeepSeek API key (sk-...) first.');
        const st = scanClientIframeDom();
        await planWithDeepSeekModel('What is on this page?', st, key, mod);
        apiTestStatus.className = 'api-test-status visible ok';
        apiTestStatus.textContent = `✓ Connected to DeepSeek (${mod}) in ${Date.now() - startMs}ms!`;
        return;
      }

      if (aiProvider === 'gemini') {
        const key = geminiKeyInput.value.trim();
        const mod = geminiModelSelect.value;
        if (!key) throw new Error('Please paste your Gemini API key (AIzaSy...) or select Built-in Local.');
        const st = scanClientIframeDom();
        await planWithGeminiModel('What is on this page?', st, key, mod);
        apiTestStatus.className = 'api-test-status visible ok';
        apiTestStatus.textContent = `✓ Connected to Google Gemini (${mod}) in ${Date.now() - startMs}ms!`;
      }
    } catch (err) {
      apiTestStatus.className = 'api-test-status visible err';
      apiTestStatus.textContent = `✕ Connection test failed: ${err.message}`;
    }
  });

  aiModalSave.addEventListener('click', () => {
    geminiModel = geminiModelSelect.value;
    geminiApiKey = geminiKeyInput.value.trim();
    deepseekModel = deepseekModelSelect.value;
    deepseekApiKey = deepseekKeyInput.value.trim();

    localStorage.setItem('a11y_ai_provider', aiProvider);
    localStorage.setItem('a11y_gemini_model', geminiModel);
    localStorage.setItem('a11y_gemini_key', geminiApiKey);
    localStorage.setItem('a11y_deepseek_model', deepseekModel);
    localStorage.setItem('a11y_deepseek_key', deepseekApiKey);

    updateEngineBadge();
    closeAiModal();
    setAgentAnnouncement(`Saved AI settings: Active model is ${activeEngineBadge.textContent}.`);
  });

  agentCommandForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runAgentCommand(agentCommandInput.value);
  });

  // Voice Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    let isListening = false;

    voiceMicBtn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
        return;
      }
      try {
        recognition.start();
        isListening = true;
        voiceMicBtn.classList.add('listening');
        setAgentAnnouncement('Listening for your voice command...', false);
      } catch (_) {}
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      agentCommandInput.value = transcript;
      runAgentCommand(transcript);
    };
    recognition.onend = () => {
      isListening = false;
      voiceMicBtn.classList.remove('listening');
    };
    recognition.onerror = () => {
      isListening = false;
      voiceMicBtn.classList.remove('listening');
    };
  }

  window.addEventListener('resize', () => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'select' || activeTag === 'textarea') {
      return;
    }
    if (!usePlaywrightBackend) {
      scanClientIframeDom();
    }
  });

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initialize
  loadClientPortal('/sites/clinic');
})();
