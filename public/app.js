const state = {
  authenticated: false,
  loading: false,
  tab: "today",
  selectedDate: todayString(),
  visibleMonth: monthStart(todayString()),
  items: [],
  itemTimeMemory: {},
  editingItem: null,
  timeSelection: null,
  selectedTimeRange: null,
  selectedTimelineItem: null,
  timeClickTimer: null,
  timeSelectionHoldTimer: null,
  timelineDrag: null,
  timelineResize: null,
  suppressTimelineItemClick: false,
  calendarSelection: null,
  selectedCalendarSchedule: null,
  calendarScheduleResize: null,
  calendarScheduleDrag: null,
  calendarZoom: 1.48,
  calendarZoomGesture: null,
  calendarZoomPulse: false,
  calendarZoomPulseTimer: null,
  suppressCalendarScheduleClick: false,
  suppressCalendarClick: false,
  lastCalendarClick: null,
  selectedEmotionDate: null,
  selectedChallengeLayer: null,
  challengeAnalysis: null,
  challengeRenderToken: 0,
  lastEmotionClick: null,
  emotionClickTimer: null,
  suppressEmotionDblclick: false,
  picker: null,
  emotionSaving: false,
  challengeSaving: false,
  pinSubmitting: false
};

const PIN_LENGTH = 4;
const CALENDAR_ZOOM_MIN = 0.76;
const CALENDAR_ZOOM_MAX = 1.48;
const CALENDAR_ZOOM_DEFAULT = CALENDAR_ZOOM_MAX;
const CALENDAR_ZOOM_STEP = 0.12;
const TIMELINE_TOUCH_HOLD_DELAY = 260;
const TIMELINE_TOUCH_MOVE_CANCEL_DISTANCE = 10;
const CHALLENGE_CANVAS_WIDTH = 720;
const CHALLENGE_WHITE_THRESHOLD = 250;
const CHALLENGE_MIN_LAYER_AREA = 400;
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const ROUTINE_DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const EMOTION_GROUPS = [
  {
    name: "빨강",
    options: [
      { value: "빨강 1", color: "#fca5a5", border: "#fee2e2", text: "#2a1111" },
      { value: "빨강 2", color: "#dc2626", border: "#fecaca", text: "#fff7f7" },
      { value: "빨강 3", color: "#b91c1c", border: "#fca5a5", text: "#fff7f7" },
      { value: "빨강 4", color: "#991b1b", border: "#f87171", text: "#fff7f7" },
      { value: "빨강 5", color: "#7f1d1d", border: "#ef4444", text: "#fff7f7" }
    ]
  },
  {
    name: "파랑",
    options: [
      { value: "파랑 1", color: "#93c5fd", border: "#dbeafe", text: "#111827" },
      { value: "파랑 2", color: "#3b82f6", border: "#dbeafe", text: "#f4f8ff" },
      { value: "파랑 3", color: "#2563eb", border: "#bfdbfe", text: "#f4f8ff" },
      { value: "파랑 4", color: "#1d4ed8", border: "#93c5fd", text: "#f4f8ff" },
      { value: "파랑 5", color: "#1e3a8a", border: "#60a5fa", text: "#f4f8ff" }
    ]
  },
  {
    name: "초록",
    options: [
      { value: "초록 1", color: "#86efac", border: "#dcfce7", text: "#072b15" },
      { value: "초록 2", color: "#22c55e", border: "#dcfce7", text: "#072b15" },
      { value: "초록 3", color: "#15803d", border: "#bbf7d0", text: "#f3fff6" },
      { value: "초록 4", color: "#166534", border: "#86efac", text: "#f3fff6" },
      { value: "초록 5", color: "#14532d", border: "#4ade80", text: "#f3fff6" }
    ]
  }
];
const EMOTIONS = EMOTION_GROUPS.flatMap((group) => group.options);
const CHALLENGE_LEVELS = [
  { id: "8", image: "/assets/challenge/8.png", layerCount: 26 },
  { id: "10", image: "/assets/challenge/10.png", layerCount: 39 },
  { id: "7", image: "/assets/challenge/7.png", layerCount: 40 },
  { id: "13", image: "/assets/challenge/13.png", layerCount: 48 },
  { id: "11", image: "/assets/challenge/11.png", layerCount: 51 },
  { id: "5", image: "/assets/challenge/5.png", layerCount: 55 },
  { id: "3", image: "/assets/challenge/3.png", layerCount: 61 },
  { id: "4", image: "/assets/challenge/4.png", layerCount: 66 },
  { id: "12", image: "/assets/challenge/12.png", layerCount: 70 },
  { id: "6", image: "/assets/challenge/6.png", layerCount: 72 },
  { id: "1", image: "/assets/challenge/1.png", layerCount: 74 },
  { id: "2", image: "/assets/challenge/2.png", layerCount: 97 },
  { id: "9", image: "/assets/challenge/9.png", layerCount: 110 }
];
const CHALLENGE_COLORS = Array.from({ length: 64 }, (_, index) => {
  const hue = Math.round((index * 137.508) % 360);
  const saturation = 48 + (index % 4) * 8;
  const lightness = 44 + (Math.floor(index / 4) % 4) * 7;
  return hslToHex(hue, saturation, lightness);
});
const challengeImageCache = new Map();

