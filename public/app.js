const state = {
  authenticated: false,
  loading: false,
  tab: "today",
  selectedDate: todayString(),
  visibleMonth: monthStart(todayString()),
  items: [],
  editingItem: null,
  timeSelection: null,
  calendarSelection: null,
  suppressCalendarClick: false,
  lastCalendarClick: null,
  pinSubmitting: false
};

const PIN_LENGTH = 4;
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const ROUTINE_DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const EMOTION_GROUPS = [
  {
    name: "빨강",
    options: [
      { value: "빨강 5", color: "#7f1d1d", border: "#ef4444", text: "#fff7f7" },
      { value: "빨강 4", color: "#991b1b", border: "#f87171", text: "#fff7f7" },
      { value: "빨강 3", color: "#b91c1c", border: "#fca5a5", text: "#fff7f7" },
      { value: "빨강 2", color: "#dc2626", border: "#fecaca", text: "#fff7f7" },
      { value: "빨강 1", color: "#fca5a5", border: "#fee2e2", text: "#2a1111" }
    ]
  },
  {
    name: "파랑",
    options: [
      { value: "파랑 5", color: "#1e3a8a", border: "#60a5fa", text: "#f4f8ff" },
      { value: "파랑 4", color: "#1d4ed8", border: "#93c5fd", text: "#f4f8ff" },
      { value: "파랑 3", color: "#2563eb", border: "#bfdbfe", text: "#f4f8ff" },
      { value: "파랑 2", color: "#3b82f6", border: "#dbeafe", text: "#f4f8ff" },
      { value: "파랑 1", color: "#93c5fd", border: "#dbeafe", text: "#111827" }
    ]
  },
  {
    name: "초록",
    options: [
      { value: "초록 5", color: "#14532d", border: "#4ade80", text: "#f3fff6" },
      { value: "초록 4", color: "#166534", border: "#86efac", text: "#f3fff6" },
      { value: "초록 3", color: "#15803d", border: "#bbf7d0", text: "#f3fff6" },
      { value: "초록 2", color: "#22c55e", border: "#dcfce7", text: "#072b15" },
      { value: "초록 1", color: "#86efac", border: "#dcfce7", text: "#072b15" }
    ]
  }
];
const EMOTIONS = EMOTION_GROUPS.flatMap((group) => group.options);

