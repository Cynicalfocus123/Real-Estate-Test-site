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
    body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; background: #f4f7fb; color: #132137; }
    .shell { display: flex; min-height: 100vh; }
    .sidebar { width: 250px; background: #0b1f3a; color: #fff; padding: 18px 12px; display: none; }
    .brand { font-weight: 700; margin: 0 10px 16px; }
    .menu { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
    .menu button { width: 100%; border: 0; text-align: left; padding: 10px; border-radius: 8px; background: transparent; color: #d2def5; cursor: pointer; }
    .menu button.active, .menu button:hover { background: #17406f; color: #fff; }
    .main { flex: 1; padding: 20px; }
    .card { background: #fff; border-radius: 10px; padding: 14px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(19,33,55,0.08); }
    .hidden { display: none !important; }
    .grid { display: grid; gap: 10px; }
    .grid.two { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; }
    label { display: grid; gap: 4px; font-size: 13px; }
    input, select, textarea, button { border-radius: 8px; border: 1px solid #bcc8d8; padding: 8px; font: inherit; }
    button { cursor: pointer; }
    button.primary { background: #17406f; color: #fff; border-color: #17406f; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border-bottom: 1px solid #e3e9f2; text-align: left; padding: 7px; vertical-align: top; }
    .top { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
    .small { color: #4d5f78; font-size: 12px; }
    .mono { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; }
    .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: end; }
  </style>
</head>
<body>
  <div class="shell">
    <aside class="sidebar" id="sidebar">
      <div class="brand">Admin Backend Demo</div>
      <ul class="menu" id="menu"></ul>
    </aside>
    <main class="main">
      <section id="authFlow">
        <div class="card">
          <h2>Step 1: Register First Head Admin</h2>
          <form id="registerForm" class="grid two">
            <label>Full name<input name="fullName" required maxlength="80" /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" required minlength="8" /></label>
            <div><button class="primary" type="submit">Register Head Admin</button></div>
          </form>
        </div>
        <div class="card">
          <h2>Step 2: Login</h2>
          <form id="loginForm" class="grid two">
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" required /></label>
            <div><button class="primary" type="submit">Login</button></div>
          </form>
        </div>
      </section>

      <section id="adminApp" class="hidden">
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
  const state = { token: localStorage.getItem("admin_demo_token") || "", user: null, active: "dashboard" };
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
    adminApp: document.getElementById("adminApp"),
    sidebar: document.getElementById("sidebar"),
    menu: document.getElementById("menu"),
    msg: document.getElementById("msg"),
    currentUser: document.getElementById("currentUser"),
    logoutBtn: document.getElementById("logoutBtn")
  };

  function setMsg(text) { el.msg.textContent = text; }

  function authHeaders(extra) {
    const headers = Object.assign({ "Content-Type": "application/json" }, extra || {});
    if (state.token) headers.Authorization = "Bearer " + state.token;
    return headers;
  }

  async function api(path, options) {
    const res = await fetch(path, options || {});
    const data = await res.json().catch(function(){ return {}; });
    if (!res.ok) throw new Error(data.error || ("HTTP " + res.status));
    return data;
  }

  async function secureApi(path, options) {
    const opts = options || {};
    opts.headers = authHeaders(opts.headers || {});
    return api(path, opts);
  }

  function makeMenu() {
    el.menu.innerHTML = "";
    sections.forEach(function(item){
      const key = item[0];
      const label = item[1];
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.dataset.key = key;
      btn.onclick = function(){
        if (key === "logout") return logout();
        state.active = key;
        renderViews();
      };
      if (state.active === key) btn.classList.add("active");
      li.appendChild(btn);
      el.menu.appendChild(li);
    });
  }

  function show(id) {
    document.querySelectorAll(".view").forEach(function(node){ node.classList.add("hidden"); });
    document.getElementById("view-" + id).classList.remove("hidden");
    document.querySelectorAll(".menu button").forEach(function(btn){
      btn.classList.toggle("active", btn.dataset.key === id);
    });
  }

  async function loadOverview() {
    const data = await secureApi("/api/admin/dashboard/overview");
    const box = document.getElementById("view-dashboard");
    box.innerHTML = "<h3>Dashboard Overview</h3>" +
      "<div class='stats'>" +
      card("Total listings", data.totalListings) +
      card("Published listings", data.publishedListings) +
      card("Draft listings", data.draftListings) +
      card("Archived listings", data.archivedListings) +
      card("Deleted listings", data.deletedListings) +
      card("Total registered users", data.totalRegisteredUsers) +
      card("Total seller applications", data.totalSellerApplications) +
      card("Total employee accounts", data.totalEmployeeAccounts) +
      "</div>" +
      "<h4>Recent listings</h4>" + table([
        "ID","Title","Section","Category","Status","Created"
      ], data.recentListings.map(function(r){ return [r.id,r.title,r.section,r.category,r.status,r.created_at]; })) +
      "<h4>Recent seller applications</h4>" + table([
        "ID","Name","Type","Location","Status","Created"
      ], data.recentSellerApplications.map(function(r){ return [r.id,r.full_name,r.property_type||"",r.location,r.status,r.created_at]; }));
  }

  function card(label, value) {
    return "<div class='card'><div class='small'>" + label + "</div><div style='font-size:24px;font-weight:700'>" + value + "</div></div>";
  }

  function table(headers, rows) {
    const thead = "<tr>" + headers.map(function(h){ return "<th>" + esc(h) + "</th>"; }).join("") + "</tr>";
    const body = rows.map(function(row){
      return "<tr>" + row.map(function(cell){ return "<td>" + esc(cell == null ? "" : String(cell)) + "</td>"; }).join("") + "</tr>";
    }).join("");
    return "<table><thead>" + thead + "</thead><tbody>" + body + "</tbody></table>";
  }

  function esc(s) { return s.replace(/[&<>\"']/g, function(c){ return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]; }); }

  async function loadListings() {
    const data = await secureApi("/api/admin/listings");
    const box = document.getElementById("view-listings");
    box.innerHTML = "<h3>Listings</h3>" + table(
      ["ID","Title","Section","Category","Status","Price","City","Province","Updated"],
      data.items.map(function(r){ return [r.id,r.title,r.section,r.category,r.status,(r.price_amount||"")+" "+(r.currency_code||""),r.city||"",r.province||"",r.updated_at]; })
    );
  }

  function lines(name, label, placeholder) {
    return "<label>" + label + "<textarea name='" + name + "' rows='2' placeholder='" + placeholder + "'></textarea></label>";
  }

  function bool(name, label) {
    return "<label>" + label + "<select name='" + name + "'><option value=''>Unknown</option><option value='true'>Yes</option><option value='false'>No</option></select></label>";
  }

  async function loadAddListing() {
    const box = document.getElementById("view-add-listing");
    box.innerHTML = "<h3>Add Listing</h3>" +
      "<form id='listingForm' class='grid two'>" +
      "<label>Property title<input name='title' required maxlength='180' /></label>" +
      "<label>Property type<input name='propertyType' maxlength='120' /></label>" +
      "<label>Section<select name='section'><option>BUY</option><option>RENT</option><option>SELL</option><option>SENIOR_HOME</option></select></label>" +
      "<label>Category<select name='category'><option>FORECLOSURE</option><option>PRE_FORECLOSURE</option><option>DISTRESS_PROPERTY</option><option>FIXER_UPPER</option><option>URGENT_SALE</option><option>FEATURED</option><option>NEW_LISTING</option></select></label>" +
      "<label>Status<select name='status'><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option><option>DELETED</option></select></label>" +
      "<label>Currency<select name='currencyCode'><option>THB</option><option>USD</option><option>EUR</option><option>CNY</option></select></label>" +
      "<label>Price amount<input name='priceAmount' type='number' min='0' /></label>" +
      "<label>Buy price<input name='buyPrice' type='number' min='0' /></label>" +
      "<label>Rent monthly price<input name='rentMonthlyPrice' type='number' min='0' /></label>" +
      "<label>Deposit field<input name='depositAmount' type='number' min='0' /></label>" +
      "<label>Price unit / label<input name='priceUnitLabel' maxlength='80' placeholder='per month / total / negotiable' /></label>" +
      "<label>Bedrooms<input name='bedrooms' type='number' min='0' /></label>" +
      "<label>Bathrooms<input name='bathrooms' type='number' min='0' /></label>" +
      "<label>Land size<input name='landSize' type='number' min='0' step='0.01' /></label>" +
      "<label>Interior size sqm<input name='interiorSizeSqm' type='number' min='0' step='0.01' /></label>" +
      "<label>Built year<input name='builtYear' type='number' min='1800' max='2100' /></label>" +
      "<label>Furnishing status<input name='furnishingStatus' maxlength='80' placeholder='Fully furnished / Partly furnished' /></label>" +
      bool("hasAirConditioner", "Air conditioner availability") +
      bool("hasKitchen", "Kitchen availability") +
      "<label>Street address<input name='streetAddress' maxlength='240' /></label>" +
      "<label>District<input name='district' maxlength='120' /></label>" +
      "<label>Subdistrict<input name='subdistrict' maxlength='120' /></label>" +
      "<label>City<input name='city' maxlength='120' /></label>" +
      "<label>Province<input name='province' maxlength='120' /></label>" +
      "<label>Postal code<input name='postalCode' maxlength='20' /></label>" +
      "<label>Country<input name='country' value='Thailand' maxlength='120' /></label>" +
      "<label>Latitude<input name='latitude' type='number' step='0.0000001' /></label>" +
      "<label>Longitude<input name='longitude' type='number' step='0.0000001' /></label>" +
      "<label>Map location search / marker label<input name='mapSearchLabel' maxlength='255' placeholder='Search label from map' /></label>" +
      "<label>Property description<textarea name='description' rows='4'></textarea></label>" +
      lines("highlights", "Highlights (one per line)", "Near BTS\nOcean view") +
      lines("amenities", "Amenities (one per line)", "Pool\nGym") +
      lines("features", "Features (one per line)", "Pet friendly") +
      lines("propertyDetails", "Property details (one per line)", "Title deed ready") +
      lines("faqs", "FAQ manager (Q|A per line)", "Is financing available?|Yes") +
      "<div><button class='primary' type='submit'>Create Listing</button></div>" +
      "</form>";

    document.getElementById("listingForm").onsubmit = async function(ev){
      ev.preventDefault();
      const form = ev.target;
      const payload = {
        title: form.title.value,
        propertyType: form.propertyType.value || null,
        section: form.section.value,
        category: form.category.value,
        status: form.status.value,
        currencyCode: form.currencyCode.value,
        country: form.country.value || "Thailand",
        priceAmount: toInt(form.priceAmount.value),
        buyPrice: toInt(form.buyPrice.value),
        rentMonthlyPrice: toInt(form.rentMonthlyPrice.value),
        depositAmount: toInt(form.depositAmount.value),
        priceUnitLabel: emptyToNull(form.priceUnitLabel.value),
        bedrooms: toInt(form.bedrooms.value),
        bathrooms: toInt(form.bathrooms.value),
        landSize: toFloat(form.landSize.value),
        interiorSizeSqm: toFloat(form.interiorSizeSqm.value),
        builtYear: toInt(form.builtYear.value),
        furnishingStatus: emptyToNull(form.furnishingStatus.value),
        hasAirConditioner: toBool(form.hasAirConditioner.value),
        hasKitchen: toBool(form.hasKitchen.value),
        streetAddress: emptyToNull(form.streetAddress.value),
        district: emptyToNull(form.district.value),
        subdistrict: emptyToNull(form.subdistrict.value),
        city: emptyToNull(form.city.value),
        province: emptyToNull(form.province.value),
        postalCode: emptyToNull(form.postalCode.value),
        latitude: toFloat(form.latitude.value),
        longitude: toFloat(form.longitude.value),
        mapSearchLabel: emptyToNull(form.mapSearchLabel.value),
        description: emptyToNull(form.description.value),
        highlights: linesToArray(form.highlights.value),
        amenities: linesToArray(form.amenities.value),
        features: linesToArray(form.features.value),
        propertyDetails: linesToArray(form.propertyDetails.value),
        faqs: faqLinesToArray(form.faqs.value)
      };
      const created = await secureApi("/api/admin/listings", { method:"POST", headers: authHeaders(), body: JSON.stringify(payload) });
      setMsg("Listing created. ID: " + created.id);
      state.active = "listings";
      await renderViews();
    };
  }

  async function loadSellerApplications() {
    const data = await secureApi("/api/admin/seller-applications");
    const box = document.getElementById("view-seller");
    box.innerHTML = "<h3>Seller Applications</h3>" + table(
      ["ID","Name","Phone","Email","Type","Location","Message","Submitted","Status"],
      data.items.map(function(r){ return [r.id,r.full_name,r.phone,r.email,r.property_type||"",r.location,r.message||"",r.created_at,r.status]; })
    ) +
    "<div class='row' style='margin-top:10px'>" +
    "<label>Application ID<input id='sellerStatusId' type='number' min='1' /></label>" +
    "<label>Status<select id='sellerStatusVal'><option>NEW</option><option>CONTACTED</option><option>IN_REVIEW</option><option>CLOSED</option><option>SPAM_REJECTED</option></select></label>" +
    "<button class='primary' id='sellerStatusBtn'>Update Status</button></div>";

    document.getElementById("sellerStatusBtn").onclick = async function(){
      const id = document.getElementById("sellerStatusId").value;
      const status = document.getElementById("sellerStatusVal").value;
      await secureApi("/api/admin/seller-applications/" + id + "/status", { method:"PATCH", headers: authHeaders(), body: JSON.stringify({ status: status }) });
      await loadSellerApplications();
      setMsg("Seller application status updated.");
    };
  }

  async function loadUsers() {
    const data = await secureApi("/api/admin/registered-users");
    document.getElementById("view-users").innerHTML = "<h3>Registered Users</h3>" + table(
      ["ID","Name","Email","Role","Status","Created"],
      data.items.map(function(u){ return [u.id,u.full_name,u.email,u.role,u.status,u.created_at]; })
    );
  }

  async function loadEmployees() {
    const data = await secureApi("/api/admin/employees");
    const box = document.getElementById("view-employees");
    box.innerHTML = "<h3>Employee Accounts</h3>" + table(
      ["ID","Name","Email","Role","Status","Created"],
      data.items.map(function(u){ return [u.id,u.full_name,u.email,u.role,u.status,u.created_at]; })
    ) +
    "<h4>Create employee</h4><form id='employeeCreate' class='grid two'>" +
    "<label>Name<input name='fullName' required /></label>" +
    "<label>Email<input name='email' type='email' required /></label>" +
    "<label>Password<input name='password' type='password' required minlength='8' /></label>" +
    "<label>Role<select name='role'><option>EMPLOYEE</option><option>ADMIN</option></select></label>" +
    "<div><button class='primary' type='submit'>Create</button></div></form>" +
    "<h4>Edit / Disable / Delete employee</h4><div class='row'>" +
    "<label>ID<input id='empId' type='number' min='1' /></label>" +
    "<label>Status<select id='empStatus'><option value=''>No change</option><option>ACTIVE</option><option>DISABLED</option></select></label>" +
    "<button id='empPatch'>Save Changes</button><button id='empDelete'>Delete</button></div>";

    document.getElementById("employeeCreate").onsubmit = async function(ev){
      ev.preventDefault();
      const f = ev.target;
      await secureApi("/api/admin/employees", { method:"POST", headers: authHeaders(), body: JSON.stringify({ fullName: f.fullName.value, email: f.email.value, password: f.password.value, role: f.role.value }) });
      setMsg("Employee created.");
      await loadEmployees();
    };

    document.getElementById("empPatch").onclick = async function(){
      const id = document.getElementById("empId").value;
      const status = document.getElementById("empStatus").value;
      const payload = {};
      if (status) payload.status = status;
      if (!Object.keys(payload).length) { setMsg("Choose at least one field to update."); return; }
      await secureApi("/api/admin/employees/" + id, { method:"PATCH", headers: authHeaders(), body: JSON.stringify(payload) });
      setMsg("Employee updated.");
      await loadEmployees();
    };

    document.getElementById("empDelete").onclick = async function(){
      const id = document.getElementById("empId").value;
      await secureApi("/api/admin/employees/" + id, { method:"DELETE", headers: authHeaders() });
      setMsg("Employee deleted.");
      await loadEmployees();
    };
  }

  async function loadAccount() {
    document.getElementById("view-account").innerHTML = "<h3>Account Settings</h3>" +
      "<form id='accountForm' class='grid two'>" +
      "<label>Current password<input name='currentPassword' type='password' required /></label>" +
      "<label>Full name<input name='fullName' /></label>" +
      "<label>New email<input name='newEmail' type='email' /></label>" +
      "<label>New password<input name='newPassword' type='password' minlength='8' /></label>" +
      "<div><button class='primary' type='submit'>Save account settings</button></div></form>";

    document.getElementById("accountForm").onsubmit = async function(ev){
      ev.preventDefault();
      const f = ev.target;
      const payload = {
        currentPassword: f.currentPassword.value,
        fullName: emptyToNull(f.fullName.value),
        newEmail: emptyToNull(f.newEmail.value),
        newPassword: emptyToNull(f.newPassword.value)
      };
      await secureApi("/api/admin/account-settings", { method:"PATCH", headers: authHeaders(), body: JSON.stringify(payload) });
      setMsg("Account settings updated.");
    };
  }

  async function loadMedia() {
    document.getElementById("view-media").innerHTML = "<h3>Media / Images</h3>" +
      "<form id='uploadForm' class='grid two'>" +
      "<label>Listing ID<input name='listingId' type='number' min='1' required /></label>" +
      "<label>Upload images (max 12)<input name='images' type='file' multiple accept='image/*' required /></label>" +
      "<div><button class='primary' type='submit'>Upload</button></div></form>" +
      "<div class='row'><label>Listing ID<input id='mediaListingId' type='number' min='1' /></label><button id='mediaLoad'>Load listing media</button></div>" +
      "<div id='mediaData' class='small' style='margin-top:8px'></div>" +
      "<div class='row'>" +
      "<label>Reorder IDs (comma)<input id='mediaReorder' /></label><button id='mediaReorderBtn'>Reorder + Set first cover</button></div>" +
      "<div class='row'>" +
      "<label>Cover image ID<input id='mediaCoverId' type='number' min='1' /></label><button id='mediaCoverBtn'>Set cover image</button></div>" +
      "<div class='row'>" +
      "<label>Delete image ID<input id='mediaDeleteId' type='number' min='1' /></label><button id='mediaDeleteBtn'>Delete image</button></div>";

    document.getElementById("uploadForm").onsubmit = async function(ev){
      ev.preventDefault();
      const f = ev.target;
      const listingId = f.listingId.value;
      const fd = new FormData();
      Array.from(f.images.files || []).forEach(function(file){ fd.append("images", file); });
      const res = await fetch("/api/admin/listings/" + listingId + "/images", { method: "POST", headers: state.token ? { Authorization: "Bearer " + state.token } : {}, body: fd });
      const data = await res.json().catch(function(){ return {}; });
      if (!res.ok) throw new Error(data.error || "Image upload failed");
      setMsg("Uploaded " + data.total + " image(s).");
    };

    document.getElementById("mediaLoad").onclick = async function(){
      const listingId = document.getElementById("mediaListingId").value;
      const detail = await secureApi("/api/admin/listings/" + listingId);
      const list = (detail.images || []).map(function(img){
        return "ID " + img.id + " | sort " + img.sort_order + " | cover " + img.is_cover + " | " + img.card_url;
      }).join("\n");
      document.getElementById("mediaData").textContent = list || "No images";
    };

    document.getElementById("mediaReorderBtn").onclick = async function(){
      const listingId = document.getElementById("mediaListingId").value;
      const imageIds = document.getElementById("mediaReorder").value.split(",").map(function(v){ return Number(v.trim()); }).filter(Boolean);
      await secureApi("/api/admin/listings/" + listingId + "/images/reorder", { method:"PATCH", headers: authHeaders(), body: JSON.stringify({ imageIds: imageIds }) });
      setMsg("Image order updated.");
    };

    document.getElementById("mediaCoverBtn").onclick = async function(){
      const listingId = document.getElementById("mediaListingId").value;
      const imageId = document.getElementById("mediaCoverId").value;
      await secureApi("/api/admin/listings/" + listingId + "/images/" + imageId + "/cover", { method:"PATCH", headers: authHeaders() });
      setMsg("Cover image updated.");
    };

    document.getElementById("mediaDeleteBtn").onclick = async function(){
      const listingId = document.getElementById("mediaListingId").value;
      const imageId = document.getElementById("mediaDeleteId").value;
      await secureApi("/api/admin/listings/" + listingId + "/images/" + imageId, { method:"DELETE", headers: authHeaders() });
      setMsg("Image deleted.");
    };
  }

  async function loadFaqManager() {
    document.getElementById("view-faq").innerHTML = "<h3>FAQ Manager</h3>" +
      "<div class='row'><label>Listing ID<input id='faqListingId' type='number' min='1' /></label><button id='faqLoad'>Load FAQ</button></div>" +
      "<label style='margin-top:8px'>FAQ lines (Q|A per line)<textarea id='faqLines' rows='9'></textarea></label>" +
      "<button class='primary' id='faqSave'>Save FAQ</button>";

    document.getElementById("faqLoad").onclick = async function(){
      const id = document.getElementById("faqListingId").value;
      const data = await secureApi("/api/admin/listings/" + id + "/faqs");
      const text = (data.items || []).map(function(f){ return f.question + "|" + f.answer; }).join("\n");
      document.getElementById("faqLines").value = text;
      setMsg("FAQ loaded.");
    };

    document.getElementById("faqSave").onclick = async function(){
      const id = document.getElementById("faqListingId").value;
      const items = faqLinesToArray(document.getElementById("faqLines").value);
      await secureApi("/api/admin/listings/" + id + "/faqs", { method:"PUT", headers: authHeaders(), body: JSON.stringify({ items: items }) });
      setMsg("FAQ saved.");
    };
  }

  async function renderViews() {
    show(state.active);
    if (state.active === "dashboard") return loadOverview();
    if (state.active === "listings") return loadListings();
    if (state.active === "add-listing") return loadAddListing();
    if (state.active === "seller") return loadSellerApplications();
    if (state.active === "users") return loadUsers();
    if (state.active === "employees") return loadEmployees();
    if (state.active === "account") return loadAccount();
    if (state.active === "media") return loadMedia();
    if (state.active === "faq") return loadFaqManager();
  }

  function toInt(v) { return v === "" ? null : Number.parseInt(v, 10); }
  function toFloat(v) { return v === "" ? null : Number(v); }
  function emptyToNull(v) { return v && v.trim() ? v.trim() : null; }
  function toBool(v) { if (!v) return null; return v === "true"; }
  function linesToArray(v) { return v.split(/\r?\n/).map(function(x){ return x.trim(); }).filter(Boolean); }
  function faqLinesToArray(v) {
    return linesToArray(v).map(function(line){
      const idx = line.indexOf("|");
      if (idx < 0) return { question: line, answer: "" };
      return { question: line.slice(0, idx).trim(), answer: line.slice(idx + 1).trim() };
    }).filter(function(item){ return item.question && item.answer; });
  }

  function logout() {
    state.token = "";
    state.user = null;
    localStorage.removeItem("admin_demo_token");
    el.authFlow.classList.remove("hidden");
    el.adminApp.classList.add("hidden");
    el.sidebar.style.display = "none";
    setMsg("Logged out.");
  }

  async function completeLogin(data) {
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem("admin_demo_token", state.token);
    el.currentUser.textContent = data.user.fullName + " (" + data.user.role + ") - " + data.user.email;
    el.authFlow.classList.add("hidden");
    el.adminApp.classList.remove("hidden");
    el.sidebar.style.display = "block";
    makeMenu();
    state.active = "dashboard";
    await renderViews();
    setMsg("Logged in and redirected to dashboard.");
  }

  document.getElementById("registerForm").onsubmit = async function(ev){
    ev.preventDefault();
    try {
      const f = ev.target;
      const data = await api("/api/auth/register", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ fullName:f.fullName.value, email:f.email.value, password:f.password.value }) });
      await completeLogin(data);
      setMsg("Head admin registered and logged in.");
    } catch (error) {
      setMsg(error.message);
    }
  };

  document.getElementById("loginForm").onsubmit = async function(ev){
    ev.preventDefault();
    try {
      const f = ev.target;
      const data = await api("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email:f.email.value, password:f.password.value }) });
      await completeLogin(data);
    } catch (error) {
      setMsg(error.message);
    }
  };

  el.logoutBtn.onclick = logout;

  (async function init(){
    if (!state.token) return;
    try {
      const me = await secureApi("/api/auth/me");
      await completeLogin({ token: state.token, user: me.user });
    } catch (_error) {
      logout();
    }
  })();
})();
</script>
</body></html>`;

export const adminDemoRoutes = Router();

adminDemoRoutes.get("/", (_request, response) => {
  response.type("html").send(adminDemoHtml);
});
