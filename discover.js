// discover.js — Person 1: search, filters, user cards, request modal

let activeTag = "";
let exchangeType = "swap";
let currentMoUser = null;

function renderDiscover() {
  renderTagFilters();

  const query = document.getElementById("search-input").value.toLowerCase();
  let list = [...USERS];

  if (activeTag) {
    list = list.filter(u => [...u.offers, ...u.wants].some(s => s.toLowerCase().includes(activeTag.toLowerCase())));
  }
  if (query) {
    list = list.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.dept.toLowerCase().includes(query) ||
      [...u.offers, ...u.wants].some(s => s.toLowerCase().includes(query))
    );
  }
  list.sort((a, b) => calcMatch(b) - calcMatch(a));

  const grid = document.getElementById("users-grid");
  if (!list.length) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-20 text-[#999]">
        <div class="text-4xl mb-3">🔍</div>
        <div class="font-semibold text-[#444] mb-1">No results</div>
        <div class="text-sm">Try a different search or clear the filter</div>
      </div>`;
    return;
  }

  grid.innerHTML = list.map((u, i) => userCardHTML(u, i)).join("");

  // bars start at 0% in the HTML so they can animate up after painting
  requestAnimationFrame(() => {
    list.forEach((u, i) => {
      const bar = document.getElementById("bar-" + u.id);
      if (bar) setTimeout(() => { bar.style.width = calcMatch(u) + "%"; }, 50 + i * 30);
    });
  });
}

function renderTagFilters() {
  document.getElementById("skill-filters").innerHTML = SKILL_TAGS.map(tag => `
    <button onclick="setTag('${tag}')"
            class="px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                   ${activeTag === tag
                     ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                     : "border-[#E5E5E5] text-[#666] hover:border-[#ccc] hover:text-[#111] bg-white"}">
      ${tag}
    </button>`).join("");
}

function setTag(tag) {
  activeTag = activeTag === tag ? "" : tag; // click again to clear
  renderDiscover();
}

function userCardHTML(user, index) {
  const match    = calcMatch(user);
  const isSent   = sentSet.has(user.id);
  const isMutual = match > 40;

  const mutualBadge = isMutual
    ? `<div class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 mb-3">⇄ Mutual benefit match</div>`
    : "";

  return `
    <div class="card hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 relative"
         style="animation-delay:${index * 0.04}s">

      <div class="flex items-center gap-3 mb-3">
        ${avatarHTML(user.name, user.initials, "md", user.online)}
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm text-[#111] truncate">${user.name}</div>
          <div class="text-xs text-[#999] truncate">${user.dept}</div>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-xs font-semibold text-amber-600">★ ${user.rating} <span class="text-[#bbb] font-normal">(${user.reviews})</span></div>
          <div class="text-xs text-[#999]">${user.swaps} swaps</div>
        </div>
      </div>

      ${mutualBadge}

      <div class="mb-2">
        <div class="text-xs uppercase tracking-wider text-[#aaa] font-semibold mb-1.5">Can teach</div>
        <div class="flex flex-wrap gap-1.5">${user.offers.map(s => skillTagHTML(s, "offer")).join("")}</div>
      </div>
      <div class="mb-3">
        <div class="text-xs uppercase tracking-wider text-[#aaa] font-semibold mb-1.5">Wants to learn</div>
        <div class="flex flex-wrap gap-1.5">${user.wants.map(s => skillTagHTML(s, "want")).join("")}</div>
      </div>

      <div class="flex justify-between text-xs text-[#999] mb-1">
        <span>Skill compatibility</span>
        <span class="text-emerald-600 font-semibold">${match}%</span>
      </div>
      <div class="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div id="bar-${user.id}" class="h-full rounded-full"
             style="width:0%;background:linear-gradient(90deg,#10B981,#34D399);transition:width 0.6s cubic-bezier(0.23,1,0.32,1)"></div>
      </div>

      <button onclick="${isSent ? "" : `openReqModal(${user.id})`}"
              class="w-full mt-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300
                     ${isSent
                       ? "bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-default"
                       : "bg-[#111] text-white hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-emerald-600"}">
        ${isSent ? "✓ Request sent" : "Request exchange →"}
      </button>
    </div>`;
}

function openReqModal(userId) {
  const user = USERS.find(u => u.id === userId);
  if (!user || sentSet.has(userId)) return;
  currentMoUser = user;

  document.getElementById("mo-req-user-info").innerHTML = `
    ${avatarHTML(user.name, user.initials, "sm")}
    <div>
      <div class="font-semibold text-sm">${user.name}</div>
      <div class="text-xs text-[#999]">★ ${user.rating} · ${user.reviews} reviews</div>
    </div>`;

  document.getElementById("req-offer-sel").innerHTML =
    (myOffers.length ? myOffers : ["Add skills to your profile first"]).map(s => `<option>${s}</option>`).join("");

  const theirOptions = user.offers.map(s => `<option>${s}</option>`).join("");
  document.getElementById("req-want-sel").innerHTML      = theirOptions;
  document.getElementById("req-coin-want-sel").innerHTML = theirOptions;

  document.getElementById("modal-coin-count").textContent = myCoins;
  document.getElementById("req-msg").value = "";

  setExchangeType("swap", document.querySelector(".etog[data-type='swap']"));
  openModal("mo-req");
}

function setExchangeType(type, el) {
  exchangeType = type;
  document.querySelectorAll(".etog").forEach(b => b.classList.remove("on"));
  el.classList.add("on");
  document.getElementById("swap-fields").style.display = type === "swap" ? "block" : "none";
  document.getElementById("coin-fields").style.display = type === "coin" ? "block" : "none";
}

function sendRequest() {
  if (!currentMoUser) return;

  const msg = document.getElementById("req-msg").value.trim();
  if (!msg) { showToast("Please add a message", "error"); return; }

  if (exchangeType === "coin") {
    if (myCoins < 3) { showToast("Not enough Skill Coins!", "error"); return; }
    myCoins -= 3;
    updateCoins();
    showToast("3 Skill Coins spent · Request sent ✓", "success");
  } else {
    showToast(`Request sent to ${currentMoUser.name} ✓`, "success");
  }

  const offer = exchangeType === "swap" ? document.getElementById("req-offer-sel").value : null;
  const want  = exchangeType === "swap"
    ? document.getElementById("req-want-sel").value
    : document.getElementById("req-coin-want-sel").value;

  REQUESTS.push({
    id: nextId++, fromId: currentMoUser.id, toId: currentMoUser.id,
    offer, want, type: exchangeType, msg, time: "Just now", status: "sent",
  });

  sentSet.add(currentMoUser.id);
  closeModal("mo-req");
  renderDiscover();
  updateReqBadge();
  currentMoUser = null;
}