const els = {
  appView: document.querySelector("#appView"),
  authMessage: document.querySelector("#authMessage"),
  authView: document.querySelector("#authView"),
  calendarTab: document.querySelector("#calendarTab"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  dateFields: document.querySelector("#dateFields"),
  dateInput: document.querySelector("#dateInput"),
  deleteButton: document.querySelector("#deleteButton"),
  dialog: document.querySelector("#itemDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  editingId: document.querySelector("#editingId"),
  endDateField: document.querySelector("#endDateField"),
  endDateInput: document.querySelector("#endDateInput"),
  endTimeInput: document.querySelector("#endTimeInput"),
  emotionTab: document.querySelector("#emotionTab"),
  itemForm: document.querySelector("#itemForm"),
  loginForm: document.querySelector("#loginForm"),
  noteInput: document.querySelector("#noteInput"),
  passwordInput: document.querySelector("#passwordInput"),
  priorityField: document.querySelector("#priorityField"),
  priorityInput: document.querySelector("#priorityInput"),
  routinesTab: document.querySelector("#routinesTab"),
  routineFields: document.querySelector("#routineFields"),
  scheduleFields: document.querySelector("#scheduleFields"),
  selectedDateLabel: document.querySelector("#selectedDateLabel"),
  startTimeLabel: document.querySelector("#startTimeLabel"),
  startTimeInput: document.querySelector("#startTimeInput"),
  endTimeLabel: document.querySelector("#endTimeLabel"),
  statusMessage: document.querySelector("#statusMessage"),
  titleInput: document.querySelector("#titleInput"),
  todayTab: document.querySelector("#todayTab"),
  typeInput: document.querySelector("#typeInput"),
  categoryInput: document.querySelector("#categoryInput")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  await checkAuth();
}

function bindEvents() {
  els.loginForm.addEventListener("submit", login);
  document.addEventListener("keydown", handlePinKeydown);
  document.querySelector("#logoutButton").addEventListener("click", logout);
  document.querySelector("#refreshButton").addEventListener("click", loadItems);
  els.closeDialogButton.addEventListener("click", () => els.dialog.close());
  els.typeInput.addEventListener("change", updateFormVisibility);
  els.itemForm.addEventListener("submit", saveItem);
  els.deleteButton.addEventListener("click", deleteCurrentItem);

  document.querySelectorAll(".bottom-nav button").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  document.body.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]");
    const pinKey = event.target.closest("[data-pin-key]");
    const pinDelete = event.target.closest("[data-pin-delete]");

    if (pinKey) {
      appendPinDigit(pinKey.dataset.pinKey);
      return;
    }

    if (pinDelete) {
      deletePinDigit();
      return;
    }

    if (!action) return;

    const id = action.dataset.id;
    if (action.dataset.action === "add") openItemDialog(action.dataset.type);
    if (action.dataset.action === "edit") openItemDialog(null, findItem(id));
    if (action.dataset.action === "toggle-task") {
      event.stopPropagation();
      await toggleTask(id);
    }
    if (action.dataset.action === "toggle-routine") {
      event.stopPropagation();
      await toggleRoutine(id);
    }
    if (action.dataset.action === "set-emotion") {
      event.stopPropagation();
      await saveEmotion(action.dataset.emotion);
    }
    if (action.dataset.action === "save-emotion-comment") {
      event.stopPropagation();
      await saveEmotion();
    }
    if (action.dataset.action === "select-date") {
      const selectedDate = action.dataset.date;
      if (state.tab === "calendar" && state.suppressCalendarClick) {
        state.suppressCalendarClick = false;
        state.lastCalendarClick = null;
        return;
      }

      const now = Date.now();
      const isDoubleClick = state.tab === "calendar" &&
        state.lastCalendarClick &&
        state.lastCalendarClick.date === selectedDate &&
        now - state.lastCalendarClick.at < 450;

      state.selectedDate = selectedDate;
      render();

      if (state.tab === "calendar" && isDoubleClick) {
        openCalendarScheduleDialog(state.selectedDate);
      } else if (state.tab === "calendar") {
        state.lastCalendarClick = { date: selectedDate, at: now };
      }
    }
    if (action.dataset.action === "month-prev") {
      state.visibleMonth = addMonths(state.visibleMonth, -1);
      await loadItems();
    }
    if (action.dataset.action === "month-next") {
      state.visibleMonth = addMonths(state.visibleMonth, 1);
      await loadItems();
    }
  });

  document.body.addEventListener("dblclick", (event) => {
    const action = event.target.closest('[data-action="select-date"]');
    if (!action || state.tab !== "calendar" || state.suppressCalendarClick || els.dialog.open) return;

    event.preventDefault();
    state.selectedDate = action.dataset.date;
    render();
    openCalendarScheduleDialog(state.selectedDate);
  });

  document.body.addEventListener("change", async (event) => {
    if (!event.target.matches("#emotionDateInput")) return;
    state.selectedDate = event.target.value || todayString();
    state.visibleMonth = monthStart(state.selectedDate);
    await loadItems();
  });

  document.body.addEventListener("pointerdown", startTimeSelection);
  document.body.addEventListener("pointermove", moveTimeSelection);
  document.body.addEventListener("pointerup", finishTimeSelection);
  document.body.addEventListener("pointercancel", cancelTimeSelection);
  document.body.addEventListener("pointerdown", startCalendarSelection);
  document.body.addEventListener("pointermove", moveCalendarSelection);
  document.body.addEventListener("pointerup", finishCalendarSelection);
  document.body.addEventListener("pointercancel", cancelCalendarSelection);
}

async function checkAuth() {
  const response = await api("/api/auth");
  state.authenticated = Boolean(response.authenticated);
  els.authView.hidden = state.authenticated;
  els.appView.hidden = !state.authenticated;
  if (state.authenticated) await loadItems();
}

async function login(event) {
  event.preventDefault();
  if (state.pinSubmitting) return;
  els.authMessage.textContent = "";
  const password = els.passwordInput.value;

  if (!new RegExp(`^\\d{${PIN_LENGTH}}$`).test(password)) {
    els.authMessage.textContent = "4자리 숫자를 입력하세요.";
    return;
  }

  state.pinSubmitting = true;
  try {
    await api("/api/auth", {
      method: "POST",
      body: { password }
    });
    setPinValue("");
    await checkAuth();
  } catch (error) {
    els.authMessage.textContent = authErrorMessage(error);
    setPinValue("");
  } finally {
    state.pinSubmitting = false;
  }
}

