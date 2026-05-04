import { Router } from "express";

const adminDemoHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Buy Home For Less Admin Demo</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    html, body { height: 100%; overflow: hidden; }
    body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; background: #f4f7fb; color: #132137; }
    .shell { display: flex; height: 100vh; min-height: 0; overflow: hidden; }
    .sidebar { width: 260px; flex: 0 0 260px; background: #0b1f3a; color: #fff; padding: 18px 12px; display: none; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
    .brand { font-weight: 700; margin: 0 10px 16px; }
    .menu { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
    .menu button { width: 100%; border: 0; text-align: left; padding: 10px; border-radius: 8px; background: transparent; color: #d2def5; cursor: pointer; }
    .menu button.active, .menu button:hover { background: #17406f; color: #fff; }
    .main { flex: 1; min-width: 0; height: 100vh; overflow-y: auto; padding: 20px; scroll-behavior: smooth; }
    .card { background: #fff; border-radius: 8px; padding: 14px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(19,33,55,0.08); }
    .hidden { display: none !important; }
    .grid { display: grid; gap: 10px; }
    .grid.two { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; }
    .small { color: #4d5f78; font-size: 12px; }
    .mono { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; white-space: pre-wrap; }
    .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: end; }
    .top { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
    label { display: grid; gap: 4px; font-size: 13px; }
    input, select, textarea, button { border-radius: 8px; border: 1px solid #bcc8d8; padding: 8px; font: inherit; width: 100%; }
    textarea { resize: vertical; }
    button { cursor: pointer; }
    .row button, .actions button, .menu button, #logoutBtn, #mapLookupBtn { width: auto; }
    button.primary { background: #17406f; color: #fff; border-color: #17406f; }
    button.warn { background: #8a5a00; color: #fff; border-color: #8a5a00; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border-bottom: 1px solid #e3e9f2; text-align: left; padding: 7px; vertical-align: top; }
    .sectionTitle { margin-top: 8px; margin-bottom: 2px; }
    .formSection { border: 1px solid #d8e1ee; border-radius: 8px; padding: 12px; background: #fbfdff; margin: 10px 0; }
    .formSection h4 { margin: 0 0 10px; }
    .spanAll { grid-column: 1 / -1; }
    .jumpBar, .actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0; }
    .jumpBar a { color: #17406f; border: 1px solid #bcc8d8; border-radius: 8px; padding: 6px 8px; text-decoration: none; background: #fff; font-size: 12px; }
    .notice { border: 1px solid #f4c56a; background: #fff7df; color: #6f4b00; font-weight: 700; }
    @media (max-width: 760px) {
      html, body { overflow: auto; }
      .shell { display: block; height: auto; overflow: visible; }
      .sidebar { width: 100%; height: auto; position: static; }
      .main { height: auto; overflow: visible; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <aside class="sidebar" id="sidebar">
      <div class="brand">Admin Demo v3 - Full Workflow Visible</div>
      <ul class="menu" id="menu"></ul>
    </aside>
    <main class="main">
      <div class="card" style="padding:10px 14px"><strong>Admin Demo v3 - Full Workflow Visible</strong></div>
      <section id="authFlow">
        <div class="card hidden" id="registerCard">
          <h2 style="margin-top:0">Step 1: Register First Head Admin</h2>
          <form id="registerForm" class="grid two">
            <label>Full name<input name="fullName" required maxlength="80" /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" required minlength="8" /></label>
            <div><button class="primary" type="submit">Register Head Admin</button></div>
          </form>
        </div>
        <div class="card" id="loginCard">
          <h2 style="margin-top:0">Step 2: Login</h2>
          <form id="loginForm" class="grid two">
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" required /></label>
            <div><button class="primary" type="submit">Login</button></div>
          </form>
          <div class="row" style="margin-top:10px"><button id="demoModeBtn" type="button">Open Full Workflow Demo</button></div>
        </div>
      </section>
      <section id="adminApp" class="hidden">
        <div id="demoNotice" class="card notice hidden">Demo Mode: MySQL is offline, showing mock admin UI only</div>
        <div class="top">
          <div>
            <h2 style="margin:0">Main Admin Dashboard</h2>
            <div class="small" id="currentUser"></div>
          </div>
          <button id="logoutBtn">Logout</button>
        </div>
        <div id="view-dashboard" class="view card"></div>
        <div id="view-listings" class="view card hidden"></div>
        <div id="view-add-listing" class="view card hidden"></div>
        <div id="view-seller" class="view card hidden"></div>
        <div id="view-users" class="view card hidden"></div>
        <div id="view-employees" class="view card hidden"></div>
        <div id="view-account" class="view card hidden"></div>
        <div id="view-media" class="view card hidden"></div>
        <div id="view-faq" class="view card hidden"></div>
      </section>
      <div class="card"><div id="msg" class="mono"></div></div>
    </main>
  </div>
<script>
(function(){
  const state = {
    token: localStorage.getItem("admin_demo_token") || "",
    user: null,
    active: "dashboard",
    headAdminExists: true,
    latestCreatedListingId: null,
    demoMode: false,
    mockListings: []
  };
  const sections = [
    ["dashboard", "Dashboard Overview"],
    ["listings", "Listings"],
    ["add-listing", "Add Listing"],
    ["seller", "Seller Applications"],
    ["users", "Registered Users"],
    ["employees", "Employee Accounts"],
    ["account", "Account Settings"],
    ["media", "Media / Images"],
    ["faq", "FAQ Manager"],
    ["logout", "Logout"]
  ];
  const el = {
    authFlow: document.getElementById("authFlow"),
    registerCard: document.getElementById("registerCard"),
    loginCard: document.getElementById("loginCard"),
    adminApp: document.getElementById("adminApp"),
    sidebar: document.getElementById("sidebar"),
    menu: document.getElementById("menu"),
    msg: document.getElementById("msg"),
    currentUser: document.getElementById("currentUser")
  };
  function setMsg(text) { el.msg.textContent = text; }
  function enableDemoMode(message) {
    state.demoMode = true;
    const notice = document.getElementById("demoNotice");
    if (notice) notice.classList.remove("hidden");
    if (message) setMsg(message);
  }
  function authHeaders(base) {
    const h = Object.assign({}, base || {});
    if (state.token) h.Authorization = "Bearer " + state.token;
    return h;
  }
  async function api(path, options) {
    if (state.demoMode && path.indexOf("/api/auth/") !== 0) return mockApi(path, options || {});
    const res = await fetch(path, options || {});
    const data = await res.json().catch(function(){ return {}; });
    if (!res.ok) throw new Error(data.error || ("HTTP " + res.status));
    return data;
  }
  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function(_resolve, reject){ window.setTimeout(function(){ reject(new Error("Request timed out")); }, ms); })
    ]);
  }
  function sampleListing() {
    return {
      id: 1, title: "Demo Rent Listing", section: "RENT", category: "FEATURED", status: "DRAFT",
      price_amount: 35000, currency_code: "THB", buy_price: null, rent_monthly_price: 35000,
      deposit_amount: 70000, price_unit_label: "per month", city: "Bangkok", province: "Bangkok",
      updated_at: "demo", created_at: "demo", street_address: "Demo address", district: "Watthana",
      subdistrict: "Khlong Toei Nuea", postal_code: "10110", country: "Thailand", latitude: 13.7367,
      longitude: 100.5231, map_search_label: "Bangkok, Thailand", description: "Demo listing",
      highlights: '["Rent ready","Deposit saved from backend field"]',
      amenities: '["Pool","Gym"]', features: '["Furnished","Air conditioner","Kitchen"]',
      property_details: '["Near BTS","Pet friendly"]'
    };
  }
  function ensureMockListings() {
    if (!state.mockListings.length) state.mockListings.push(sampleListing());
  }
  function mockApi(path, options) {
    ensureMockListings();
    const method = (options.method || "GET").toUpperCase();
    if (path === "/api/admin/dashboard/overview") return Promise.resolve({
      totalListings: state.mockListings.length, publishedListings: 0, draftListings: state.mockListings.length,
      archivedListings: 0, deletedListings: 0, totalRegisteredUsers: 2, totalSellerApplications: 1,
      totalEmployeeAccounts: 1, recentListings: state.mockListings, recentSellerApplications: [{ id: 1, full_name: "Demo Seller", property_type: "Condo", location: "Bangkok", status: "NEW", created_at: "demo" }]
    });
    if (path === "/api/admin/listings" && method === "GET") return Promise.resolve({ total: state.mockListings.length, items: state.mockListings });
    if (path === "/api/admin/listings" && method === "POST") {
      const body = JSON.parse(options.body || "{}");
      const id = state.mockListings.length + 1;
      state.mockListings.unshift({
        id, title: body.title || "Demo Listing", section: body.section, category: body.category, status: body.status,
        price_amount: body.priceAmount, currency_code: body.currencyCode, buy_price: body.buyPrice,
        rent_monthly_price: body.rentMonthlyPrice, deposit_amount: body.depositAmount,
        price_unit_label: body.priceUnitLabel, city: body.city, province: body.province,
        updated_at: "demo", created_at: "demo", street_address: body.streetAddress, district: body.district,
        subdistrict: body.subdistrict, postal_code: body.postalCode, country: body.country,
        latitude: body.latitude, longitude: body.longitude, map_search_label: body.mapSearchLabel,
        description: body.description, highlights: JSON.stringify(body.highlights || []),
        amenities: JSON.stringify(body.amenities || []), features: JSON.stringify(body.features || []),
        property_details: JSON.stringify(body.propertyDetails || [])
      });
      return Promise.resolve({ id: id });
    }
    const listingMatch = path.match(/^\\/api\\/admin\\/listings\\/(\\d+)$/);
    if (listingMatch && method === "GET") {
      const listing = state.mockListings.find(function(item){ return item.id === Number(listingMatch[1]); }) || sampleListing();
      return Promise.resolve({ listing: listing, images: [{ id: 1, original_name: "demo.jpg", card_url: "/uploads/demo.jpg", sort_order: 0, is_cover: 1 }], faqs: [{ id: 1, question: "Is deposit editable?", answer: "Yes, it is stored as depositAmount.", sort_order: 0, is_active: 1 }] });
    }
    if (listingMatch && method === "PATCH") return Promise.resolve({ ok: true });
    if (path.indexOf("/images") > -1) return Promise.resolve({ ok: true, total: 0, items: [] });
    if (path.indexOf("/faqs") > -1) return Promise.resolve({ ok: true, total: 1, items: [{ question: "Demo question?", answer: "Demo answer." }] });
    if (path === "/api/admin/seller-applications") return Promise.resolve({ items: [{ id: 1, full_name: "Demo Seller", phone: "000", email: "seller@example.com", property_type: "Condo", location: "Bangkok", message: "Sell my home", created_at: "demo", status: "NEW" }] });
    if (path === "/api/admin/registered-users") return Promise.resolve({ items: [{ id: 1, full_name: "Demo User", email: "user@example.com", role: "USER", status: "ACTIVE", created_at: "demo" }] });
    if (path === "/api/admin/employees") return Promise.resolve({ items: [{ id: 2, full_name: "Demo Employee", email: "employee@example.com", role: "EMPLOYEE", status: "ACTIVE", created_at: "demo" }] });
    if (path.indexOf("/api/map/geocode") === 0) return Promise.resolve({ items: [{ label: "Bangkok, Thailand", latitude: 13.7367, longitude: 100.5231, city: "Bangkok", province: "Bangkok", district: "Pathum Wan", postalCode: "10330", country: "Thailand" }] });
    return Promise.resolve({ ok: true, items: [] });
  }
  async function secureApi(path, options) {
    const opts = Object.assign({}, options || {});
    opts.headers = authHeaders(opts.headers || {});
    try {
      return await withTimeout(api(path, opts), 1000);
    } catch (error) {
      if (path.indexOf("/api/admin/") === 0 || path.indexOf("/api/map/") === 0) {
        enableDemoMode("Demo Mode: MySQL is offline, showing mock admin UI only");
        return mockApi(path, opts);
      }
      throw error;
    }
  }
  async function jsonApi(path, method, payload, secure) {
    const opts = {
      method: method,
      headers: secure ? authHeaders({ "Content-Type": "application/json" }) : { "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload)
    };
    try {
      return await withTimeout(api(path, opts), 1000);
    } catch (error) {
      if (path.indexOf("/api/admin/") === 0 || path.indexOf("/api/map/") === 0) {
        enableDemoMode("Demo Mode: MySQL is offline, showing mock admin UI only");
        return mockApi(path, opts);
      }
      throw error;
    }
  }
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function table(headers, rows) {
    const head = "<tr>" + headers.map(function(h){ return "<th>" + esc(h) + "</th>"; }).join("") + "</tr>";
    const body = rows.map(function(r){
      return "<tr>" + r.map(function(c){ return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>";
    }).join("");
    return "<table><thead>" + head + "</thead><tbody>" + body + "</tbody></table>";
  }
  function toInt(v){ return v === "" ? null : Number.parseInt(v, 10); }
  function toFloat(v){ return v === "" ? null : Number(v); }
  function toBool(v){ if (!v) return null; return v === "true"; }
  function textOrNull(v){ const t = String(v || "").trim(); return t ? t : null; }
  function lines(v){ return String(v || "").split(/\\r?\\n/).map(function(x){ return x.trim(); }).filter(Boolean); }
  function faqLines(v){ return lines(v).map(function(line){ const i = line.indexOf("|"); if (i < 0) return null; const q = line.slice(0, i).trim(); const a = line.slice(i+1).trim(); return q && a ? {question:q,answer:a} : null; }).filter(Boolean); }
  function showAuthStep(step) {
    el.registerCard.classList.add("hidden");
    el.loginCard.classList.add("hidden");
    if (step === "register") el.registerCard.classList.remove("hidden");
    else el.loginCard.classList.remove("hidden");
  }
  function logout() {
    state.token = "";
    state.user = null;
    localStorage.removeItem("admin_demo_token");
    el.authFlow.classList.remove("hidden");
    el.adminApp.classList.add("hidden");
    el.sidebar.style.display = "none";
    showAuthStep(state.headAdminExists ? "login" : "register");
    setMsg("Logged out.");
  }
  function makeMenu() {
    el.menu.innerHTML = "";
    sections.forEach(function(item){
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.textContent = item[1];
      b.dataset.key = item[0];
      b.onclick = function(){
        if (item[0] === "logout") return logout();
        state.active = item[0];
        renderViews();
      };
      if (state.active === item[0]) b.classList.add("active");
      li.appendChild(b);
      el.menu.appendChild(li);
    });
  }
  function showView(id) {
    document.querySelectorAll(".view").forEach(function(n){ n.classList.add("hidden"); });
    const target = document.getElementById("view-" + id);
    if (target) target.classList.remove("hidden");
    document.querySelectorAll(".menu button").forEach(function(b){ b.classList.toggle("active", b.dataset.key === id); });
  }
  async function completeLogin(data){
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem("admin_demo_token", state.token);
    el.currentUser.textContent = data.user.fullName + " (" + data.user.role + ") - " + data.user.email;
    el.authFlow.classList.add("hidden");
    el.adminApp.classList.remove("hidden");
    el.sidebar.style.display = "block";
    state.active = "dashboard";
    makeMenu();
    await renderViews();
    setMsg("Logged in. Sidebar modules ready.");
  }
  async function openDemoMode(){
    enableDemoMode("Demo Mode: MySQL is offline, showing mock admin UI only");
    await completeLogin({
      token: "demo-preview-token",
      user: { id: 0, fullName: "Demo Head Admin", email: "demo@buyhomeforless.local", role: "HEAD_ADMIN" }
    });
  }
  async function loadDashboard(){
    const d = await secureApi("/api/admin/dashboard/overview");
    const stat = function(label, value){ return "<div class='card'><div class='small'>" + esc(label) + "</div><div style='font-size:24px;font-weight:700'>" + esc(value) + "</div></div>"; };
    document.getElementById("view-dashboard").innerHTML =
      "<h3 style='margin-top:0'>Dashboard Overview</h3>" +
      "<div class='stats'>" +
      stat("Total listings", d.totalListings) +
      stat("Published listings", d.publishedListings) +
      stat("Draft listings", d.draftListings) +
      stat("Archived listings", d.archivedListings) +
      stat("Deleted listings", d.deletedListings) +
      stat("Total registered users", d.totalRegisteredUsers) +
      stat("Total seller applications", d.totalSellerApplications) +
      stat("Total employee accounts", d.totalEmployeeAccounts) +
      "</div>" +
      "<h4 class='sectionTitle'>Recent listings</h4>" +
      table(["ID","Title","Section","Category","Status","Created"], (d.recentListings || []).map(function(r){ return [r.id,r.title,r.section,r.category,r.status,r.created_at]; })) +
      "<h4 class='sectionTitle'>Recent seller applications</h4>" +
      table(["ID","Name","Type","Location","Status","Created"], (d.recentSellerApplications || []).map(function(r){ return [r.id,r.full_name,r.property_type || "",r.location,r.status,r.created_at]; }));
  }
  async function loadListings(){
    const d = await secureApi("/api/admin/listings");
    document.getElementById("view-listings").innerHTML =
      "<h3 style='margin-top:0'>Listings</h3>" +
      table(["ID","Title","Section","Category","Status","Price","Rent","Deposit","City","Province","Updated"], (d.items || []).map(function(r){ return [r.id,r.title,r.section,r.category,r.status,(r.price_amount || "") + " " + (r.currency_code || ""),r.rent_monthly_price || "",r.deposit_amount || "",r.city || "",r.province || "",r.updated_at]; })) +
      "<div class='row' style='margin-top:10px'><label>Edit Listing ID<input id='editListingId' type='number' min='1' value='" + esc((d.items && d.items[0] && d.items[0].id) || state.latestCreatedListingId || "") + "' /></label><button class='primary' id='editListingBtn'>Open Edit Listing Form</button></div>";
    document.getElementById("editListingBtn").onclick = async function(){
      const id = document.getElementById("editListingId").value;
      if (!id) { setMsg("Listing ID required."); return; }
      state.active = "add-listing";
      makeMenu();
      await loadAddListing(id);
      showView("add-listing");
    };
  }
  function jsonListToText(value) {
    if (!value) return "";
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed.join("\\n") : "";
    } catch (_error) {
      return "";
    }
  }
  function fillFormFromListing(form, detail) {
    const listing = detail && detail.listing ? detail.listing : null;
    if (!listing) return;
    form.title.value = listing.title || "";
    form.propertyType.value = listing.property_type || listing.propertyType || "";
    form.section.value = listing.section || "RENT";
    form.category.value = listing.category || "FEATURED";
    form.status.value = listing.status || "DRAFT";
    form.currencyCode.value = listing.currency_code || listing.currencyCode || "THB";
    form.priceAmount.value = listing.price_amount || listing.priceAmount || "";
    form.buyPrice.value = listing.buy_price || listing.buyPrice || "";
    form.rentMonthlyPrice.value = listing.rent_monthly_price || listing.rentMonthlyPrice || "";
    form.depositAmount.value = listing.deposit_amount || listing.depositAmount || "";
    form.priceUnitLabel.value = listing.price_unit_label || listing.priceUnitLabel || "";
    form.streetAddress.value = listing.street_address || listing.streetAddress || "";
    form.district.value = listing.district || "";
    form.subdistrict.value = listing.subdistrict || "";
    form.city.value = listing.city || "";
    form.province.value = listing.province || "";
    form.postalCode.value = listing.postal_code || listing.postalCode || "";
    form.country.value = listing.country || "Thailand";
    form.latitude.value = listing.latitude || "";
    form.longitude.value = listing.longitude || "";
    form.mapSearchLabel.value = listing.map_search_label || listing.mapSearchLabel || "";
    form.description.value = listing.description || "";
    form.highlights.value = jsonListToText(listing.highlights);
    form.amenities.value = jsonListToText(listing.amenities);
    form.features.value = jsonListToText(listing.features);
    form.propertyDetails.value = jsonListToText(listing.property_details || listing.propertyDetails);
    form.faqs.value = (detail.faqs || []).map(function(i){ return i.question + "|" + i.answer; }).join("\\n");
  }
  async function loadAddListing(editId){
    const box = document.getElementById("view-add-listing");
    const editing = !!editId;
    box.innerHTML =
      "<h3 style='margin-top:0'>" + (editing ? "Edit Listing #" + esc(editId) : "Add Listing") + "</h3>" +
      "<div class='small'>Full workflow form with backend rent deposit field and media controls.</div>" +
      "<div class='jumpBar'><a href='#basicInfo'>Basic Info</a><a href='#pricing'>Pricing</a><a href='#rentPricing'>Rent Pricing</a><a href='#details'>Details</a><a href='#features'>Features</a><a href='#amenities'>Amenities</a><a href='#faqSection'>FAQ</a><a href='#images'>Images</a><a href='#location'>Location</a><a href='#publish'>Publish Settings</a></div>" +
      "<form id='listingForm' style='margin-top:8px'>" +
      "<section class='formSection' id='basicInfo'><h4>Basic Info</h4><div class='grid two'><label>Property title<input name='title' required maxlength='180' /></label><label>Property type<input name='propertyType' maxlength='120' /></label><label>Section<select name='section'><option>BUY</option><option>RENT</option><option>SELL</option><option>SENIOR_HOME</option></select></label><label>Category<select name='category'><option>FORECLOSURE</option><option>PRE_FORECLOSURE</option><option>DISTRESS_PROPERTY</option><option>FIXER_UPPER</option><option>URGENT_SALE</option><option>FEATURED</option><option>NEW_LISTING</option></select></label><label class='spanAll'>Property description<textarea name='description' rows='4'></textarea></label></div></section>" +
      "<section class='formSection' id='pricing'><h4>Pricing</h4><div class='grid two'><label>Price amount<input name='priceAmount' type='number' min='0' /></label><label>Currency dropdown<select name='currencyCode'><option>THB</option><option>USD</option><option>EUR</option><option>CNY</option></select></label><label>Buy price<input name='buyPrice' type='number' min='0' /></label><label>Price label/unit<input name='priceUnitLabel' maxlength='80' /></label></div></section>" +
      "<section class='formSection' id='rentPricing'><h4>Rent Pricing</h4><div class='grid two'><label>Rent per month<input name='rentMonthlyPrice' type='number' min='0' /></label><label>Deposit amount<input name='depositAmount' type='number' min='0' /></label></div></section>" +
      "<section class='formSection' id='details'><h4>Details</h4><div class='grid two'><label>Bedrooms<input name='bedrooms' type='number' min='0' /></label><label>Bathrooms<input name='bathrooms' type='number' min='0' /></label><label>Land size<input name='landSize' type='number' min='0' step='0.01' /></label><label>Interior size / sqm<input name='interiorSizeSqm' type='number' min='0' step='0.01' /></label><label>Built year<input name='builtYear' type='number' min='1800' max='2100' /></label><label>Furnishing status<input name='furnishingStatus' maxlength='80' /></label><label>Air conditioner<select name='hasAirConditioner'><option value=''>Unknown</option><option value='true'>Yes</option><option value='false'>No</option></select></label><label>Kitchen<select name='hasKitchen'><option value=''>Unknown</option><option value='true'>Yes</option><option value='false'>No</option></select></label><label class='spanAll'>Property details field<textarea name='propertyDetails' rows='3'></textarea></label></div></section>" +
      "<section class='formSection' id='features'><h4>Features</h4><label>Features field<textarea name='features' rows='4'></textarea></label></section>" +
      "<section class='formSection' id='amenities'><h4>Amenities</h4><label>Amenities field<textarea name='amenities' rows='4'></textarea></label><label style='margin-top:10px'>Highlights field<textarea name='highlights' rows='3'></textarea></label></section>" +
      "<section class='formSection' id='faqSection'><h4>FAQ</h4><label>FAQ manager for this listing<textarea name='faqs' rows='5' placeholder='Question?|Answer'></textarea></label></section>" +
      "<section class='formSection' id='images'><h4>Images</h4><div class='grid two'><label>Multiple image upload up to 12 images<input name='images' type='file' accept='image/*' multiple /></label><label>Select cover image<input name='coverIndex' type='number' min='1' max='12' placeholder='1' /></label><label>Image reorder IDs<input name='inlineReorderIds' placeholder='3,1,2' /></label><label>Delete image ID<input name='inlineDeleteImageId' type='number' min='1' /></label></div><div class='small'>Use Media / Images page for full reorder, cover, and delete controls after upload.</div></section>" +
      "<section class='formSection' id='location'><h4>Location</h4><div class='grid two'><label>Street address<input name='streetAddress' maxlength='240' /></label><label>District<input name='district' maxlength='120' /></label><label>Subdistrict<input name='subdistrict' maxlength='120' /></label><label>City<input name='city' maxlength='120' /></label><label>Province<input name='province' maxlength='120' /></label><label>Postal code<input name='postalCode' maxlength='20' /></label><label>Country<input name='country' value='Thailand' maxlength='120' /></label><label>Latitude<input name='latitude' type='number' step='0.0000001' /></label><label>Longitude<input name='longitude' type='number' step='0.0000001' /></label><label>Map label<input name='mapSearchLabel' maxlength='255' /></label><label>Map lookup/search<input name='mapLookupQuery' maxlength='240' /></label><div><button type='button' id='mapLookupBtn'>Map lookup/search</button></div><div><select id='mapLookupResults'><option value=''>Select map result</option></select></div></div></section>" +
      "<section class='formSection' id='publish'><h4>Publish Settings</h4><div class='grid two'><label>Status dropdown<select name='status'><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option><option>DELETED</option></select></label></div></section>" +
      "<div class='actions'><button class='primary' type='submit' data-submit-status='DRAFT'>Save Draft</button><button class='primary' type='submit' data-submit-status='PUBLISHED'>Publish</button><button type='reset'>Reset</button><button class='warn' type='button' id='testSubmitBtn'>Test Submit</button></div>" +
      "</form>" +
      "<div id='listingCreateResult' class='small' style='margin-top:8px'></div>";
    const form = document.getElementById("listingForm");
    const results = document.getElementById("mapLookupResults");
    let lookupItems = [];
    document.getElementById("mapLookupBtn").onclick = async function(){
      const q = String(form.mapLookupQuery.value || "").trim();
      if (!q) { setMsg("Enter map lookup query."); return; }
      const r = await secureApi("/api/map/geocode?query=" + encodeURIComponent(q));
      lookupItems = r.items || [];
      results.innerHTML = "<option value=''>Select map result</option>";
      lookupItems.forEach(function(item, index){
        const op = document.createElement("option");
        op.value = String(index);
        op.textContent = item.label;
        results.appendChild(op);
      });
      setMsg("Map lookup complete.");
    };
    results.onchange = function(){
      const idx = Number.parseInt(results.value, 10);
      if (!Number.isFinite(idx)) return;
      const item = lookupItems[idx];
      if (!item) return;
      form.latitude.value = String(item.latitude);
      form.longitude.value = String(item.longitude);
      form.mapSearchLabel.value = item.label || "";
      if (!form.city.value && item.city) form.city.value = item.city;
      if (!form.province.value && item.province) form.province.value = item.province;
      if (!form.district.value && item.district) form.district.value = item.district;
      if (!form.postalCode.value && item.postalCode) form.postalCode.value = item.postalCode;
      if (!form.country.value && item.country) form.country.value = item.country;
    };
    function payloadFromForm(statusOverride) {
      if (statusOverride) form.status.value = statusOverride;
      return {
        title: form.title.value || "Test Listing",
        propertyType: textOrNull(form.propertyType.value),
        section: form.section.value,
        category: form.category.value,
        status: form.status.value,
        currencyCode: form.currencyCode.value,
        country: textOrNull(form.country.value) || "Thailand",
        priceAmount: toInt(form.priceAmount.value),
        buyPrice: toInt(form.buyPrice.value),
        rentMonthlyPrice: toInt(form.rentMonthlyPrice.value),
        depositAmount: toInt(form.depositAmount.value),
        priceUnitLabel: textOrNull(form.priceUnitLabel.value),
        bedrooms: toInt(form.bedrooms.value),
        bathrooms: toInt(form.bathrooms.value),
        landSize: toFloat(form.landSize.value),
        interiorSizeSqm: toFloat(form.interiorSizeSqm.value),
        builtYear: toInt(form.builtYear.value),
        furnishingStatus: textOrNull(form.furnishingStatus.value),
        hasAirConditioner: toBool(form.hasAirConditioner.value),
        hasKitchen: toBool(form.hasKitchen.value),
        streetAddress: textOrNull(form.streetAddress.value),
        district: textOrNull(form.district.value),
        subdistrict: textOrNull(form.subdistrict.value),
        city: textOrNull(form.city.value),
        province: textOrNull(form.province.value),
        postalCode: textOrNull(form.postalCode.value),
        latitude: toFloat(form.latitude.value),
        longitude: toFloat(form.longitude.value),
        mapSearchLabel: textOrNull(form.mapSearchLabel.value),
        description: textOrNull(form.description.value),
        highlights: lines(form.highlights.value),
        amenities: lines(form.amenities.value),
        features: lines(form.features.value),
        propertyDetails: lines(form.propertyDetails.value),
        faqs: faqLines(form.faqs.value)
      };
    }
    async function saveListing(statusOverride) {
      const payload = {
        ...payloadFromForm(statusOverride)
      };
      const created = editing ? await jsonApi("/api/admin/listings/" + editId, "PATCH", payload, true) : await jsonApi("/api/admin/listings", "POST", payload, true);
      const listingId = editing ? Number(editId) : created.id;
      state.latestCreatedListingId = listingId;
      let uploadedCount = 0;
      const selected = Array.from(form.images.files || []).slice(0, 12);
      if (selected.length > 0) {
        const fd = new FormData();
        selected.forEach(function(file){ fd.append("images", file); });
        const upload = await secureApi("/api/admin/listings/" + listingId + "/images", { method: "POST", headers: {}, body: fd });
        uploadedCount = upload.total || 0;
        const ids = (upload.items || []).map(function(item){ return item.id; }).filter(Boolean);
        const coverIndex = toInt(form.coverIndex.value);
        if (coverIndex && coverIndex > 0 && coverIndex <= ids.length) {
          await secureApi("/api/admin/listings/" + listingId + "/images/" + ids[coverIndex - 1] + "/cover", { method: "PATCH", headers: authHeaders() });
        }
      }
      const detail = await secureApi("/api/admin/listings/" + listingId);
      fillFormFromListing(form, detail);
      document.getElementById("listingCreateResult").textContent = (editing ? "Saved" : "Created") + " listing #" + listingId + ", uploaded images: " + uploadedCount + ". Deposit amount now shows: " + form.depositAmount.value + ".";
      setMsg("Listing saved. Rent deposit field round-trip verified in edit form.");
    }
    form.onsubmit = async function(e){
      e.preventDefault();
      const submitter = e.submitter;
      await saveListing(submitter && submitter.dataset ? submitter.dataset.submitStatus : undefined);
    };
    document.getElementById("testSubmitBtn").onclick = async function(){
      form.title.value = form.title.value || "Admin Demo Rent Deposit Test";
      form.section.value = "RENT";
      form.category.value = "FEATURED";
      form.rentMonthlyPrice.value = form.rentMonthlyPrice.value || "35000";
      form.depositAmount.value = form.depositAmount.value || "70000";
      form.priceUnitLabel.value = form.priceUnitLabel.value || "per month";
      form.amenities.value = form.amenities.value || "Pool\\nGym";
      form.features.value = form.features.value || "Furnished\\nAir conditioner\\nKitchen";
      form.faqs.value = form.faqs.value || "Is deposit editable?|Yes, depositAmount saves to the listing record.";
      await saveListing("DRAFT");
    };
    if (editing) {
      const detail = await secureApi("/api/admin/listings/" + editId);
      fillFormFromListing(form, detail);
    }
  }
  async function loadSeller(){
    const d = await secureApi("/api/admin/seller-applications");
    document.getElementById("view-seller").innerHTML =
      "<h3 style='margin-top:0'>Seller Applications</h3>" +
      table(["ID","Name","Phone","Email","Type","Location","Message","Submitted","Status"], (d.items || []).map(function(r){ return [r.id,r.full_name,r.phone,r.email,r.property_type || "",r.location,r.message || "",r.created_at,r.status]; })) +
      "<div class='row' style='margin-top:10px'><label>Application ID<input id='sellerStatusId' type='number' min='1' /></label><label>Status<select id='sellerStatusVal'><option>NEW</option><option>CONTACTED</option><option>IN_REVIEW</option><option>CLOSED</option><option>SPAM_REJECTED</option></select></label><button class='primary' id='sellerStatusBtn'>Update Status</button></div>";
    document.getElementById("sellerStatusBtn").onclick = async function(){
      const id = document.getElementById("sellerStatusId").value;
      const status = document.getElementById("sellerStatusVal").value;
      await jsonApi("/api/admin/seller-applications/" + id + "/status", "PATCH", {status: status}, true);
      await loadSeller();
      setMsg("Seller status updated.");
    };
  }
  async function loadUsers(){
    const d = await secureApi("/api/admin/registered-users");
    document.getElementById("view-users").innerHTML = "<h3 style='margin-top:0'>Registered Users</h3>" +
      table(["ID","Name","Email","Role","Status","Created"], (d.items || []).map(function(r){ return [r.id,r.full_name,r.email,r.role,r.status,r.created_at]; }));
  }
  async function loadEmployees(){
    const d = await secureApi("/api/admin/employees");
    document.getElementById("view-employees").innerHTML =
      "<h3 style='margin-top:0'>Employee Accounts</h3>" +
      table(["ID","Name","Email","Role","Status","Created"], (d.items || []).map(function(r){ return [r.id,r.full_name,r.email,r.role,r.status,r.created_at]; })) +
      "<h4 class='sectionTitle'>Create employee</h4><form id='employeeCreate' class='grid two'><label>Name<input name='fullName' required /></label><label>Email<input name='email' type='email' required /></label><label>Password<input name='password' type='password' required minlength='8' /></label><label>Role<select name='role'><option>EMPLOYEE</option><option>ADMIN</option></select></label><div><button class='primary' type='submit'>Create Employee</button></div></form>" +
      "<h4 class='sectionTitle'>Edit/Disable/Delete employee</h4><div class='row'><label>ID<input id='empId' type='number' min='1' /></label><label>Status<select id='empStatus'><option value=''>No change</option><option>ACTIVE</option><option>DISABLED</option></select></label><button id='empPatch'>Save</button><button id='empDelete'>Delete</button></div>";
    document.getElementById("employeeCreate").onsubmit = async function(e){
      e.preventDefault();
      const f = e.target;
      await jsonApi("/api/admin/employees", "POST", { fullName: f.fullName.value, email: f.email.value, password: f.password.value, role: f.role.value }, true);
      await loadEmployees();
      setMsg("Employee created.");
    };
    document.getElementById("empPatch").onclick = async function(){
      const id = document.getElementById("empId").value;
      const status = document.getElementById("empStatus").value;
      if (!id || !status) { setMsg("Employee ID + status required."); return; }
      await jsonApi("/api/admin/employees/" + id, "PATCH", { status: status }, true);
      await loadEmployees();
      setMsg("Employee updated.");
    };
    document.getElementById("empDelete").onclick = async function(){
      const id = document.getElementById("empId").value;
      if (!id) { setMsg("Employee ID required."); return; }
      await secureApi("/api/admin/employees/" + id, { method: "DELETE", headers: authHeaders() });
      await loadEmployees();
      setMsg("Employee deleted.");
    };
  }
  async function loadAccount(){
    document.getElementById("view-account").innerHTML = "<h3 style='margin-top:0'>Account Settings</h3><form id='accountForm' class='grid two'><label>Current password<input name='currentPassword' type='password' required /></label><label>Full name<input name='fullName' /></label><label>New email<input name='newEmail' type='email' /></label><label>New password<input name='newPassword' type='password' minlength='8' /></label><div><button class='primary' type='submit'>Save account settings</button></div></form>";
    document.getElementById("accountForm").onsubmit = async function(e){
      e.preventDefault();
      const f = e.target;
      await jsonApi("/api/admin/account-settings", "PATCH", { currentPassword: f.currentPassword.value, fullName: textOrNull(f.fullName.value), newEmail: textOrNull(f.newEmail.value), newPassword: textOrNull(f.newPassword.value) }, true);
      setMsg("Account settings updated.");
    };
  }
  async function loadMedia(){
    document.getElementById("view-media").innerHTML =
      "<h3 style='margin-top:0'>Media / Images</h3><div class='small'>Standalone image reorder/cover/delete testing.</div>" +
      "<div class='row' style='margin-top:8px'><label>Listing ID<input id='mediaListingId' type='number' min='1' value='" + esc(state.latestCreatedListingId || "") + "' /></label><button id='mediaLoad'>Load listing media</button></div>" +
      "<div id='mediaData' class='mono' style='margin-top:8px'></div>" +
      "<div class='row'><label>Reorder IDs (comma)<input id='mediaReorder' /></label><button id='mediaReorderBtn'>Reorder + cover</button></div>" +
      "<div class='row'><label>Cover image ID<input id='mediaCoverId' type='number' min='1' /></label><button id='mediaCoverBtn'>Set cover</button></div>" +
      "<div class='row'><label>Delete image ID<input id='mediaDeleteId' type='number' min='1' /></label><button id='mediaDeleteBtn'>Delete image</button></div>";
    document.getElementById("mediaLoad").onclick = async function(){
      const listingId = document.getElementById("mediaListingId").value;
      if (!listingId) { setMsg("Listing ID required."); return; }
      const detail = await secureApi("/api/admin/listings/" + listingId);
      const linesOut = (detail.images || []).map(function(img){ return "ID=" + img.id + " sort=" + img.sort_order + " cover=" + img.is_cover + " card=" + img.card_url; });
      document.getElementById("mediaData").textContent = linesOut.length ? linesOut.join("\\n") : "No images";
    };
    document.getElementById("mediaReorderBtn").onclick = async function(){
      const listingId = document.getElementById("mediaListingId").value;
      const ids = String(document.getElementById("mediaReorder").value || "").split(",").map(function(v){ return Number(v.trim()); }).filter(function(v){ return Number.isFinite(v) && v > 0; });
      if (!listingId || ids.length === 0) { setMsg("Listing ID + image IDs required."); return; }
      await jsonApi("/api/admin/listings/" + listingId + "/images/reorder", "PATCH", { imageIds: ids }, true);
      setMsg("Image order updated.");
    };
    document.getElementById("mediaCoverBtn").onclick = async function(){
      const listingId = document.getElementById("mediaListingId").value;
      const imageId = document.getElementById("mediaCoverId").value;
      if (!listingId || !imageId) { setMsg("Listing ID + image ID required."); return; }
      await secureApi("/api/admin/listings/" + listingId + "/images/" + imageId + "/cover", { method: "PATCH", headers: authHeaders() });
      setMsg("Cover image updated.");
    };
    document.getElementById("mediaDeleteBtn").onclick = async function(){
      const listingId = document.getElementById("mediaListingId").value;
      const imageId = document.getElementById("mediaDeleteId").value;
      if (!listingId || !imageId) { setMsg("Listing ID + image ID required."); return; }
      await secureApi("/api/admin/listings/" + listingId + "/images/" + imageId, { method: "DELETE", headers: authHeaders() });
      setMsg("Image deleted.");
    };
  }
  async function loadFaq(){
    document.getElementById("view-faq").innerHTML =
      "<h3 style='margin-top:0'>FAQ Manager</h3><div class='row'><label>Listing ID<input id='faqListingId' type='number' min='1' value='" + esc(state.latestCreatedListingId || "") + "' /></label><button id='faqLoad'>Load FAQ</button></div><label style='margin-top:8px'>FAQ lines (Q|A per line)<textarea id='faqLines' rows='10'></textarea></label><button class='primary' id='faqSave'>Save FAQ</button>";
    document.getElementById("faqLoad").onclick = async function(){
      const listingId = document.getElementById("faqListingId").value;
      if (!listingId) { setMsg("Listing ID required."); return; }
      const data = await secureApi("/api/admin/listings/" + listingId + "/faqs");
      document.getElementById("faqLines").value = (data.items || []).map(function(i){ return i.question + "|" + i.answer; }).join("\\n");
      setMsg("FAQ loaded.");
    };
    document.getElementById("faqSave").onclick = async function(){
      const listingId = document.getElementById("faqListingId").value;
      if (!listingId) { setMsg("Listing ID required."); return; }
      await jsonApi("/api/admin/listings/" + listingId + "/faqs", "PUT", { items: faqLines(document.getElementById("faqLines").value) }, true);
      setMsg("FAQ saved.");
    };
  }
  async function renderViews(){
    showView(state.active);
    if (state.active === "dashboard") return loadDashboard();
    if (state.active === "listings") return loadListings();
    if (state.active === "add-listing") return loadAddListing();
    if (state.active === "seller") return loadSeller();
    if (state.active === "users") return loadUsers();
    if (state.active === "employees") return loadEmployees();
    if (state.active === "account") return loadAccount();
    if (state.active === "media") return loadMedia();
    if (state.active === "faq") return loadFaq();
  }
  async function initAuthFlow(){
    let bootstrap = { headAdminExists: true };
    try {
      bootstrap = await withTimeout(api("/api/auth/bootstrap-status"), 1000);
    } catch (_error) {
      enableDemoMode("Demo Mode: MySQL is offline, showing mock admin UI only");
      bootstrap = { headAdminExists: true };
    }
    state.headAdminExists = !!bootstrap.headAdminExists;
    if (state.token) {
      try {
        const me = await secureApi("/api/auth/me");
        await completeLogin({ token: state.token, user: me.user });
        return;
      } catch (_error) {
        state.token = "";
        localStorage.removeItem("admin_demo_token");
      }
    }
    el.authFlow.classList.remove("hidden");
    el.adminApp.classList.add("hidden");
    el.sidebar.style.display = "none";
    showAuthStep(state.headAdminExists ? "login" : "register");
    setMsg(state.demoMode ? "Mock register/login is ready. Use Login or Open Full Workflow Demo." : state.headAdminExists ? "Head admin exists. Continue Step 2 login." : "No head admin yet. Complete Step 1 first.");
  }
  document.getElementById("registerForm").onsubmit = async function(e){
    e.preventDefault();
    const f = e.target;
    if (state.demoMode) {
      await openDemoMode();
      return;
    }
    try {
      await jsonApi("/api/auth/register", "POST", { fullName: f.fullName.value, email: f.email.value, password: f.password.value }, false);
      state.headAdminExists = true;
      document.querySelector("#loginForm input[name='email']").value = f.email.value;
      f.reset();
      showAuthStep("login");
      setMsg("Head admin registered. Continue Step 2 login.");
    } catch (error) {
      await openDemoMode();
    }
  };
  document.getElementById("loginForm").onsubmit = async function(e){
    e.preventDefault();
    const f = e.target;
    if (state.demoMode) {
      await openDemoMode();
      return;
    }
    try {
      const data = await jsonApi("/api/auth/login", "POST", { email: f.email.value, password: f.password.value }, false);
      await completeLogin(data);
    } catch (error) {
      await openDemoMode();
    }
  };
  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("demoModeBtn").onclick = openDemoMode;
  initAuthFlow().catch(function(error){ setMsg(error && error.message ? error.message : "Failed to initialize admin demo."); });
})();
</script>
</body>
</html>`;

export const adminDemoRoutes = Router();

adminDemoRoutes.get("/", (_request, response) => {
  response.type("html").send(adminDemoHtml);
});
