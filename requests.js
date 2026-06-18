// requests.js — Person 3: incoming/sent/accepted tabs, accept/decline

let activeReqTab = "incoming";

function updateReqBadge() {
  const count = REQUESTS.filter(r => r.status === "incoming").length;
  document.getElementById("req-dot").style.display = count > 0 ? "block" : "none";
  document.getElementById("in-count").textContent = count > 0 ? `(${count})` : "";
}

function setReqTab(tab, el) {
  activeReqTab = tab;
  document.querySelectorAll(".rtab").forEach(t => t.classList.remove("on"));
  el.classList.add("on");
  renderRequests();
}

function renderRequests() {
  const list = REQUESTS.filter(r => r.status === activeReqTab);
  const el = document.getElementById("req-list");

  if (!list.length) {
    el.innerHTML = `
      <div class="text-center py-16 text-[#999]">
        <div class="text-4xl mb-3">📬</div>
        <div class="font-semibold text-[#444] mb-1">Nothing here yet</div>
        <div class="text-sm">
          ${activeReqTab === "incoming"
            ? "Requests will appear here when someone wants to swap."
            : "Send a request from the Discover page."}
        </div>
      </div>`;
    return;
  }

  el.innerHTML = list.map(r => requestCardHTML(r)).join("");
}

function requestCardHTML(req) {
  const userId = req.toId || req.fromId;
  const user = USERS.find(u => u.id === userId);
  if (!user) return "";

  const isIncoming = req.status === "incoming";
  const isAccepted = req.status === "accepted";
  const isCoin = req.type === "coin";

  const exchangeLine = isCoin
    ? `<span class="text-xs font-semibold text-amber-600">◈ Coin request</span><span class="text-[#bbb]">→</span>${skillTagHTML(req.want, "want")}`
    : `${skillTagHTML(req.offer, "offer")}<span class="text-[#bbb]">⇄</span>${skillTagHTML(req.want, "want")}`;

  const actions = isIncoming
    ? `<button onclick="acceptReq(${req.id})" class="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-all">Accept</button>
       <button onclick="declineReq(${req.id})" class="px-3.5 py-2 border border-[#E5E5E5] text-[#666] rounded-2xl text-xs font-semibold hover:text-red-600 hover:border-red-200 transition-all bg-white">Decline</button>`
    : isAccepted
      ? `<span class="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold">✓ Active</span>`
      : `<span class="px-3.5 py-1.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-semibold">Pending</span>`;

  return `
    <div class="card flex gap-3.5" id="rcard-${req.id}">
      ${avatarHTML(user.name, user.initials)}
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-sm mb-0.5">${user.name}</div>
        <div class="text-xs text-[#999] mb-2.5">${user.dept} · ★ ${user.rating} (${user.reviews} reviews)</div>
        <div class="flex items-center gap-2 flex-wrap mb-2.5">${exchangeLine}</div>
        <p class="text-xs text-[#777] italic border-l-2 border-[#EEE] pl-2.5 mb-1">"${req.msg}"</p>
        <div class="text-xs text-[#bbb]">${req.time}</div>
      </div>
      <div class="flex flex-col gap-2 flex-shrink-0">${actions}</div>
    </div>`;
}

function acceptReq(id) {
  const req = REQUESTS.find(r => r.id === id);
  if (!req) return;

  req.status = "accepted";
  myCoins += 2;
  updateCoins();
  renderRequests();
  updateReqBadge();
  showToast("Exchange accepted! +2 Skill Coins ◈", "success");
}

function declineReq(id) {
  const card = document.getElementById("rcard-" + id);
  if (!card) return;

  card.style.opacity = "0.3";
  card.style.pointerEvents = "none";

  setTimeout(() => {
    REQUESTS = REQUESTS.filter(r => r.id !== id);
    renderRequests();
    updateReqBadge();
  }, 400); // matches the fade so the card doesn't just vanish
}