const els = {
  allDayField: document.querySelector("#allDayField"),
  allDayInput: document.querySelector("#allDayInput"),
  appView: document.querySelector("#appView"),
  authMessage: document.querySelector("#authMessage"),
  authView: document.querySelector("#authView"),
  calendarTimelineContent: document.querySelector("#calendarTimelineContent"),
  calendarTimelineDialog: document.querySelector("#calendarTimelineDialog"),
  calendarTimelineTitle: document.querySelector("#calendarTimelineTitle"),
  calendarTab: document.querySelector("#calendarTab"),
  closeCalendarTimelineDialogButton: document.querySelector("#closeCalendarTimelineDialogButton"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  closeEmotionDialogButton: document.querySelector("#closeEmotionDialogButton"),
  dateFields: document.querySelector("#dateFields"),
  dateInput: document.querySelector("#dateInput"),
  deleteButton: document.querySelector("#deleteButton"),
  dialog: document.querySelector("#itemDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  editingId: document.querySelector("#editingId"),
  endDateField: document.querySelector("#endDateField"),
  endDateInput: document.querySelector("#endDateInput"),
  endTimeInput: document.querySelector("#endTimeInput"),
  emotionDialog: document.querySelector("#emotionDialog"),
  emotionDialogContent: document.querySelector("#emotionDialogContent"),
  emotionDialogTitle: document.querySelector("#emotionDialogTitle"),
  emotionTab: document.querySelector("#emotionTab"),
  itemForm: document.querySelector("#itemForm"),
  loginForm: document.querySelector("#loginForm"),
  noteInput: document.querySelector("#noteInput"),
  passwordInput: document.querySelector("#passwordInput"),
  pickerPanel: document.querySelector("#pickerPanel"),
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
  typeInput: document.querySelector("#typeInput")
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
  els.closeCalendarTimelineDialogButton.addEventListener("click", () => els.calendarTimelineDialog.close());
  els.closeDialogButton.addEventListener("click", () => els.dialog.close());
  els.closeEmotionDialogButton.addEventListener("click", () => els.emotionDialog.close());
  els.dialog.addEventListener("close", closePicker);
  els.dialog.addEventListener("cancel", closePicker);
  els.allDayInput.addEventListener("change", applyAllDayTime);
  els.typeInput.addEventListener("change", updateFormVisibility);
  els.itemForm.addEventListener("submit", saveItem);
  els.deleteButton.addEventListener("click", deleteCurrentItem);
  document.querySelectorAll("[data-picker]").forEach((input) => {
    input.addEventListener("click", () => openPicker(input));
    input.addEventListener("focus", () => openPicker(input));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePicker();
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker(input);
      }
    });
  });

  document.querySelectorAll(".bottom-nav button").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  document.body.addEventListener("click", async (event) => {
    if (state.suppressTimelineItemClick && event.target.closest(".timeline-item")) {
      event.preventDefault();
      event.stopPropagation();
      state.suppressTimelineItemClick = false;
      return;
    }
    if (state.suppressCalendarScheduleClick && event.target.closest(".schedule-chip")) {
      event.preventDefault();
      event.stopPropagation();
      state.suppressCalendarScheduleClick = false;
      return;
    }

    const pickerAction = event.target.closest("[data-picker-action]");
    if (pickerAction) {
      event.preventDefault();
      event.stopPropagation();
      handlePickerAction(pickerAction);
      return;
    }

    if (
      state.picker &&
      els.dialog.open &&
      !event.target.closest("#pickerPanel") &&
      !event.target.closest("[data-picker]")
    ) {
      closePicker();
    }

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
    if (state.suppressCalendarClick && action.dataset.action === "select-date") {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (action.dataset.action === "add") openItemDialog(action.dataset.type);
    if (action.dataset.action === "edit") openItemDialog(null, findItem(id));
    if (action.dataset.action === "select-timeline-item") {
      event.stopPropagation();
      const context = timelineContextFromAction(action);
      if (selectedTimelineItemMatches(id, context) && event.detail > 1) {
        await deleteTimelineItem(id);
        return;
      }
      selectTimelineItem(id, context);
      return;
    }
    if (action.dataset.action === "select-calendar-schedule") {
      event.stopPropagation();
      selectCalendarSchedule(id, action.dataset.date);
      return;
    }
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
      markEmotionSelection(action.dataset.emotion);
      await saveEmotion(action.dataset.emotion);
    }
    if (action.dataset.action === "open-challenge-gallery") {
      event.stopPropagation();
      openChallengeGallery();
    }
    if (action.dataset.action === "save-emotion-comment") {
      event.stopPropagation();
      await saveEmotion();
    }
    if (action.dataset.action === "view-emotion") {
      event.stopPropagation();
      openEmotionDialog(action.dataset.date || state.selectedDate);
    }
    if (action.dataset.action === "select-date") {
      const selectedDate = action.dataset.date;
      if (state.tab === "emotion") {
        window.clearTimeout(state.emotionClickTimer);
        state.emotionClickTimer = null;
        const wasSelected = state.selectedEmotionDate === selectedDate;
        state.selectedDate = selectedDate;
        state.selectedEmotionDate = selectedDate;

        if (wasSelected && event.detail > 1) {
          render();
          await removeEmotion(selectedDate);
          return;
        }

        render();

        if (!wasSelected) {
          return;
        }

        state.emotionClickTimer = window.setTimeout(() => {
          openEmotionEditor(selectedDate);
          state.emotionClickTimer = null;
        }, 280);
        return;
      }

      state.selectedDate = selectedDate;
      state.lastCalendarClick = null;
      state.selectedCalendarSchedule = null;
      clearSelectedTimelineRange();
      render();
      if (state.tab === "calendar") {
        openCalendarTimelineDialog();
      }
      return;
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

  document.body.addEventListener("dblclick", async (event) => {
    const card = event.target.closest(".timeline-item");
    if (card && !event.target.closest(".checkbox, .edit-button") && canSelectTimelineItem(findItem(card.dataset.timelineId))) {
      event.preventDefault();
      event.stopPropagation();
      await deleteTimelineItem(card.dataset.timelineId);
      return;
    }

    const slot = event.target.closest("[data-time-slot]");
    if (slot && (state.tab === "today" || state.tab === "calendar")) {
      event.preventDefault();
      window.clearTimeout(state.timeClickTimer);
      state.timeClickTimer = null;
      if (timeSlotMatchesSelectedRange(slot)) {
        clearSelectedTimelineRange();
        render();
      }
      return;
    }

    const action = event.target.closest('[data-action="select-date"]');
    if (!action || state.suppressCalendarClick || els.dialog.open) return;

    if (state.tab === "emotion") {
      window.clearTimeout(state.emotionClickTimer);
      state.emotionClickTimer = null;
      event.preventDefault();
      state.selectedDate = action.dataset.date;
      state.selectedEmotionDate = action.dataset.date;
      render();
      await removeEmotion(state.selectedDate);
      return;
    }
  });

  document.body.addEventListener("pointerdown", startTimeSelection);
  document.body.addEventListener("pointermove", moveTimeSelection);
  document.body.addEventListener("pointerup", finishTimeSelection);
  document.body.addEventListener("pointercancel", cancelTimeSelection);
  document.body.addEventListener("pointerdown", startTimelineItemResize);
  document.body.addEventListener("pointermove", moveTimelineItemResize);
  document.body.addEventListener("pointerup", finishTimelineItemResize);
  document.body.addEventListener("pointercancel", cancelTimelineItemResize);
  document.body.addEventListener("pointerdown", startTimelineItemDrag);
  document.body.addEventListener("pointermove", moveTimelineItemDrag);
  document.body.addEventListener("pointerup", finishTimelineItemDrag);
  document.body.addEventListener("pointercancel", cancelTimelineItemDrag);
  document.body.addEventListener("pointerdown", startCalendarScheduleResize);
  document.body.addEventListener("pointermove", moveCalendarScheduleResize);
  document.body.addEventListener("pointerup", finishCalendarScheduleResize);
  document.body.addEventListener("pointercancel", cancelCalendarScheduleResize);
  document.body.addEventListener("pointerdown", startCalendarScheduleDrag);
  document.body.addEventListener("pointermove", moveCalendarScheduleDrag);
  document.body.addEventListener("pointerup", finishCalendarScheduleDrag);
  document.body.addEventListener("pointercancel", cancelCalendarScheduleDrag);
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
  if (els.calendarTimelineDialog.open) els.calendarTimelineDialog.close();
  if (els.dialog.open) els.dialog.close();
  if (els.emotionDialog.open) els.emotionDialog.close();
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
    state.items = (payload.items || []).map(applyRememberedItemTime);
    state.items.forEach(rememberItemTime);
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
  renderCalendarTimelineDialog();
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
  const timelineItems = timelineItemsForDate(state.selectedDate);

  els.todayTab.innerHTML = `
    <section class="section">
      <div class="section-header">
        <h2>시간표</h2>
      </div>
      <div class="timeline" data-timeline-context="today">${renderTimeline(timelineItems, "today")}</div>
    </section>
  `;
}

function timelineItemsForDate(date) {
  const schedules = itemsFor("일정", date).sort(byStartTime);
  const todos = itemsFor("할일", date).sort(byDoneThenTitle);
  const timedTodos = todos
    .filter((item) => item.startTime)
    .map(todoTimelineItem);
  const timedRoutines = activeRoutines(date).map(routineTimelineItem);
  return [...schedules, ...timedTodos, ...timedRoutines].sort(byStartTime);
}

function renderTimeline(schedules, context = "today") {
  const slots = timeSlots();
  const blocks = assignTimelineColumns(schedules.map((item) => timelineBlock(item, slots)).filter(Boolean));
  const occupiedSlots = new Set();
  blocks.forEach((block) => {
    for (let index = block.startIndex; index < block.startIndex + block.span; index += 1) {
      if (slots[index]) occupiedSlots.add(slots[index]);
    }
  });

  const rows = slots.map((time, index) => {
    const body = "";
    const classes = [
      "slot",
      isSelectedTimeSlot(time, context) ? "selected" : ""
    ].filter(Boolean).join(" ");

    return `
      <div class="${classes}" data-time-slot="${time}" data-timeline-context="${context}" style="--slot-row:${index};">
        <div class="slot-time">${time}</div>
        <div class="slot-body">${body}</div>
      </div>
    `;
  }).join("");

  return `
    ${rows}
    <div class="timeline-layer" aria-label="시간표 항목">
      ${blocks.map((block) => renderSchedulePill(block, context)).join("")}
    </div>
  `;
}

function renderSchedulePill(block, context) {
  const { item } = block;
  const done = timelineItemDone(item);
  const selectable = canSelectTimelineItem(item);
  const selected = selectable && selectedTimelineItemMatches(item.id, context);
  const check = item.type === "할일" || item.type === "루틴"
    ? `<button type="button" class="checkbox" data-action="${item.type === "루틴" ? "toggle-routine" : "toggle-task"}" data-id="${item.id}">${done ? '<span class="checkmark">✓</span>' : ""}</button>`
    : `<span class="tag">${escapeHtml(item.type || "")}</span>`;
  const cardAction = selectable ? "select-timeline-item" : "edit";

  return `
    <div
      class="item timeline-item ${item.type === "루틴" ? "routine-item" : ""} ${done ? "done" : ""} ${selected ? "selected" : ""}"
      data-timeline-id="${item.id}"
      data-action="${cardAction}"
      data-id="${item.id}"
      data-slot-start="${block.startIndex}"
      data-slot-span="${block.span}"
      style="--slot-start:${block.startIndex}; --slot-span:${block.span}; --slot-column:${block.columnIndex}; --slot-columns:${block.columnCount};"
    >
      ${check}
      <button type="button" class="item-main-button">
        <span class="item-title">${escapeHtml(item.title)}</span>
        <span class="item-meta">${timelineItemTimeMeta(item)}</span>
      </button>
      <button type="button" class="edit-button" data-action="edit" data-id="${item.id}">›</button>
      ${selectable ? `
        <span class="timeline-resize-handle resize-start" data-resize-edge="start" aria-hidden="true"></span>
        <span class="timeline-resize-handle resize-end" data-resize-edge="end" aria-hidden="true"></span>
      ` : ""}
    </div>
  `;
}

function routineTimelineItem(routine) {
  if (routine.startTime) return routine;
  return {
    ...routine,
    startTime: "08:00",
    endTime: "08:30",
    timeUnset: true
  };
}

function todoTimelineItem(todo) {
  if (todo.startTime) return todo;
  return {
    ...todo,
    startTime: "08:00",
    endTime: "08:30",
    timeUnset: true
  };
}

function timelineItemTimeMeta(item) {
  const time = `${item.startTime || ""} - ${item.endTime || ""}`;
  return escapeHtml(item.timeUnset ? `${time} · 시간 미설정` : time);
}

function timelineItemDone(item) {
  if (item.type === "루틴") {
    return Boolean(routineRecord(item.id, state.selectedDate)?.completed);
  }
  return Boolean(item.completed);
}

function timelineBlock(item, slots) {
  const startIndex = slots.indexOf(item.startTime);
  if (startIndex === -1) return null;

  const endTime = item.endTime && item.endTime > item.startTime
    ? item.endTime
    : nextTime(item.startTime);
  let endIndex = endTime === "22:00" ? slots.length : slots.indexOf(endTime);
  if (endIndex === -1 || endIndex <= startIndex) endIndex = startIndex + 1;

  return {
    item,
    startIndex,
    span: Math.max(1, endIndex - startIndex)
  };
}

function assignTimelineColumns(blocks) {
  return blocks.map((block, index) => {
    const overlapping = blocks
      .map((other, otherIndex) => ({ other, otherIndex }))
      .filter(({ other }) => timelineBlocksOverlap(block, other))
      .sort((left, right) =>
        left.other.startIndex - right.other.startIndex ||
        left.other.span - right.other.span ||
        String(left.other.item.title || "").localeCompare(String(right.other.item.title || ""), "ko")
      );

    return {
      ...block,
      columnCount: Math.max(1, overlapping.length),
      columnIndex: Math.max(0, overlapping.findIndex(({ otherIndex }) => otherIndex === index))
    };
  });
}

function timelineBlocksOverlap(left, right) {
  return left.startIndex < right.startIndex + right.span && right.startIndex < left.startIndex + left.span;
}

function renderCalendar() {
  const days = calendarDays(state.visibleMonth);
  const monthLabel = state.visibleMonth.slice(0, 7);
  const scheduleRows = calendarScheduleRows(days);
  const scheduleRowCount = calendarScheduleDisplayRowCount(days, scheduleRows);
  const calendarClasses = "calendar-grid schedule-calendar";

  els.calendarTab.innerHTML = `
    <section class="section">
      <div class="month-header">
        <button type="button" data-action="month-prev">‹</button>
        <h2>${monthLabel}</h2>
        <button type="button" data-action="month-next">›</button>
      </div>
      <div class="${calendarClasses}" style="${calendarZoomStyle(scheduleRowCount)}">
        ${DAYS.map((day) => `<div class="weekday">${day}</div>`).join("")}
        ${days.map((day) => renderCalendarDay(day, scheduleRows)).join("")}
      </div>
    </section>
  `;
}

function calendarZoomStyle(scheduleRowCount) {
  const zoom = CALENDAR_ZOOM_MAX;
  const compact = window.matchMedia?.("(max-width: 430px)").matches;
  const base = compact
    ? { top: 23, row: 14, chip: 12, font: 8, gap: 4 }
    : { top: 24, row: 15, chip: 13, font: 9, gap: 5 };
  const rowHeight = roundCalendarZoomValue(base.row * zoom);
  const dayHeight = roundCalendarZoomValue((base.top + scheduleRowCount * base.row) * zoom);
  const chipHeight = roundCalendarZoomValue(Math.max(10, base.chip * zoom));
  const chipFontSize = roundCalendarZoomValue(Math.max(8, base.font * zoom));
  const gap = roundCalendarZoomValue(Math.max(3, base.gap * zoom));

  return [
    `--schedule-row-count:${scheduleRowCount}`,
    `--schedule-row-height:${rowHeight}px`,
    `--calendar-day-height:${dayHeight}px`,
    `--schedule-chip-height:${chipHeight}px`,
    `--schedule-chip-font-size:${chipFontSize}px`,
    `--calendar-gap:${gap}px`
  ].join(";");
}

function roundCalendarZoomValue(value) {
  return Math.round(value * 10) / 10;
}

function renderCalendarTimelineDialog() {
  const timelineItems = timelineItemsForDate(state.selectedDate);
  els.calendarTimelineTitle.textContent = humanDate(state.selectedDate);
  els.calendarTimelineContent.innerHTML = `
    <div class="timeline calendar-day-timeline" data-timeline-context="calendar">
      ${renderTimeline(timelineItems, "calendar")}
    </div>
  `;
}

function renderCalendarDay(day, scheduleRows = {}) {
  const schedules = itemsFor("일정", day.date).sort(byStartTime);
  const isSelected = day.date === state.selectedDate;
  const classes = [
    "day-cell",
    day.inMonth ? "" : "muted",
    isSelected ? "selected" : ""
  ].filter(Boolean).join(" ");

  return `
    <button type="button" class="${classes}" data-action="select-date" data-date="${day.date}">
      <span class="day-number">${Number(day.date.slice(8, 10))}</span>
      <span class="day-schedules">${renderCalendarScheduleChips(schedules, day.date, scheduleRows)}</span>
    </button>
  `;
}

function renderEmotionTab() {
  const progress = challengeProgress();
  const active = activeChallengeLevel(progress);

  if (!active) {
    state.selectedChallengeLayer = null;
    els.emotionTab.innerHTML = `
      <section class="section">
        <div class="challenge-panel challenge-cleared">
        <div class="challenge-summary">
          <span>챌린지</span>
          <button type="button" class="challenge-gallery-button" data-action="open-challenge-gallery">갤러리</button>
        </div>
        <div class="challenge-complete">모든 레벨 클리어</div>
        </div>
      </section>
    `;
    return;
  }

  if (state.selectedChallengeLayer?.levelId !== active.level.id) {
    state.selectedChallengeLayer = null;
  }

  els.emotionTab.innerHTML = `
    <section class="section">
      <div class="challenge-panel">
        <div class="challenge-summary">
          <span class="challenge-level-label">
            레벨 ${active.index + 1}
            <span class="challenge-layer-count">(${active.filledCount}/${active.level.layerCount})</span>
          </span>
          <button type="button" class="challenge-gallery-button" data-action="open-challenge-gallery">갤러리</button>
        </div>
        <div class="challenge-progress-bar" aria-hidden="true">
          <span style="width:${challengeProgressPercent(active)}%;"></span>
        </div>
        <div class="challenge-art">
          <canvas id="challengeCanvas" class="challenge-canvas" data-level-id="${active.level.id}"></canvas>
        </div>
      </div>
    </section>
  `;
  queueChallengeCanvasRender(active.level);
}

function challengeProgressPercent(active) {
  if (!active || !active.level.layerCount) return 0;
  return Math.min(100, Math.round((active.filledCount / active.level.layerCount) * 100));
}

function challengeProgress() {
  const filledByLevel = new Map(CHALLENGE_LEVELS.map((level) => [level.id, new Map()]));
  challengeRecords().forEach((record) => {
    if (!filledByLevel.has(record.levelId)) return;
    filledByLevel.get(record.levelId).set(record.layer, record);
  });
  return { filledByLevel };
}

function activeChallengeLevel(progress = challengeProgress()) {
  const index = CHALLENGE_LEVELS.findIndex((level) => {
    const filled = progress.filledByLevel.get(level.id);
    return (filled ? filled.size : 0) < level.layerCount;
  });
  if (index === -1) return null;

  const level = CHALLENGE_LEVELS[index];
  const filled = progress.filledByLevel.get(level.id) || new Map();
  return { index, level, filled, filledCount: filled.size };
}

function challengeRecords() {
  return state.items
    .map(challengeRecordInfo)
    .filter(Boolean);
}

function challengeRecordInfo(item) {
  try {
    const payload = JSON.parse(item.note || "{}");
    if (!isChallengeItem(item, payload)) return null;
    const levelId = String(payload.levelId || "");
    const layer = Number(payload.layer);
    if (!levelId || !Number.isInteger(layer) || layer < 0) return null;
    const color = typeof payload.color === "string" ? payload.color : "";
    return {
      item,
      levelId,
      layer,
      palette: color ? challengePaletteFromColor(color) : emotionPalette(item.emotion || item.mood)
    };
  } catch {
    return null;
  }
}

function isChallengeItem(item, payload = null) {
  if (!item) return false;
  if (item.type === "챌린지") return true;
  return item.type === "감정" && payload && payload.kind === "challenge";
}

function challengeFillMap(levelId) {
  return challengeRecords()
    .filter((record) => record.levelId === levelId && record.palette)
    .reduce((map, record) => map.set(record.layer, record.palette), new Map());
}

function challengePaletteFromColor(color) {
  return {
    color,
    border: color,
    text: "#111111"
  };
}

function queueChallengeCanvasRender(level) {
  const token = ++state.challengeRenderToken;
  window.requestAnimationFrame(() => {
    renderChallengeCanvas(level, token);
  });
}

async function renderChallengeCanvas(level, token = state.challengeRenderToken) {
  const canvas = document.querySelector("#challengeCanvas");
  if (!canvas || !level || canvas.dataset.levelId !== level.id) return;

  try {
    const analysis = await getChallengeAnalysis(level);
    if (token !== state.challengeRenderToken || canvas.dataset.levelId !== level.id) return;
    drawChallengeCanvas(canvas, level, analysis);
  } catch (error) {
    setStatus(error.message || "챌린지 그림을 불러오지 못했습니다.");
  }
}

async function getChallengeAnalysis(level) {
  if (state.challengeAnalysis?.levelId === level.id) return state.challengeAnalysis;

  const image = await loadChallengeImage(level);
  const width = CHALLENGE_CANVAS_WIDTH;
  const height = Math.round((image.naturalHeight / image.naturalWidth) * width);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#fffaf4";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const layerData = detectChallengeLayers(imageData, width, height);
  state.challengeAnalysis = {
    levelId: level.id,
    image,
    width,
    height,
    ...layerData
  };

  return state.challengeAnalysis;
}

function loadChallengeImage(level) {
  if (challengeImageCache.has(level.id)) return challengeImageCache.get(level.id);

  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("챌린지 이미지를 불러오지 못했습니다."));
    image.src = level.image;
  });

  challengeImageCache.set(level.id, promise);
  return promise;
}