async function logout() {
  await api("/api/auth", { method: "DELETE" });
  state.authenticated = false;
  setPinValue("");
  els.authView.hidden = false;
  els.appView.hidden = true;
}

function authErrorMessage(error) {
  const payload = error.payload || {};
  if (payload.error === "login_locked") {
    return `${formatRetryAfter(payload.retryAfterSeconds)} 후 다시 시도하세요.`;
  }
  if (payload.remainingAttempts !== undefined) {
    return `비밀번호가 맞지 않습니다. ${payload.remainingAttempts}회 남았습니다.`;
  }
  return "비밀번호가 맞지 않습니다.";
}

function formatRetryAfter(seconds) {
  const value = Math.max(1, Number(seconds) || 1);
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  if (minutes && rest) return `${minutes}분 ${rest}초`;
  if (minutes) return `${minutes}분`;
  return `${rest}초`;
}

function appendPinDigit(digit) {
  if (els.authView.hidden || state.pinSubmitting || !/^\d$/.test(String(digit))) return;
  if (els.passwordInput.value.length >= PIN_LENGTH) return;
  setPinValue(`${els.passwordInput.value}${digit}`);
  if (els.passwordInput.value.length === PIN_LENGTH) {
    window.setTimeout(() => els.loginForm.requestSubmit(), 120);
  }
}

function deletePinDigit() {
  if (els.authView.hidden || state.pinSubmitting) return;
  setPinValue(els.passwordInput.value.slice(0, -1));
}

function setPinValue(value) {
  els.passwordInput.value = String(value || "").replace(/\D/g, "").slice(0, PIN_LENGTH);
  updatePinDots();
  if (els.authMessage.textContent && els.passwordInput.value) {
    els.authMessage.textContent = "";
  }
}

function updatePinDots() {
  document.querySelectorAll(".pin-dots span").forEach((dot, index) => {
    dot.classList.toggle("filled", index < els.passwordInput.value.length);
  });
}

function handlePinKeydown(event) {
  if (els.authView.hidden) return;
  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    appendPinDigit(event.key);
  }
  if (event.key === "Backspace") {
    event.preventDefault();
    deletePinDigit();
  }
  if (event.key === "Enter" && els.passwordInput.value.length === PIN_LENGTH) {
    event.preventDefault();
    els.loginForm.requestSubmit();
  }
}

async function loadItems() {
  setStatus("불러오는 중...");
  state.loading = true;
  const { start, end } = queryRange();

  try {
    const payload = await api(`/api/items?start=${start}&end=${end}`);
    state.items = payload.items || [];
    setStatus("");
    render();
  } catch (error) {
    state.items = [];
    render();
    setStatus(error.message || "Notion 데이터를 불러오지 못했습니다.");
  } finally {
    state.loading = false;
  }
}

function render() {
  els.selectedDateLabel.textContent = humanDate(state.selectedDate);
  renderTabs();
  renderToday();
  renderCalendar();
  renderEmotionTab();
  renderRoutines();
}

function renderTabs() {
  for (const view of [els.todayTab, els.calendarTab, els.emotionTab, els.routinesTab]) {
    view.hidden = true;
  }
  document.querySelectorAll(".bottom-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.tab);
  });

  const activeView = {
    today: els.todayTab,
    calendar: els.calendarTab,
    emotion: els.emotionTab,
    routines: els.routinesTab
  }[state.tab];
  activeView.hidden = false;
}

function renderToday() {
  const schedules = itemsFor("일정", state.selectedDate).sort(byStartTime);
  const todos = itemsFor("할일", state.selectedDate).sort(byDoneThenTitle);
  const timedTodos = todos.filter((item) => item.startTime);
  const timelineItems = [...schedules, ...timedTodos].sort(byStartTime);

  els.todayTab.innerHTML = `
    <section class="section">
      <div class="section-header">
        <h2>시간표</h2>
      </div>
      <div class="timeline">${renderTimeline(timelineItems)}</div>
    </section>
  `;
}

