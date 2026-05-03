import { Router } from "express";

export const adminDemoRoutes = Router();

adminDemoRoutes.get("/", (_request, response) => {
  response.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>BuyHomeForLess Backend Admin Demo</title>
  <style>
    :root{--bg:#f3f4f6;--card:#fff;--ink:#111827;--muted:#6b7280;--brand:#0f766e;--danger:#b91c1c;--line:#e5e7eb}
    *{box-sizing:border-box} body{margin:0;font-family:Segoe UI,Arial,sans-serif;background:var(--bg);color:var(--ink)}
    .wrap{max-width:1100px;margin:24px auto;padding:0 16px}
    .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:14px}
    h1{margin:0 0 10px;font-size:24px} h2{margin:0 0 10px;font-size:18px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    label{display:block;font-size:12px;color:var(--muted);margin-bottom:4px}
    input,select,textarea{width:100%;border:1px solid #d1d5db;border-radius:8px;padding:10px;font:inherit}
    button{border:0;background:var(--brand);color:#fff;border-radius:8px;padding:10px 14px;cursor:pointer}
    button.secondary{background:#374151} button.danger{background:var(--danger)}
    .row{display:flex;gap:8px;flex-wrap:wrap}
    .muted{color:var(--muted);font-size:13px}
    .ok{color:#166534}.err{color:var(--danger)}
    table{width:100%;border-collapse:collapse} th,td{border-bottom:1px solid var(--line);padding:8px;text-align:left;font-size:13px}
    .token{word-break:break-all;font-size:12px;background:#f9fafb;border:1px solid var(--line);padding:8px;border-radius:8px}
    @media (max-width:900px){.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
<div class="wrap">
  <h1>Backend Admin Demo</h1>
  <p class="muted">This is a mock admin UI for testing backend login/register, admin, employee, and listing APIs.</p>

  <div class="card">
    <h2>1) Auth</h2>
    <div class="grid">
      <div>
        <h3>Register</h3>
        <label>Email</label><input id="regEmail" placeholder="headadmin@buyhomeforless.com" />
        <label>Password</label><input id="regPassword" type="password" placeholder="ChangeThis123!" />
        <label>Full Name</label><input id="regName" placeholder="Head Admin" />
        <label>Role (after head admin exists)</label>
        <select id="regRole"><option>EMPLOYEE</option><option>ADMIN</option></select>
        <div class="row"><button onclick="registerUser()">Register</button></div>
      </div>
      <div>
        <h3>Login</h3>
        <label>Email</label><input id="loginEmail" placeholder="headadmin@buyhomeforless.com" />
        <label>Password</label><input id="loginPassword" type="password" placeholder="ChangeThis123!" />
        <div class="row"><button onclick="loginUser()">Login</button><button class="secondary" onclick="loadMe()">Load Me</button></div>
        <p id="authMsg" class="muted"></p>
        <div id="tokenBox" class="token muted">No token yet.</div>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>2) Admin Health</h2>
    <div class="row">
      <button onclick="callHealth()">Health</button>
      <button onclick="callAdminTest()">Admin Test</button>
    </div>
    <pre id="healthOut" class="token muted"></pre>
  </div>

  <div class="card">
    <h2>3) Employee Management (Head Admin)</h2>
    <div class="grid">
      <div>
        <label>Email</label><input id="empEmail" placeholder="employee@buyhomeforless.com" />
        <label>Password</label><input id="empPassword" type="password" placeholder="EmpPass123!" />
        <label>Full Name</label><input id="empName" placeholder="Employee User" />
        <label>Role</label><select id="empRole"><option>EMPLOYEE</option><option>ADMIN</option></select>
        <div class="row"><button onclick="createEmployee()">Create Employee/Admin</button></div>
      </div>
      <div>
        <div class="row"><button class="secondary" onclick="loadEmployees()">Refresh Employees</button></div>
        <div style="overflow:auto;max-height:280px">
          <table><thead><tr><th>ID</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody id="employeesBody"></tbody></table>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>4) Listing Management</h2>
    <div class="grid">
      <div>
        <label>Title</label><input id="lstTitle" placeholder="Bangkok Condo Test" />
        <label>Section</label><select id="lstSection"><option>BUY</option><option>RENT</option><option>SENIOR_HOME</option><option>SELL</option></select>
        <label>Category</label><select id="lstCategory"><option>NORMAL</option><option>FORECLOSURE</option><option>URGENT_SALE</option><option>FEATURED</option><option>NEW_LISTING</option><option>DISTRESS</option><option>PRE_FORECLOSURE</option><option>FIXER_UPPER</option></select>
        <label>Status</label><select id="lstStatus"><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select>
        <label>Price</label><input id="lstPrice" type="number" placeholder="5000000" />
        <label>City</label><input id="lstCity" placeholder="Bangkok" />
        <label>Province</label><input id="lstProvince" placeholder="Bangkok" />
        <label>Description</label><textarea id="lstDesc" rows="3"></textarea>
        <div class="row"><button onclick="createListing()">Create Listing</button><button class="secondary" onclick="loadListings()">Refresh Listings</button></div>
      </div>
      <div>
        <div style="overflow:auto;max-height:300px">
          <table><thead><tr><th>ID</th><th>Title</th><th>Section</th><th>Category</th><th>Status</th></tr></thead><tbody id="listingsBody"></tbody></table>
        </div>
        <p class="muted">Upload images (up to 12) by listing ID:</p>
        <label>Listing ID</label><input id="imgListingId" type="number" />
        <input id="imgFiles" type="file" multiple accept="image/*" />
        <div class="row"><button onclick="uploadImages()">Upload Images</button></div>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>5) API Output</h2>
    <pre id="out" class="token muted"></pre>
  </div>
</div>

<script>
const base = "";
let token = localStorage.getItem("bhfl_token") || "";
renderToken();

function renderToken(){
  document.getElementById("tokenBox").textContent = token ? token : "No token yet.";
}

function headers(json=true){
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = "Bearer " + token;
  return h;
}

function show(id, data, ok=true){
  const el = document.getElementById(id);
  el.className = ok ? "token ok" : "token err";
  el.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

async function req(path, opts={}){
  const res = await fetch(base + path, opts);
  let body = null;
  try { body = await res.json(); } catch { body = { raw: await res.text() }; }
  if (!res.ok) throw body;
  return body;
}

async function registerUser(){
  try{
    const body = await req("/api/auth/register",{
      method:"POST",headers:headers(),body:JSON.stringify({
        email:document.getElementById("regEmail").value,
        password:document.getElementById("regPassword").value,
        fullName:document.getElementById("regName").value,
        role:document.getElementById("regRole").value
      })
    });
    token = body.token || token;
    if (body.token) localStorage.setItem("bhfl_token", token);
    renderToken();
    document.getElementById("authMsg").textContent = "Register success";
    show("out", body, true);
  }catch(e){ show("out", e, false); document.getElementById("authMsg").textContent = "Register failed"; }
}

async function loginUser(){
  try{
    const body = await req("/api/auth/login",{
      method:"POST",headers:headers(),body:JSON.stringify({
        email:document.getElementById("loginEmail").value,
        password:document.getElementById("loginPassword").value
      })
    });
    token = body.token || "";
    localStorage.setItem("bhfl_token", token);
    renderToken();
    document.getElementById("authMsg").textContent = "Login success";
    show("out", body, true);
  }catch(e){ show("out", e, false); document.getElementById("authMsg").textContent = "Login failed"; }
}

async function loadMe(){ try{ show("out", await req("/api/auth/me",{headers:headers(false)}), true);}catch(e){show("out",e,false);} }
async function callHealth(){ try{ show("healthOut", await req("/health"), true);}catch(e){show("healthOut",e,false);} }
async function callAdminTest(){ try{ show("healthOut", await req("/api/admin/test",{headers:headers(false)}), true);}catch(e){show("healthOut",e,false);} }

async function createEmployee(){
  try{
    const body = await req("/api/admin/employees",{
      method:"POST",headers:headers(),body:JSON.stringify({
        email:document.getElementById("empEmail").value,
        password:document.getElementById("empPassword").value,
        fullName:document.getElementById("empName").value,
        role:document.getElementById("empRole").value
      })
    });
    show("out", body, true); loadEmployees();
  }catch(e){ show("out", e, false); }
}

async function loadEmployees(){
  try{
    const body = await req("/api/admin/employees",{headers:headers(false)});
    const html = body.items.map(x=>"<tr><td>"+x.id+"</td><td>"+x.email+"</td><td>"+x.role+"</td><td>"+x.status+"</td></tr>").join("");
    document.getElementById("employeesBody").innerHTML = html;
    show("out", body, true);
  }catch(e){ show("out", e, false); }
}

async function createListing(){
  try{
    const body = await req("/api/admin/listings",{
      method:"POST",headers:headers(),body:JSON.stringify({
        title:document.getElementById("lstTitle").value,
        section:document.getElementById("lstSection").value,
        category:document.getElementById("lstCategory").value,
        status:document.getElementById("lstStatus").value,
        price:Number(document.getElementById("lstPrice").value || 0),
        city:document.getElementById("lstCity").value,
        province:document.getElementById("lstProvince").value,
        description:document.getElementById("lstDesc").value
      })
    });
    show("out", body, true); loadListings();
  }catch(e){ show("out", e, false); }
}

async function loadListings(){
  try{
    const body = await req("/api/admin/listings",{headers:headers(false)});
    const html = body.items.map(x=>"<tr><td>"+x.id+"</td><td>"+x.title+"</td><td>"+x.section+"</td><td>"+x.category+"</td><td>"+x.status+"</td></tr>").join("");
    document.getElementById("listingsBody").innerHTML = html;
    show("out", body, true);
  }catch(e){ show("out", e, false); }
}

async function uploadImages(){
  try{
    const id = document.getElementById("imgListingId").value;
    const files = document.getElementById("imgFiles").files;
    if(!id || !files || !files.length){ show("out","Need listing ID + files",false); return; }
    const fd = new FormData();
    for(const f of files) fd.append("images", f);
    const res = await fetch("/api/admin/listings/"+id+"/images",{method:"POST",headers:token?{"Authorization":"Bearer "+token}:{},body:fd});
    const body = await res.json();
    if(!res.ok) throw body;
    show("out", body, true);
  }catch(e){ show("out", e, false); }
}

callHealth();
</script>
</body>
</html>`);
});