function detectChallengeLayers(imageData, width, height) {
  const total = width * height;
  const data = imageData.data;
  const white = new Uint8Array(total);
  const visited = new Uint8Array(total);
  const componentMap = new Int32Array(total);
  const queue = new Int32Array(total);
  const components = [];
  componentMap.fill(-1);

  for (let index = 0; index < total; index += 1) {
    const offset = index * 4;
    if (
      data[offset] >= CHALLENGE_WHITE_THRESHOLD &&
      data[offset + 1] >= CHALLENGE_WHITE_THRESHOLD &&
      data[offset + 2] >= CHALLENGE_WHITE_THRESHOLD
    ) {
      white[index] = 1;
    }
  }

  const enqueueBorder = (index, queueState) => {
    if (!white[index] || visited[index]) return queueState;
    visited[index] = 1;
    queue[queueState.tail] = index;
    queueState.tail += 1;
    return queueState;
  };
  let borderQueue = { head: 0, tail: 0 };
  for (let x = 0; x < width; x += 1) {
    borderQueue = enqueueBorder(x, borderQueue);
    borderQueue = enqueueBorder((height - 1) * width + x, borderQueue);
  }
  for (let y = 0; y < height; y += 1) {
    borderQueue = enqueueBorder(y * width, borderQueue);
    borderQueue = enqueueBorder(y * width + width - 1, borderQueue);
  }

  while (borderQueue.head < borderQueue.tail) {
    const index = queue[borderQueue.head];
    borderQueue.head += 1;
    enqueueChallengeNeighbors(index, width, height, white, visited, queue, borderQueue);
  }

  for (let index = 0; index < total; index += 1) {
    if (!white[index] || visited[index]) continue;

    const pixels = [];
    let head = 0;
    let tail = 0;
    visited[index] = 1;
    queue[tail] = index;
    tail += 1;

    while (head < tail) {
      const current = queue[head];
      head += 1;
      pixels.push(current);
      const queueState = { head, tail };
      enqueueChallengeNeighbors(current, width, height, white, visited, queue, queueState);
      head = queueState.head;
      tail = queueState.tail;
    }

    if (pixels.length < CHALLENGE_MIN_LAYER_AREA) continue;

    const componentIndex = components.length;
    pixels.forEach((pixelIndex) => {
      componentMap[pixelIndex] = componentIndex;
    });
    components.push({ area: pixels.length });
  }

  return { componentMap, components };
}

function enqueueChallengeNeighbors(index, width, height, white, visited, queue, queueState) {
  const x = index % width;
  const y = Math.floor(index / width);
  const candidates = [];
  if (x > 0) candidates.push(index - 1);
  if (x < width - 1) candidates.push(index + 1);
  if (y > 0) candidates.push(index - width);
  if (y < height - 1) candidates.push(index + width);

  candidates.forEach((candidate) => {
    if (!white[candidate] || visited[candidate]) return;
    visited[candidate] = 1;
    queue[queueState.tail] = candidate;
    queueState.tail += 1;
  });
}

function drawChallengeCanvas(canvas, level, analysis, options = {}) {
  canvas.width = analysis.width;
  canvas.height = analysis.height;
  const context = canvas.getContext("2d");
  const fills = options.fills || challengeFillMap(level.id);
  const selectedLayer = options.selectedLayer !== undefined
    ? options.selectedLayer
    : state.selectedChallengeLayer?.levelId === level.id
      ? state.selectedChallengeLayer.layer
      : -1;
  const overlay = context.createImageData(analysis.width, analysis.height);
  const overlayData = overlay.data;

  for (let index = 0; index < analysis.componentMap.length; index += 1) {
    const component = analysis.componentMap[index];
    if (component < 0) continue;

    const palette = fills.get(component);
    const rgb = palette ? hexToRgb(palette.color) : (component === selectedLayer ? hexToRgb("#c47b3c") : null);
    if (!rgb) continue;

    const offset = index * 4;
    overlayData[offset] = rgb.r;
    overlayData[offset + 1] = rgb.g;
    overlayData[offset + 2] = rgb.b;
    overlayData[offset + 3] = palette ? 230 : 96;
  }

  context.fillStyle = "#fffaf4";
  context.fillRect(0, 0, analysis.width, analysis.height);
  context.putImageData(overlay, 0, 0);
  context.globalCompositeOperation = "multiply";
  context.drawImage(analysis.image, 0, 0, analysis.width, analysis.height);
  context.globalCompositeOperation = "source-over";
}

async function awardChallengeFill() {
  if (state.challengeSaving) return "";

  const active = activeChallengeLevel();
  if (!active) return "";

  const filled = challengeFillMap(active.level.id);
  const candidates = Array.from({ length: active.level.layerCount }, (_, index) => index)
    .filter((layer) => !filled.has(layer));
  if (!candidates.length) return "";

  const layer = randomChoice(candidates);
  const color = randomChoice(CHALLENGE_COLORS);
  if (!color) {
    return "챌린지 색상을 선택하지 못했습니다.";
  }

  const nextFilledCount = active.filledCount + 1;
  const cleared = nextFilledCount >= active.level.layerCount;
  state.challengeSaving = true;

  try {
    await api("/api/items", {
      method: "POST",
      body: {
        title: `챌린지 레벨 ${active.index + 1} 레이어 ${layer + 1}`,
        type: "감정",
        date: todayString(),
        completed: true,
        status: "완료",
        note: JSON.stringify({
          kind: "challenge",
          levelId: active.level.id,
          layer,
          color
        })
      }
    });

    state.selectedChallengeLayer = null;
    state.challengeAnalysis = null;
    return cleared ? "레벨 클리어. 다음 레벨로 이동했습니다." : "챌린지 기록을 저장했습니다.";
  } catch (error) {
    return error.message || "챌린지 기록을 저장하지 못했습니다.";
  } finally {
    state.challengeSaving = false;
  }
}

