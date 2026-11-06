// Built-in realistic websites for Playwright Chromium to browse and interact with out-of-the-box

function getClinicPageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CareBridge Health — Patient Appointment Portal</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #f4f7f9; color: #102a43; line-height: 1.5; }
    header { background: #0b4f6c; color: #ffffff; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; }
    .brand { display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .brand-badge { background: #20bf55; color: #062b16; font-size: 12px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
    nav { display: flex; gap: 14px; }
    nav a { color: #d9e2ec; text-decoration: none; padding: 8px 14px; border-radius: 6px; font-size: 14px; font-weight: 600; transition: background 0.15s; }
    nav a:hover, nav a.active { background: rgba(255,255,255,0.16); color: #fff; }
    .container { max-width: 1180px; margin: 24px auto; padding: 0 24px; display: grid; grid-template-columns: 1.15fr 1fr; gap: 24px; }
    .card { background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #d9e2ec; box-shadow: 0 4px 12px rgba(16,42,67,0.05); }
    h1 { font-size: 22px; margin-bottom: 6px; color: #0b4f6c; }
    .subtitle { font-size: 14px; color: #486581; margin-bottom: 18px; }
    .search-row { display: flex; gap: 10px; margin-bottom: 16px; }
    .search-row input { flex: 1; padding: 10px 14px; border: 1.5px solid #bcccdc; border-radius: 8px; font-size: 14px; }
    .search-row button { padding: 10px 16px; background: #0b4f6c; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .doctor-list { display: flex; flex-direction: column; gap: 12px; }
    .doc-card { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border: 1.5px solid #e1e8ef; border-radius: 10px; background: #fafcfe; transition: all 0.15s; }
    .doc-card.selected { border-color: #0b4f6c; background: #eef6fa; }
    .doc-info h3 { font-size: 16px; color: #102a43; }
    .doc-info p { font-size: 13px; color: #486581; }
    .doc-tag { display: inline-block; margin-top: 4px; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #d8f3dc; color: #1b4332; }
    .select-doc-btn { padding: 8px 14px; border-radius: 8px; border: 1.5px solid #0b4f6c; background: #fff; color: #0b4f6c; font-weight: 700; cursor: pointer; font-size: 13px; }
    .doc-card.selected .select-doc-btn { background: #0b4f6c; color: #fff; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 13px; font-weight: 700; color: #243b53; margin-bottom: 5px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; border: 1.5px solid #bcccdc; border-radius: 8px; font-size: 14px; color: #102a43; background: #fff; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .checkbox-row { display: flex; gap: 16px; align-items: center; margin: 12px 0; font-size: 13px; font-weight: 600; color: #334e68; }
    .checkbox-row label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .checkbox-row input { width: 16px; height: 16px; }
    .submit-btn { width: 100%; padding: 13px; background: #147d64; color: #ffffff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 6px; }
    .submit-btn:hover { background: #0f604d; }
    .banner-success { display: none; margin-top: 14px; padding: 14px 16px; border-radius: 10px; background: #d3f9d8; border: 2px solid #2b8a3e; color: #1b4332; font-weight: 600; font-size: 14px; }
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
      <a href="/sites/clinic" class="active" aria-label="Clinic Appointments Page">Clinic Booking</a>
      <a href="/sites/grocery" aria-label="Switch to FreshMarket Grocery Store">FreshMarket Grocery</a>
      <a href="/sites/civic" aria-label="Switch to City Paratransit & Utilities">Civic Paratransit</a>
    </nav>
  </header>

  <main class="container">
    <section class="card" aria-labelledby="dir-heading">
      <h1 id="dir-heading">Available Specialists</h1>
      <p class="subtitle">Select a specialist below or use the booking form on the right.</p>

      <div class="search-row">
        <input type="text" id="doctor-search" aria-label="Search doctor by name or specialty" placeholder="Search doctor or specialty (e.g. Cardiology, Neurology)..." />
        <button type="button" id="filter-btn" onclick="filterDoctors()">Filter List</button>
      </div>

      <div class="doctor-list" id="doctor-list">
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
            <p>Accessible Primary Care & Telehealth • Telemedicine / Ground Floor</p>
            <span class="doc-tag">Next Available: Friday 9:15 AM</span>
          </div>
          <button type="button" class="select-doc-btn" aria-label="Select Dr. Amara Okafor" onclick="chooseDoctor('Dr. Amara Okafor (Primary Care)', 'doc-card-okafor')">Choose Doctor</button>
        </div>
      </div>
    </section>

    <section class="card" aria-labelledby="book-heading">
      <h1 id="book-heading">Schedule Appointment</h1>
      <p class="subtitle">Complete patient details to confirm your medical visit.</p>

      <form id="booking-form" onsubmit="submitBooking(event)">
        <div class="form-group">
          <label for="patient-name">Patient Full Name</label>
          <input type="text" id="patient-name" name="patientName" placeholder="e.g. Maya Lin" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="patient-email">Email Address</label>
            <input type="email" id="patient-email" name="patientEmail" placeholder="maya@example.com" required />
          </div>
          <div class="form-group">
            <label for="patient-phone">Phone Number</label>
            <input type="tel" id="patient-phone" name="patientPhone" placeholder="555-0192" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="specialty-select">Selected Specialist</label>
            <select id="specialty-select" name="specialist">
              <option value="Dr. Arjun Patel (Cardiology)">Dr. Arjun Patel (Cardiology)</option>
              <option value="Dr. Elena Chen (Neurology)">Dr. Elena Chen (Neurology)</option>
              <option value="Dr. Amara Okafor (Primary Care)">Dr. Amara Okafor (Primary Care)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="time-slot">Preferred Time Slot</label>
            <select id="time-slot" name="timeSlot">
              <option value="Morning (9:00 AM - 11:30 AM)">Morning (9:00 AM - 11:30 AM)</option>
              <option value="Afternoon (1:30 PM - 4:00 PM)">Afternoon (1:30 PM - 4:00 PM)</option>
              <option value="Telehealth Video Visit">Telehealth Video Visit</option>
            </select>
          </div>
        </div>

        <div class="checkbox-row">
          <label for="wheelchair-access">
            <input type="checkbox" id="wheelchair-access" name="wheelchair" />
            Wheelchair Accessible Exam Room
          </label>
          <label for="asl-interpreter">
            <input type="checkbox" id="asl-interpreter" name="asl" />
            ASL Interpreter Requested
          </label>
        </div>

        <div class="form-group">
          <label for="visit-reason">Reason for Visit / Notes</label>
          <input type="text" id="visit-reason" name="reason" placeholder="e.g. Annual checkup or prescription refill" />
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
</html>`;
}

function getGroceryPageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>FreshMarket — Accessible Home Grocery Delivery</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #f8f9fa; color: #1f2933; }
    header { background: #1b4332; color: #ffffff; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
    nav { display: flex; gap: 14px; }
    nav a { color: #d8f3dc; text-decoration: none; padding: 8px 14px; border-radius: 6px; font-size: 14px; font-weight: 600; }
    nav a.active, nav a:hover { background: rgba(255,255,255,0.18); color: #fff; }
    .layout { max-width: 1180px; margin: 22px auto; padding: 0 24px; display: grid; grid-template-columns: 1.35fr 0.85fr; gap: 24px; }
    .panel { background: #fff; border-radius: 12px; padding: 22px; border: 1px solid #e4e7eb; }
    .search-bar { display: flex; gap: 10px; margin-bottom: 18px; }
    .search-bar input { flex: 1; padding: 10px 14px; border: 1.5px solid #cbd2d9; border-radius: 8px; font-size: 14px; }
    .search-bar button { padding: 10px 18px; background: #2d6a4f; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .products { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .prod-card { border: 1.5px solid #e4e7eb; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
    .prod-title { font-size: 15px; font-weight: 700; color: #102a43; }
    .prod-meta { font-size: 13px; color: #52606d; }
    .prod-price { font-size: 16px; font-weight: 800; color: #1b4332; }
    .add-btn { padding: 9px 12px; background: #2d6a4f; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px; }
    .add-btn:hover { background: #1b4332; }
    .cart-items { list-style: none; margin: 12px 0 16px; border-top: 1px solid #e4e7eb; }
    .cart-items li { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #f1f5f8; font-size: 14px; font-weight: 600; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 4px; color: #323f4b; }
    .form-group input, .form-group select { width: 100%; padding: 9px 12px; border: 1.5px solid #cbd2d9; border-radius: 8px; font-size: 14px; }
    .checkout-btn { width: 100%; padding: 13px; background: #d97706; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 800; cursor: pointer; }
    .order-msg { display: none; margin-top: 12px; padding: 12px; background: #d8f3dc; border: 2px solid #2d6a4f; border-radius: 8px; font-weight: 700; color: #1b4332; font-size: 14px; }
    .order-msg.visible { display: block; }
  </style>
</head>
<body>
  <header>
    <div class="brand">FreshMarket Accessible Grocery</div>
    <nav>
      <a href="/sites/clinic" aria-label="Switch to CareBridge Clinic">Clinic Booking</a>
      <a href="/sites/grocery" class="active" aria-label="FreshMarket Grocery Store">FreshMarket Grocery</a>
      <a href="/sites/civic" aria-label="Switch to Civic Paratransit">Civic Paratransit</a>
    </nav>
  </header>

  <main class="layout">
    <section class="panel">
      <h1 style="font-size:20px;margin-bottom:12px;">Same-Day Doorstep Essentials</h1>
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
      <h2 style="font-size:19px;margin-bottom:6px;">Delivery Cart (<span id="cart-count">1</span>)</h2>
      <ul class="cart-items" id="cart-list">
        <li><span>Whole Grain Crackers</span><span>$3.50</span></li>
      </ul>
      <div style="font-size:16px;font-weight:800;margin-bottom:14px;">Total: $<span id="cart-total">3.50</span></div>

      <div class="form-group">
        <label for="delivery-address">Delivery Street Address</label>
        <input type="text" id="delivery-address" placeholder="e.g. 742 Evergreen Terrace, Apt 1B" value="742 Evergreen Terrace, Apt 1B" />
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
</html>`;
}

function getCivicPageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CivicAccess — Paratransit & Municipal Services</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #f1f5f9; color: #0f172a; }
    header { background: #1e293b; color: #ffffff; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 20px; font-weight: 800; }
    nav { display: flex; gap: 14px; }
    nav a { color: #cbd5e1; text-decoration: none; padding: 8px 14px; border-radius: 6px; font-size: 14px; font-weight: 600; }
    nav a.active, nav a:hover { background: rgba(255,255,255,0.16); color: #fff; }
    .main { max-width: 1100px; margin: 24px auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #cbd5e1; }
    h1 { font-size: 20px; margin-bottom: 8px; color: #0f172a; }
    p.sub { font-size: 13px; color: #475569; margin-bottom: 16px; }
    .field { margin-bottom: 14px; }
    .field label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 5px; }
    .field input, .field select { width: 100%; padding: 10px 12px; border: 1.5px solid #94a3b8; border-radius: 8px; font-size: 14px; }
    .btn-primary { width: 100%; padding: 12px; background: #0284c7; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; }
    .status-box { display: none; margin-top: 14px; padding: 12px; background: #e0f2fe; border: 2px solid #0284c7; border-radius: 8px; font-weight: 700; color: #075985; font-size: 14px; }
    .status-box.visible { display: block; }
  </style>
</head>
<body>
  <header>
    <div class="brand">CivicAccess Paratransit & City Portal</div>
    <nav>
      <a href="/sites/clinic" aria-label="Switch to CareBridge Clinic">Clinic Booking</a>
      <a href="/sites/grocery" aria-label="Switch to FreshMarket Grocery">FreshMarket Grocery</a>
      <a href="/sites/civic" class="active" aria-label="Civic Paratransit Page">Civic Paratransit</a>
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
</html>`;
}

module.exports = {
  getClinicPageHtml,
  getGroceryPageHtml,
  getCivicPageHtml
};
