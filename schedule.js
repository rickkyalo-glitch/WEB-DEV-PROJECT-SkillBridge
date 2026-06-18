// schedule.js — Person 4: calendar, sessions panel, booking, reviews

let calYear = 2026;
let calMonth = 4; // 0-indexed: 4 = May
let selectedDate = null;
let selectedStar = 0;

function renderCalendar() {
  const el = document.getElementById("calendar-card");

  const sessionDays = new Set(
    SESSIONS
      .filter(s => { const d = new Date(s.date); return d.getFullYear() === calYear && d.getMonth() === calMonth; })
      .map(s => new Date(s.date).getDate())
  );

  // getDay() returns 0 for Sunday — shift so the grid starts on Monday
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();

  let cells = "";
  for (let i = 0; i < offset; i++) cells += `<div></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday    = today.getDate() === d && today.getMonth() === calMonth && today.getFullYear() === calYear;
    const isSelected = selectedDate?.d === d && selectedDate?.m === calMonth && selectedDate?.y === calYear;
    const hasSession = sessionDays.has(d);

    const cellStyle = isSelected ? "bg-[#111] text-white"
      : isToday ? "border border-emerald-400 text-emerald-600 font-semibold"
      : "hover:bg-[#FAFAFA] text-[#333]";

    const dot = hasSession
      ? `<span class="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}"></span>`
      : "";

    cells += `<div onclick="selectDay(${d})" class="aspect-square flex items-center justify-center rounded-xl text-sm relative cursor-pointer transition-all ${cellStyle}">${d}${dot}</div>`;
  }

  el.innerHTML = `
    <div class="flex items-center justify-between mb-5">
      <span class="font-semibold text-base" style="font-family:'Space Grotesk',sans-serif;">${MONTH_NAMES[calMonth]} ${calYear}</span>
      <div class="flex gap-2">
        <button onclick="changeMonth(-1)" class="w-8 h-8 flex items-center justify-center border border-[#E5E5E5] rounded-xl text-[#666] hover:text-[#111] hover:bg-[#FAFAFA] transition-all text-sm">‹</button>
        <button onclick="changeMonth(1)" class="w-8 h-8 flex items-center justify-center border border-[#E5E5E5] rounded-xl text-[#666] hover:text-[#111] hover:bg-[#FAFAFA] transition-all text-sm">›</button>
      </div>
    </div>
    <div class="grid grid-cols-7 gap-1.5">
      ${WEEK_DAYS.map(d => `<div class="text-center text-xs font-semibold uppercase tracking-wider text-[#bbb] py-1">${d}</div>`).join("")}
      ${cells}
    </div>`;
}

function changeMonth(direction) {
  const d = new Date(calYear, calMonth + direction, 1);
  calYear = d.getFullYear();
  calMonth = d.getMonth();
  renderCalendar();
}

function selectDay(d) {
  selectedDate = { d, m: calMonth, y: calYear };
  renderCalendar();
  renderSessions();
}

function renderSessions() {
  const el = document.getElementById("sessions-card");

  const list = selectedDate
    ? SESSIONS.filter(s => { const d = new Date(s.date); return d.getDate() === selectedDate.d && d.getMonth() === selectedDate.m; })
    : SESSIONS.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

  const title = selectedDate ? formatDate(new Date(selectedDate.y, selectedDate.m, selectedDate.d)) : "Upcoming sessions";

  const rows = list.length === 0
    ? `<div class="text-center py-8 text-[#999] text-sm">No sessions${selectedDate ? " on this day" : ""}</div>`
    : list.map(s => `
        <div class="flex items-start gap-3 py-3.5 border-b border-[#F0F0F0] last:border-0">
          <div class="w-10 flex-shrink-0 text-center"><div class="font-semibold text-emerald-600 text-xs">${s.time}</div></div>
          <div class="w-2 h-2 rounded-full mt-1 flex-shrink-0" style="background:${s.color}"></div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-[#111]">${s.with}</div>
            <div class="text-xs text-[#777]">${s.skill}</div>
            <div class="text-xs text-[#bbb]">${s.dur} min</div>
          </div>
          ${!s.reviewed
            ? `<button onclick="openReview(${s.id})" class="text-xs px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl font-semibold hover:bg-amber-500 hover:text-white transition-all">Rate</button>`
            : `<span class="text-xs text-emerald-600">✓</span>`}
        </div>`).join("");

  el.innerHTML = `
    <div class="font-semibold text-sm mb-3.5" style="font-family:'Space Grotesk',sans-serif;">${title}</div>
    ${rows}
    <button onclick="openModal('mo-session')" class="w-full mt-4 py-2.5 bg-[#111] hover:bg-emerald-600 text-white rounded-2xl text-xs font-semibold transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">+ Schedule a session</button>`;
}

function bookSession() {
  const withUser = document.getElementById("sess-with").value;
  const skill    = document.getElementById("sess-skill").value.trim();
  const date     = document.getElementById("sess-date").value;
  const time     = document.getElementById("sess-time").value;
  const dur      = parseInt(document.getElementById("sess-dur").value);

  if (!skill || !date || !time) { showToast("Please fill in all fields", "error"); return; }

  SESSIONS.push({ id: nextId++, with: withUser, skill, date, time, dur, color: getAvatarColor(withUser), reviewed: false });

  closeModal("mo-session");
  renderCalendar();
  renderSessions();
  showToast(`Session booked with ${withUser} ✓`, "success");
}

function openReview(sessionId) {
  const session = SESSIONS.find(s => s.id === sessionId);
  if (!session) return;

  selectedStar = 0;
  renderStars(0);
  document.getElementById("review-session-info").textContent = `${session.with} · ${session.skill}`;
  document.getElementById("mo-review").dataset.sessionId = sessionId; // stash id on the modal itself
  openModal("mo-review");
}

function setStar(n) {
  selectedStar = n;
  renderStars(n);
}

function renderStars(n) {
  document.querySelectorAll(".star").forEach((star, i) => {
    star.className = `star text-3xl leading-none cursor-pointer transition-colors ${i < n ? "text-amber-500" : "text-[#DDD] hover:text-amber-300"}`;
  });
}

function submitReview() {
  if (!selectedStar) { showToast("Please select a rating", "error"); return; }

  const sessionId = parseInt(document.getElementById("mo-review").dataset.sessionId);
  const session = SESSIONS.find(s => s.id === sessionId);
  if (session) session.reviewed = true;

  myCoins += 1;
  updateCoins();
  closeModal("mo-review");
  renderSessions();
  showToast("Review submitted · +1 Skill Coin ◈", "success");
}