function randomChoice(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function hexToRgb(hex) {
  const normalized = String(hex || "").replace("#", "");
  const value = parseInt(normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function hslToHex(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = l - c / 2;
  const [r, g, b] = hue < 60 ? [c, x, 0]
    : hue < 120 ? [x, c, 0]
      : hue < 180 ? [0, c, x]
        : hue < 240 ? [0, x, c]
          : hue < 300 ? [x, 0, c]
            : [c, 0, x];

  return [r, g, b]
    .map((value) => Math.round((value + m) * 255).toString(16).padStart(2, "0"))
    .reduce((hex, part) => `${hex}${part}`, "#");
}

function openChallengeGallery() {
  const progress = challengeProgress();
  const active = activeChallengeLevel(progress);
  const activeIndex = active ? active.index : CHALLENGE_LEVELS.length;

  els.emotionDialogTitle.textContent = "갤러리";
  els.emotionDialogContent.innerHTML = renderChallengeGallery(progress, activeIndex);
  if (!els.emotionDialog.open) {
    els.emotionDialog.showModal();
  }
  queueChallengeGalleryRender(activeIndex);
}

function renderChallengeGallery(progress, activeIndex) {
  return `
    <div class="challenge-gallery">
      ${CHALLENGE_LEVELS.map((level, index) => {
        const filled = progress.filledByLevel.get(level.id);
        const filledCount = filled ? filled.size : 0;
        const unlocked = index <= activeIndex;
        const cleared = filledCount >= level.layerCount;

        if (!unlocked) {
          return `
            <div class="challenge-gallery-card locked">
              <div class="challenge-gallery-mask">?</div>
              <span>레벨 ${index + 1}</span>
            </div>
          `;
        }

        return `
          <div class="challenge-gallery-card ${cleared ? "cleared" : "current"}">
            <canvas class="challenge-gallery-canvas" data-gallery-level-id="${level.id}"></canvas>
            <div class="challenge-gallery-meta">
              <span>레벨 ${index + 1}</span>
              <strong>${cleared ? "CLEAR" : `${filledCount}/${level.layerCount}`}</strong>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function queueChallengeGalleryRender(activeIndex) {
  window.requestAnimationFrame(() => {
    renderChallengeGalleryCanvases(activeIndex);
  });
}

async function renderChallengeGalleryCanvases(activeIndex) {
  const canvases = [...document.querySelectorAll(".challenge-gallery-canvas")];
  await Promise.all(canvases.map(async (canvas) => {
    const level = CHALLENGE_LEVELS.find((item) => item.id === canvas.dataset.galleryLevelId);
    const index = CHALLENGE_LEVELS.findIndex((item) => item.id === level?.id);
    if (!level || index > activeIndex) return;

    const analysis = await getChallengeAnalysis(level);
    drawChallengeCanvas(canvas, level, analysis, { selectedLayer: -1 });
  }));
}

function renderCalendarScheduleChips(schedules, date, scheduleRows = {}) {
  if (!schedules.length) return "";

  const decorated = calendarDecoratedSchedules(schedules, date, scheduleRows);

  return decorated.map(({ rangeClass, row, schedule, selected, showTitle, title }) => {
    const label = showTitle ? escapeHtml(title) : "&nbsp;";
    const rangeTokens = rangeClass.split(/\s+/);
    const canResizeStart = selected && (rangeTokens.includes("single") || rangeTokens.includes("segment-start"));
    const canResizeEnd = selected && (rangeTokens.includes("single") || rangeTokens.includes("segment-end"));
    const chipClass = [
      "schedule-chip",
      rangeClass,
      showTitle ? "has-title" : "continuation",
      selected ? "selected" : ""
    ].join(" ");

    return `
      <span
        class="${chipClass}"
        title="${escapeHtml(title)}"
        data-action="select-calendar-schedule"
        data-id="${schedule.id}"
        data-date="${date}"
        style="--schedule-row:${row};"
      >
        ${canResizeStart ? '<span class="calendar-resize-handle resize-left" data-calendar-resize-edge="start" aria-hidden="true"></span>' : ""}
        ${label}
        ${canResizeEnd ? '<span class="calendar-resize-handle resize-right" data-calendar-resize-edge="end" aria-hidden="true"></span>' : ""}
      </span>
    `;
  }).join("");
}

function calendarDecoratedSchedules(schedules, date, scheduleRows = {}) {
  return schedules.map((schedule) => {
    const rangeClass = calendarScheduleRangeClass(schedule, date);
    const rangeTokens = rangeClass.split(/\s+/);
    const showTitle = rangeTokens.includes("single") || rangeTokens.includes("segment-start");
    const title = String(schedule.title || "").trim() || "제목 없음";
    const selected = selectedCalendarScheduleMatches(schedule.id);
    const row = scheduleRows[schedule.id] || 0;

    return { rangeClass, row, schedule, showTitle, title, selected };
  });
}

function calendarScheduleDisplayRowCount(days, scheduleRows = {}) {
  const counts = days.map((day) => {
    const schedules = itemsFor("일정", day.date).sort(byStartTime);
    if (!schedules.length) return 2;

    const decorated = calendarDecoratedSchedules(schedules, day.date, scheduleRows);
    return Math.max(2, ...decorated.map((schedule) => schedule.row + 1));
  });

  return Math.max(2, ...counts);
}

function calendarScheduleRows(days) {
  const rangeStart = days[0]?.date;
  const rangeEnd = days[days.length - 1]?.date;
  if (!rangeStart || !rangeEnd) return {};

  const schedules = state.items
    .filter((item) => item.type === "일정" && isItemRangeOnCalendar(item, rangeStart, rangeEnd))
    .sort((left, right) => {
      const leftRange = selectedDateRange(left.date, left.endDate || left.date);
      const rightRange = selectedDateRange(right.date, right.endDate || right.date);
      return leftRange.startDate.localeCompare(rightRange.startDate) ||
        rightRange.endDate.localeCompare(leftRange.endDate) ||
        String(left.title || "").localeCompare(String(right.title || ""), "ko");
    });
  const rows = {};
  const rowEndDates = [];

  schedules.forEach((schedule) => {
    const range = selectedDateRange(schedule.date, schedule.endDate || schedule.date);
    const row = rowEndDates.findIndex((endDate) => endDate < range.startDate);
    const rowIndex = row === -1 ? rowEndDates.length : row;
    rowEndDates[rowIndex] = range.endDate;
    rows[schedule.id] = rowIndex;
  });

  return rows;
}

function isItemRangeOnCalendar(item, startDate, endDate) {
  if (!item.date) return false;
  const range = selectedDateRange(item.date, item.endDate || item.date);
  return range.startDate <= endDate && range.endDate >= startDate;
}

function calendarScheduleRangeClass(schedule, date) {
  const range = selectedDateRange(schedule.date, schedule.endDate || schedule.date);
  const weekday = new Date(`${date}T00:00:00`).getDay();
  const connectsLeft = date > range.startDate && weekday !== 0;
  const connectsRight = date < range.endDate && weekday !== 6;

  if (range.startDate === range.endDate) return "single";
  return [
    connectsLeft ? "connect-left" : "segment-start",
    connectsRight ? "connect-right" : "segment-end"
  ].join(" ");
}

function renderEmotionCalendar() {
  const days = calendarDays(state.visibleMonth);
  const monthLabel = state.visibleMonth.slice(0, 7);

  return `
    <div class="month-header">
      <button type="button" data-action="month-prev">‹</button>
      <h2>${monthLabel}</h2>
      <button type="button" data-action="month-next">›</button>
    </div>
    <div class="calendar-grid emotion-calendar">
      ${DAYS.map((day) => `<div class="weekday">${day}</div>`).join("")}
      ${days.map(renderEmotionCalendarDay).join("")}
    </div>
  `;
}

function renderEmotionCalendarDay(day) {
  const emotion = emotionRecord(day.date);
  const palette = emotion ? emotionPalette(emotion.emotion || emotion.mood) : null;
  const isSelected = day.date === state.selectedDate;
  const classes = [
    "day-cell",
    palette ? "has-emotion" : "",
    day.inMonth ? "" : "muted",
    isSelected ? "selected" : ""
  ].filter(Boolean).join(" ");
  const style = palette
    ? ` style="--emotion-bg:${palette.color}; --emotion-border:${palette.border}; --emotion-text:${palette.text};"`
    : "";
  const comment = emotion && emotion.note
    ? `<span class="emotion-day-comment">${escapeHtml(emotion.note)}</span>`
    : "";

  return `
    <button type="button" class="${classes}" data-action="select-date" data-date="${day.date}"${style}>
      <span class="day-number">${Number(day.date.slice(8, 10))}</span>
      ${comment}
    </button>
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
  const check = mode === "task" || item.type === "할일"
    ? `<button type="button" class="checkbox" data-action="toggle-task" data-id="${item.id}">${item.completed ? '<span class="checkmark">✓</span>' : ""}</button>`
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
        return `
          <div class="item">
            <span class="tag">루틴</span>
            <button type="button" class="item-main-button" data-action="edit" data-id="${routine.id}">
              <span class="item-title">${escapeHtml(routine.title)}</span>
              <span class="item-meta">${routineMeta(routine)}</span>
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
      <div class="emotion-actions">
        <button type="button" class="primary" data-action="save-emotion-comment">코멘트 저장</button>
      </div>
    </div>
  `;
}

function markEmotionSelection(emotion) {
  const normalized = normalizeEmotionValue(emotion);
  document.querySelectorAll(".emotion-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.emotion === normalized);
  });
}

function renderCalendarEmotionPreview(emotion) {
  if (!emotion) return "";
  const normalizedEmotion = normalizeEmotionValue(emotion.emotion || emotion.mood);
  const palette = emotionPalette(normalizedEmotion);
  const style = palette
    ? ` style="--emotion-bg:${palette.color}; --emotion-border:${palette.border}; --emotion-text:${palette.text};"`
    : "";
  const comment = emotion.note ? escapeHtml(emotion.note) : "코멘트 없음";

  return `
    <div class="emotion-preview"${style} aria-label="감정 코멘트">
      <span class="emotion-preview-label">감정 코멘트</span>
      <p class="emotion-preview-comment">${comment}</p>
    </div>
  `;
}

function itemMeta(item) {
  const parts = [];
  if (item.date) parts.push(item.date);
  if (item.endDate && item.endDate !== item.date) parts[parts.length - 1] = `${item.date}~${item.endDate}`;
  if (item.startTime) parts.push(`${item.startTime}-${item.endTime || ""}`);
  if (item.emotion || item.mood) parts.push(item.emotion || item.mood);
  return parts.map(escapeHtml).join(" · ");
}

function openItemDialog(type, item, defaults = {}) {
  state.editingItem = item || null;
  const selectedType = item ? item.type : type || "일정";
  closePicker();
  if (els.calendarTimelineDialog.open) {
    els.calendarTimelineDialog.close();
  }

  els.dialogTitle.textContent = item ? "수정" : "추가";
  els.editingId.value = item ? item.id : "";
  els.typeInput.value = selectedType;
  els.titleInput.value = item ? item.title : "";
  els.dateInput.value = item && item.date ? item.date : defaults.date || state.selectedDate;
  els.endDateInput.value = item && item.endDate ? item.endDate : defaults.endDate || defaults.date || state.selectedDate;
  els.startTimeInput.value = item && item.startTime ? item.startTime : defaults.startTime || "08:00";
  els.endTimeInput.value = item && item.endTime ? item.endTime : defaults.endTime || "08:30";
  els.noteInput.value = item && item.note ? item.note : "";
  els.allDayInput.checked = selectedType === "일정" && els.startTimeInput.value === "08:00" && els.endTimeInput.value === "22:00";

  document.querySelectorAll('[name="repeatDay"]').forEach((input) => {
    input.checked = Boolean(item && item.repeatDays && item.repeatDays.includes(input.value));
  });

  els.deleteButton.hidden = !item;
  updateFormVisibility();
  els.dialog.showModal();
}

function openCalendarTimelineDialog() {
  renderCalendarTimelineDialog();
  if (!els.calendarTimelineDialog.open) {
    els.calendarTimelineDialog.showModal();
  }
}

function openCalendarScheduleDialog(date) {
  state.lastCalendarClick = null;
  if (els.dialog.open) return;
  openItemDialog("일정", null, { date, endDate: date });
}

function updateFormVisibility() {
  closePicker();
  const type = els.typeInput.value;
  els.dateFields.hidden = type === "루틴";
  els.endDateField.hidden = type !== "일정";
  els.allDayField.hidden = type !== "일정";
  els.scheduleFields.hidden = type !== "일정" && type !== "할일" && type !== "루틴";
  els.routineFields.hidden = type !== "루틴";
  els.startTimeLabel.textContent = "시작";
  els.endTimeLabel.textContent = type === "할일" ? "마감" : "종료";
  if (type !== "일정") els.allDayInput.checked = false;
  applyAllDayTime();
}

function applyAllDayTime() {
  const isAllDay = els.typeInput.value === "일정" && els.allDayInput.checked;
  if (isAllDay) {
    els.startTimeInput.value = "08:00";
    els.endTimeInput.value = "22:00";
    closePicker();
  }
  els.startTimeInput.disabled = isAllDay;
  els.endTimeInput.disabled = isAllDay;
}

function openPicker(input) {
  if (!input || input.disabled || !els.dialog.open) return;
  const type = input.dataset.picker;
  if (type !== "date" && type !== "time") return;

  const selectedValue = input.value || defaultPickerValue(input);
  state.picker = {
    targetId: input.id,
    type,
    visibleMonth: type === "date" ? monthStart(selectedValue) : null
  };

  const field = input.closest("label") || input;
  field.after(els.pickerPanel);
  renderPickerPanel();
}

function closePicker() {
  state.picker = null;
  if (!els.pickerPanel) return;
  els.pickerPanel.hidden = true;
  els.pickerPanel.innerHTML = "";
}

function renderPickerPanel() {
  if (!state.picker || !els.pickerPanel) return;
  els.pickerPanel.hidden = false;
  els.pickerPanel.innerHTML = state.picker.type === "date"
    ? renderDatePicker()
    : renderTimePicker();
}

function renderDatePicker() {
  const input = pickerTargetInput();
  const selectedDate = input && isDateString(input.value) ? input.value : state.selectedDate;
  const visibleMonth = state.picker.visibleMonth || monthStart(selectedDate);
  const monthLabel = visibleMonth.slice(0, 7);
  const days = calendarDays(visibleMonth);

  return `
    <div class="picker-header">
      <button type="button" class="picker-icon-button" data-picker-action="date-month-prev" aria-label="이전 달">‹</button>
      <strong>${monthLabel}</strong>
      <button type="button" class="picker-icon-button" data-picker-action="date-month-next" aria-label="다음 달">›</button>
    </div>
    <div class="picker-calendar-grid">
      ${DAYS.map((day) => `<span class="picker-weekday">${day}</span>`).join("")}
      ${days.map((day) => {
        const classes = [
          "picker-day",
          day.inMonth ? "" : "muted",
          day.date === selectedDate ? "selected" : ""
        ].filter(Boolean).join(" ");
        return `
          <button type="button" class="${classes}" data-picker-action="select-date" data-date="${day.date}">
            ${Number(day.date.slice(8, 10))}
          </button>
        `;
      }).join("")}
    </div>
    <div class="picker-footer">
      <button type="button" class="secondary" data-picker-action="picker-close">닫기</button>
    </div>
  `;
}

function renderTimePicker() {
  const input = pickerTargetInput();
  const selectedTime = input && isTimeString(input.value) ? input.value : defaultPickerValue(input);
  const options = pickerTimeOptions(input);

  return `
    <div class="picker-header picker-header-simple">
      <strong>${input && input.id === "endTimeInput" ? "종료 시간" : "시작 시간"}</strong>
      <button type="button" class="picker-icon-button" data-picker-action="picker-close" aria-label="닫기">×</button>
    </div>
    <div class="picker-time-grid">
      ${options.map((time) => `
        <button
          type="button"
          class="picker-time ${time === selectedTime ? "selected" : ""}"
          data-picker-action="select-time"
          data-time="${time}"
        >
          ${time}
        </button>
      `).join("")}
    </div>
  `;
}

function handlePickerAction(action) {
  if (!state.picker) return;

  if (action.dataset.pickerAction === "picker-close") {
    closePicker();
    return;
  }

  if (action.dataset.pickerAction === "date-month-prev") {
    state.picker.visibleMonth = addMonths(state.picker.visibleMonth, -1);
    renderPickerPanel();
    return;
  }

  if (action.dataset.pickerAction === "date-month-next") {
    state.picker.visibleMonth = addMonths(state.picker.visibleMonth, 1);
    renderPickerPanel();
    return;
  }

  const input = pickerTargetInput();
  if (!input) {
    closePicker();
    return;
  }

  if (action.dataset.pickerAction === "select-date") {
    input.value = action.dataset.date;
    normalizeDateRangeAfterPicker(input.id);
    closePicker();
  }

  if (action.dataset.pickerAction === "select-time") {
    input.value = action.dataset.time;
    normalizeTimeRangeAfterPicker(input.id);
    renderPickerPanel();
  }
}

function pickerTargetInput() {
  return state.picker && state.picker.targetId
    ? document.querySelector(`#${state.picker.targetId}`)
    : null;
}

function defaultPickerValue(input) {
  if (!input) return state.selectedDate;
  if (input.dataset.picker === "date") return state.selectedDate;
  return input.id === "endTimeInput" ? "08:30" : "08:00";
}

function pickerTimeOptions(input) {
  const slots = timeSlots();
  if (input && input.id === "endTimeInput") return [...slots.slice(1), "22:00"];
  return slots;
}

function normalizeDateRangeAfterPicker(targetId) {
  if (!isDateString(els.dateInput.value)) els.dateInput.value = state.selectedDate;
  if (!isDateString(els.endDateInput.value)) els.endDateInput.value = els.dateInput.value;

  if (targetId === "dateInput" && els.endDateInput.value < els.dateInput.value) {
    els.endDateInput.value = els.dateInput.value;
  }
  if (targetId === "endDateInput" && els.endDateInput.value < els.dateInput.value) {
    els.dateInput.value = els.endDateInput.value;
  }
}

function normalizeTimeRangeAfterPicker(targetId) {
  const start = isTimeString(els.startTimeInput.value) ? els.startTimeInput.value : "08:00";
  const end = isTimeString(els.endTimeInput.value) ? els.endTimeInput.value : nextTime(start);
  els.startTimeInput.value = start;
  els.endTimeInput.value = end;

  if (els.endTimeInput.value > els.startTimeInput.value) return;

  if (targetId === "endTimeInput") {
    els.startTimeInput.value = previousTime(els.endTimeInput.value) || "08:00";
    return;
  }

  els.endTimeInput.value = els.startTimeInput.value === "21:30"
    ? "22:00"
    : nextTime(els.startTimeInput.value);
}

async function saveItem(event) {
  event.preventDefault();
  closePicker();
  const type = els.typeInput.value;
  const id = els.editingId.value;
  const payload = {
    title: els.titleInput.value,
    type,
    note: els.noteInput.value
  };

  if (type !== "루틴") payload.date = els.dateInput.value || state.selectedDate;
  if (type === "일정") payload.endDate = els.endDateInput.value || payload.date;
  if (type === "일정" && els.allDayInput.checked) {
    els.startTimeInput.value = "08:00";
    els.endTimeInput.value = "22:00";
  }
  if (type === "일정" || type === "할일" || type === "루틴") {
    payload.startTime = els.startTimeInput.value;
    payload.endTime = els.endTimeInput.value;
  }
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
  rememberItemTime(item);
  const body = {
    id,
    completed,
    status: completed ? "완료" : "예정"
  };

  if (item.date) body.date = item.date;
  if (item.startTime) body.startTime = item.startTime;
  if (item.endTime) body.endTime = item.endTime;

  await api("/api/items", {
    method: "PATCH",
    body
  });
  await loadItems();
}

function rememberItemTime(item) {
  if (!item || !item.id || (!item.date && !item.startTime && !item.endTime)) return;
  state.itemTimeMemory[item.id] = {
    date: item.date || state.itemTimeMemory[item.id]?.date || "",
    startTime: item.startTime || state.itemTimeMemory[item.id]?.startTime || "",
    endTime: item.endTime || state.itemTimeMemory[item.id]?.endTime || ""
  };
}

function applyRememberedItemTime(item) {
  const remembered = item && state.itemTimeMemory[item.id];
  if (!remembered || (item.type !== "할일" && item.type !== "루틴")) return item;

  return {
    ...item,
    date: item.type === "루틴" ? item.date : item.date || remembered.date,
    startTime: item.startTime || remembered.startTime,
    endTime: item.endTime || remembered.endTime
  };
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
        sourceRoutineId: routine.id
      }
    });
  }

  const challengeMessage = completed ? await awardChallengeFill() : "";
  await loadItems();
  if (challengeMessage) setStatus(challengeMessage);
}

