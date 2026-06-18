// profile.js — Person 2: profile card, skill sections, add/remove

function renderProfile() {
  renderProfileCard();
  renderSkillSections();
}

function renderProfileCard() {
  document.getElementById("profile-card").innerHTML = `
    <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold mb-4"
         style="background:${ME.color}1A;color:${ME.color}">${ME.initials}</div>

    <div class="font-semibold text-lg mb-0.5" style="font-family:'Space Grotesk',sans-serif;">${ME.name}</div>
    <div class="text-sm text-[#666] mb-1">${ME.dept} · ${ME.unit}</div>
    <div class="text-xs text-[#aaa] mb-5">Member since May 2026</div>

    <div class="grid grid-cols-3 gap-2 mb-4">
      ${[
        [myOffers.length + myWants.length, "Skills"],
        [SESSIONS.length, "Sessions"],
        ["4.8 ★", "Rating"],
      ].map(([num, label]) => `
        <div class="bg-[#FAFAFA] border border-[#EEE] rounded-2xl p-2.5 text-center">
          <div class="font-semibold text-emerald-600 text-lg">${num}</div>
          <div class="text-xs text-[#999] uppercase tracking-wide mt-0.5">${label}</div>
        </div>`).join("")}
    </div>

    <div class="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl p-3.5 mb-3">
      <div>
        <div class="text-xs font-semibold text-amber-700">◈ Skill Coins</div>
        <div class="text-xs text-[#999]">For asymmetric exchanges</div>
      </div>
      <div class="text-2xl font-semibold text-amber-600 coin-count">${myCoins}</div>
    </div>

    <div class="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-2xl px-3.5 py-2.5 mb-5">
      ⇄ Not a CV platform — a community exchange
    </div>

    <button onclick="nav('discover')" class="w-full py-2.5 bg-[#111] hover:bg-emerald-600 text-white rounded-2xl text-xs font-semibold mb-2 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">Find matches →</button>
    <button onclick="nav('requests')" class="w-full py-2.5 border border-[#E5E5E5] hover:border-[#ccc] text-[#444] rounded-2xl text-xs font-semibold transition-all bg-white">View requests</button>`;
}

function renderSkillSections() {
  document.getElementById("skill-sections").innerHTML =
    buildSkillSection("offer", myOffers, "Skills I can teach",    "bg-emerald-500", "e.g. Python, Guitar…") +
    buildSkillSection("want",  myWants,  "Skills I want to learn", "bg-violet-500",  "e.g. Spanish, React…");
}

function buildSkillSection(type, skills, title, dotColor, placeholder) {
  return `
    <div class="card">
      <div class="flex items-center gap-2 mb-3.5">
        <span class="w-2 h-2 rounded-full ${dotColor}"></span>
        <span class="font-semibold text-sm" style="font-family:'Space Grotesk',sans-serif;">${title}</span>
        <span class="ml-auto text-xs text-[#aaa]">${skills.length} skill${skills.length !== 1 ? "s" : ""}</span>
      </div>

      <div class="flex flex-wrap gap-2 mb-4">
        ${skills.length === 0
          ? `<span class="text-xs text-[#aaa]">None added yet</span>`
          : skills.map((s, i) => skillTagHTML(s, type, true, i)).join("")}
      </div>

      <div class="flex gap-2">
        <input id="add-${type}-input" placeholder="${placeholder}"
               onkeydown="if(event.key==='Enter') addSkill('${type}')"
               class="flex-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl px-3.5 py-2.5 text-sm text-[#111] outline-none focus:border-emerald-400 focus:bg-white placeholder-[#aaa]"/>
        <button onclick="addSkill('${type}')"
                class="px-4 py-2.5 bg-[#111] hover:bg-emerald-600 text-white rounded-2xl text-xs font-semibold transition-all">+ Add</button>
      </div>
    </div>`;
}

function addSkill(type) {
  const input = document.getElementById("add-" + type + "-input");
  const value = input.value.trim();
  if (!value) return;

  const arr = type === "offer" ? myOffers : myWants;
  if (arr.some(s => s.toLowerCase() === value.toLowerCase())) {
    showToast("Already in your list");
    return;
  }

  arr.push(value);
  input.value = "";

  if (type === "offer") {
    myCoins += 1; // reward for adding something you can teach
    updateCoins();
    showToast(`${value} added · +1 Skill Coin ◈`, "success");
  } else {
    showToast(`${value} added ✓`, "success");
  }

  renderProfile();
  renderDiscover(); // match scores depend on myOffers/myWants
}

function removeSkill(type, index) {
  const arr = type === "offer" ? myOffers : myWants;
  const removed = arr[index];
  arr.splice(index, 1);

  renderProfile();
  renderDiscover();
  showToast(`${removed} removed`);
}
