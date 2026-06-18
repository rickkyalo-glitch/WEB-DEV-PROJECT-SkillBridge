// utils.js — shared state, helpers, nav, boot
// Loaded after data.js, before all feature files

let myOffers = ["Python", "Flask", "Git"];
let myWants  = ["UI Design", "Spanish", "Piano"];
let myCoins  = 12;
let activePage = "discover";
const sentSet = new Set([3]); // ids already requested
let nextId = 100;

// Same name always gives the same colour (like Slack/GitHub avatars)
function getAvatarColor(name) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Bidirectional match: do they teach what I want, and do I teach what they want?
function calcMatch(user) {
  const lower = s => s.toLowerCase();
  const theyTeachMe = user.offers.filter(s => myWants.some(w => lower(s).includes(lower(w)) || lower(w).includes(lower(s)))).length;
  const iTeachThem  = user.wants.filter(s => myOffers.some(o => lower(s).includes(lower(o)) || lower(o).includes(lower(s)))).length;
  const total = Math.max(1, myOffers.length + myWants.length);
  return Math.min(97, Math.round(((theyTeachMe + iTeachThem) / total) * 120)); // capped so it never feels like a guaranteed 100%
}

function formatDate(date) {
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function avatarHTML(name, initials, size = "md", showOnline = false) {
  const color = getAvatarColor(name);
  const sizeClass = { sm: "w-8 h-8 text-xs", md: "w-11 h-11 text-sm", lg: "w-16 h-16 text-2xl" }[size];
  const dot = showOnline ? `<span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>` : "";
  return `
    <div class="relative inline-flex flex-shrink-0">
      <div class="${sizeClass} rounded-full flex items-center justify-center font-semibold" style="background:${color}1A;color:${color}">${initials}</div>
      ${dot}
    </div>`;
}

function skillTagHTML(label, variant = "offer", showRemove = false, index = 0) {
  const colorClass = variant === "offer"
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : "bg-violet-50 text-violet-700 border-violet-100";
  const removeBtn = showRemove
    ? `<button onclick="removeSkill('${variant}', ${index})" class="opacity-50 hover:opacity-100 hover:text-red-500 ml-0.5">×</button>`
    : "";
  return `<span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClass}">${label}${removeBtn}</span>`;
}

function updateCoins() {
  document.querySelectorAll(".coin-count").forEach(el => el.textContent = myCoins);
}

function showToast(msg, type = "") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast";
  if (type) toast.classList.add(type);
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function openModal(id)  { document.getElementById(id).classList.add("on"); }
function closeModal(id) { document.getElementById(id).classList.remove("on"); }

function nav(page) {
  activePage = page;
  document.querySelectorAll(".page").forEach(p => p.classList.remove("on"));
  document.getElementById("page-" + page).classList.add("on");
  document.querySelectorAll(".ntab").forEach(t => t.classList.remove("on"));
  document.querySelector(`.ntab[data-page="${page}"]`).classList.add("on");

  if (page === "discover") renderDiscover();
  if (page === "profile")  renderProfile();
  if (page === "requests") renderRequests();
  if (page === "schedule") { renderCalendar(); renderSessions(); }
}

function boot() {
  const navAv = document.getElementById("nav-av");
  navAv.textContent = ME.initials;
  navAv.style.background = ME.color + "1A";
  navAv.style.color = ME.color;

  document.getElementById("sess-with").innerHTML = USERS.map(u => `<option>${u.name}</option>`).join("");
  document.getElementById("sess-date").value = new Date().toISOString().split("T")[0];

  document.querySelectorAll(".mo").forEach(modal => {
    modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("on"); });
  });

  updateCoins();
  renderDiscover();
  updateReqBadge();
}

window.addEventListener("DOMContentLoaded", boot);