function startTimeSelection(event) {
  const slot = event.target.closest("[data-time-slot]");
  if (
    !slot ||
    event.target.closest(".slot-time") ||
    isTimelineTimeRailPointer(event, slot) ||
    event.target.closest("button, input, textarea, select")
  ) return;
  const context = timelineContextFromSlot(slot);
  const holdDelay = event.pointerType === "touch" ? TIMELINE_TOUCH_HOLD_DELAY : 0;

  window.clearTimeout(state.timeSelectionHoldTimer);
  state.timeSelection = {
    pointerId: event.pointerId,
    context,
    date: state.selectedDate,
    startTime: slot.dataset.timeSlot,
    currentTime: slot.dataset.timeSlot,
    startX: event.clientX,
    startY: event.clientY,
    lastScrollY: event.clientY,
    pointerType: event.pointerType || "mouse",
    active: holdDelay === 0,
    cancelled: false,
    scrolling: false,
    moved: false
  };
  try {
    slot.setPointerCapture?.(event.pointerId);
  } catch {
    // Pointer capture can fail when the browser does not consider the pointer active.
  }

  if (holdDelay === 0) {
    markSelectedTimeSlots();
    return;
  }

  state.timeSelectionHoldTimer = window.setTimeout(() => {
    if (!state.timeSelection || state.timeSelection.pointerId !== event.pointerId || state.timeSelection.cancelled) return;
    state.timeSelection.active = true;
    markSelectedTimeSlots();
  }, holdDelay);
}