function renderTimeline(schedules) {
  return timeSlots().map((time) => {
    const slotItems = schedules.filter((item) => item.startTime === time);
    const body = slotItems.length
      ? slotItems.map(renderSchedulePill).join("")
      : `<span class="item-meta">비어 있음</span>`;

    return `
      <div class="slot" data-time-slot="${time}">
        <div class="slot-time">${time}</div>
        <div class="slot-body">${body}</div>
      </div>
    `;
  }).join("");
}

function renderSchedulePill(item) {
  return `
    <button type="button" class="item" data-action="edit" data-id="${item.id}">
      <span class="tag">${escapeHtml(item.type || item.category || "개인")}</span>
      <span class="item-main">
        <span class="item-title">${escapeHtml(item.title)}</span>
        <span class="item-meta">${item.startTime || ""} - ${item.endTime || ""}</span>
      </span>
      <span class="item-meta">›</span>
    </button>
  `;
}

function renderCalendar() {
  const days = calendarDays(state.visibleMonth);
  const monthLabel = state.visibleMonth.slice(0, 7);
  const selectedItems = state.items
    .filter((item) => isItemOnDate(item, state.selectedDate) && item.type !== "루틴" && !isEmotionItem(item))
    .sort(byStartTime);

  els.calendarTab.innerHTML = `
    <section class="section">
      <div class="month-header">
        <button type="button" data-action="month-prev">‹</button>
        <h2>${monthLabel}</h2>
        <button type="button" data-action="month-next">›</button>
      </div>
      <div class="calendar-grid">
        ${DAYS.map((day) => `<div class="weekday">${day}</div>`).join("")}
        ${days.map(renderCalendarDay).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>${humanDate(state.selectedDate)}</h2>
      </div>
      ${renderItemList(selectedItems, "mixed")}
    </section>
  `;
}

function renderCalendarDay(day) {
  const hasItems = state.items.some((item) => isItemOnDate(item, day.date) && item.type !== "루틴" && !isEmotionItem(item));
  const isSelected = day.date === state.selectedDate;
  const emotion = emotionRecord(day.date);
  const palette = emotion ? emotionPalette(emotion.emotion || emotion.mood) : null;
  const classes = [
    "day-cell",
    palette ? "has-emotion" : "",
    day.inMonth ? "" : "muted",
    isSelected ? "selected" : ""
  ].filter(Boolean).join(" ");
  const style = palette
    ? ` style="--emotion-bg:${palette.color}; --emotion-border:${palette.border}; --emotion-text:${palette.text};"`
    : "";

  return `
    <button type="button" class="${classes}" data-action="select-date" data-date="${day.date}"${style}>
      ${Number(day.date.slice(8, 10))}
      ${hasItems ? '<span class="dot"></span>' : ""}
    </button>
  `;
}

function renderEmotionTab() {
  const emotion = emotionRecord(state.selectedDate);

  els.emotionTab.innerHTML = `
    <section class="section">
      <input id="emotionDateInput" type="date" value="${state.selectedDate}" aria-label="감정 날짜">
      ${renderEmotionCheck(emotion)}
    </section>
  `;
}

function renderRoutines() {
  const routines = state.items.filter((item) => item.type === "루틴").sort(byTitle);

  els.routinesTab.innerHTML = `
    <section class="section">
      <div class="section-header">
        <h2>루틴</h2>
      </div>
      ${renderRoutineList(routines, true)}
    </section>
  `;
}

function renderItemList(items, mode) {
  if (!items.length) return `<div class="empty">등록된 항목이 없습니다.</div>`;

  return `
    <div class="item-list">
      ${items.map((item) => renderItem(item, mode)).join("")}
    </div>
  `;
}

function renderItem(item, mode) {
  const check = mode === "task"
    ? `<button type="button" class="checkbox" data-action="toggle-task" data-id="${item.id}">${item.completed ? "✓" : ""}</button>`
    : `<span class="tag">${escapeHtml(item.type || "")}</span>`;

  return `
    <div class="item ${item.completed ? "done" : ""}">
      ${check}
      <button type="button" class="item-main-button" data-action="edit" data-id="${item.id}">
        <span class="item-title">${escapeHtml(item.title)}</span>
        <span class="item-meta">${itemMeta(item)}</span>
      </button>
      <button type="button" class="edit-button" data-action="edit" data-id="${item.id}">›</button>
    </div>
  `;
}

