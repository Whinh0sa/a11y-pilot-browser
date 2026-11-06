(() => {
  let currentState = null;
  let badgesVisible = true;
  let ttsEnabled = false;
  let geminiApiKey = localStorage.getItem('a11y_gemini_key') || '';
  let activeQuickElement = null;
  let usePlaywrightBackend = false;
  let clientHistory = [];
  let navStack = ['/sites/clinic'];
  let currentSiteKey = '/sites/clinic';

  // Built-in Realistic Portals for Client-Side Live Browser Mode (GitHub Pages / Standalone)
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
    header { background: #0b4f6c; color: #ffffff; padding: 14px 26px; display: flex; justify-content: space-between; align-items: center; }
    .brand { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
    .brand-badge { background: #20bf55; color: #062b16; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
    nav { display: flex; gap: 10px; }
    nav a { color: #d9e2ec; text-decoration: none; padding: 7px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    nav a:hover, nav a.active { background: rgba(255,255,255,0.18); color: #fff; }
    .container { max-width: 1140px; margin: 18px auto; padding: 0 20px; display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; }
    .card { background: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #d9e2ec; box-shadow: 0 4px 12px rgba(16,42,67,0.05); }
    h1 { font-size: 19px; margin-bottom: 4px; color: #0b4f6c; }
    .subtitle { font-size: 13px; color: #486581; margin-bottom: 14px; }
    .search-row { display: flex; gap: 8px; margin-bottom: 14px; }
    .search-row input { flex: 1; padding: 9px 12px; border: 1.5px solid #bcccdc; border-radius: 8px; font-size: 13px; }
    .search-row button { padding: 9px 14px; background: #0b4f6c; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px; }
    .doctor-list { display: flex; flex-direction: column; gap: 10px; }
    .doc-card { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border: 1.5px solid #e1e8ef; border-radius: 10px; background: #fafcfe; }
    .doc-card.selected { border-color: #0b4f6c; background: #eef6fa; }
    .doc-info h3 { font-size: 15px; color: #102a43; }
    .doc-info p { font-size: 12.5px; color: #486581; }
    .doc-tag { display: inline-block; margin-top: 4px; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: #d8f3dc; color: #1b4332; }
    .select-doc-btn { padding: 7px 12px; border-radius: 8px; border: 1.5px solid #0b4f6c; background: #fff; color: #0b4f6c; font-weight: 700; cursor: pointer; font-size: 12.5px; }
    .doc-card.selected .select-doc-btn { background: #0b4f6c; color: #fff; }
    .form-group { margin-bottom: 11px; }
    .form-group label { display: block; font-size: 12.5px; font-weight: 700; color: #243b53; margin-bottom: 4px; }
    .form-group input, .form-group select { width: 100%; padding: 8px 11px; border: 1.5px solid #bcccdc; border-radius: 8px; font-size: 13.5px; color: #102a43; background: #fff; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .checkbox-row { display: flex; gap: 14px; align-items: center; margin: 10px 0; font-size: 12.5px; font-weight: 600; color: #334e68; }
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
      <h1>Available Specialists</h1>
      <p class="subtitle">Select a specialist below or use the booking form on the right.</p>

      <div class="search-row">
        <input type="text" id="doctor-search" aria-label="Search doctor by name or specialty" placeholder="Search doctor or specialty (e.g. Cardiology, Neurology)..." />
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
    header { background: #1b4332; color: #ffffff; padding: 14px 26px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 18px; font-weight: 800; }
    nav { display: flex; gap: 10px; }
    nav a { color: #d8f3dc; text-decoration: none; padding: 7px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    nav a.active, nav a:hover { background: rgba(255,255,255,0.18); color: #fff; }
    .layout { max-width: 1140px; margin: 18px auto; padding: 0 20px; display: grid; grid-template-columns: 1.3fr 0.9fr; gap: 20px; }
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

    <section class="panel">
      <h2 style="font-size:17px;margin-bottom:4px;">Delivery Cart (<span id="cart-count">1</span>)</h2>
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
    header { background: #1e293b; color: #ffffff; padding: 14px 26px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 18px; font-weight: 800; }
    nav { display: flex; gap: 10px; }
    nav a { color: #cbd5e1; text-decoration: none; padding: 7px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    nav a.active, nav a:hover { background: rgba(255,255,255,0.16); color: #fff; }
    .main { max-width: 1100px; margin: 20px auto; padding: 0 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
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
  const viewportStage = document.getElementById('viewport-stage');
  const viewportIframe = document.getElementById('viewport-iframe');
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
  const agentSpeechText = document.getElementById('agent-speech-text');
  const activeEngineBadge = document.getElementById('active-engine-badge');
  const presetPromptsContainer = document.getElementById('preset-prompts-container');

  const deckPanelControls = document.getElementById('deck-panel-controls');
  const deckPanelHistory = document.getElementById('deck-panel-history');
  const stepLogList = document.getElementById('step-log-list');
  const traceCount = document.getElementById('trace-count');

  const tabDeckBtn = document.getElementById('tab-deck-btn');
  const tabHistoryBtn = document.getElementById('tab-history-btn');

  // Modals
  const quickFieldModal = document.getElementById('quick-field-modal');
  const quickFieldTitle = document.getElementById('quick-field-title');
  const quickFieldSubtitle = document.getElementById('quick-field-subtitle');
  const quickFieldContainer = document.getElementById('quick-field-input-container');
  const quickFieldCancel = document.getElementById('quick-field-cancel');
  const quickFieldSubmit = document.getElementById('quick-field-submit');

  const geminiModal = document.getElementById('gemini-modal');
  const geminiKeyInput = document.getElementById('gemini-key-input');
  const openGeminiModalBtn = document.getElementById('open-gemini-modal-btn');
  const geminiModalClose = document.getElementById('gemini-modal-close');
  const geminiModalSave = document.getElementById('gemini-modal-save');

  function updateEngineBadge() {
    if (geminiApiKey) {
      activeEngineBadge.textContent = 'Gemini 2.5 Flash + DOM';
    } else {
      activeEngineBadge.textContent = 'Semantic Grounding Ready';
    }
  }
  updateEngineBadge();

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
  // CLIENT-SIDE LIVE DOM ENGINE (Used on Public GitHub Pages & Standalone Mode)
  // ============================================================================
  function loadClientPortal(siteKey, pushHistory = true) {
    const portal = PORTAL_PAGES[siteKey] || PORTAL_PAGES['/sites/clinic'];
    currentSiteKey = PORTAL_PAGES[siteKey] ? siteKey : '/sites/clinic';
    if (pushHistory && navStack[navStack.length - 1] !== currentSiteKey) {
      navStack.push(currentSiteKey);
    }

    viewportIframe.style.display = 'block';
    screenshotImg.style.display = 'none';

    const doc = viewportIframe.contentDocument || viewportIframe.contentWindow.document;
    doc.open();
    doc.write(portal.html);
    doc.close();

    // Wire internal nav links inside the iframe to switch portals seamlessly
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
    }, 60);
  }

  function scanClientIframeDom() {
    const doc = viewportIframe.contentDocument;
    if (!doc || !doc.body) return null;

    const selector = [
      'a[href]',
      'button',
      'input:not([type="hidden"])',
      'select',
      'textarea',
      '[role="button"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[onclick]'
    ].join(',');

    const candidates = Array.from(doc.querySelectorAll(selector));
    const elements = [];
    let nextId = 1;

    function getAccessibleLabel(el) {
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

      if (el.id) {
        const explicitLabel = doc.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (explicitLabel && explicitLabel.innerText.trim()) return explicitLabel.innerText.trim();
      }

      const parentLabel = el.closest('label');
      if (parentLabel && parentLabel.innerText.trim()) return parentLabel.innerText.trim();

      const placeholder = el.getAttribute('placeholder');
      if (placeholder && placeholder.trim()) return placeholder.trim();

      const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) return text.slice(0, 90);

      return el.getAttribute('title') || el.id || el.tagName.toLowerCase();
    }

    function getCategory(tag, type, role) {
      if (tag === 'input' && (type === 'checkbox' || type === 'radio')) return 'toggle';
      if (tag === 'input' && (type === 'submit' || type === 'button')) return 'action';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return 'input';
      if (tag === 'a' || role === 'link') return 'navigation';
      return 'action';
    }

    const win = viewportIframe.contentWindow;
    for (const el of candidates) {
      const style = win.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 6 || rect.height < 6) continue;
      if (rect.bottom < 0 || rect.top > win.innerHeight) continue;

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
    }

    const alerts = [];
    doc.querySelectorAll('[role="status"], [aria-live], .banner-success.visible, .order-msg.visible, .status-box.visible').forEach(node => {
      const s = win.getComputedStyle(node);
      if (s.display !== 'none' && s.visibility !== 'hidden') {
        const txt = (node.innerText || '').trim();
        if (txt) alerts.push(txt);
      }
    });

    const portalInfo = PORTAL_PAGES[currentSiteKey] || PORTAL_PAGES['/sites/clinic'];
    const state = {
      url: portalInfo.url,
      title: doc.title || portalInfo.title,
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

  function performClientSingleAction(step) {
    const doc = viewportIframe.contentDocument;
    const win = viewportIframe.contentWindow;
    const state = scanClientIframeDom();
    const elements = state ? state.elements : [];

    const { action, elementId, value, direction } = step;
    const targetEl = elementId ? elements.find(e => e.id === Number(elementId)) : null;
    const domNode = targetEl ? doc.querySelector(`[data-a11y-id="${targetEl.id}"]`) : null;

    let summary = '';
    if (action === 'navigate') {
      const val = String(value || '');
      if (val.includes('grocery')) loadClientPortal('/sites/grocery');
      else if (val.includes('civic')) loadClientPortal('/sites/civic');
      else loadClientPortal('/sites/clinic');
      summary = `Navigated to ${val}`;
    } else if (action === 'back') {
      if (navStack.length > 1) {
        navStack.pop();
        loadClientPortal(navStack[navStack.length - 1], false);
      }
      summary = 'Navigated back';
    } else if (action === 'reload') {
      loadClientPortal(currentSiteKey, false);
      summary = 'Reloaded page';
    } else if (action === 'scroll') {
      const dir = (direction || value || 'down').toLowerCase();
      win.scrollBy({ top: dir === 'up' ? -280 : 280, behavior: 'smooth' });
      summary = `Scrolled page ${dir}`;
    } else if (action === 'click' && domNode) {
      if (domNode.hasAttribute('data-portal')) {
        loadClientPortal(domNode.getAttribute('data-portal'));
      } else {
        domNode.click();
      }
      summary = `Clicked #${targetEl.id} "${targetEl.label}"`;
    } else if (action === 'type' && domNode) {
      domNode.focus();
      domNode.value = String(value ?? '');
      domNode.dispatchEvent(new Event('input', { bubbles: true }));
      domNode.dispatchEvent(new Event('change', { bubbles: true }));
      summary = `Typed "${value}" into #${targetEl.id} (${targetEl.label})`;
    } else if (action === 'select' && domNode) {
      let matchedValue = String(value ?? '');
      if (targetEl.options) {
        const q = matchedValue.toLowerCase();
        const found = targetEl.options.find(
          o => o.value.toLowerCase() === q || o.text.toLowerCase() === q || o.text.toLowerCase().includes(q)
        );
        if (found) matchedValue = found.value;
      }
      domNode.value = matchedValue;
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
    const idMatch = clean.match(/^(?:#|element\s+#?|badge\s+#?|item\s+#?|number\s+#?)?(\d+)$/);
    if (idMatch) {
      const exact = elements.find(e => e.id === Number(idMatch[1]));
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

  function planClientGrounding(command, state) {
    const elements = state.elements;
    const steps = [];
    const raw = String(command || '').trim();
    const lower = raw.toLowerCase();

    if (/^(what|describe|summarize|read|where am i|help|list)/.test(lower) && !/click|type|fill|select|book|add|order/.test(lower)) {
      const inputCount = elements.filter(e => e.category === 'input').length;
      const actionCount = elements.filter(e => e.category === 'action' || e.category === 'toggle').length;
      const alertPart = state.alerts.length ? ` Active alert: ${state.alerts.join(' ')}` : '';
      const summary = `You are on "${state.title}". There are ${elements.length} interactive controls: ${inputCount} form fields and ${actionCount} buttons or toggles.${alertPart}`;
      return {
        engine: 'A11yPilot Semantic DOM Grounding',
        spokenResponse: summary,
        steps: [{ action: 'narrate', value: summary, explanation: summary }]
      };
    }

    const clauses = raw
      .split(/\s*(?:;|,\s+and\s+|\s+then\s+|,\s*(?=(?:click|press|tap|type|enter|fill|set|select|choose|check|toggle|scroll|go|open|switch|book|confirm|submit|add|place|request|enroll)\b)|\s+and\s+(?=(?:click|press|tap|type|enter|fill|set|select|choose|check|toggle|scroll|go|open|switch|book|confirm|submit|add|place|request|enroll)\b))\s*/i)
      .map(c => c.trim())
      .filter(Boolean);

    for (const clause of clauses) {
      const cLow = clause.toLowerCase();
      if (/^scroll\s+(down|up)/i.test(cLow)) {
        const dir = cLow.match(/^scroll\s+(down|up)/i)[1];
        steps.push({ action: 'scroll', direction: dir, value: dir, explanation: `Scroll ${dir}` });
        continue;
      }

      const badgeClick = clause.match(/^(?:click|press|tap|select|check|toggle)?\s*(?:#|badge\s*|element\s*|number\s*)?(\d+)$/i);
      if (badgeClick) {
        const el = elements.find(e => e.id === Number(badgeClick[1]));
        if (el) {
          steps.push({ action: 'click', elementId: el.id, explanation: `Click #${el.id} (${el.label})` });
          continue;
        }
      }

      let typeMatch = clause.match(/^(?:type|enter|write|input)\s+["']?(.+?)["']?\s+(?:in|into|for|on)\s+(?:the\s+)?(.+?)(?:\s+field|\s+box|\s+input)?$/i);
      let fieldPhrase = null;
      let textValue = null;
      if (typeMatch) {
        textValue = typeMatch[1].trim();
        fieldPhrase = typeMatch[2].trim();
      } else {
        const fillWith = clause.match(/^(?:fill(?:\s+in|\s+out)?|set|enter)\s+(?:the\s+)?(.+?)\s+(?:with|to|as)\s+["']?(.+?)["']?$/i);
        if (fillWith) {
          fieldPhrase = fillWith[1].trim();
          textValue = fillWith[2].trim();
        }
      }

      if (fieldPhrase && textValue !== null) {
        const inputEl = findBestElementClient(elements, fieldPhrase, e => e.tag === 'input' || e.tag === 'textarea' || e.tag === 'select');
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

      const cleanedTarget = clause.replace(/^(?:please\s+)?(?:click|press|tap|check|uncheck|toggle|hit|activate|switch\s+to|go\s+to|open)\s+(?:on\s+)?(?:the\s+)?/i, '').trim();
      const targetEl = findBestElementClient(elements, cleanedTarget) || findBestElementClient(elements, clause);
      if (targetEl) {
        steps.push({ action: 'click', elementId: targetEl.id, explanation: `Click #${targetEl.id} (${targetEl.label})` });
      }
    }

    if (steps.length === 0) {
      const anyEl = findBestElementClient(elements, raw);
      if (anyEl) {
        steps.push({ action: 'click', elementId: anyEl.id, explanation: `Click #${anyEl.id} (${anyEl.label})` });
      } else {
        return {
          engine: 'A11yPilot Semantic DOM Grounding',
          spokenResponse: `I couldn't match "${raw}" to a control on this page. Try a badge number like "Click #4" or a visible button/field name.`,
          steps: []
        };
      }
    }

    return {
      engine: 'A11yPilot Semantic DOM Grounding',
      spokenResponse: steps.map(s => s.explanation).join(', then ') + '.',
      steps
    };
  }

  async function planClientGemini(command, state, apiKey) {
    const elementLines = state.elements.map(e => {
      const optStr = e.options ? ` options=[${e.options.map(o => `"${o.text}"`).join(', ')}]` : '';
      return `#${e.id} [${e.tag}/${e.type}] label="${e.label}"${optStr}`;
    }).join('\n');

    const prompt = `You are A11yPilot, an accessibility browser agent.
Page: "${state.title}"
Interactive Elements (#1..#${state.elements.length}):
${elementLines}

User Command: "${command}"
Return JSON with:
{ "spokenResponse": "...", "steps": [{ "action": "click"|"type"|"select"|"scroll"|"narrate", "elementId": 1, "value": "...", "explanation": "..." }] }`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
        })
      }
    );
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    const parsed = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
    return {
      engine: 'Gemini 2.5 Flash + DOM',
      spokenResponse: parsed.spokenResponse || 'Executed requested steps.',
      steps: Array.isArray(parsed.steps) ? parsed.steps : []
    };
  }

  // ============================================================================
  // UI RENDERING
  // ============================================================================
  function renderPresetPrompts(url) {
    let presets = [];
    if (url.includes('/sites/grocery')) {
      presets = [
        {
          label: '🍎 Add Apples & Oat Milk to Cart',
          cmd: 'Click Add Organic Honeycrisp Apples to Cart, then click Add Barista Oat Milk to Cart'
        },
        {
          label: '📦 Fill Ramp Note & Place Order',
          cmd: 'Type Please use side ramp entrance in Driver Instructions, select Place on raised porch table, and click Place Grocery Order'
        },
        {
          label: '🔍 Search Soup',
          cmd: 'Type soup in Search grocery items, then click Search Items'
        }
      ];
    } else if (url.includes('/sites/civic')) {
      presets = [
        {
          label: '🚐 Book ADA Wheelchair Van',
          cmd: 'Type Jordan Rivera in Rider Pass Name, type 240 Oak Street in Pickup Location, type CareBridge Medical Center in Destination, and click Request Accessible Van'
        },
        {
          label: '⚡ Enroll Utility Medical Discount',
          cmd: 'Type UTIL-99201 in Utility Account Number, select Power Wheelchair Charging Station, and click Enroll in Medical Baseline Rate'
        }
      ];
    } else {
      presets = [
        {
          label: '🩺 Auto-Fill & Confirm Maya Lin Booking',
          cmd: 'Type Maya Lin in Patient Full Name, type maya@lin.org in Email Address, select Dr. Elena Chen, check Wheelchair Accessible Exam Room, and click Confirm Appointment Booking'
        },
        {
          label: '👩‍⚕️ Choose Dr. Amara Okafor & Telehealth',
          cmd: 'Click Select Dr. Amara Okafor, then select Telehealth Video Visit'
        },
        {
          label: '🔊 Summarize Page Controls',
          cmd: 'What is on this page?'
        }
      ];
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
      btn.classList.toggle('active', url.includes(sitePath));
    });
  }

  function renderSomOverlay(elements) {
    somOverlay.innerHTML = '';
    somOverlay.classList.toggle('badges-hidden', !badgesVisible);
    const dims = getViewportDimensions();

    for (const el of elements) {
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

      const tooltip = document.createElement('span');
      tooltip.className = 'som-tooltip';
      tooltip.textContent = `#${el.id} • ${el.label}`;

      box.appendChild(badge);
      box.appendChild(tooltip);

      box.addEventListener('click', (e) => {
        e.stopPropagation();
        if (el.category === 'input') {
          openQuickFieldModal(el);
        } else {
          executeDirectAction({ action: 'click', elementId: el.id }, el.rect, `Clicking #${el.id}`);
        }
      });

      somOverlay.appendChild(box);
    }
  }

  function renderAccessibleDeck(elements) {
    deckPanelControls.innerHTML = '';

    const inputs = elements.filter(e => e.category === 'input');
    const actions = elements.filter(e => e.category === 'action' || e.category === 'toggle');
    const links = elements.filter(e => e.category === 'navigation');

    if (inputs.length > 0) {
      const sec = document.createElement('div');
      const heading = document.createElement('div');
      heading.className = 'section-label';
      heading.textContent = `Form Fields & Inputs (${inputs.length})`;
      sec.appendChild(heading);

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
          <span class="control-name">${escapeHtml(el.label)}</span>
          <span class="control-role-tag">${escapeHtml(el.tag === 'select' ? 'dropdown' : el.type)}</span>
        `;
        card.appendChild(topRow);

        const fieldRow = document.createElement('div');
        fieldRow.className = 'inline-field-row';

        if (el.tag === 'select' && Array.isArray(el.options)) {
          const sel = document.createElement('select');
          sel.setAttribute('aria-label', `Select option for ${el.label}`);
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
          inp.type = 'text';
          inp.value = el.value || '';
          inp.placeholder = el.placeholder || `Type value for #${el.id}...`;
          inp.setAttribute('aria-label', `Type into ${el.label}`);

          const applyBtn = document.createElement('button');
          applyBtn.type = 'button';
          applyBtn.className = 'apply-btn';
          applyBtn.textContent = 'Type';

          const triggerType = () => {
            executeDirectAction(
              { action: 'type', elementId: el.id, value: inp.value },
              el.rect,
              `Typing in #${el.id}`
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

      sec.appendChild(list);
      deckPanelControls.appendChild(sec);
    }

    if (actions.length > 0) {
      const sec = document.createElement('div');
      const heading = document.createElement('div');
      heading.className = 'section-label';
      heading.textContent = `Buttons & Checkboxes (${actions.length})`;
      sec.appendChild(heading);

      const list = document.createElement('div');
      list.className = 'a11y-card-list';

      for (const el of actions) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'big-action-btn';
        const stateSuffix = el.type === 'checkbox' ? ` (${el.value === 'checked' ? '✓ Checked' : 'Unchecked'})` : '';
        btn.innerHTML = `
          <span style="display:flex;align-items:center;gap:9px;">
            <span class="badge-pill">#${el.id}</span>
            <span>${escapeHtml(el.label)}${escapeHtml(stateSuffix)}</span>
          </span>
          <span class="control-role-tag">Click →</span>
        `;
        btn.addEventListener('mouseenter', () => highlightElementOnViewport(el.id, true));
        btn.addEventListener('mouseleave', () => highlightElementOnViewport(el.id, false));
        btn.addEventListener('focus', () => highlightElementOnViewport(el.id, true));
        btn.addEventListener('blur', () => highlightElementOnViewport(el.id, false));
        btn.addEventListener('click', () => {
          executeDirectAction({ action: 'click', elementId: el.id }, el.rect, `Clicking #${el.id}`);
        });
        list.appendChild(btn);
      }

      sec.appendChild(list);
      deckPanelControls.appendChild(sec);
    }

    if (links.length > 0) {
      const sec = document.createElement('div');
      const heading = document.createElement('div');
      heading.className = 'section-label';
      heading.textContent = `Page Links (${links.length})`;
      sec.appendChild(heading);

      const list = document.createElement('div');
      list.className = 'a11y-card-list';

      for (const el of links) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'big-action-btn';
        btn.innerHTML = `
          <span style="display:flex;align-items:center;gap:9px;">
            <span class="badge-pill">#${el.id}</span>
            <span>${escapeHtml(el.label)}</span>
          </span>
          <span class="control-role-tag">Link ↗</span>
        `;
        btn.addEventListener('mouseenter', () => highlightElementOnViewport(el.id, true));
        btn.addEventListener('mouseleave', () => highlightElementOnViewport(el.id, false));
        btn.addEventListener('click', () => {
          executeDirectAction({ action: 'click', elementId: el.id }, el.rect, `Opening #${el.id}`);
        });
        list.appendChild(btn);
      }

      sec.appendChild(list);
      deckPanelControls.appendChild(sec);
    }
  }

  function renderStepHistory(history) {
    const items = Array.isArray(history) ? [...history].reverse() : [];
    traceCount.textContent = String(items.length);
    stepLogList.innerHTML = '';

    if (items.length === 0) {
      stepLogList.innerHTML = `<div style="color:var(--text-muted);font-size:13px;">No actions recorded yet. Run an agent command or click any badge to see the visual trace.</div>`;
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
    const prevUrl = currentState ? currentState.url : '';
    currentState = state;

    if (usePlaywrightBackend && state.screenshot) {
      screenshotImg.style.display = 'block';
      viewportIframe.style.display = 'none';
      screenshotImg.src = state.screenshot;
    }

    livePageTitle.textContent = state.title || state.url;
    urlInput.value = state.url;
    elementCountBadge.textContent = `${state.elements.length} interactive controls`;

    if (state.alerts && state.alerts.length > 0) {
      liveAlertText.textContent = state.alerts.join(' • ');
      liveAlertStrip.classList.add('visible');
    } else {
      liveAlertStrip.classList.remove('visible');
    }

    if (state.url !== prevUrl) {
      renderPresetPrompts(state.url);
    }

    renderSomOverlay(state.elements);
    renderAccessibleDeck(state.elements);
    renderStepHistory(state.history);
  }

  async function executeDirectAction(payload, rect = null, cursorText = '') {
    if (rect) {
      moveAgentCursorToRect(rect, cursorText || `${payload.action} #${payload.elementId || ''}`);
    }

    if (!usePlaywrightBackend) {
      const { record, state } = performClientSingleAction(payload);
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
    runAgentBtn.textContent = 'Acting...';
    setAgentAnnouncement(`Planning & executing: "${command}"...`, false);

    try {
      if (!usePlaywrightBackend) {
        const initialState = scanClientIframeDom();
        let plan = null;
        if (geminiApiKey) {
          try {
            plan = await planClientGemini(command, initialState, geminiApiKey);
          } catch (_) {
            plan = planClientGrounding(command, initialState);
          }
        } else {
          plan = planClientGrounding(command, initialState);
        }

        if (plan.engine) activeEngineBadge.textContent = plan.engine.slice(0, 32);

        for (const step of plan.steps) {
          if (step.action === 'narrate') continue;
          const { record } = performClientSingleAction(step);
          if (record.rect) {
            moveAgentCursorToRect(record.rect, `${step.action.toUpperCase()} #${record.elementId || ''}`, 900);
            await new Promise(r => setTimeout(r, 380));
          }
        }

        const finalState = scanClientIframeDom();
        let spoken = plan.spokenResponse;
        if (finalState.alerts && finalState.alerts.length > 0) {
          spoken += ` Page alert: ${finalState.alerts.join(' ')}`;
        }
        setAgentAnnouncement(spoken);
        return;
      }

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, apiKey: geminiApiKey })
      });
      const data = await res.json();
      if (data.engine) activeEngineBadge.textContent = data.engine.slice(0, 32);

      if (Array.isArray(data.executedSteps)) {
        for (const step of data.executedSteps) {
          if (step.rect) {
            moveAgentCursorToRect(step.rect, `${step.action.toUpperCase()} #${step.elementId || ''}`, 900);
            await new Promise(r => setTimeout(r, 340));
          }
        }
      }
      if (data.state) applyBrowserState(data.state);
      setAgentAnnouncement(data.spokenResponse || 'Completed requested browser actions.');
    } catch (err) {
      setAgentAnnouncement(`Agent error: ${err.message}`);
    } finally {
      runAgentBtn.disabled = false;
      runAgentBtn.textContent = 'Run Agent';
    }
  }

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
      `${el.tag === 'select' ? 'Selecting' : 'Typing'} #${el.id}`
    );
  }

  quickFieldCancel.addEventListener('click', () => {
    quickFieldModal.classList.remove('open');
    activeQuickElement = null;
  });
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
      if (!usePlaywrightBackend) {
        loadClientPortal(site);
      } else {
        executeDirectAction({ action: 'navigate', value: site });
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
  toggleTtsBtn.addEventListener('click', () => {
    ttsEnabled = !ttsEnabled;
    toggleTtsBtn.classList.toggle('active', ttsEnabled);
    toggleTtsBtn.setAttribute('aria-pressed', String(ttsEnabled));
    toggleTtsBtn.textContent = `🔊 Voice Readout: ${ttsEnabled ? 'ON' : 'OFF'}`;
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
    if (!usePlaywrightBackend) setTimeout(scanClientIframeDom, 60);
  });

  openGeminiModalBtn.addEventListener('click', () => {
    geminiKeyInput.value = geminiApiKey;
    geminiModal.classList.add('open');
    geminiKeyInput.focus();
  });
  geminiModalClose.addEventListener('click', () => geminiModal.classList.remove('open'));
  geminiModalSave.addEventListener('click', () => {
    geminiApiKey = geminiKeyInput.value.trim();
    localStorage.setItem('a11y_gemini_key', geminiApiKey);
    updateEngineBadge();
    geminiModal.classList.remove('open');
    setAgentAnnouncement(
      geminiApiKey
        ? 'Gemini 2.5 Flash API key saved!'
        : 'Cleared API key. Using built-in Semantic DOM Grounding engine.'
    );
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

  tabDeckBtn.addEventListener('click', () => {
    tabDeckBtn.classList.add('active');
    tabHistoryBtn.classList.remove('active');
    deckPanelControls.style.display = 'flex';
    deckPanelHistory.style.display = 'none';
  });

  tabHistoryBtn.addEventListener('click', () => {
    tabHistoryBtn.classList.add('active');
    tabDeckBtn.classList.remove('active');
    deckPanelHistory.style.display = 'flex';
    deckPanelControls.style.display = 'none';
  });

  window.addEventListener('resize', () => {
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

  // Initialize: start immediately in fast 60fps Client-Side Live DOM mode so it works on GitHub Pages and anywhere
  loadClientPortal('/sites/clinic');
})();