function isTimelineTimeRailPointer(event, slot) {
  const body = slot.querySelector(".slot-body");
  if (!body) return false;
  return event.clientX < body.getBoundingClientRect().left;
}

function moveTimeSelection(event) {
  if (!state.timeSelection || state.timeSelection.pointerId !== event.pointerId) return;

  const distance = Math.abs(event.clientX - state.timeSelection.startX) + Math.abs(event.clientY - state.timeSelection.startY);
  if (!state.timeSelection.active) {
    if (state.timeSelection.cancelled) {
      scrollTimelineTouchGesture(event);
      return;
    }
    if (distance > TIMELINE_TOUCH_MOVE_CANCEL_DISTANCE) {
      state.timeSelection.cancelled = true;
      state.timeSelection.moved = true;
      state.timeSelection.scrolling = state.timeSelection.pointerType === "touch";
      window.clearTimeout(state.timeSelectionHoldTimer);
      state.timeSelectionHoldTimer = null;
      scrollTimelineTouchGesture(event);
    }
    return;
  }

  if (distance > TIMELINE_TOUCH_MOVE_CANCEL_DISTANCE) state.timeSelection.moved = true;

  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-time-slot]");
  if (!target) return;

  state.timeSelection.currentTime = target.dataset.timeSlot;
  markSelectedTimeSlots();
}

function scrollTimelineTouchGesture(event) {
  if (!state.timeSelection?.scrolling) return;
  const delta = state.timeSelection.lastScrollY - event.clientY;
  state.timeSelection.lastScrollY = event.clientY;
  if (delta) window.scrollBy(0, delta);
  event.preventDefault?.();
}

function finishTimeSelection(event) {
  if (!state.timeSelection || state.timeSelection.pointerId !== event.pointerId) return;

  const selection = state.timeSelection;
  const { startTime, endTime } = selectedTimeRange(selection.startTime, selection.currentTime);
  window.clearTimeout(state.timeSelectionHoldTimer);
  state.timeSelectionHoldTimer = null;
  state.timeSelection = null;
  clearSelectedTimeSlots();

  if (selection.cancelled) return;
  if (event.target.closest("button, input, textarea, select")) return;

  const nextSelection = {
    context: selection.context,
    date: selection.date,
    type: timelineTypeForContext(selection.context),
    startTime,
    endTime
  };

  if (!selection.moved && timeRangeContainsSlot(state.selectedTimeRange, selection.context, selection.date, selection.startTime)) {
    const pendingSelection = { ...state.selectedTimeRange };
    window.clearTimeout(state.timeClickTimer);
    state.timeClickTimer = window.setTimeout(() => {
      state.timeClickTimer = null;
      if (!els.dialog.open) openSelectedTimelineDialog(pendingSelection);
    }, 280);
    return;
  }

  window.clearTimeout(state.timeClickTimer);
  state.timeClickTimer = null;
  state.selectedTimeRange = nextSelection;
  state.selectedTimelineItem = null;
  render();
}

function cancelTimeSelection() {
  window.clearTimeout(state.timeSelectionHoldTimer);
  state.timeSelectionHoldTimer = null;
  state.timeSelection = null;
  clearSelectedTimeSlots();
}

function startTimelineItemResize(event) {
  const handle = event.target.closest("[data-resize-edge]");
  if (!handle) return;

  const card = handle.closest(".timeline-item");
  const item = findItem(card?.dataset.timelineId);
  if (!card || !canSelectTimelineItem(item) || !card.classList.contains("selected")) return;

  const timeline = card.closest(".timeline");
  if (!timeline) return;

  const startIndex = Number(card.dataset.slotStart || 0);
  const span = Number(card.dataset.slotSpan || 1);
  state.timelineResize = {
    pointerId: event.pointerId,
    id: card.dataset.timelineId,
    edge: handle.dataset.resizeEdge,
    element: card,
    timeline,
    originalStartIndex: startIndex,
    originalSpan: span,
    targetStartIndex: startIndex,
    targetSpan: span,
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };
  handle.setPointerCapture?.(event.pointerId);
  event.preventDefault();
  event.stopPropagation();
}

function moveTimelineItemResize(event) {
  if (!state.timelineResize || state.timelineResize.pointerId !== event.pointerId) return;

  const distance = Math.abs(event.clientX - state.timelineResize.startX) + Math.abs(event.clientY - state.timelineResize.startY);
  if (distance <= 10 && !state.timelineResize.moved) return;

  state.timelineResize.moved = true;
  state.timelineResize.element.classList.add("resizing");
  updateTimelineResizeTarget(event);
  state.timelineResize.element.style.setProperty("--slot-start", state.timelineResize.targetStartIndex);
  state.timelineResize.element.style.setProperty("--slot-span", state.timelineResize.targetSpan);
  markTimelineResizeSlots();
  event.preventDefault();
}

async function finishTimelineItemResize(event) {
  if (!state.timelineResize || state.timelineResize.pointerId !== event.pointerId) return;

  const resize = state.timelineResize;
  const moved = resize.moved;
  const targetStartIndex = resize.targetStartIndex;
  const targetSpan = resize.targetSpan;
  clearTimelineResizeState(false);

  if (!moved) return;

  state.suppressTimelineItemClick = true;
  window.setTimeout(() => {
    state.suppressTimelineItemClick = false;
  }, 300);

  const item = findItem(resize.id);
  if (!item) return;

  const slots = timeSlots();
  const startTime = slots[targetStartIndex] || "08:00";
  const endTime = slots[targetStartIndex + targetSpan] || "22:00";

  try {
    await updateTimelineItemTime(item, startTime, endTime);
  } catch (error) {
    setStatus(error.message || "시간을 변경하지 못했습니다.");
    render();
  }
}

function cancelTimelineItemResize() {
  clearTimelineResizeState(true);
}

function startTimelineItemDrag(event) {
  const card = event.target.closest(".timeline-item");
  if (!card || event.target.closest(".checkbox, .edit-button, .timeline-resize-handle, input, textarea, select")) return;

  const timeline = card.closest(".timeline");
  if (!timeline) return;

  state.timelineDrag = {
    pointerId: event.pointerId,
    id: card.dataset.timelineId,
    element: card,
    timeline,
    originalIndex: Number(card.dataset.slotStart || 0),
    targetIndex: Number(card.dataset.slotStart || 0),
    span: Number(card.dataset.slotSpan || 1),
    startX: event.clientX,
    startY: event.clientY,
    offsetY: event.clientY - card.getBoundingClientRect().top,
    moved: false
  };
  card.setPointerCapture?.(event.pointerId);
}

function moveTimelineItemDrag(event) {
  if (!state.timelineDrag || state.timelineDrag.pointerId !== event.pointerId) return;

  const distance = Math.abs(event.clientX - state.timelineDrag.startX) + Math.abs(event.clientY - state.timelineDrag.startY);
  if (distance <= 10 && !state.timelineDrag.moved) return;

  state.timelineDrag.moved = true;
  state.timelineDrag.element.classList.add("dragging");
  state.timelineDrag.targetIndex = timelineDragTargetIndex(event);
  state.timelineDrag.element.style.setProperty("--slot-start", state.timelineDrag.targetIndex);
  markTimelineDragSlots();
  event.preventDefault();
}

async function finishTimelineItemDrag(event) {
  if (!state.timelineDrag || state.timelineDrag.pointerId !== event.pointerId) return;

  const drag = state.timelineDrag;
  const moved = drag.moved;
  const targetIndex = drag.targetIndex;
  clearTimelineDragState(false);

  if (!moved) return;

  state.suppressTimelineItemClick = true;
  window.setTimeout(() => {
    state.suppressTimelineItemClick = false;
  }, 300);

  const item = findItem(drag.id);
  if (!item) return;

  const slots = timeSlots();
  const startTime = slots[targetIndex] || item.startTime || "08:00";
  const endTime = slots[targetIndex + drag.span] || "22:00";

  try {
    await updateTimelineItemTime(item, startTime, endTime);
  } catch (error) {
    setStatus(error.message || "시간을 변경하지 못했습니다.");
    render();
  }
}

function cancelTimelineItemDrag() {
  clearTimelineDragState(true);
}

async function updateTimelineItemTime(item, startTime, endTime) {
  const body = {
    id: item.id,
    type: item.type,
    startTime,
    endTime
  };

  if (item.type !== "루틴") {
    body.date = item.date || state.selectedDate;
  }
  if (item.type === "일정") {
    body.endDate = item.endDate || body.date;
  }

  rememberItemTime({
    ...item,
    date: body.date || item.date,
    startTime,
    endTime
  });

  await api("/api/items", {
    method: "PATCH",
    body
  });
  await loadItems();
}

function timelineDragTargetIndex(event) {
  const drag = state.timelineDrag;
  const slots = timeSlots();
  const slotHeight = parseFloat(getComputedStyle(drag.timeline).getPropertyValue("--slot-height")) || 56;
  const top = drag.timeline.getBoundingClientRect().top;
  const rawIndex = Math.round((event.clientY - top - drag.offsetY) / slotHeight);
  const maxIndex = Math.max(0, slots.length - drag.span);
  return Math.max(0, Math.min(maxIndex, rawIndex));
}

function updateTimelineResizeTarget(event) {
  const resize = state.timelineResize;
  const slots = timeSlots();
  const slotHeight = parseFloat(getComputedStyle(resize.timeline).getPropertyValue("--slot-height")) || 56;
  const top = resize.timeline.getBoundingClientRect().top;
  const rawIndex = Math.round((event.clientY - top) / slotHeight);
  const originalEndIndex = resize.originalStartIndex + resize.originalSpan;

  if (resize.edge === "start") {
    const nextStartIndex = Math.max(0, Math.min(originalEndIndex - 1, rawIndex));
    resize.targetStartIndex = nextStartIndex;
    resize.targetSpan = originalEndIndex - nextStartIndex;
    return;
  }

  const nextEndIndex = Math.max(resize.originalStartIndex + 1, Math.min(slots.length, rawIndex));
  resize.targetStartIndex = resize.originalStartIndex;
  resize.targetSpan = nextEndIndex - resize.originalStartIndex;
}

function markTimelineDragSlots() {
  clearTimelineDragSlots();
  if (!state.timelineDrag) return;

  const { targetIndex, span, timeline } = state.timelineDrag;
  timeline.querySelectorAll("[data-time-slot]").forEach((slot, index) => {
    if (index >= targetIndex && index < targetIndex + span) {
      slot.classList.add("drag-target");
    }
  });
}

function markTimelineResizeSlots() {
  clearTimelineDragSlots();
  if (!state.timelineResize) return;

  const { targetStartIndex, targetSpan, timeline } = state.timelineResize;
  timeline.querySelectorAll("[data-time-slot]").forEach((slot, index) => {
    if (index >= targetStartIndex && index < targetStartIndex + targetSpan) {
      slot.classList.add("drag-target");
    }
  });
}

function clearTimelineDragSlots() {
  document.querySelectorAll(".slot.drag-target").forEach((slot) => slot.classList.remove("drag-target"));
}