function renderRoutineList(routines, showAll) {
  const list = showAll ? routines : routines.filter((routine) => isRoutineActive(routine, state.selectedDate));
  if (!list.length) return `<div class="empty">등록된 루틴이 없습니다.</div>`;

  return `
    <div class="item-list">
      ${list.map((routine) => {
        const record = routineRecord(routine.id, state.selectedDate);
        const done = Boolean(record && record.completed);
        return `
          <div class="item ${done ? "done" : ""}">
            <button type="button" class="checkbox" data-action="toggle-routine" data-id="${routine.id}">${done ? "✓" : ""}</button>
            <button type="button" class="item-main-button" data-action="edit" data-id="${routine.id}">
              <span class="item-title">${escapeHtml(routine.title)}</span>
              <span class="item-meta">${routineDaysLabel(routine)} · ${routineStreak(routine.id)}일 연속</span>
            </button>
            <button type="button" class="edit-button" data-action="edit" data-id="${routine.id}">›</button>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderEmotionCheck(emotion) {
  const selectedEmotion = emotion ? emotion.emotion || emotion.mood : "";
  const normalizedEmotion = normalizeEmotionValue(selectedEmotion);
  const note = emotion ? emotion.note : "";

  return `
    <div class="emotion-panel">
      <div class="emotion-grid" aria-label="감정 색상 선택">
        ${EMOTION_GROUPS.map((group) => `
          <div class="emotion-row" aria-label="${group.name}">
            ${group.options.map((option) => `
              <button
                type="button"
                class="emotion-button ${normalizedEmotion === option.value ? "selected" : ""}"
                data-action="set-emotion"
                data-emotion="${option.value}"
                aria-label="${option.value}"
                title="${option.value}"
                style="--emotion-swatch:${option.color}; --emotion-swatch-border:${option.border};"
              >
                <span class="emotion-dot" aria-hidden="true"></span>
              </button>
            `).join("")}
          </div>
        `).join("")}
      </div>
      <label>
        코멘트
        <textarea id="emotionComment" rows="3" maxlength="2000">${escapeHtml(note)}</textarea>
      </label>
      <button type="button" class="primary" data-action="save-emotion-comment">코멘트 저장</button>
    </div>
  `;
}

function itemMeta(item) {
  const parts = [];
  if (item.date) parts.push(item.date);
  if (item.endDate && item.endDate !== item.date) parts[parts.length - 1] = `${item.date}~${item.endDate}`;
  if (item.startTime) parts.push(`${item.startTime}-${item.endTime || ""}`);
  if (item.priority) parts.push(item.priority);
  if (item.category) parts.push(item.category);
  if (item.emotion || item.mood) parts.push(item.emotion || item.mood);
  return parts.map(escapeHtml).join(" · ");
}

function openItemDialog(type, item, defaults = {}) {
  state.editingItem = item || null;
  const selectedType = item ? item.type : type || "일정";

  els.dialogTitle.textContent = item ? "수정" : "추가";
  els.editingId.value = item ? item.id : "";
  els.typeInput.value = selectedType;
  els.titleInput.value = item ? item.title : "";
  els.dateInput.value = item && item.date ? item.date : defaults.date || state.selectedDate;
  els.endDateInput.value = item && item.endDate ? item.endDate : defaults.endDate || defaults.date || state.selectedDate;
  els.startTimeInput.value = item && item.startTime ? item.startTime : defaults.startTime || "08:00";
  els.endTimeInput.value = item && item.endTime ? item.endTime : defaults.endTime || "08:30";
  els.categoryInput.value = item && item.category ? item.category : "개인";
  els.priorityInput.value = item && item.priority ? item.priority : "보통";
  els.noteInput.value = item && item.note ? item.note : "";

  document.querySelectorAll('[name="repeatDay"]').forEach((input) => {
    input.checked = Boolean(item && item.repeatDays && item.repeatDays.includes(input.value));
  });

  els.deleteButton.hidden = !item;
  updateFormVisibility();
  els.dialog.showModal();
}

function openCalendarScheduleDialog(date) {
  state.lastCalendarClick = null;
  if (els.dialog.open) return;
  openItemDialog("일정", null, { date, endDate: date });
}

function updateFormVisibility() {
  const type = els.typeInput.value;
  els.dateFields.hidden = type === "루틴";
  els.endDateField.hidden = type !== "일정";
  els.scheduleFields.hidden = type !== "일정" && type !== "할일";
  els.routineFields.hidden = type !== "루틴";
  els.priorityField.hidden = type !== "할일";
  els.startTimeLabel.textContent = "시작";
  els.endTimeLabel.textContent = type === "할일" ? "마감" : "종료";
}

async function saveItem(event) {
  event.preventDefault();
  const type = els.typeInput.value;
  const id = els.editingId.value;
  const payload = {
    title: els.titleInput.value,
    type,
    category: els.categoryInput.value,
    note: els.noteInput.value
  };

  if (type !== "루틴") payload.date = els.dateInput.value || state.selectedDate;
  if (type === "일정") payload.endDate = els.endDateInput.value || payload.date;
  if (type === "일정" || type === "할일") {
    payload.startTime = els.startTimeInput.value;
    payload.endTime = els.endTimeInput.value;
  }
  if (type === "할일") payload.priority = els.priorityInput.value;
  if (type === "루틴") {
    payload.repeatDays = [...document.querySelectorAll('[name="repeatDay"]:checked')].map((input) => input.value);
  }

  try {
    if (id) {
      await api("/api/items", {
        method: "PATCH",
        body: { id, ...payload }
      });
    } else {
      await api("/api/items", {
        method: "POST",
        body: payload
      });
    }
    els.dialog.close();
    await loadItems();
  } catch (error) {
    setStatus(error.message || "저장하지 못했습니다.");
  }
}

async function deleteCurrentItem() {
  const id = els.editingId.value;
  if (!id) return;
  if (!window.confirm("삭제할까요?")) return;

  try {
    await api(`/api/items?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    els.dialog.close();
    await loadItems();
  } catch (error) {
    setStatus(error.message || "삭제하지 못했습니다.");
  }
}

async function toggleTask(id) {
  const item = findItem(id);
  if (!item) return;
  const completed = !item.completed;

  await api("/api/items", {
    method: "PATCH",
    body: {
      id,
      completed,
      status: completed ? "완료" : "예정"
    }
  });
  await loadItems();
}

async function toggleRoutine(id) {
  const routine = findItem(id);
  if (!routine) return;
  const existing = routineRecord(id, state.selectedDate);
  const completed = !(existing && existing.completed);

  if (existing) {
    await api("/api/items", {
      method: "PATCH",
      body: {
        id: existing.id,
        completed,
        status: completed ? "완료" : "예정"
      }
    });
  } else {
    await api("/api/items", {
      method: "POST",
      body: {
        title: `${routine.title} 기록`,
        type: "루틴기록",
        date: state.selectedDate,
        completed,
        status: completed ? "완료" : "예정",
        category: routine.category || "개인",
        sourceRoutineId: routine.id
      }
    });
  }

  await loadItems();
}

function startTimeSelection(event) {
  const slot = event.target.closest("[data-time-slot]");
  if (!slot || event.target.closest("button, input, textarea, select")) return;

  state.timeSelection = {
    pointerId: event.pointerId,
    startTime: slot.dataset.timeSlot,
    currentTime: slot.dataset.timeSlot,
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };
  slot.setPointerCapture?.(event.pointerId);
  markSelectedTimeSlots();
}

function moveTimeSelection(event) {
  if (!state.timeSelection || state.timeSelection.pointerId !== event.pointerId) return;

  const distance = Math.abs(event.clientX - state.timeSelection.startX) + Math.abs(event.clientY - state.timeSelection.startY);
  if (distance > 10) state.timeSelection.moved = true;

  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-time-slot]");
  if (!target) return;

  state.timeSelection.currentTime = target.dataset.timeSlot;
  markSelectedTimeSlots();
}

function finishTimeSelection(event) {
  if (!state.timeSelection || state.timeSelection.pointerId !== event.pointerId) return;

  const selection = state.timeSelection;
  const { startTime, endTime } = selectedTimeRange(selection.startTime, selection.currentTime);
  state.timeSelection = null;
  clearSelectedTimeSlots();

  if (event.target.closest("button, input, textarea, select")) return;

  openItemDialog(selection.moved ? "일정" : "할일", null, {
    date: state.selectedDate,
    startTime,
    endTime
  });
}

function cancelTimeSelection() {
  state.timeSelection = null;
  clearSelectedTimeSlots();
}

function startCalendarSelection(event) {
  if (state.tab !== "calendar") return;
  const day = event.target.closest("[data-date]");
  if (!day || event.target.closest('[data-action="month-prev"], [data-action="month-next"]')) return;

  state.calendarSelection = {
    pointerId: event.pointerId,
    startDate: day.dataset.date,
    currentDate: day.dataset.date,
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };
  day.setPointerCapture?.(event.pointerId);
  markSelectedCalendarDates();
}

function moveCalendarSelection(event) {
  if (!state.calendarSelection || state.calendarSelection.pointerId !== event.pointerId) return;

  const distance = Math.abs(event.clientX - state.calendarSelection.startX) + Math.abs(event.clientY - state.calendarSelection.startY);
  if (distance > 10) state.calendarSelection.moved = true;

  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-date]");
  if (!target) return;

  state.calendarSelection.currentDate = target.dataset.date;
  markSelectedCalendarDates();
}

function finishCalendarSelection(event) {
  if (!state.calendarSelection || state.calendarSelection.pointerId !== event.pointerId) return;

  const selection = state.calendarSelection;
  const range = selectedDateRange(selection.startDate, selection.currentDate);
  state.calendarSelection = null;
  clearSelectedCalendarDates();

  if (!selection.moved) return;

  state.lastCalendarClick = null;
  state.suppressCalendarClick = true;
  window.setTimeout(() => {
    state.suppressCalendarClick = false;
  }, 250);
  state.selectedDate = range.startDate;
  render();
  openItemDialog("일정", null, {
    date: range.startDate,
    endDate: range.endDate
  });
}

function cancelCalendarSelection() {
  state.calendarSelection = null;
  clearSelectedCalendarDates();
}

function markSelectedCalendarDates() {
  clearSelectedCalendarDates();
  if (!state.calendarSelection) return;

  const range = selectedDateRange(state.calendarSelection.startDate, state.calendarSelection.currentDate);
  document.querySelectorAll("[data-date]").forEach((day) => {
    const date = day.dataset.date;
    if (date >= range.startDate && date <= range.endDate) {
      day.classList.add("calendar-selecting");
    }
  });
}

function clearSelectedCalendarDates() {
  document.querySelectorAll(".day-cell.calendar-selecting").forEach((day) => day.classList.remove("calendar-selecting"));
}

function markSelectedTimeSlots() {
  clearSelectedTimeSlots();
  if (!state.timeSelection) return;

  const range = selectedTimeRange(state.timeSelection.startTime, state.timeSelection.currentTime);
  document.querySelectorAll("[data-time-slot]").forEach((slot) => {
    const time = slot.dataset.timeSlot;
    if (time >= range.startTime && time < range.endTime) {
      slot.classList.add("selecting");
    }
  });
}

function clearSelectedTimeSlots() {
  document.querySelectorAll(".slot.selecting").forEach((slot) => slot.classList.remove("selecting"));
}

function selectedTimeRange(firstTime, secondTime) {
  const times = timeSlots();
  const firstIndex = times.indexOf(firstTime);
  const secondIndex = times.indexOf(secondTime);
  const startIndex = Math.max(0, Math.min(firstIndex, secondIndex));
  const endIndex = Math.max(firstIndex, secondIndex) + 1;

  return {
    startTime: times[startIndex] || firstTime,
    endTime: nextTime(times[endIndex - 1] || secondTime)
  };
}

function selectedDateRange(firstDate, secondDate) {
  return {
    startDate: firstDate <= secondDate ? firstDate : secondDate,
    endDate: firstDate <= secondDate ? secondDate : firstDate
  };
}

function nextTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hour, minute + 30, 0);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

async function saveEmotion(nextEmotion) {
  const existing = emotionRecord(state.selectedDate);
  const comment = document.querySelector("#emotionComment")?.value || "";
  const emotion = normalizeEmotionValue(nextEmotion || (existing && (existing.emotion || existing.mood)));

  if (!emotion) {
    setStatus("감정 색을 먼저 골라주세요.");
    return;
  }

  const payload = {
    title: `${state.selectedDate} 감정 체크`,
    type: "감정",
    date: state.selectedDate,
    emotion,
    note: comment,
    completed: true,
    status: "완료"
  };

  try {
    if (existing) {
      await api("/api/items", {
        method: "PATCH",
        body: { id: existing.id, ...payload }
      });
    } else {
      await api("/api/items", {
        method: "POST",
        body: payload
      });
    }
    setStatus("감정 체크를 저장했습니다.");
    await loadItems();
  } catch (error) {
    setStatus(error.message || "감정 체크를 저장하지 못했습니다.");
  }
}

function setTab(tab) {
  state.tab = tab;
  state.lastCalendarClick = null;
  render();
}

function findItem(id) {
  return state.items.find((item) => item.id === id);
}

function itemsFor(type, date) {
  return state.items.filter((item) => item.type === type && (type === "일정" ? isItemOnDate(item, date) : item.date === date));
}

function isItemOnDate(item, date) {
  if (!item || !item.date || !date) return false;
  const range = selectedDateRange(item.date, item.endDate || item.date);
  return date >= range.startDate && date <= range.endDate;
}

function activeRoutines(date) {
  return state.items.filter((item) => item.type === "루틴" && isRoutineActive(item, date));
}

function isRoutineActive(routine, date) {
  if (!routine.repeatDays || routine.repeatDays.length === 0) return true;
  return routine.repeatDays.includes(ROUTINE_DAYS[new Date(`${date}T00:00:00`).getDay()]);
}

function routineRecord(routineId, date) {
  return state.items.find((item) => item.type === "루틴기록" && item.sourceRoutineId === routineId && item.date === date);
}

function emotionRecord(date) {
  return state.items.find((item) => isEmotionItem(item) && item.date === date);
}

function isEmotionItem(item) {
  return item.type === "감정" || item.type === "기분";
}

function routineStreak(routineId) {
  let streak = 0;
  let date = state.selectedDate;

  while (routineRecord(routineId, date)?.completed) {
    streak += 1;
    date = addDays(date, -1);
  }

  return streak;
}

function routineDaysLabel(routine) {
  return routine.repeatDays && routine.repeatDays.length ? routine.repeatDays.join(", ") : "매일";
}

function emotionColor(emotion) {
  return {
    "나쁨": "빨강 3",
    "애매함": "파랑 3",
    "좋음": "초록 3"
  }[emotion] || emotion || "";
}

function normalizeEmotionValue(emotion) {
  return emotionColor(emotion);
}

function emotionPalette(emotion) {
  const normalized = normalizeEmotionValue(emotion);
  return EMOTIONS.find((option) => option.value === normalized);
}

function queryRange() {
  const start = addDays(monthStart(state.visibleMonth), -45);
  const end = addDays(monthEnd(state.visibleMonth), 7);
  return { start, end };
}

function timeSlots() {
  const slots = [];
  for (let hour = 8; hour < 22; hour += 1) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
}

function calendarDays(monthDate) {
  const first = monthStart(monthDate);
  const start = addDays(first, -new Date(`${first}T00:00:00`).getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      inMonth: date.slice(0, 7) === monthDate.slice(0, 7)
    };
  });
}

function todayString() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function monthStart(date) {
  return `${date.slice(0, 7)}-01`;
}

function monthEnd(date) {
  const [year, month] = date.slice(0, 7).split("-").map(Number);
  return toDateString(new Date(year, month, 0));
}

function addDays(date, amount) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + amount);
  return toDateString(next);
}

function addMonths(date, amount) {
  const next = new Date(`${date.slice(0, 7)}-01T00:00:00`);
  next.setMonth(next.getMonth() + amount);
  return toDateString(next).slice(0, 8) + "01";
}

function toDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function humanDate(date) {
  const target = new Date(`${date}T00:00:00`);
  const label = target.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  });
  return label;
}

function byStartTime(a, b) {
  return String(a.startTime || "99:99").localeCompare(String(b.startTime || "99:99"));
}

function byDoneThenTitle(a, b) {
  return Number(a.completed) - Number(b.completed) || byTitle(a, b);
}

function byTitle(a, b) {
  return String(a.title || "").localeCompare(String(b.title || ""), "ko");
}

function setStatus(message) {
  els.statusMessage.textContent = message;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || payload.error || "요청에 실패했습니다.");
    error.payload = payload;
    throw error;
  }

  return payload;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