function clearTimelineDragState(restorePosition) {
  if (!state.timelineDrag) return;
  const { element, originalIndex } = state.timelineDrag;
  if (restorePosition) element.style.setProperty("--slot-start", originalIndex);
  element.classList.remove("dragging");
  clearTimelineDragSlots();
  state.timelineDrag = null;
}

function clearTimelineResizeState(restorePosition) {
  if (!state.timelineResize) return;
  const { element, originalStartIndex, originalSpan } = state.timelineResize;
  if (restorePosition) {
    element.style.setProperty("--slot-start", originalStartIndex);
    element.style.setProperty("--slot-span", originalSpan);
  }
  element.classList.remove("resizing");
  clearTimelineDragSlots();
  state.timelineResize = null;
}

function selectCalendarSchedule(id, date) {
  const item = findItem(id);
  if (!item || item.type !== "일정") return;
  state.selectedCalendarSchedule = { id };
  state.selectedDate = date || item.date || state.selectedDate;
  clearSelectedTimelineRange();
  render();
}

function selectedCalendarScheduleMatches(id) {
  return Boolean(state.selectedCalendarSchedule && state.selectedCalendarSchedule.id === id);
}

function startCalendarScheduleResize(event) {
  const handle = event.target.closest("[data-calendar-resize-edge]");
  if (!handle) return;

  const chip = handle.closest(".schedule-chip");
  const item = findItem(chip?.dataset.id);
  if (!chip || !item || item.type !== "일정" || !selectedCalendarScheduleMatches(item.id)) return;

  const range = selectedDateRange(item.date, item.endDate || item.date);
  state.calendarScheduleResize = {
    pointerId: event.pointerId,
    id: item.id,
    edge: handle.dataset.calendarResizeEdge,
    element: chip,
    originalStartDate: range.startDate,
    originalEndDate: range.endDate,
    targetStartDate: range.startDate,
    targetEndDate: range.endDate,
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };
  handle.setPointerCapture?.(event.pointerId);
  event.preventDefault();
  event.stopPropagation();
}

function moveCalendarScheduleResize(event) {
  if (!state.calendarScheduleResize || state.calendarScheduleResize.pointerId !== event.pointerId) return;

  const distance = Math.abs(event.clientX - state.calendarScheduleResize.startX) + Math.abs(event.clientY - state.calendarScheduleResize.startY);
  if (distance <= 8 && !state.calendarScheduleResize.moved) return;

  state.calendarScheduleResize.moved = true;
  state.calendarScheduleResize.element.classList.add("resizing");
  updateCalendarScheduleResizeTarget(event);
  markCalendarScheduleResizeDates();
  event.preventDefault();
}

async function finishCalendarScheduleResize(event) {
  if (!state.calendarScheduleResize || state.calendarScheduleResize.pointerId !== event.pointerId) return;

  const resize = state.calendarScheduleResize;
  const moved = resize.moved;
  const startDate = resize.targetStartDate;
  const endDate = resize.targetEndDate;
  clearCalendarScheduleResizeState(false);

  if (!moved) return;

  state.suppressCalendarScheduleClick = true;
  window.setTimeout(() => {
    state.suppressCalendarScheduleClick = false;
  }, 300);

  const item = findItem(resize.id);
  if (!item) return;

  try {
    await updateCalendarScheduleRange(item, startDate, endDate);
  } catch (error) {
    setStatus(error.message || "일정 기간을 변경하지 못했습니다.");
    render();
  }
}

function cancelCalendarScheduleResize() {
  clearCalendarScheduleResizeState(true);
}

function startCalendarScheduleDrag(event) {
  const chip = event.target.closest(".schedule-chip[data-action='select-calendar-schedule']");
  if (
    !chip ||
    event.target.closest("[data-calendar-resize-edge]") ||
    !selectedCalendarScheduleMatches(chip.dataset.id)
  ) return;

  const item = findItem(chip.dataset.id);
  if (!item || item.type !== "일정") return;

  const range = selectedDateRange(item.date, item.endDate || item.date);
  state.calendarScheduleDrag = {
    pointerId: event.pointerId,
    id: item.id,
    element: chip,
    grabbedDate: chip.dataset.date || range.startDate,
    originalStartDate: range.startDate,
    originalEndDate: range.endDate,
    targetStartDate: range.startDate,
    targetEndDate: range.endDate,
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };
  chip.setPointerCapture?.(event.pointerId);
}

function moveCalendarScheduleDrag(event) {
  if (!state.calendarScheduleDrag || state.calendarScheduleDrag.pointerId !== event.pointerId) return;

  const distance = Math.abs(event.clientX - state.calendarScheduleDrag.startX) + Math.abs(event.clientY - state.calendarScheduleDrag.startY);
  if (distance <= 8 && !state.calendarScheduleDrag.moved) return;

  state.calendarScheduleDrag.moved = true;
  state.calendarScheduleDrag.element.classList.add("dragging");
  updateCalendarScheduleDragTarget(event);
  markCalendarScheduleDragDates();
  event.preventDefault();
}

async function finishCalendarScheduleDrag(event) {
  if (!state.calendarScheduleDrag || state.calendarScheduleDrag.pointerId !== event.pointerId) return;

  const drag = state.calendarScheduleDrag;
  const moved = drag.moved;
  const startDate = drag.targetStartDate;
  const endDate = drag.targetEndDate;
  clearCalendarScheduleDragState();

  if (!moved) return;

  state.suppressCalendarScheduleClick = true;
  window.setTimeout(() => {
    state.suppressCalendarScheduleClick = false;
  }, 300);

  const item = findItem(drag.id);
  if (!item) return;

  try {
    await updateCalendarScheduleRange(item, startDate, endDate);
  } catch (error) {
    setStatus(error.message || "일정 날짜를 변경하지 못했습니다.");
    render();
  }
}

function cancelCalendarScheduleDrag() {
  clearCalendarScheduleDragState();
}

function updateCalendarScheduleDragTarget(event) {
  const drag = state.calendarScheduleDrag;
  const targetDate = calendarDateFromPoint(event);
  if (!targetDate) return;

  const delta = daysBetween(drag.grabbedDate, targetDate);
  drag.targetStartDate = addDays(drag.originalStartDate, delta);
  drag.targetEndDate = addDays(drag.originalEndDate, delta);
}

function markCalendarScheduleDragDates() {
  clearCalendarScheduleDragDates();
  if (!state.calendarScheduleDrag) return;

  const range = selectedDateRange(state.calendarScheduleDrag.targetStartDate, state.calendarScheduleDrag.targetEndDate);
  document.querySelectorAll(".schedule-calendar [data-date]").forEach((day) => {
    const date = day.dataset.date;
    if (date >= range.startDate && date <= range.endDate) {
      day.classList.add("calendar-drag-target");
    }
  });
}

function clearCalendarScheduleDragDates() {
  document.querySelectorAll(".day-cell.calendar-drag-target").forEach((day) => day.classList.remove("calendar-drag-target"));
}

function clearCalendarScheduleDragState() {
  if (!state.calendarScheduleDrag) return;
  state.calendarScheduleDrag.element.classList.remove("dragging");
  clearCalendarScheduleDragDates();
  state.calendarScheduleDrag = null;
}

function startCalendarZoomGesture(event) {
  if (state.tab !== "calendar") return;
  const grid = event.target.closest(".schedule-calendar");
  if (!grid) return;

  if (!state.calendarZoomGesture) {
    state.calendarZoomGesture = {
      active: false,
      grid,
      initialDistance: 0,
      initialZoom: state.calendarZoom,
      moved: false,
      points: new Map()
    };
  }

  const gesture = state.calendarZoomGesture;
  gesture.grid = grid;
  gesture.points.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (gesture.points.size < 2 || gesture.active) return;

  const distance = calendarZoomGestureDistance(gesture);
  if (!distance) return;

  clearCalendarScheduleDragState();
  clearCalendarScheduleResizeState(false);
  gesture.active = true;
  gesture.initialDistance = distance;
  gesture.initialZoom = state.calendarZoom;
  suppressCalendarGestureClicks();
  event.preventDefault();
  event.stopPropagation();
}

function moveCalendarZoomGesture(event) {
  const gesture = state.calendarZoomGesture;
  if (!gesture || !gesture.points.has(event.pointerId)) return;

  gesture.points.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (!gesture.active) return;

  const distance = calendarZoomGestureDistance(gesture);
  if (!distance || !gesture.initialDistance) return;

  const previousZoom = state.calendarZoom;
  const nextZoom = snapCalendarZoomToDefault(clampCalendarZoom(gesture.initialZoom * (distance / gesture.initialDistance)));
  const moved = Math.abs(distance - gesture.initialDistance) > 8 || Math.abs(nextZoom - gesture.initialZoom) > 0.01;
  if (moved) gesture.moved = true;

  if (nextZoom !== previousZoom) {
    state.calendarZoom = nextZoom;
    triggerDefaultCalendarZoomPulse(crossedDefaultCalendarZoom(previousZoom, nextZoom), false);
    applyCalendarZoomToDom();
  }

  event.preventDefault();
  event.stopPropagation();
}

function finishCalendarZoomGesture(event) {
  const gesture = state.calendarZoomGesture;
  if (!gesture || !gesture.points.has(event.pointerId)) return;

  gesture.points.delete(event.pointerId);
  if (gesture.points.size >= 2) return;

  const moved = gesture.active && gesture.moved;
  state.calendarZoomGesture = null;

  if (!moved) return;

  suppressCalendarGestureClicks();
  render();
  event.preventDefault();
  event.stopPropagation();
}

function calendarZoomGestureDistance(gesture) {
  const points = [...gesture.points.values()];
  if (points.length < 2) return 0;

  const [first, second] = points;
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function suppressCalendarGestureClicks() {
  state.suppressCalendarClick = true;
  state.suppressCalendarScheduleClick = true;
  window.setTimeout(() => {
    state.suppressCalendarClick = false;
    state.suppressCalendarScheduleClick = false;
  }, 280);
}

function updateCalendarScheduleResizeTarget(event) {
  const resize = state.calendarScheduleResize;
  const targetDate = calendarDateFromPoint(event);
  if (!targetDate) return;

  if (resize.edge === "start") {
    resize.targetStartDate = targetDate <= resize.originalEndDate ? targetDate : resize.originalEndDate;
    resize.targetEndDate = resize.originalEndDate;
    return;
  }

  resize.targetStartDate = resize.originalStartDate;
  resize.targetEndDate = targetDate >= resize.originalStartDate ? targetDate : resize.originalStartDate;
}

function calendarDateFromPoint(event) {
  return document.elementFromPoint(event.clientX, event.clientY)
    ?.closest(".schedule-calendar [data-date]")
    ?.dataset.date;
}

function markCalendarScheduleResizeDates() {
  clearCalendarScheduleResizeDates();
  if (!state.calendarScheduleResize) return;

  const range = selectedDateRange(state.calendarScheduleResize.targetStartDate, state.calendarScheduleResize.targetEndDate);
  document.querySelectorAll(".schedule-calendar [data-date]").forEach((day) => {
    const date = day.dataset.date;
    if (date >= range.startDate && date <= range.endDate) {
      day.classList.add("calendar-resize-target");
    }
  });
}

function clearCalendarScheduleResizeDates() {
  document.querySelectorAll(".day-cell.calendar-resize-target").forEach((day) => day.classList.remove("calendar-resize-target"));
}

function clearCalendarScheduleResizeState(restoreClass) {
  if (!state.calendarScheduleResize) return;
  state.calendarScheduleResize.element.classList.remove("resizing");
  clearCalendarScheduleResizeDates();
  state.calendarScheduleResize = null;
}

async function updateCalendarScheduleRange(item, startDate, endDate) {
  const range = selectedDateRange(startDate, endDate);
  const body = {
    id: item.id,
    type: "일정",
    date: range.startDate,
    endDate: range.endDate
  };

  if (item.startTime) body.startTime = item.startTime;
  if (item.endTime) body.endTime = item.endTime;

  state.selectedDate = range.startDate;
  state.selectedCalendarSchedule = { id: item.id };
  await api("/api/items", {
    method: "PATCH",
    body
  });
  await loadItems();
}

function startCalendarSelection(event) {
  return;
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
    if (timelineContextFromSlot(slot) === state.timeSelection.context && time >= range.startTime && time < range.endTime) {
      slot.classList.add("selecting");
    }
  });
}

function clearSelectedTimeSlots() {
  document.querySelectorAll(".slot.selecting").forEach((slot) => slot.classList.remove("selecting"));
}

function clearSelectedTimelineRange() {
  window.clearTimeout(state.timeClickTimer);
  window.clearTimeout(state.timeSelectionHoldTimer);
  state.timeClickTimer = null;
  state.timeSelectionHoldTimer = null;
  state.timeSelection = null;
  state.selectedTimeRange = null;
  state.selectedTimelineItem = null;
  clearSelectedTimeSlots();
}

function selectTimelineItem(id, context = "today") {
  const item = findItem(id);
  if (!canSelectTimelineItem(item)) return;
  window.clearTimeout(state.timeClickTimer);
  state.timeClickTimer = null;
  state.selectedTimeRange = null;
  state.selectedTimelineItem = {
    id,
    context,
    date: state.selectedDate
  };
  render();
}

function selectedTimelineItemMatches(id, context) {
  return Boolean(
    state.selectedTimelineItem &&
    state.selectedTimelineItem.id === id &&
    state.selectedTimelineItem.context === context &&
    state.selectedTimelineItem.date === state.selectedDate
  );
}

function canSelectTimelineItem(item) {
  return Boolean(item && (item.type === "일정" || item.type === "할일" || item.type === "루틴"));
}

async function deleteTimelineItem(id) {
  const item = findItem(id);
  if (!canSelectTimelineItem(item)) return;
  state.selectedTimelineItem = null;
  clearSelectedTimelineRange();

  try {
    await api(`/api/items?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setStatus("삭제했습니다.");
    await loadItems();
  } catch (error) {
    setStatus(error.message || "삭제하지 못했습니다.");
    render();
  }
}

function isSelectedTimeSlot(time, context) {
  return timeRangeContainsSlot(state.selectedTimeRange, context, state.selectedDate, time);
}

function timeSlotMatchesSelectedRange(slot) {
  return timeRangeContainsSlot(
    state.selectedTimeRange,
    timelineContextFromSlot(slot),
    state.selectedDate,
    slot.dataset.timeSlot
  );
}

function timeRangeContainsSlot(range, context, date, time) {
  return Boolean(
    range &&
    range.context === context &&
    range.date === date &&
    time >= range.startTime &&
    time < range.endTime
  );
}

function timelineContextFromSlot(slot) {
  return slot.dataset.timelineContext || slot.closest(".timeline")?.dataset.timelineContext || "today";
}

function timelineContextFromAction(action) {
  return action.closest(".timeline")?.dataset.timelineContext || "today";
}

function timelineTypeForContext(context) {
  return context === "calendar" ? "일정" : "할일";
}

function openSelectedTimelineDialog(selection) {
  if (!selection) return;
  state.selectedTimeRange = null;
  render();

  const defaults = {
    date: selection.date,
    startTime: selection.startTime,
    endTime: selection.endTime
  };
  if (selection.type === "일정") defaults.endDate = selection.date;

  openItemDialog(selection.type, null, defaults);
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

function previousTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hour, minute - 30, 0);
  const value = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return value >= "08:00" && value < "22:00" ? value : "";
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function isTimeString(value) {
  return /^\d{2}:\d{2}$/.test(String(value || ""));
}

async function saveEmotion(nextEmotion) {
  if (state.emotionSaving) return;
  const existing = emotionRecord(state.selectedDate);
  const comment = document.querySelector("#emotionComment")?.value || "";
  const emotion = normalizeEmotionValue(nextEmotion || (existing && (existing.emotion || existing.mood)));

  if (!emotion) {
    if (existing) {
      try {
        await api("/api/items", {
          method: "PATCH",
          body: {
            id: existing.id,
            note: comment
          }
        });
        setStatus("코멘트를 저장했습니다.");
        await loadItems();
      } catch (error) {
        setStatus(error.message || "코멘트를 저장하지 못했습니다.");
      }
      return;
    }

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

  state.emotionSaving = true;
  try {
    await api("/api/items", {
      method: "POST",
      body: payload
    });
    setStatus("감정 체크를 저장했습니다.");
    await loadItems();
    if (els.emotionDialog.open && !nextEmotion) {
      els.emotionDialog.close();
    }
  } catch (error) {
    setStatus(error.message || "감정 체크를 저장하지 못했습니다.");
  } finally {
    state.emotionSaving = false;
  }
}

function openEmotionEditor(date) {
  const emotion = emotionRecord(date);
  state.selectedDate = date;
  els.emotionDialogTitle.textContent = humanDate(date);
  els.emotionDialogContent.innerHTML = renderEmotionCheck(emotion);
  if (!els.emotionDialog.open) {
    els.emotionDialog.showModal();
  }
}

function openEmotionDialog(date) {
  const emotion = emotionRecord(date);
  if (!emotion) return;

  els.emotionDialogTitle.textContent = "감정 코멘트";
  const normalizedEmotion = normalizeEmotionValue(emotion.emotion || emotion.mood);
  const palette = emotionPalette(normalizedEmotion);
  const swatchStyle = palette
    ? ` style="--emotion-swatch:${palette.color}; --emotion-swatch-border:${palette.border};"`
    : "";
  const note = emotion.note ? escapeHtml(emotion.note) : "코멘트 없음";

  els.emotionDialogContent.innerHTML = `
    <div class="emotion-dialog-date">${humanDate(date)}</div>
    <div class="emotion-dialog-row">
      <span class="emotion-dialog-swatch"${swatchStyle}></span>
      <span>${normalizedEmotion ? escapeHtml(normalizedEmotion) : "색상 없음"}</span>
    </div>
    <p class="emotion-dialog-comment">${note}</p>
  `;
  els.emotionDialog.showModal();
}

async function removeEmotion(date) {
  const existing = emotionRecord(date);
  if (!existing) {
    if (els.emotionDialog.open) els.emotionDialog.close();
    render();
    return;
  }

  try {
    if (els.emotionDialog.open) els.emotionDialog.close();
    await api(`/api/items?id=${encodeURIComponent(existing.id)}`, { method: "DELETE" });
    setStatus("감정 기록을 제거했습니다.");
    await loadItems();
  } catch (error) {
    setStatus(error.message || "감정 기록을 제거하지 못했습니다.");
  }
}

function setTab(tab) {
  const changed = state.tab !== tab;
  const today = todayString();
  state.tab = tab;
  state.lastCalendarClick = null;
  state.lastEmotionClick = null;
  if (changed) {
    state.selectedDate = today;
    state.visibleMonth = monthStart(today);
    state.calendarZoomGesture = null;
    resetCalendarZoom(false);
  }
  if (tab !== "emotion") state.selectedEmotionDate = null;
  if (tab !== "emotion") state.selectedChallengeLayer = null;
  if (tab !== "calendar") state.selectedCalendarSchedule = null;
  if (tab !== "calendar" && els.calendarTimelineDialog.open) els.calendarTimelineDialog.close();
  clearSelectedTimelineRange();
  render();
}

function adjustCalendarZoom(delta) {
  const previousZoom = state.calendarZoom;
  const nextZoom = clampCalendarZoom(previousZoom + delta);
  state.calendarZoom = snapCalendarZoomToDefault(nextZoom);
  triggerDefaultCalendarZoomPulse(crossedDefaultCalendarZoom(previousZoom, state.calendarZoom));
  render();
}

function resetCalendarZoom(withPulse) {
  state.calendarZoom = CALENDAR_ZOOM_DEFAULT;
  triggerDefaultCalendarZoomPulse(withPulse);
}

function triggerDefaultCalendarZoomPulse(active, renderAfterPulse = true) {
  window.clearTimeout(state.calendarZoomPulseTimer);
  state.calendarZoomPulse = Boolean(active);
  if (!active) return;

  state.calendarZoomPulseTimer = window.setTimeout(() => {
    state.calendarZoomPulse = false;
    if (state.tab !== "calendar") return;
    if (renderAfterPulse) {
      render();
      return;
    }
    applyCalendarZoomToDom();
  }, 320);
}

function applyCalendarZoomToDom() {
  const grid = document.querySelector(".schedule-calendar");
  if (!grid) return;

  const scheduleRowCount = Number(
    grid.style.getPropertyValue("--schedule-row-count") ||
    getComputedStyle(grid).getPropertyValue("--schedule-row-count")
  ) || 2;

  calendarZoomStyle(scheduleRowCount).split(";").forEach((rule) => {
    const [property, value] = rule.split(":");
    if (!property || !value) return;
    grid.style.setProperty(property.trim(), value.trim());
  });
  grid.classList.toggle("zoom-default-hit", state.calendarZoomPulse);
  document
    .querySelector("[data-action='calendar-zoom-reset']")
    ?.classList.toggle("is-default", isDefaultCalendarZoom());
}

function clampCalendarZoom(value) {
  return Math.max(CALENDAR_ZOOM_MIN, Math.min(CALENDAR_ZOOM_MAX, Math.round(value * 100) / 100));
}

function snapCalendarZoomToDefault(value) {
  return Math.abs(value - CALENDAR_ZOOM_DEFAULT) < 0.02 ? CALENDAR_ZOOM_DEFAULT : value;
}

function crossedDefaultCalendarZoom(previousZoom, nextZoom) {
  return nextZoom === CALENDAR_ZOOM_DEFAULT && previousZoom !== CALENDAR_ZOOM_DEFAULT;
}

function isDefaultCalendarZoom() {
  return state.calendarZoom === CALENDAR_ZOOM_DEFAULT;
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

function routineTimeLabel(routine) {
  if (!routine.startTime) return "";
  return routine.endTime ? `${routine.startTime}-${routine.endTime}` : routine.startTime;
}

function routineMeta(routine) {
  const parts = [routineTimeLabel(routine), routineDaysLabel(routine), `${routineStreak(routine.id)}일 연속`]
    .filter(Boolean);
  return parts.map(escapeHtml).join(" · ");
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
  const last = monthEnd(monthDate);
  const start = addDays(first, -new Date(`${first}T00:00:00`).getDay());
  const end = addDays(last, 6 - new Date(`${last}T00:00:00`).getDay());
  const length = daysBetween(start, end) + 1;

  return Array.from({ length }, (_, index) => {
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

function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.round((end - start) / 86400000);
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
