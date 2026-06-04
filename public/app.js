const state = {
  authenticated: false,
  loading: false,
  tab: "today",
  selectedDate: todayString(),
  visibleMonth: monthStart(todayString()),
  items: [],
  itemTimeMemory: {},
  editingItem: null,
  itemDialogReturnTarget: null,
  itemDialogSaveInProgress: false,
  timeSelection: null,
  selectedTimeRange: null,
  selectedTimelineItem: null,
  timeClickTimer: null,
  timeSelectionHoldTimer: null,
  suppressTimeSelectionPointerId: null,
  suppressTimeSelectionTimer: null,
  timelineDrag: null,
  timelineResize: null,
  suppressTimelineItemClick: false,
  calendarSelection: null,
  calendarMonthSwipe: null,
  selectedCalendarSchedule: null,
  calendarScheduleResize: null,
  calendarScheduleDrag: null,
  calendarScheduleDragFrame: null,
  suppressCalendarControlClick: false,
  calendarZoom: 1.48,
  calendarZoomGesture: null,
  calendarZoomPulse: false,
  calendarZoomPulseTimer: null,
  suppressCalendarScheduleClick: false,
  suppressCalendarClick: false,
  lastCalendarClick: null,
  lastCalendarScheduleTap: null,
  calendarSelectedDate: null,
  selectedEmotionDate: null,
  selectedChallengeLayer: null,
  challengeAnalysis: null,
  challengeRenderToken: 0,
  lastEmotionClick: null,
  emotionClickTimer: null,
  suppressEmotionDblclick: false,
  picker: null,
  lastHapticAt: 0,
  timeWheelSettleTimer: null,
  timeWheelProgrammaticScroll: false,
  suppressPickerOutsideClick: false,
  pickerOutsideClickTimer: null,
  emotionSaving: false,
  challengeSaving: false,
  pinSubmitting: false
};

const PIN_LENGTH = 4;
const CALENDAR_ZOOM_MIN = 0.76;
const CALENDAR_ZOOM_MAX = 1.48;
const CALENDAR_ZOOM_DEFAULT = CALENDAR_ZOOM_MAX;
const CALENDAR_ZOOM_STEP = 0.12;
const CALENDAR_MONTH_SWIPE_DISTANCE = 38;
const CALENDAR_MONTH_SWIPE_RATIO = 0.82;
const CALENDAR_MONTH_SWIPE_VISUAL_LIMIT = 124;
const TIMELINE_START_MINUTES = 0;
const TIMELINE_END_MINUTES = 24 * 60;
const TIMELINE_ROW_MINUTES = 60;
const TIMELINE_TIME_STEP_MINUTES = 5;
const TIMELINE_MANIPULATION_STEP_MINUTES = 30;
const TIMELINE_RESIZE_MIN_MINUTES = 60;
const DEFAULT_ITEM_DURATION_MINUTES = 60;
const FULL_DAY_START_TIME = "00:00";
const FULL_DAY_END_TIME = "24:00";
const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "09:00";
const HAPTIC_DURATION_MS = 8;
const HAPTIC_MIN_INTERVAL_MS = 52;
const TIME_WHEEL_SETTLE_DELAY_MS = 90;
const TIME_WHEEL_WHEEL_PIXEL_STEP = 44;
const TIME_WHEEL_LOOP_COPIES = 7;
const TIMELINE_TOUCH_HOLD_DELAY = 260;
const TIMELINE_TOUCH_MOVE_CANCEL_DISTANCE = 10;
const AUTH_UNLOCK_ANIMATION_MS = 500;
const AUTH_MOOD_STORAGE_KEY = "sephia-chord.authMood";
const AUTH_PHRASE_STORAGE_KEY = "sephia-chord.authPhrase";
const ITEM_CACHE_STORAGE_KEY = "sephia-chord.itemsCache.v1";
const ITEM_CACHE_MAX_RANGES = 6;
const ITEM_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const AUTH_PHRASES = [
  { id: "chord", text: "Keep your chord" },
  { id: "rhythm", text: "Move in your rhythm" },
  { id: "soft", text: "Today can be soft" }
];
const CHALLENGE_CANVAS_WIDTH = 720;
const CHALLENGE_WHITE_THRESHOLD = 250;
const CHALLENGE_MIN_LAYER_AREA = 400;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ROUTINE_DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const ROUTINE_DAY_LABELS = {
  "일": "Sun",
  "월": "Mon",
  "화": "Tue",
  "수": "Wed",
  "목": "Thu",
  "금": "Fri",
  "토": "Sat"
};
const TYPE_LABELS = {
  "일정": "Event",
  "고정일정": "Fixed",
  "할일": "Task",
  "루틴": "Routine",
  "루틴기록": "Routine Log",
  "감정": "Emotion",
  "기분": "Mood",
  "챌린지": "Challenge"
};
const TYPE_VALUE_ALIASES = Object.fromEntries(
  Object.entries(TYPE_LABELS).map(([value, label]) => [label, value])
);
const EMOTION_LABELS = {
  "나쁨": "Bad",
  "애매함": "Mixed",
  "좋음": "Good",
  "빨강": "Red",
  "빨강 1": "Red 1",
  "빨강 2": "Red 2",
  "빨강 3": "Red 3",
  "빨강 4": "Red 4",
  "빨강 5": "Red 5",
  "파랑": "Blue",
  "파랑 1": "Blue 1",
  "파랑 2": "Blue 2",
  "파랑 3": "Blue 3",
  "파랑 4": "Blue 4",
  "파랑 5": "Blue 5",
  "초록": "Green",
  "초록 1": "Green 1",
  "초록 2": "Green 2",
  "초록 3": "Green 3",
  "초록 4": "Green 4",
  "초록 5": "Green 5"
};
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
const buttonPressTimers = new WeakMap();
const KOREAN_CALENDAR_MARKS = {
  "2026-01-01": { label: "신정", kind: "holiday" },
  "2026-02-16": { label: "설 연휴", kind: "festival" },
  "2026-02-17": { label: "설날", kind: "festival" },
  "2026-02-18": { label: "설 연휴", kind: "festival" },
  "2026-03-01": { label: "삼일절", kind: "national" },
  "2026-03-02": { label: "대체휴일", kind: "substitute" },
  "2026-05-05": { label: "어린이날", kind: "holiday" },
  "2026-05-24": { label: "부처님오신날", kind: "holiday" },
  "2026-05-25": { label: "대체휴일", kind: "substitute" },
  "2026-06-03": { label: "지방선거", kind: "holiday" },
  "2026-06-06": { label: "현충일", kind: "holiday" },
  "2026-07-17": { label: "제헌절", kind: "national-observed" },
  "2026-08-15": { label: "광복절", kind: "national" },
  "2026-08-17": { label: "대체휴일", kind: "substitute" },
  "2026-09-24": { label: "추석 연휴", kind: "festival" },
  "2026-09-25": { label: "추석", kind: "festival" },
  "2026-09-26": { label: "추석 연휴", kind: "festival" },
  "2026-10-03": { label: "개천절", kind: "national" },
  "2026-10-05": { label: "대체휴일", kind: "substitute" },
  "2026-10-09": { label: "한글날", kind: "national" },
  "2026-12-25": { label: "성탄절", kind: "holiday" },
  "2027-01-01": { label: "신정", kind: "holiday" },
  "2027-02-06": { label: "설 연휴", kind: "festival" },
  "2027-02-07": { label: "설날", kind: "festival" },
  "2027-02-08": { label: "설 연휴", kind: "festival" },
  "2027-02-09": { label: "대체휴일", kind: "substitute" },
  "2027-03-01": { label: "삼일절", kind: "national" },
  "2027-05-05": { label: "어린이날", kind: "holiday" },
  "2027-05-13": { label: "부처님오신날", kind: "holiday" },
  "2027-06-06": { label: "현충일", kind: "holiday" },
  "2027-07-17": { label: "제헌절", kind: "national-observed" },
  "2027-08-15": { label: "광복절", kind: "national" },
  "2027-08-16": { label: "대체휴일", kind: "substitute" },
  "2027-09-14": { label: "추석 연휴", kind: "festival" },
  "2027-09-15": { label: "추석", kind: "festival" },
  "2027-09-16": { label: "추석 연휴", kind: "festival" },
  "2027-10-03": { label: "개천절", kind: "national" },
  "2027-10-04": { label: "대체휴일", kind: "substitute" },
  "2027-10-09": { label: "한글날", kind: "national" },
  "2027-10-11": { label: "대체휴일", kind: "substitute" },
  "2027-12-25": { label: "성탄절", kind: "holiday" },
  "2027-12-27": { label: "대체휴일", kind: "substitute" }
};

const els = {
  allDayField: document.querySelector("#allDayField"),
  allDayInput: document.querySelector("#allDayInput"),
  appView: document.querySelector("#appView"),
  authCatchphrase: document.querySelector("#authCatchphrase"),
  authMessage: document.querySelector("#authMessage"),
  authPhraseContent: document.querySelector("#authPhraseContent"),
  authPhraseDialog: document.querySelector("#authPhraseDialog"),
  authUnlockLogo: document.querySelector(".auth-unlock-logo"),
  authView: document.querySelector("#authView"),
  calendarTimelineContent: document.querySelector("#calendarTimelineContent"),
  calendarTimelineDialog: document.querySelector("#calendarTimelineDialog"),
  calendarTimelineTitle: document.querySelector("#calendarTimelineTitle"),
  calendarTab: document.querySelector("#calendarTab"),
  closeCalendarTimelineDialogButton: document.querySelector("#closeCalendarTimelineDialogButton"),
  closeAuthPhraseDialogButton: document.querySelector("#closeAuthPhraseDialogButton"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  closeEmotionDialogButton: document.querySelector("#closeEmotionDialogButton"),
  closeLogoutMoodDialogButton: document.querySelector("#closeLogoutMoodDialogButton"),
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
  itemDialogBackdrop: document.querySelector("#itemDialogBackdrop"),
  loginForm: document.querySelector("#loginForm"),
  logoutMoodContent: document.querySelector("#logoutMoodContent"),
  logoutMoodDialog: document.querySelector("#logoutMoodDialog"),
  noteInput: document.querySelector("#noteInput"),
  passwordInput: document.querySelector("#passwordInput"),
  phraseButton: document.querySelector("#phraseButton"),
  pickerPanel: document.querySelector("#pickerPanel"),
  routinesTab: document.querySelector("#routinesTab"),
  routineFields: document.querySelector("#routineFields"),
  scheduleFields: document.querySelector("#scheduleFields"),
  selectedDateLabel: document.querySelector("#selectedDateLabel"),
  startTimeDisplay: document.querySelector("#startTimeDisplay"),
  startTimeLabel: document.querySelector("#startTimeLabel"),
  startTimeInput: document.querySelector("#startTimeInput"),
  endTimeDisplay: document.querySelector("#endTimeDisplay"),
  endTimeLabel: document.querySelector("#endTimeLabel"),
  statusMessage: document.querySelector("#statusMessage"),
  titleInput: document.querySelector("#titleInput"),
  todayTab: document.querySelector("#todayTab"),
  typeInput: document.querySelector("#typeInput")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  applyStoredAuthMood();
  applyStoredAuthPhrase();
  bindEvents();
  await requireLoginOnEntry();
}

function bindEvents() {
  els.loginForm.addEventListener("submit", login);
  document.addEventListener("keydown", handlePinKeydown);
  document.addEventListener("pointerdown", closePickerOnOutsidePointer, true);
  document.addEventListener("pointerdown", closeItemDialogOnOutsidePointer, true);
  document.addEventListener("click", closeItemDialogOnOutsidePointer, true);
  document.addEventListener("click", suppressPickerOutsideClick, true);
  bindDialogButtonFeedback();
  document.querySelector("#logoutButton").addEventListener("click", logout);
  document.querySelector("#refreshButton").addEventListener("click", loadItems);
  els.phraseButton.addEventListener("click", openAuthPhraseDialog);
  els.closeCalendarTimelineDialogButton.addEventListener("click", () => els.calendarTimelineDialog.close());
  els.closeDialogButton.addEventListener("click", cancelItemDialog);
  els.itemDialogBackdrop.addEventListener("pointerdown", handleItemDialogBackdropPress);
  els.itemDialogBackdrop.addEventListener("click", cancelItemDialog);
  els.closeEmotionDialogButton.addEventListener("click", () => els.emotionDialog.close());
  els.closeLogoutMoodDialogButton.addEventListener("click", () => els.logoutMoodDialog.close());
  els.closeAuthPhraseDialogButton.addEventListener("click", () => els.authPhraseDialog.close());
  els.dialog.addEventListener("pointerdown", closeItemDialogOnOutsidePointer);
  els.dialog.addEventListener("click", closeItemDialogOnOutsidePointer);
  els.dialog.addEventListener("close", handleItemDialogClose);
  els.dialog.addEventListener("cancel", closePicker);
  els.allDayInput.addEventListener("change", applyAllDayTime);
  els.typeInput.addEventListener("change", updateFormVisibility);
  document.querySelectorAll("[data-type-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      els.typeInput.value = button.dataset.typeChoice;
      updateFormVisibility();
    });
  });
  els.itemForm.addEventListener("submit", saveItem);
  els.deleteButton.addEventListener("click", deleteCurrentItem);
  document.querySelectorAll("[data-picker]").forEach((input) => {
    input.addEventListener("pointerdown", (event) => openPickerFromPointer(event, input));
    input.addEventListener("click", (event) => openPickerFromClick(event, input));
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
  document.querySelectorAll(".time-editor-field").forEach((field) => {
    field.addEventListener("pointerdown", (event) => openPickerFromPointer(event, field.querySelector("[data-picker='time']")));
    field.addEventListener("click", (event) => openPickerFromClick(event, field.querySelector("[data-picker='time']")));
  });
  document.querySelectorAll(".date-editor-field").forEach((field) => {
    field.addEventListener("pointerdown", (event) => openPickerFromPointer(event, field.querySelector("[data-picker='date']")));
    field.addEventListener("click", (event) => openPickerFromClick(event, field.querySelector("[data-picker='date']")));
  });
  document.querySelectorAll(".editor-date-time-row").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest(".date-editor-field, .time-editor-field")) return;
      const input = row.id === "endDateField" || event.offsetX > row.clientWidth * 0.62
        ? row.querySelector("[data-picker='time']")
        : row.querySelector("[data-picker='date']");
      openPicker(input);
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
      const isSelected = selectedTimelineItemMatches(id, context);
      if (isSelected && event.detail > 1) {
        await deleteTimelineItem(id);
        return;
      }
      if (isSelected) return;
      selectTimelineItem(id, context);
      return;
    }
    if (action.dataset.action === "select-calendar-schedule") {
      event.stopPropagation();
      const isSelected = selectedCalendarScheduleMatches(id);
      const isDoubleTap = registerCalendarScheduleTap(id) || event.detail > 1;
      if (isSelected && isDoubleTap) {
        await deleteCalendarSchedule(id);
        return;
      }
      if (isSelected) return;
      selectCalendarSchedule(id, action.dataset.date);
      return;
    }
    if (action.dataset.action === "choose-calendar-span-edge") {
      event.stopPropagation();
      if (state.suppressCalendarControlClick) {
        event.preventDefault();
        state.suppressCalendarControlClick = false;
        return;
      }
      await adjustCalendarScheduleSpan(id, action.dataset.calendarSpanEdge);
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
    if (action.dataset.action === "skip-fixed-schedule") {
      event.stopPropagation();
      await skipFixedSchedule(id, action.dataset.date || state.selectedDate);
    }
    if (action.dataset.action === "return-fixed-schedule") {
      event.stopPropagation();
      await returnFixedSchedule(id);
    }
    if (action.dataset.action === "set-emotion") {
      event.stopPropagation();
      markEmotionSelection(action.dataset.emotion);
      await saveEmotion(action.dataset.emotion);
    }
    if (action.dataset.action === "choose-logout-mood") {
      event.stopPropagation();
      await chooseLogoutMood(action.dataset.emotion);
    }
    if (action.dataset.action === "choose-auth-phrase") {
      event.stopPropagation();
      chooseAuthPhrase(action.dataset.phraseId);
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

      if (state.tab === "calendar") {
        const wasSelected = state.calendarSelectedDate === selectedDate;
        state.selectedDate = selectedDate;
        state.calendarSelectedDate = selectedDate;
        state.lastCalendarClick = null;
        state.selectedCalendarSchedule = null;
        clearSelectedTimelineRange();
        render();
        if (wasSelected) openCalendarTimelineDialog();
        return;
      }
      state.selectedDate = selectedDate;
      state.lastCalendarClick = null;
      state.selectedCalendarSchedule = null;
      clearSelectedTimelineRange();
      render();
      return;
    }
    if (action.dataset.action === "month-prev") {
      await changeCalendarMonth(-1);
    }
    if (action.dataset.action === "month-next") {
      await changeCalendarMonth(1);
    }
  });

  document.body.addEventListener("dblclick", async (event) => {
    const scheduleChip = event.target.closest(".schedule-chip[data-action='select-calendar-schedule']");
    if (scheduleChip && selectedCalendarScheduleMatches(scheduleChip.dataset.id)) {
      event.preventDefault();
      event.stopPropagation();
      await deleteCalendarSchedule(scheduleChip.dataset.id);
      return;
    }

    const card = event.target.closest(".timeline-item");
    if (card && !event.target.closest(".checkbox, .fixed-skip-button, .edit-button") && canSelectTimelineItem(findItem(card.dataset.timelineId))) {
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
  document.body.addEventListener("pointerdown", startCalendarMonthSwipe);
  document.body.addEventListener("pointermove", moveCalendarMonthSwipe);
  document.body.addEventListener("pointerup", finishCalendarMonthSwipe);
  document.body.addEventListener("pointercancel", cancelCalendarMonthSwipe);
  document.body.addEventListener("pointerdown", clearTimelineItemOnOutsidePointer);
  document.body.addEventListener("pointerdown", clearCalendarDateOnOutsidePointer);
  document.addEventListener("scroll", clearTimelineItemOnScroll, true);
  document.body.addEventListener("pointerdown", startCalendarSelection);
  document.body.addEventListener("pointermove", moveCalendarSelection);
  document.body.addEventListener("pointerup", finishCalendarSelection);
  document.body.addEventListener("pointercancel", cancelCalendarSelection);
  window.addEventListener("pagehide", lockAppForNextEntry);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") lockAppForNextEntry();
  });
  window.addEventListener("resize", handleViewportResize);
}

function bindDialogButtonFeedback() {
  document
    .querySelectorAll("#itemDialog .dialog-text-button, .dialog-close-button")
    .forEach((button) => {
      button.addEventListener("pointerdown", () => setButtonPressed(button, true));
      button.addEventListener("pointerup", () => setButtonPressed(button, false, 140));
      button.addEventListener("pointerleave", () => setButtonPressed(button, false));
      button.addEventListener("pointercancel", () => setButtonPressed(button, false));
    });
}

function setButtonPressed(button, pressed, delay = 0) {
  const existingTimer = buttonPressTimers.get(button);
  if (existingTimer) window.clearTimeout(existingTimer);

  if (pressed) {
    button.classList.add("is-pressed");
    buttonPressTimers.delete(button);
    return;
  }

  const removePressed = () => {
    button.classList.remove("is-pressed");
    buttonPressTimers.delete(button);
  };

  if (delay > 0) {
    buttonPressTimers.set(button, window.setTimeout(removePressed, delay));
    return;
  }

  removePressed();
}

async function checkAuth() {
  const response = await api("/api/auth");
  state.authenticated = Boolean(response.authenticated);
  els.authView.hidden = state.authenticated;
  els.appView.hidden = !state.authenticated;
  if (state.authenticated) await loadItems();
}

async function requireLoginOnEntry() {
  lockAppView();
  await clearAuthSession();
}

async function login(event) {
  event.preventDefault();
  if (state.pinSubmitting) return;
  els.authMessage.textContent = "";
  const password = els.passwordInput.value;

  if (!new RegExp(`^\\d{${PIN_LENGTH}}$`).test(password)) {
    els.authMessage.textContent = "Enter a 4-digit PIN.";
    return;
  }

  state.pinSubmitting = true;
  try {
    await api("/api/auth", {
      method: "POST",
      body: { password }
    });
    setPinValue("");
    await unlockAppAfterLogin();
  } catch (error) {
    els.authMessage.textContent = authErrorMessage(error);
    setPinValue("");
  } finally {
    state.pinSubmitting = false;
  }
}

async function logout() {
  openLogoutMoodDialog();
}

async function completeLogout() {
  await clearAuthSession();
  lockAppView();
}

function openLogoutMoodDialog() {
  if (!els.logoutMoodDialog || !els.logoutMoodContent) {
    completeLogout();
    return;
  }

  els.logoutMoodContent.innerHTML = renderLogoutMoodChoices(storedAuthMood());
  if (!els.logoutMoodDialog.open) {
    els.logoutMoodDialog.showModal();
  }
}

function renderLogoutMoodChoices(selectedEmotion = "") {
  const normalized = normalizeEmotionValue(selectedEmotion);
  return `
    <div class="logout-mood-grid" aria-label="Mood color selection">
      ${EMOTION_GROUPS.map((group) => `
        <div class="logout-mood-row" aria-label="${displayEmotion(group.name)}">
          ${group.options.map((option) => `
            <button
              type="button"
              class="logout-mood-button ${normalized === option.value ? "selected" : ""}"
              data-action="choose-logout-mood"
              data-emotion="${option.value}"
              aria-label="${displayEmotion(option.value)}"
              style="--emotion-swatch:${option.color}; --emotion-swatch-border:${option.border};"
            ></button>
          `).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

async function chooseLogoutMood(emotion) {
  const normalized = normalizeEmotionValue(emotion);
  if (!emotionPalette(normalized)) return;
  storeAuthMood(normalized);
  applyAuthMood(normalized);
  if (els.logoutMoodDialog.open) els.logoutMoodDialog.close();
  await completeLogout();
}

async function unlockAppAfterLogin() {
  state.authenticated = true;
  resetStateForLoginEntry();
  els.appView.hidden = false;
  const loadPromise = loadItems();
  await playAuthUnlockAnimation();
  els.authView.hidden = true;
  els.authView.classList.remove("is-unlocking");
  await loadPromise;
}

function resetStateForLoginEntry() {
  const today = todayString();
  state.tab = "today";
  state.selectedDate = today;
  state.visibleMonth = monthStart(today);
  state.calendarSelectedDate = null;
  state.selectedCalendarSchedule = null;
  state.selectedEmotionDate = null;
  state.selectedChallengeLayer = null;
  state.calendarZoomGesture = null;
  resetCalendarZoom(false);
  clearSelectedTimelineRange();
}

function playAuthUnlockAnimation() {
  els.authView.classList.remove("is-glitching");
  els.authView.classList.add("is-unlocking");
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, AUTH_UNLOCK_ANIMATION_MS);
  });
}

function lockAppForNextEntry() {
  if (!state.authenticated) return;
  lockAppView();
  clearAuthSession({ keepalive: true });
}

function lockAppView() {
  state.authenticated = false;
  applyStoredAuthMood();
  applyStoredAuthPhrase();
  document.documentElement.classList.remove("fixed-tab");
  document.body.classList.remove("fixed-tab");
  document.body.removeAttribute("data-active-tab");
  els.appView.removeAttribute("data-tab");
  els.authView.classList.remove("is-unlocking");
  els.authView.classList.remove("is-glitching");
  setPinValue("");
  if (els.calendarTimelineDialog.open) els.calendarTimelineDialog.close();
  if (els.dialog.open) els.dialog.close();
  state.itemDialogReturnTarget = null;
  state.itemDialogSaveInProgress = false;
  if (els.emotionDialog.open) els.emotionDialog.close();
  if (els.logoutMoodDialog.open) els.logoutMoodDialog.close();
  els.authView.hidden = false;
  els.appView.hidden = true;
}

async function clearAuthSession(options = {}) {
  try {
    await api("/api/auth", {
      method: "DELETE",
      keepalive: Boolean(options.keepalive)
    });
  } catch {
    // The local lock screen is still enforced even if the network drops while closing.
  }
}

function authErrorMessage(error) {
  const payload = error.payload || {};
  if (payload.error === "login_locked") {
    return `Try again in ${formatRetryAfter(payload.retryAfterSeconds)}.`;
  }
  if (payload.remainingAttempts !== undefined) {
    return `Incorrect PIN. ${payload.remainingAttempts} attempts left.`;
  }
  return "Incorrect PIN.";
}

function formatRetryAfter(seconds) {
  const value = Math.max(1, Number(seconds) || 1);
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  if (minutes && rest) return `${minutes}m ${rest}s`;
  if (minutes) return `${minutes}m`;
  return `${rest}s`;
}

function appendPinDigit(digit) {
  if (els.authView.hidden || state.pinSubmitting || !/^\d$/.test(String(digit))) return;
  if (els.passwordInput.value.length >= PIN_LENGTH) return;
  setPinValue(`${els.passwordInput.value}${digit}`);
  pulseAuthScreenGlitch();
  if (els.passwordInput.value.length === PIN_LENGTH) {
    window.setTimeout(() => els.loginForm.requestSubmit(), 120);
  }
}

function deletePinDigit() {
  if (els.authView.hidden || state.pinSubmitting) return;
  setPinValue(els.passwordInput.value.slice(0, -1));
  pulseAuthScreenGlitch();
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

function pulseAuthScreenGlitch() {
  if (!els.authView || els.authView.hidden) return;
  els.authView.classList.remove("is-glitching");
  void els.authView.offsetWidth;
  els.authView.classList.add("is-glitching");
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
  const range = queryRange();
  const cacheUsed = hydrateItemsFromCache(range);
  setStatus(cacheUsed ? "Syncing..." : "Loading...");
  state.loading = true;
  const { start, end } = range;

  try {
    const payload = await api(`/api/items?start=${start}&end=${end}`);
    setItems(payload.items || []);
    writeItemsCache(range, state.items);
    setStatus("");
  } catch (error) {
    if (!cacheUsed) {
      state.items = [];
      render();
    }
    setStatus(error.message || "Could not load Notion data.");
  } finally {
    state.loading = false;
  }
}

function setItems(items, options = {}) {
  state.items = (items || []).map(applyRememberedItemTime);
  state.items.forEach(rememberItemTime);
  if (options.renderAfter !== false) render();
}

function hydrateItemsFromCache(range = queryRange()) {
  const entry = readItemsCache(range);
  if (!entry) return false;
  setItems(entry.items || []);
  return true;
}

function readItemsCache(range = queryRange()) {
  try {
    const cache = JSON.parse(window.localStorage.getItem(ITEM_CACHE_STORAGE_KEY) || "{}");
    const entry = cache.ranges?.[itemsCacheRangeKey(range)];
    if (!entry || !Array.isArray(entry.items)) return null;
    if (Date.now() - Number(entry.savedAt || 0) > ITEM_CACHE_MAX_AGE_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

function writeActiveItemsCache() {
  writeItemsCache(queryRange(), state.items);
}

function writeItemsCache(range = queryRange(), items = state.items) {
  try {
    const cache = JSON.parse(window.localStorage.getItem(ITEM_CACHE_STORAGE_KEY) || "{}");
    const ranges = cache.ranges && typeof cache.ranges === "object" ? cache.ranges : {};
    const key = itemsCacheRangeKey(range);
    ranges[key] = {
      savedAt: Date.now(),
      items
    };

    Object.entries(ranges)
      .sort((left, right) => Number(right[1]?.savedAt || 0) - Number(left[1]?.savedAt || 0))
      .slice(ITEM_CACHE_MAX_RANGES)
      .forEach(([staleKey]) => {
        delete ranges[staleKey];
      });

    window.localStorage.setItem(ITEM_CACHE_STORAGE_KEY, JSON.stringify({ ranges }));
  } catch {
    // Cache writes are best-effort; Notion remains the source of truth.
  }
}

function itemsCacheRangeKey(range = queryRange()) {
  return `${range.start}|${range.end}`;
}

function render() {
  els.selectedDateLabel.textContent = humanDate(topbarDisplayDate());
  renderTabs();
  renderToday();
  renderCalendar();
  renderCalendarTimelineDialog();
  renderEmotionTab();
  renderRoutines();
}

function renderActiveView() {
  els.selectedDateLabel.textContent = humanDate(topbarDisplayDate());
  renderTabs();

  if (state.tab === "today") {
    renderToday();
    return;
  }
  if (state.tab === "calendar") {
    renderCalendar();
    renderCalendarTimelineDialog();
    return;
  }
  if (state.tab === "emotion") {
    renderEmotionTab();
    return;
  }
  if (state.tab === "routines") {
    renderRoutines();
  }
}

function renderLocalChange(options = {}) {
  if (options.renderAfter === false) return;
  if (options.fullRender) {
    render();
    return;
  }
  renderActiveView();
}

function topbarDisplayDate() {
  return state.tab === "calendar" ? todayString() : state.selectedDate;
}

function renderTabs() {
  const fixedTab = state.tab === "calendar" || state.tab === "emotion";
  document.documentElement.classList.toggle("fixed-tab", fixedTab);
  document.body.classList.toggle("fixed-tab", fixedTab);
  document.body.dataset.activeTab = state.tab;
  els.appView.dataset.tab = state.tab;

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
  updateFixedTabMetrics({ immediate: true });
}

function updateFixedTabMetrics(options = {}) {
  const apply = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 720;
    const topbarBottom = document.querySelector(".topbar")?.getBoundingClientRect().bottom ?? 78;
    const bottomNavTop = document.querySelector(".bottom-nav")?.getBoundingClientRect().top ?? (viewportHeight - 64);
    const contentTop = Math.max(0, Math.round(topbarBottom));
    const contentBottom = Math.max(0, Math.round(viewportHeight - bottomNavTop));

    document.documentElement.style.setProperty("--fixed-content-top", `${contentTop}px`);
    document.documentElement.style.setProperty("--fixed-content-bottom", `${contentBottom}px`);
  };

  if (options.immediate) {
    apply();
    return;
  }

  window.requestAnimationFrame(apply);
}

function handleViewportResize() {
  updateFixedTabMetrics();
  if (!state.authenticated) return;
  if (state.tab === "calendar") renderCalendar();
  if (state.tab === "emotion") renderEmotionTab();
}

function renderToday() {
  const timelineItems = timelineItemsForDate(state.selectedDate);

  els.todayTab.innerHTML = `
    <section class="section">
      <div class="section-header">
        <h2>Timeline</h2>
      </div>
      <div class="timeline" data-timeline-context="today">${renderTimeline(timelineItems, "today")}</div>
    </section>
  `;
}

function timelineItemsForDate(date) {
  const schedules = [
    ...itemsFor("일정", date),
    ...activeFixedSchedules(date).map((item) => fixedScheduleTimelineItem(item, date))
  ].sort(byStartTime);
  const todos = itemsFor("할일", date).sort(byDoneThenTitle);
  const timedTodos = todos
    .filter((item) => item.startTime)
    .map(todoTimelineItem);
  const timedRoutines = activeRoutines(date).map(routineTimelineItem);
  return [...schedules, ...timedTodos, ...timedRoutines].sort(byStartTime);
}

function renderTimeline(schedules, context = "today") {
  const slots = timelineHourSlots();
  const blocks = assignTimelineColumns(schedules.map(timelineBlock).filter(Boolean));

  const rows = slots.map((time, index) => {
    const body = "";
    const classes = [
      "slot",
      isSelectedTimeSlot(time, context) ? "selected" : ""
    ].filter(Boolean).join(" ");

    return `
      <div
        class="${classes}"
        data-time-slot="${time}"
        data-slot-start-minute="${index * TIMELINE_ROW_MINUTES}"
        data-slot-end-minute="${(index + 1) * TIMELINE_ROW_MINUTES}"
        data-timeline-context="${context}"
        style="--slot-row:${index};"
      >
        <div class="slot-time">${formatTimelineHour(time)}</div>
        <div class="slot-body">${body}</div>
      </div>
    `;
  }).join("");

  return `
    ${rows}
    <div class="timeline-layer" aria-label="Timeline items">
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
    : `<span class="tag">${escapeHtml(displayType(item.type))}</span>`;
  const fixedSkipButton = item.type === "고정일정"
    ? `<button type="button" class="fixed-skip-button" data-action="skip-fixed-schedule" data-id="${item.id}" data-date="${item.date || state.selectedDate}">SKIP</button>`
    : "";
  const cardAction = selectable ? "select-timeline-item" : "edit";
  const typeClass = timelineTypeClass(item.type);

  return `
    <div
      class="item timeline-item ${typeClass} ${done ? "done" : ""} ${selected ? "selected" : ""}"
      data-timeline-id="${item.id}"
      data-action="${cardAction}"
      data-id="${item.id}"
      data-slot-start="${block.startOffset}"
      data-slot-span="${block.durationMinutes}"
      style="--slot-start:${timelineOffsetUnits(block.startOffset)}; --slot-span:${timelineOffsetUnits(block.durationMinutes)}; --slot-column:${block.columnIndex}; --slot-columns:${block.columnCount};"
    >
      ${check}
      <button type="button" class="item-main-button">
        <span class="item-title">${escapeHtml(item.title)}</span>
        <span class="item-meta">${timelineItemTimeMeta(item)}</span>
      </button>
      ${fixedSkipButton}
      <button type="button" class="edit-button" data-action="edit" data-id="${item.id}">›</button>
      ${selectable ? `
        <span class="timeline-resize-handle resize-start" data-resize-edge="start" aria-hidden="true"></span>
        <span class="timeline-resize-handle resize-end" data-resize-edge="end" aria-hidden="true"></span>
      ` : ""}
    </div>
  `;
}

function timelineTypeClass(type) {
  if (type === "일정") return "event-item";
  if (type === "고정일정") return "event-item fixed-event-item";
  if (type === "할일") return "task-item";
  if (type === "루틴") return "routine-item";
  return "";
}

function fixedScheduleTimelineItem(schedule, date) {
  return {
    ...schedule,
    date,
    endDate: date
  };
}

function routineTimelineItem(routine) {
  if (routine.startTime) return routine;
  return {
    ...routine,
    startTime: "08:00",
    endTime: "09:00",
    timeUnset: true
  };
}

function todoTimelineItem(todo) {
  if (todo.startTime) return todo;
  return {
    ...todo,
    startTime: "08:00",
    endTime: "09:00",
    timeUnset: true
  };
}

function timelineItemTimeMeta(item) {
  const time = `${item.startTime || ""} - ${item.endTime || ""}`;
  return escapeHtml(item.timeUnset ? `${time} · Time unset` : time);
}

function timelineItemDone(item) {
  if (item.type === "루틴") {
    return Boolean(routineRecord(item.id, state.selectedDate)?.completed);
  }
  return Boolean(item.completed);
}

function timelineBlock(item) {
  const startMinutes = isTimeString(item.startTime) ? timeToMinutes(item.startTime) : NaN;
  if (!Number.isFinite(startMinutes)) return null;

  const fallbackEndMinutes = startMinutes + DEFAULT_ITEM_DURATION_MINUTES;
  const endMinutes = item.endTime && isTimeString(item.endTime)
    ? timeToMinutes(item.endTime)
    : NaN;
  const rawEndMinutes = Number.isFinite(endMinutes) && endMinutes > startMinutes
    ? endMinutes
    : fallbackEndMinutes;
  const startOffset = timelineMinuteOffset(startMinutes);
  const endOffset = timelineMinuteOffset(rawEndMinutes);
  if (endOffset <= 0 || startOffset >= timelineTotalMinutes()) return null;

  const visibleStartOffset = Math.max(0, startOffset);
  const visibleEndOffset = Math.min(timelineTotalMinutes(), Math.max(endOffset, visibleStartOffset + 1));

  return {
    item,
    startIndex: visibleStartOffset,
    span: Math.max(1, visibleEndOffset - visibleStartOffset),
    startOffset: visibleStartOffset,
    durationMinutes: Math.max(1, visibleEndOffset - visibleStartOffset)
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
        <h2>${monthLabel}</h2>
      </div>
      <div class="calendar-stage">
        <div class="${calendarClasses}" style="${calendarZoomStyle(scheduleRowCount, days.length / 7)}">
          ${DAYS.map((day) => `<div class="weekday">${day}</div>`).join("")}
          ${days.map((day) => renderCalendarDay(day, scheduleRows)).join("")}
        </div>
        ${renderCalendarScheduleControl()}
      </div>
    </section>
  `;
}

function renderCalendarScheduleControl() {
  const selection = state.selectedCalendarSchedule;
  const item = selection ? findItem(selection.id) : null;
  if (!item || item.type !== "일정") return "";

  const range = selectedDateRange(item.date, item.endDate || item.date);
  const grabbedDate = selection.date && selection.date >= range.startDate && selection.date <= range.endDate
    ? selection.date
    : range.startDate;
  const title = String(item.title || "").trim() || "Untitled";
  const dateText = range.startDate === range.endDate
    ? range.startDate
    : `${range.startDate} - ${range.endDate}`;
  const timeText = item.startTime || item.endTime
    ? `${item.startTime || ""}${item.endTime ? ` - ${item.endTime}` : ""}`
    : "";

  return `
    <div
      class="calendar-schedule-control"
      data-calendar-schedule-control
      data-id="${item.id}"
      data-date="${grabbedDate}"
    >
      <button
        type="button"
        class="calendar-control-grip resize-left"
        data-action="choose-calendar-span-edge"
        data-calendar-span-edge="start"
        data-calendar-resize-edge="start"
        data-id="${item.id}"
        aria-label="Adjust start date"
      >‹</button>
      <button
        type="button"
        class="calendar-control-main"
        data-calendar-control-action="move"
        aria-label="Move event"
      >
        <span class="calendar-control-title">${escapeHtml(title)}</span>
        <span class="calendar-control-meta">${escapeHtml([dateText, timeText].filter(Boolean).join(" · "))}</span>
      </button>
      <button
        type="button"
        class="calendar-control-grip resize-right"
        data-action="choose-calendar-span-edge"
        data-calendar-span-edge="end"
        data-calendar-resize-edge="end"
        data-id="${item.id}"
        aria-label="Adjust end date"
      >›</button>
    </div>
  `;
}

function calendarZoomStyle(scheduleRowCount, weekCount = 6) {
  const zoom = CALENDAR_ZOOM_MAX;
  const compact = window.matchMedia?.("(max-width: 430px)").matches;
  const baseGap = compact ? 4 : 5;
  const chipHeight = compact ? 15 : 15;
  const chipFontSize = compact ? 8.5 : 9;
  const rowHeight = chipHeight + 2;
  const topHeight = compact ? 14 : 14;
  const gap = roundCalendarZoomValue(Math.max(3, baseGap * zoom));
  const minimumDayHeight = topHeight + scheduleRowCount * rowHeight;
  const availableDayHeight = calendarAvailableDayHeight(weekCount, gap);
  const dayHeight = Math.max(minimumDayHeight, availableDayHeight);

  return [
    `--schedule-row-count:${scheduleRowCount}`,
    `--calendar-week-count:${weekCount}`,
    `--schedule-row-height:${rowHeight}px`,
    `--calendar-day-height:${dayHeight}px`,
    `--schedule-chip-height:${chipHeight}px`,
    `--schedule-chip-font-size:${chipFontSize}px`,
    `--calendar-gap:${gap}px`
  ].join(";");
}

function calendarAvailableDayHeight(weekCount, gap) {
  const weeks = Math.max(1, Number(weekCount) || 6);
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 720;
  const calendarTop = els.calendarTab && !els.calendarTab.hidden
    ? els.calendarTab.getBoundingClientRect().top
    : 104;
  const bottomNavTop = document.querySelector(".bottom-nav")?.getBoundingClientRect().top
    || (viewportHeight - 72);
  const compact = window.matchMedia?.("(max-width: 430px)").matches;
  const sectionPadding = compact ? 4 : 6;
  const sectionGap = compact ? 4 : 6;
  const monthHeaderHeight = compact ? 26 : 28;
  const weekdayHeight = compact ? 22 : 24;
  const bottomBreathingRoom = 8;
  const availableGridHeight = bottomNavTop
    - calendarTop
    - sectionPadding
    - monthHeaderHeight
    - sectionGap
    - bottomBreathingRoom;
  const availableDayRowsHeight = availableGridHeight - weekdayHeight - gap * weeks;
  return Math.max(42, Math.floor(availableDayRowsHeight / weeks));
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
  const schedules = calendarSchedulesForDate(day.date).sort(byStartTime);
  const mark = koreanCalendarMark(day.date);
  const isSelected = day.date === state.calendarSelectedDate;
  const isToday = day.date === todayString();
  const classes = [
    "day-cell",
    mark ? "has-calendar-mark" : "",
    mark ? `calendar-mark-${mark.kind}` : "",
    isToday ? "today" : "",
    day.inMonth ? "" : "muted",
    isSelected ? "selected" : ""
  ].filter(Boolean).join(" ");

  return `
    <button type="button" class="${classes}" data-action="select-date" data-date="${day.date}">
      <span class="day-head">
        <span class="day-number">${Number(day.date.slice(8, 10))}</span>
        ${mark ? `<span class="holiday-label">${escapeHtml(mark.label)}</span>` : ""}
      </span>
      <span class="day-schedules">${renderCalendarScheduleChips(schedules, day.date, scheduleRows)}</span>
    </button>
  `;
}

function koreanCalendarMark(date) {
  return KOREAN_CALENDAR_MARKS[date] || null;
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
          <span>Challenge</span>
          <button type="button" class="challenge-gallery-button" data-action="open-challenge-gallery">Gallery</button>
        </div>
        <div class="challenge-complete">All levels cleared</div>
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
            Level ${active.index + 1}
            <span class="challenge-layer-count">(${active.filledCount}/${active.level.layerCount})</span>
          </span>
          <button type="button" class="challenge-gallery-button" data-action="open-challenge-gallery">Gallery</button>
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
    setStatus(error.message || "Could not load the challenge image.");
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
    image.onerror = () => reject(new Error("Could not load the challenge image."));
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
    return "Could not choose a challenge color.";
  }

  const nextFilledCount = active.filledCount + 1;
  const cleared = nextFilledCount >= active.level.layerCount;
  state.challengeSaving = true;

  try {
    await createItemFast({
      title: `Challenge Level ${active.index + 1} Layer ${layer + 1}`,
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
    }, { renderAfter: false });

    state.selectedChallengeLayer = null;
    state.challengeAnalysis = null;
    render();
    return cleared ? "Level cleared. Moving to the next level." : "Challenge progress saved.";
  } catch (error) {
    return error.message || "Could not save challenge progress.";
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

function storedAuthMood() {
  try {
    return window.localStorage.getItem(AUTH_MOOD_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function storedAuthPhraseId() {
  try {
    return window.localStorage.getItem(AUTH_PHRASE_STORAGE_KEY) || AUTH_PHRASES[0].id;
  } catch {
    return AUTH_PHRASES[0].id;
  }
}

function storeAuthMood(emotion) {
  try {
    window.localStorage.setItem(AUTH_MOOD_STORAGE_KEY, emotion);
  } catch {
    // The selected color still applies for this session even if storage is unavailable.
  }
}

function storeAuthPhrase(id) {
  try {
    window.localStorage.setItem(AUTH_PHRASE_STORAGE_KEY, id);
  } catch {
    // The selected phrase still updates the current lock screen.
  }
}

function applyStoredAuthMood() {
  applyAuthMood(storedAuthMood());
}

function applyStoredAuthPhrase() {
  applyAuthPhrase(storedAuthPhraseId());
}

function applyAuthPhrase(id) {
  if (!els.authCatchphrase) return;
  const phrase = authPhraseById(id);
  els.authCatchphrase.textContent = phrase.text;
}

function authPhraseById(id) {
  return AUTH_PHRASES.find((phrase) => phrase.id === id) || AUTH_PHRASES[0];
}

function openAuthPhraseDialog() {
  if (!els.authPhraseDialog || !els.authPhraseContent) return;
  els.authPhraseContent.innerHTML = renderAuthPhraseChoices(storedAuthPhraseId());
  if (!els.authPhraseDialog.open) els.authPhraseDialog.showModal();
}

function renderAuthPhraseChoices(selectedId) {
  return `
    <div class="auth-phrase-list" aria-label="Login phrase choices">
      ${AUTH_PHRASES.map((phrase) => `
        <button
          type="button"
          class="auth-phrase-choice ${phrase.id === selectedId ? "selected" : ""}"
          data-action="choose-auth-phrase"
          data-phrase-id="${phrase.id}"
        >${escapeHtml(phrase.text)}</button>
      `).join("")}
    </div>
  `;
}

function chooseAuthPhrase(id) {
  const phrase = authPhraseById(id);
  storeAuthPhrase(phrase.id);
  applyAuthPhrase(phrase.id);
  if (els.authPhraseDialog.open) els.authPhraseDialog.close();
}

function applyAuthMood(emotion) {
  const palette = emotionPalette(emotion);
  const root = document.documentElement;

  if (!palette) {
    root.style.removeProperty("--auth-bg-start");
    root.style.removeProperty("--auth-bg-mid");
    root.style.removeProperty("--auth-bg-end");
    root.style.removeProperty("--auth-bg-glow");
    root.style.removeProperty("--auth-bg-glow-rgb");
    return;
  }

  const color = hexToRgb(palette.color);
  const deepSepia = { r: 20, g: 9, b: 2 };
  const warmSepia = { r: 82, g: 42, b: 12 };

  root.style.setProperty("--auth-bg-start", rgbString(mixRgb(deepSepia, color, 0.22)));
  root.style.setProperty("--auth-bg-mid", rgbString(mixRgb(warmSepia, color, 0.58)));
  root.style.setProperty("--auth-bg-end", rgbString(mixRgb(deepSepia, color, 0.18)));
  root.style.setProperty("--auth-bg-glow", rgbString(mixRgb(warmSepia, color, 0.72)));
  root.style.setProperty("--auth-bg-glow-rgb", rgbChannels(mixRgb(warmSepia, color, 0.72)));
}

function mixRgb(base, color, amount) {
  const ratio = Math.max(0, Math.min(1, amount));
  return {
    r: Math.round(base.r + (color.r - base.r) * ratio),
    g: Math.round(base.g + (color.g - base.g) * ratio),
    b: Math.round(base.b + (color.b - base.b) * ratio)
  };
}

function rgbString(rgb) {
  return `rgb(${rgb.r} ${rgb.g} ${rgb.b})`;
}

function rgbChannels(rgb) {
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
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

  els.emotionDialogTitle.textContent = "Gallery";
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
              <span>Level ${index + 1}</span>
            </div>
          `;
        }

        return `
          <div class="challenge-gallery-card ${cleared ? "cleared" : "current"}">
            <canvas class="challenge-gallery-canvas" data-gallery-level-id="${level.id}"></canvas>
            <div class="challenge-gallery-meta">
              <span>Level ${index + 1}</span>
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

  return decorated.map(({ rangeClass, resizing, row, schedule, selected, showTitle, title }) => {
    const label = showTitle ? escapeHtml(title) : "&nbsp;";
    const rangeTokens = rangeClass.split(/\s+/);
    const fixedSchedule = isFixedScheduleType(schedule.type);
    const canResizeStart = !fixedSchedule && selected && (rangeTokens.includes("single") || rangeTokens.includes("segment-start"));
    const canResizeEnd = !fixedSchedule && selected && (rangeTokens.includes("single") || rangeTokens.includes("segment-end"));
    const chipClass = [
      "schedule-chip",
      fixedSchedule ? "fixed-schedule-chip" : "",
      rangeClass,
      showTitle ? "has-title" : "continuation",
      selected ? "selected" : "",
      resizing ? "resizing" : ""
    ].join(" ");

    return `
      <span
        class="${chipClass}"
        title="${escapeHtml(title)}"
        data-action="${fixedSchedule ? "edit" : "select-calendar-schedule"}"
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
    const title = String(schedule.title || "").trim() || "Untitled";
    const selected = schedule.type === "일정" && selectedCalendarScheduleMatches(schedule.id);
    const resizing = calendarScheduleIsResizing(schedule.id);
    const row = scheduleRows[calendarScheduleRowKey(schedule)] || 0;

    return { rangeClass, resizing, row, schedule, showTitle, title, selected };
  });
}

function calendarScheduleDisplayRowCount(days, scheduleRows = {}) {
  const counts = days.map((day) => {
    const schedules = calendarSchedulesForDate(day.date).sort(byStartTime);
    if (!schedules.length) return 2;

    const decorated = calendarDecoratedSchedules(schedules, day.date, scheduleRows);
    return Math.max(2, ...decorated.map((schedule) => schedule.row + 1));
  });

  return Math.max(2, ...counts);
}

function calendarScheduleRows(days, previewItem = null) {
  const schedules = calendarScheduleItemsForRows(days, previewItem?.id);
  if (previewItem && isItemRangeOnCalendar(previewItem, days[0]?.date, days[days.length - 1]?.date)) {
    schedules.push(previewItem);
  }
  schedules.sort(byCalendarScheduleOrder);
  return assignCalendarScheduleRows(schedules);
}

function calendarScheduleItemsForRows(days, excludedId = null) {
  const rangeStart = days[0]?.date;
  const rangeEnd = days[days.length - 1]?.date;
  if (!rangeStart || !rangeEnd) return [];

  return [
    ...state.items
      .filter((item) => item.type === "일정" && item.id !== excludedId)
      .map(calendarScheduleVisualItem)
      .filter((item) => isItemRangeOnCalendar(item, rangeStart, rangeEnd)),
    ...days.flatMap((day) =>
      activeFixedSchedules(day.date).map((item) => fixedScheduleCalendarItem(item, day.date))
    )
  ].sort(byCalendarScheduleOrder);
}

function assignCalendarScheduleRows(schedules) {
  const rows = {};
  const rowEndDates = [];

  schedules.forEach((schedule) => {
    const range = selectedDateRange(schedule.date, schedule.endDate || schedule.date);
    const row = rowEndDates.findIndex((endDate) => endDate < range.startDate);
    const rowIndex = row === -1 ? rowEndDates.length : row;
    rowEndDates[rowIndex] = range.endDate;
    rows[calendarScheduleRowKey(schedule)] = rowIndex;
  });

  return rows;
}

function calendarSchedulePreviewPlacement(item, startDate, endDate) {
  const range = selectedDateRange(startDate, endDate);
  const previewItem = {
    ...item,
    date: range.startDate,
    endDate: range.endDate
  };
  const blockedRows = calendarScheduleOccupiedRows(range, item.id);

  let row = 0;
  while (blockedRows.has(row)) row += 1;

  const rowCount = Math.max(calendarScheduleCurrentRowCount(), row + 1);
  return { previewItem, row, rowCount };
}

function calendarScheduleOccupiedRows(range, excludedId) {
  const rows = new Set();

  document.querySelectorAll(".schedule-calendar .schedule-chip[data-id]").forEach((chip) => {
    if (
      chip.dataset.id === excludedId ||
      chip.classList.contains("schedule-drag-preview") ||
      chip.classList.contains("schedule-resize-preview")
    ) return;

    const date = chip.dataset.date;
    if (!date || date < range.startDate || date > range.endDate) return;
    rows.add(Number(chip.style.getPropertyValue("--schedule-row")) || 0);
  });

  return rows;
}

function calendarScheduleCurrentRowCount() {
  const grid = document.querySelector(".schedule-calendar");
  const gridRowCount = Number(
    grid?.style.getPropertyValue("--schedule-row-count") ||
    (grid ? getComputedStyle(grid).getPropertyValue("--schedule-row-count") : "")
  ) || 2;
  const chipRows = [...document.querySelectorAll(".schedule-calendar .schedule-chip[data-id]")]
    .filter((chip) => !chip.classList.contains("schedule-drag-preview") && !chip.classList.contains("schedule-resize-preview"))
    .map((chip) => (Number(chip.style.getPropertyValue("--schedule-row")) || 0) + 1);

  return Math.max(2, gridRowCount, ...chipRows);
}

function applyCalendarScheduleRowCount(rowCount) {
  const grid = document.querySelector(".schedule-calendar");
  if (!grid) return;

  const weekCount = Number(
    grid.style.getPropertyValue("--calendar-week-count") ||
    getComputedStyle(grid).getPropertyValue("--calendar-week-count")
  ) || 6;

  calendarZoomStyle(rowCount, weekCount).split(";").forEach((rule) => {
    const [property, value] = rule.split(":");
    if (!property || !value) return;
    grid.style.setProperty(property.trim(), value.trim());
  });
}

function resetCalendarScheduleRowCount() {
  const days = calendarDays(state.visibleMonth);
  const rows = calendarScheduleRows(days);
  applyCalendarScheduleRowCount(calendarScheduleDisplayRowCount(days, rows));
}

function byCalendarScheduleOrder(left, right) {
  const leftRange = selectedDateRange(left.date, left.endDate || left.date);
  const rightRange = selectedDateRange(right.date, right.endDate || right.date);
  return leftRange.startDate.localeCompare(rightRange.startDate) ||
    calendarScheduleTimeValue(left.startTime) - calendarScheduleTimeValue(right.startTime) ||
    calendarScheduleTimeValue(left.endTime) - calendarScheduleTimeValue(right.endTime) ||
    rightRange.endDate.localeCompare(leftRange.endDate) ||
    String(left.title || "").localeCompare(String(right.title || ""), "en");
}

function calendarScheduleTimeValue(time) {
  return isTimeString(time) ? timeToMinutes(time) : 24 * 60;
}

function calendarSchedulesForDate(date) {
  return [
    ...state.items
      .filter((item) => item.type === "일정")
      .map(calendarScheduleVisualItem)
      .filter((item) => isItemOnDate(item, date)),
    ...activeFixedSchedules(date).map((item) => fixedScheduleCalendarItem(item, date))
  ];
}

function fixedScheduleCalendarItem(schedule, date) {
  return {
    ...schedule,
    date,
    endDate: date,
    calendarRowKey: `${schedule.id}:${date}`
  };
}

function calendarScheduleRowKey(schedule) {
  return schedule.calendarRowKey || schedule.id;
}

function calendarScheduleVisualItem(item) {
  const resize = state.calendarScheduleResize;
  if (!resize || !resize.moved || resize.id !== item.id) return item;

  return {
    ...item,
    date: resize.targetStartDate,
    endDate: resize.targetEndDate
  };
}

function calendarScheduleIsResizing(id) {
  return Boolean(state.calendarScheduleResize?.moved && state.calendarScheduleResize.id === id);
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
        <h2>${monthLabel}</h2>
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
  const skippedFixed = skippedFixedSchedules();

  els.routinesTab.innerHTML = `
    <section class="section">
      <div class="section-header">
        <h2>Routine</h2>
      </div>
      ${renderRoutineList(routines, true)}
      ${renderSkippedFixedSchedules(skippedFixed)}
    </section>
  `;
}

function renderItemList(items, mode) {
  if (!items.length) return `<div class="empty">No items yet.</div>`;

  return `
    <div class="item-list">
      ${items.map((item) => renderItem(item, mode)).join("")}
    </div>
  `;
}

function renderItem(item, mode) {
  const check = mode === "task" || item.type === "할일"
    ? `<button type="button" class="checkbox" data-action="toggle-task" data-id="${item.id}">${item.completed ? '<span class="checkmark">✓</span>' : ""}</button>`
    : `<span class="tag">${escapeHtml(displayType(item.type))}</span>`;

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
  if (!list.length) return `<div class="empty">No routines yet.</div>`;

  return `
    <div class="item-list">
      ${list.map((routine) => {
        return `
          <div class="item">
            <span class="tag">Routine</span>
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

function renderSkippedFixedSchedules(entries) {
  if (!entries.length) return "";

  return `
    <div class="skipped-fixed-panel">
      <div class="skipped-fixed-header">
        <h3>Skipped Fixed</h3>
      </div>
      <div class="skipped-fixed-list">
        ${entries.map(({ record, schedule }) => `
          <div class="item skipped-fixed-card">
            <span class="tag">Fixed</span>
            <div class="item-main">
              <span class="item-title">${escapeHtml(schedule.title || record.title || "Untitled")}</span>
              <span class="item-meta">${escapeHtml(skippedFixedMeta(record, schedule))}</span>
            </div>
            <button type="button" class="return-button" data-action="return-fixed-schedule" data-id="${record.id}">Return</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function skippedFixedMeta(record, schedule) {
  const parts = [
    record.date ? humanDate(record.date) : "",
    routineTimeLabel(schedule)
  ];
  return parts.filter(Boolean).join(" · ");
}

function renderEmotionCheck(emotion) {
  const selectedEmotion = emotion ? emotion.emotion || emotion.mood : "";
  const normalizedEmotion = normalizeEmotionValue(selectedEmotion);
  const note = emotion ? emotion.note : "";

  return `
    <div class="emotion-panel">
      <div class="emotion-grid" aria-label="Emotion color selection">
        ${EMOTION_GROUPS.map((group) => `
          <div class="emotion-row" aria-label="${displayEmotion(group.name)}">
            ${group.options.map((option) => `
              <button
                type="button"
                class="emotion-button ${normalizedEmotion === option.value ? "selected" : ""}"
                data-action="set-emotion"
                data-emotion="${option.value}"
                aria-label="${displayEmotion(option.value)}"
                title="${displayEmotion(option.value)}"
                style="--emotion-swatch:${option.color}; --emotion-swatch-border:${option.border};"
              >
                <span class="emotion-dot" aria-hidden="true"></span>
              </button>
            `).join("")}
          </div>
        `).join("")}
      </div>
      <label>
        Comment
        <textarea id="emotionComment" rows="3" maxlength="2000">${escapeHtml(note)}</textarea>
      </label>
      <div class="emotion-actions">
        <button type="button" class="primary" data-action="save-emotion-comment">Save Comment</button>
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
  const comment = emotion.note ? escapeHtml(emotion.note) : "No comment";

  return `
    <div class="emotion-preview"${style} aria-label="Emotion comment">
      <span class="emotion-preview-label">Emotion Comment</span>
      <p class="emotion-preview-comment">${comment}</p>
    </div>
  `;
}

function itemMeta(item) {
  const parts = [];
  if (item.date) parts.push(item.date);
  if (item.endDate && item.endDate !== item.date) parts[parts.length - 1] = `${item.date}~${item.endDate}`;
  if (item.startTime) parts.push(`${item.startTime}-${item.endTime || ""}`);
  if (item.emotion || item.mood) parts.push(displayEmotion(item.emotion || item.mood));
  return parts.map(escapeHtml).join(" · ");
}

function rememberItemDialogReturnTarget() {
  state.itemDialogReturnTarget = els.calendarTimelineDialog.open ? "calendar-timeline" : null;
}

function handleItemDialogClose() {
  closePicker();
  if (state.itemDialogSaveInProgress) return;
  restoreItemDialogReturnTarget();
}

function restoreItemDialogReturnTarget() {
  const target = state.itemDialogReturnTarget;
  state.itemDialogReturnTarget = null;
  if (target !== "calendar-timeline") return;
  if (!state.authenticated || state.tab !== "calendar") return;

  window.setTimeout(() => {
    if (!state.authenticated || state.tab !== "calendar" || els.dialog.open || els.calendarTimelineDialog.open) return;
    openCalendarTimelineDialog();
  }, 0);
}

function closeItemDialogOnOutsidePointer(event) {
  if (!els.dialog.open || state.itemDialogSaveInProgress) return;
  if (itemDialogPointerInsideBody(event)) return;
  event.preventDefault();
  event.stopPropagation();
  cancelItemDialog();
}

function itemDialogPointerInsideBody(event) {
  const rect = els.itemForm.getBoundingClientRect();
  const hasPoint = Number.isFinite(event.clientX) && Number.isFinite(event.clientY);
  if (hasPoint) {
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }
  return Boolean(event.target?.closest?.("#itemDialog .item-dialog-body"));
}

function handleItemDialogBackdropPress(event) {
  event.preventDefault();
  event.stopPropagation();
  cancelItemDialog();
}

function cancelItemDialog() {
  if (!els.dialog.open || state.itemDialogSaveInProgress) return;
  closePicker();
  els.dialog.close();
}

function openItemDialog(type, item, defaults = {}) {
  state.editingItem = item || null;
  const selectedType = normalizeItemType(item ? item.type : type || "일정");
  closePicker();
  rememberItemDialogReturnTarget();
  if (els.calendarTimelineDialog.open) {
    els.calendarTimelineDialog.close();
  }

  els.dialogTitle.textContent = "";
  els.editingId.value = item ? item.id : "";
  els.typeInput.value = selectedType;
  els.titleInput.value = item ? item.title : "";
  els.dateInput.value = item && item.date ? item.date : defaults.date || state.selectedDate;
  els.endDateInput.value = item && item.endDate ? item.endDate : defaults.endDate || defaults.date || state.selectedDate;
  els.startTimeInput.value = item && item.startTime ? item.startTime : defaults.startTime || DEFAULT_START_TIME;
  els.endTimeInput.value = item && item.endTime ? item.endTime : defaults.endTime || DEFAULT_END_TIME;
  els.noteInput.value = item && item.note ? item.note : "";
  els.allDayInput.checked = (selectedType === "일정" || selectedType === "할일")
    && els.startTimeInput.value === FULL_DAY_START_TIME
    && els.endTimeInput.value === FULL_DAY_END_TIME;

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
  const type = normalizeItemType(els.typeInput.value);
  if (els.typeInput.value !== type) els.typeInput.value = type;
  const usesTime = isTimedItemType(type);
  syncTypeChoices(type);
  els.dialog.dataset.itemType = type;
  els.dateFields.hidden = !usesTime;
  els.endDateField.hidden = !usesTime;
  els.allDayField.hidden = type !== "일정" && type !== "할일";
  els.scheduleFields.hidden = !usesTime;
  els.routineFields.hidden = !isRecurringTemplateType(type);
  syncDateTimeFieldLabels(type);
  if (isRecurringTemplateType(type)) els.allDayInput.checked = false;
  applyAllDayTime();
}

function syncDateTimeFieldLabels(type) {
  const startDateLabel = document.querySelector("#startDateLabel");
  const endDateLabel = document.querySelector("#endDateLabel");
  if (startDateLabel) startDateLabel.textContent = type === "일정" ? "Start date" : "Date";
  if (endDateLabel) endDateLabel.textContent = type === "일정" ? "End date" : "Date";

  els.startTimeLabel.textContent = type === "루틴" || type === "고정일정" ? "Start" : "Time";
  els.endTimeLabel.textContent = type === "루틴" || type === "고정일정" ? "End" : "Time";
}

function applyAllDayTime() {
  const isAllDay = (els.typeInput.value === "일정" || els.typeInput.value === "할일") && els.allDayInput.checked;
  if (isAllDay) {
    els.startTimeInput.value = FULL_DAY_START_TIME;
    els.endTimeInput.value = FULL_DAY_END_TIME;
    closePicker();
  }
  els.startTimeInput.disabled = isAllDay;
  els.endTimeInput.disabled = isAllDay;
  syncTimeDisplays();
}

function syncTimeDisplays() {
  if (els.startTimeDisplay) els.startTimeDisplay.textContent = formatKoreanTime(els.startTimeInput.value);
  if (els.endTimeDisplay) els.endTimeDisplay.textContent = formatKoreanTime(els.endTimeInput.value);
}

function syncTypeChoices(type = els.typeInput.value) {
  document.querySelectorAll("[data-type-choice]").forEach((button) => {
    button.classList.toggle("active", button.dataset.typeChoice === type);
  });
}

function openPickerFromPointer(event, input) {
  event.preventDefault();
  event.stopPropagation();
  openPicker(input, { blurTarget: true });
}

function openPickerFromClick(event, input) {
  event.preventDefault();
  event.stopPropagation();
  openPicker(input, { blurTarget: true });
}

function openPicker(input, options = {}) {
  if (!input || input.disabled || !els.dialog.open) return;
  const type = input.dataset.picker;
  if (type !== "date" && type !== "time") return;
  if (options.blurTarget && document.activeElement === input) input.blur();

  const selectedValue = input.value || defaultPickerValue(input);
  state.picker = {
    targetId: input.id,
    type,
    visibleMonth: type === "date" ? monthStart(selectedValue) : null
  };

  els.itemForm.append(els.pickerPanel);
  positionPickerPanel();
  renderPickerPanel();
}

function positionPickerPanel() {
  if (!els.pickerPanel) return;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 720;
  const safeVerticalPadding = state.picker?.type === "time" ? 96 : 76;
  const maxHeight = Math.max(280, viewportHeight - safeVerticalPadding);
  els.pickerPanel.style.setProperty("--picker-max-height", `${Math.round(maxHeight)}px`);
}

function closePicker() {
  state.picker = null;
  window.clearTimeout(state.timeWheelSettleTimer);
  state.timeWheelSettleTimer = null;
  state.timeWheelProgrammaticScroll = false;
  if (!els.pickerPanel) return;
  els.pickerPanel.hidden = true;
  els.pickerPanel.innerHTML = "";
  els.pickerPanel.style.removeProperty("--picker-top");
  els.pickerPanel.style.removeProperty("--picker-max-height");
}

function closePickerOnOutsidePointer(event) {
  if (!state.picker || !els.dialog.open) return;
  if (isPickerInteractiveTarget(event.target)) return;
  closePicker();
  armPickerOutsideClickSuppress();
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function isPickerInteractiveTarget(target) {
  return Boolean(target?.closest?.("#pickerPanel"));
}

function armPickerOutsideClickSuppress() {
  state.suppressPickerOutsideClick = true;
  window.clearTimeout(state.pickerOutsideClickTimer);
  state.pickerOutsideClickTimer = window.setTimeout(() => {
    state.suppressPickerOutsideClick = false;
    state.pickerOutsideClickTimer = null;
  }, 450);
}

function suppressPickerOutsideClick(event) {
  if (!state.suppressPickerOutsideClick) return;
  state.suppressPickerOutsideClick = false;
  window.clearTimeout(state.pickerOutsideClickTimer);
  state.pickerOutsideClickTimer = null;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
}

function renderPickerPanel() {
  if (!state.picker || !els.pickerPanel) return;
  els.pickerPanel.hidden = false;
  els.pickerPanel.innerHTML = state.picker.type === "date"
    ? renderDatePicker()
    : renderTimePicker();
  if (state.picker.type === "time") bindTimeWheelHaptics();
}

function renderDatePicker() {
  const input = pickerTargetInput();
  const selectedDate = input && isDateString(input.value) ? input.value : state.selectedDate;
  const visibleMonth = state.picker.visibleMonth || monthStart(selectedDate);
  const monthLabel = visibleMonth.slice(0, 7);
  const days = calendarDays(visibleMonth);

  return `
    <div class="picker-header">
      <button type="button" class="picker-icon-button" data-picker-action="date-month-prev" aria-label="Previous month">‹</button>
      <strong>${monthLabel}</strong>
      <button type="button" class="picker-icon-button" data-picker-action="date-month-next" aria-label="Next month">›</button>
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
      <button type="button" class="secondary" data-picker-action="picker-close">Close</button>
    </div>
  `;
}

function renderTimePicker() {
  const input = pickerTargetInput();
  const options = pickerTimeOptions(input);
  const selectedTime = nearestPickerTime(input && isTimeString(input.value) ? input.value : defaultPickerValue(input), options);
  const periods = [...new Set(options.map((time) => timeParts(time).period))];
  const periodOptions = periods.map((period) => ({
    label: period,
    time: timeForWheelPart(options, selectedTime, "period", period),
    value: period
  }));
  const hourOptions = uniqueTimeHours(options).map((hour) => ({
    label: String(hour.label),
    time: timeForWheelPart(options, selectedTime, "hour", hour.hour24),
    value: hour.hour24
  }));
  const minuteOptions = pickerMinuteValues().map((minute) => ({
    label: minute,
    time: timeForWheelPart(options, selectedTime, "minute", minute),
    value: minute
  }));

  return `
    <div class="picker-header picker-header-simple google-time-picker-header">
      <strong>${timePickerTitle(input)}</strong>
      <button type="button" class="dialog-text-button primary-text" data-picker-action="picker-close">Done</button>
    </div>
    <div class="time-wheel" aria-label="Time selection">
      <div class="time-wheel-column" aria-label="AM PM" data-wheel-kind="period" data-wheel-middle-copy="0">
        ${renderLoopingTimeWheelOptions(periodOptions, selectedTime, 1, "period")}
      </div>
      <div class="time-wheel-column" aria-label="Hour" data-wheel-kind="hour" data-wheel-middle-copy="${middleWheelCopy(TIME_WHEEL_LOOP_COPIES)}">
        ${renderLoopingTimeWheelOptions(hourOptions, selectedTime, TIME_WHEEL_LOOP_COPIES, "hour")}
      </div>
      <div class="time-wheel-column" aria-label="Minute" data-wheel-kind="minute" data-wheel-middle-copy="${middleWheelCopy(TIME_WHEEL_LOOP_COPIES)}">
        ${renderLoopingTimeWheelOptions(minuteOptions, selectedTime, TIME_WHEEL_LOOP_COPIES, "minute")}
      </div>
    </div>
  `;
}

function timePickerTitle(input) {
  if (!input || input.id !== "endTimeInput") return "Start Time";
  return els.typeInput.value === "할일" ? "Due Time" : "End Time";
}

function renderLoopingTimeWheelOptions(options, selectedTime, copyCount = 3, part = "") {
  const selectedCopyIndex = middleWheelCopy(copyCount);
  return Array.from({ length: copyCount }, (_, copyIndex) => options.map((option, optionIndex) => timeWheelButton(
    option.label,
    copyIndex === selectedCopyIndex && option.time === selectedTime,
    option.time,
    copyIndex,
    optionIndex,
    part,
    option.value
  )).join("")).join("");
}

function middleWheelCopy(copyCount) {
  return Math.floor(Number(copyCount || 1) / 2);
}

function uniqueTimeHours(options) {
  const seen = new Set();
  return options
    .map(timeParts)
    .filter((parts) => {
      if (seen.has(parts.hour24)) return false;
      seen.add(parts.hour24);
      return true;
    })
    .map((parts) => ({
      hour24: parts.hour24,
      label: parts.hour12
    }));
}

function timeWheelButton(label, selected, time, copyIndex = 0, optionIndex = 0, part = "", value = "") {
  return `
        <button
          type="button"
          class="time-wheel-option ${selected ? "selected" : ""}"
          data-picker-action="select-time"
          data-time="${time}"
          data-wheel-part="${escapeHtml(part)}"
          data-wheel-value="${escapeHtml(String(value))}"
          data-wheel-copy="${copyIndex}"
          data-wheel-index="${optionIndex}"
        >
          ${escapeHtml(label)}
        </button>
  `;
}

function handlePickerAction(action) {
  if (!state.picker) return;

  if (action.dataset.pickerAction === "picker-close") {
    closePickerWithFeedback(action);
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
    selectPickerTime(action.dataset.time);
  }
}

function closePickerWithFeedback(action) {
  if (!action) {
    closePicker();
    return;
  }
  action.classList.add("is-pressed");
  window.setTimeout(closePicker, 180);
}

function bindTimeWheelHaptics() {
  els.pickerPanel.querySelectorAll(".time-wheel-column").forEach((column) => {
    column.dataset.hapticIndex = "0";
    column.addEventListener("wheel", handleTimeWheelWheel, { passive: false });
    column.addEventListener("scroll", handleTimeWheelScroll, { passive: true });
    column.addEventListener("scrollend", () => settleTimeWheelColumn(column), { passive: true });
  });
  window.requestAnimationFrame(centerSelectedTimeWheelOptions);
}

function handleTimeWheelWheel(event) {
  if (!state.picker || state.picker.type !== "time") return;
  const column = event.currentTarget;
  const options = [...column.querySelectorAll(".time-wheel-option")];
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  if (!options.length || !delta) return;

  event.preventDefault();
  window.clearTimeout(state.timeWheelSettleTimer);
  const selectedIndex = options.findIndex((option) => option.classList.contains("selected"));
  const nearest = nearestTimeWheelOption(column);
  const currentIndex = selectedIndex >= 0 ? selectedIndex : nearest?.index || 0;
  const direction = delta > 0 ? 1 : -1;
  const stepCount = Math.max(1, Math.min(3, Math.round(Math.abs(delta) / TIME_WHEEL_WHEEL_PIXEL_STEP)));
  const nextIndex = (currentIndex + direction * stepCount + options.length) % options.length;
  const nextTime = timeForWheelOption(options[nextIndex]);
  if (nextTime) selectPickerTime(nextTime);
}

function handleTimeWheelScroll(event) {
  if (!state.picker || state.picker.type !== "time") return;
  if (state.timeWheelProgrammaticScroll) return;
  const column = event.currentTarget;
  const nearest = nearestTimeWheelOption(column);
  const nextIndex = nearest ? String(nearest.index) : "0";
  if (column.dataset.hapticIndex !== nextIndex) {
    column.dataset.hapticIndex = nextIndex;
    triggerHaptic();
  }
  window.clearTimeout(state.timeWheelSettleTimer);
  state.timeWheelSettleTimer = window.setTimeout(() => {
    settleTimeWheelColumn(column);
  }, TIME_WHEEL_SETTLE_DELAY_MS);
}

function settleTimeWheelColumn(column) {
  if (!state.picker || state.picker.type !== "time" || !column.isConnected) return;
  const nearest = nearestTimeWheelOption(column);
  const input = pickerTargetInput();
  if (!nearest || !input) return;

  const time = timeForWheelOption(nearest.option);
  if (!time || input.value === time) {
    updateTimePickerSelection();
    return;
  }

  selectPickerTime(time);
}

function selectPickerTime(time) {
  const input = pickerTargetInput();
  if (!input || !time) return;
  triggerHaptic();
  input.value = time;
  normalizeTimeRangeAfterPicker(input.id);
  syncTimeDisplays();
  updateTimePickerSelection();
}

function updateTimePickerSelection() {
  if (!state.picker || state.picker.type !== "time" || !els.pickerPanel || els.pickerPanel.hidden) return;
  const input = pickerTargetInput();
  if (!input) return;

  const options = pickerTimeOptions(input);
  const selectedTime = nearestPickerTime(isTimeString(input.value) ? input.value : defaultPickerValue(input), options);
  els.pickerPanel.querySelectorAll(".time-wheel-option").forEach((option) => {
    const part = option.dataset.wheelPart;
    if (part === "period" || part === "hour" || part === "minute") {
      option.dataset.time = timeForWheelOption(option, selectedTime, options);
    }
    const preferredCopy = optionWheelCopy(option) === middleWheelCopyForOption(option);
    option.classList.toggle("selected", option.dataset.time === selectedTime && preferredCopy);
  });

  window.requestAnimationFrame(centerSelectedTimeWheelOptions);
}

function nearestTimeWheelOption(column) {
  const options = [...column.querySelectorAll(".time-wheel-option")];
  if (!options.length) return null;

  const columnRect = column.getBoundingClientRect();
  const centerY = columnRect.top + columnRect.height / 2;
  return options.reduce((nearest, option, index) => {
    const rect = option.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - centerY);
    if (!nearest || distance < nearest.distance) return { option, index, distance };
    return nearest;
  }, null);
}

function centerSelectedTimeWheelOptions() {
  if (!state.picker || state.picker.type !== "time") return;
  const columns = [...els.pickerPanel.querySelectorAll(".time-wheel-column")];
  if (!columns.length) return;

  state.timeWheelProgrammaticScroll = true;
  columns.forEach((column) => {
    const selected = column.querySelector(".time-wheel-option.selected") || nearestTimeWheelOption(column)?.option;
    if (!selected) return;
    centerTimeWheelOption(column, selected);
    const nearest = nearestTimeWheelOption(column);
    column.dataset.hapticIndex = nearest ? String(nearest.index) : "0";
  });
  window.setTimeout(() => {
    state.timeWheelProgrammaticScroll = false;
  }, TIME_WHEEL_SETTLE_DELAY_MS);
}

function optionWheelCopy(option) {
  return Number(option?.dataset?.wheelCopy || 0);
}

function middleWheelCopyForOption(option) {
  const column = option?.closest?.(".time-wheel-column");
  return Number(column?.dataset?.wheelMiddleCopy || 0);
}

function centerTimeWheelOption(column, option) {
  state.timeWheelProgrammaticScroll = true;
  const targetTop = option.offsetTop - (column.clientHeight - option.offsetHeight) / 2;
  const top = Math.max(0, targetTop);
  if (typeof column.scrollTo === "function") {
    column.scrollTo({ top, behavior: "smooth" });
  } else {
    column.scrollTop = top;
  }
  window.setTimeout(() => {
    state.timeWheelProgrammaticScroll = false;
  }, TIME_WHEEL_SETTLE_DELAY_MS);
}

function triggerHaptic(duration = HAPTIC_DURATION_MS) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  const now = Date.now();
  if (now - state.lastHapticAt < HAPTIC_MIN_INTERVAL_MS) return;
  state.lastHapticAt = now;
  navigator.vibrate(duration);
}

function pickerTargetInput() {
  return state.picker && state.picker.targetId
    ? document.querySelector(`#${state.picker.targetId}`)
    : null;
}

function defaultPickerValue(input) {
  if (!input) return state.selectedDate;
  if (input.dataset.picker === "date") return state.selectedDate;
  return input.id === "endTimeInput" ? DEFAULT_END_TIME : DEFAULT_START_TIME;
}

function pickerTimeOptions(input) {
  return minuteTimeSlots(Boolean(input && input.id === "endTimeInput"));
}

function pickerMinuteValues() {
  return Array.from({ length: 60 / TIMELINE_TIME_STEP_MINUTES }, (_, index) =>
    String(index * TIMELINE_TIME_STEP_MINUTES).padStart(2, "0")
  );
}

function nearestPickerTime(time, options) {
  if (options.includes(time)) return time;
  return closestTime(options, time) || options[0] || DEFAULT_START_TIME;
}

function closestTime(options, time) {
  if (!options.length) return "";
  const target = timeToMinutes(time);
  return options.reduce((closest, option) => {
    return Math.abs(timeToMinutes(option) - target) < Math.abs(timeToMinutes(closest) - target)
      ? option
      : closest;
  }, options[0]);
}

function timeForWheelPart(options, selectedTime, part, value) {
  const selected = timeParts(selectedTime);
  const candidates = options.filter((time) => {
    const parts = timeParts(time);
    if (part === "period") return parts.period === value;
    if (part === "hour") return parts.hour24 === Number(value);
    if (part === "minute") {
      return parts.hour24 === selected.hour24
        && parts.minute === value;
    }
    return false;
  });

  if (!candidates.length) return selectedTime;
  if (candidates.includes(selectedTime)) return selectedTime;

  const exact = candidates.find((time) => {
    const parts = timeParts(time);
    if (part === "period") return parts.hour12 === selected.hour12 && parts.minute === selected.minute;
    if (part === "hour") return parts.minute === selected.minute;
    return true;
  });

  return exact || closestTime(candidates, selectedTime);
}

function timeForWheelOption(option, selectedTime = "", options = null) {
  if (!option) return "";
  const input = pickerTargetInput();
  const availableOptions = options || pickerTimeOptions(input);
  const baseTime = selectedTime || (input && isTimeString(input.value) ? input.value : defaultPickerValue(input));
  const normalizedBaseTime = nearestPickerTime(baseTime, availableOptions);
  const part = option.dataset.wheelPart;
  const value = option.dataset.wheelValue;

  if (part === "minute") {
    const selected = timeParts(normalizedBaseTime);
    const minute = Number(value);
    const selectedMinute = Number(selected.minute);
    let nextTime = timeForWheelPart(availableOptions, normalizedBaseTime, "minute", value);
    const copy = optionWheelCopy(option);
    const selectedCopy = middleWheelCopyForOption(option);

    if (copy > selectedCopy && minute < selectedMinute) {
      nextTime = addMinutesToTime(nextTime, 60);
    }
    if (copy < selectedCopy && minute > selectedMinute) {
      nextTime = addMinutesToTime(nextTime, -60);
    }

    return nearestPickerTime(clampTimelineTime(nextTime, input?.id === "endTimeInput"), availableOptions);
  }

  if (part === "period" || part === "hour") {
    return timeForWheelPart(availableOptions, normalizedBaseTime, part, value);
  }

  return option.dataset.time || "";
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
  const start = isTimeString(els.startTimeInput.value) ? els.startTimeInput.value : DEFAULT_START_TIME;
  const end = isTimeString(els.endTimeInput.value) ? els.endTimeInput.value : addMinutesToTime(start, DEFAULT_ITEM_DURATION_MINUTES);
  els.startTimeInput.value = clampTimelineTime(start, false);
  els.endTimeInput.value = clampTimelineTime(end, true);

  if (timeToMinutes(els.endTimeInput.value) > timeToMinutes(els.startTimeInput.value)) return;

  if (targetId === "endTimeInput") {
    els.startTimeInput.value = minutesToTime(Math.max(TIMELINE_START_MINUTES, timeToMinutes(els.endTimeInput.value) - DEFAULT_ITEM_DURATION_MINUTES));
    if (timeToMinutes(els.startTimeInput.value) >= timeToMinutes(els.endTimeInput.value)) {
      els.startTimeInput.value = minutesToTime(Math.max(TIMELINE_START_MINUTES, timeToMinutes(els.endTimeInput.value) - TIMELINE_TIME_STEP_MINUTES));
    }
    return;
  }

  els.endTimeInput.value = minutesToTime(Math.min(
    TIMELINE_END_MINUTES,
    timeToMinutes(els.startTimeInput.value) + DEFAULT_ITEM_DURATION_MINUTES
  ));
  if (timeToMinutes(els.endTimeInput.value) <= timeToMinutes(els.startTimeInput.value)) {
    els.endTimeInput.value = minutesToTime(Math.min(TIMELINE_END_MINUTES, timeToMinutes(els.startTimeInput.value) + TIMELINE_TIME_STEP_MINUTES));
  }
}

async function saveItem(event) {
  event.preventDefault();
  if (event.submitter?.dataset.dialogAction === "cancel") {
    cancelItemDialog();
    return;
  }
  closePicker();
  const type = normalizeItemType(
    els.typeInput.value ||
    document.querySelector("[data-type-choice].active")?.dataset.typeChoice ||
    state.editingItem?.type ||
    "일정"
  );
  els.typeInput.value = type;
  const id = els.editingId.value;
  const payload = {
    title: els.titleInput.value,
    type,
    note: els.noteInput.value
  };

  if (!isRecurringTemplateType(type)) payload.date = els.dateInput.value || state.selectedDate;
  if (type === "일정") payload.endDate = els.endDateInput.value || payload.date;
  if ((type === "일정" || type === "할일") && els.allDayInput.checked) {
    els.startTimeInput.value = FULL_DAY_START_TIME;
    els.endTimeInput.value = FULL_DAY_END_TIME;
  }
  if (isTimedItemType(type)) {
    payload.startTime = els.startTimeInput.value;
    payload.endTime = els.endTimeInput.value;
  }
  if (isRecurringTemplateType(type)) {
    payload.repeatDays = [...document.querySelectorAll('[name="repeatDay"]:checked')].map((input) => input.value);
  }

  state.itemDialogSaveInProgress = true;
  let saved = false;

  try {
    let responsePayload;
    if (id) {
      responsePayload = await api("/api/items", {
        method: "PATCH",
        body: { id, ...payload }
      });
    } else {
      responsePayload = await api("/api/items", {
        method: "POST",
        body: payload
      });
    }
    if (responsePayload.item) upsertLocalItem(responsePayload.item, { renderAfter: false });
    saved = true;
    els.dialog.close();
    render();
  } catch (error) {
    setStatus(error.message || "Could not save.");
  } finally {
    state.itemDialogSaveInProgress = false;
    if (saved && !els.dialog.open) restoreItemDialogReturnTarget();
  }
}

async function deleteCurrentItem() {
  const id = els.editingId.value;
  if (!id) return;
  if (!window.confirm("Delete this item?")) return;

  state.itemDialogSaveInProgress = true;
  let deleted = false;

  try {
    await deleteItemFast(id, { renderAfter: false });
    deleted = true;
    els.dialog.close();
    render();
  } catch (error) {
    setStatus(error.message || "Could not delete.");
  } finally {
    state.itemDialogSaveInProgress = false;
    if (deleted && !els.dialog.open) restoreItemDialogReturnTarget();
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

  try {
    await patchItemFast(id, body);
  } catch (error) {
    setStatus(error.message || "Could not update.");
  }
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
  if (!remembered || (item.type !== "할일" && !isRecurringTemplateType(item.type))) return item;

  return {
    ...item,
    date: isRecurringTemplateType(item.type) ? item.date : item.date || remembered.date,
    startTime: item.startTime || remembered.startTime,
    endTime: item.endTime || remembered.endTime
  };
}

function upsertLocalItem(item, options = {}) {
  if (!item || !item.id) return null;
  const normalized = applyRememberedItemTime(item);
  const index = state.items.findIndex((entry) => entry.id === normalized.id);
  if (index >= 0) {
    state.items = [
      ...state.items.slice(0, index),
      normalized,
      ...state.items.slice(index + 1)
    ];
  } else {
    state.items = [...state.items, normalized];
  }
  rememberItemTime(normalized);
  writeActiveItemsCache();
  renderLocalChange(options);
  return normalized;
}

function removeLocalItem(id, options = {}) {
  if (!id) return null;
  const previous = findItem(id);
  if (!previous) return null;
  state.items = state.items.filter((item) => item.id !== id);
  delete state.itemTimeMemory[id];
  writeActiveItemsCache();
  renderLocalChange(options);
  return previous;
}

function localPatchedItem(item, patch) {
  if (!item) return null;
  return applyRememberedItemTime({
    ...item,
    ...patch,
    lastEditedTime: new Date().toISOString()
  });
}

async function patchItemFast(id, patch, apiBody = patch, options = {}) {
  const previous = findItem(id);
  if (!previous) return null;
  const optimistic = localPatchedItem(previous, patch);
  upsertLocalItem(optimistic, { renderAfter: options.renderAfter !== false });

  try {
    const payload = await api("/api/items", {
      method: "PATCH",
      body: { id, ...apiBody }
    });
    if (payload.item) return upsertLocalItem(payload.item, { renderAfter: options.renderAfter !== false });
    return optimistic;
  } catch (error) {
    upsertLocalItem(previous, { renderAfter: options.renderAfter !== false });
    throw error;
  }
}

async function createItemFast(body, options = {}) {
  const payload = await api("/api/items", {
    method: "POST",
    body
  });
  if (payload.item) upsertLocalItem(payload.item, { renderAfter: options.renderAfter !== false });
  return payload;
}

async function deleteItemFast(id, options = {}) {
  const previous = removeLocalItem(id, { renderAfter: options.renderAfter !== false });
  if (!previous) return null;

  try {
    await api(`/api/items?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    return previous;
  } catch (error) {
    upsertLocalItem(previous, { renderAfter: options.renderAfter !== false });
    throw error;
  }
}

async function toggleRoutine(id) {
  const routine = findItem(id);
  if (!routine) return;
  const existing = routineRecord(id, state.selectedDate);
  const completed = !(existing && existing.completed);

  try {
    if (existing) {
      await patchItemFast(existing.id, {
        completed,
        status: completed ? "완료" : "예정"
      });
    } else {
      await createItemFast({
        title: `${routine.title} log`,
        type: "루틴기록",
        date: state.selectedDate,
        completed,
        status: completed ? "완료" : "예정",
        sourceRoutineId: routine.id
      });
    }

    const challengeMessage = completed ? await awardChallengeFill() : "";
    if (challengeMessage) setStatus(challengeMessage);
  } catch (error) {
    setStatus(error.message || "Could not update the routine.");
  }
}

async function skipFixedSchedule(id, date = state.selectedDate) {
  const schedule = findItem(id);
  if (!schedule || schedule.type !== "고정일정" || !isDateString(date)) return;

  const existing = routineRecord(id, date);
  state.selectedTimelineItem = null;
  clearSelectedTimelineRange();

  try {
    if (existing) {
      await patchItemFast(existing.id, {
        completed: false,
        status: "취소"
      });
    } else {
      await createItemFast({
        title: `${schedule.title} skip`,
        type: "루틴기록",
        date,
        completed: false,
        status: "취소",
        sourceRoutineId: schedule.id
      });
    }
  } catch (error) {
    setStatus(error.message || "Could not skip the fixed schedule.");
  }
}

async function returnFixedSchedule(recordId) {
  const record = findItem(recordId);
  if (!record || record.type !== "루틴기록" || record.status !== "취소") return;

  try {
    await deleteItemFast(record.id);
    setStatus("Returned.");
  } catch (error) {
    setStatus(error.message || "Could not return the fixed schedule.");
  }
}

function startTimeSelection(event) {
  if (state.suppressTimeSelectionPointerId === event.pointerId) return;

  const slot = event.target.closest("[data-time-slot]");
  if (
    !slot ||
    event.target.closest("button, input, textarea, select")
  ) return;
  const context = timelineContextFromSlot(slot);
  const startsFromSelectedRange = timeRangeContainsSlot(
    state.selectedTimeRange,
    context,
    state.selectedDate,
    slot.dataset.timeSlot
  );
  if (document.querySelector(".slot.selected") && !slot.classList.contains("selected")) {
    clearSelectedTimeRangeOnly();
    suppressTimeSelectionForPointer(event.pointerId);
    return;
  }
  if (
    state.selectedTimeRange &&
    !startsFromSelectedRange
  ) {
    clearSelectedTimeRangeOnly();
    suppressTimeSelectionForPointer(event.pointerId);
    return;
  }

  const holdDelay = event.pointerType === "touch" && !startsFromSelectedRange
    ? TIMELINE_TOUCH_HOLD_DELAY
    : 0;

  window.clearTimeout(state.timeClickTimer);
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
    scrollContainer: timelineScrollContainer(slot),
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
    event.preventDefault();
    return;
  }

  state.timeSelectionHoldTimer = window.setTimeout(() => {
    if (!state.timeSelection || state.timeSelection.pointerId !== event.pointerId || state.timeSelection.cancelled) return;
    state.timeSelection.active = true;
    markSelectedTimeSlots();
  }, holdDelay);
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
      clearSelectedTimeRangeOnly();
      suppressTimeSelectionForPointer(event.pointerId);
      scrollTimelineTouchGesture(event);
    }
    return;
  }

  if (distance > TIMELINE_TOUCH_MOVE_CANCEL_DISTANCE) state.timeSelection.moved = true;

  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-time-slot]");
  if (!target) return;

  state.timeSelection.currentTime = target.dataset.timeSlot;
  markSelectedTimeSlots();
  event.preventDefault();
}

function scrollTimelineTouchGesture(event) {
  if (!state.timeSelection?.scrolling) return;
  const delta = state.timeSelection.lastScrollY - event.clientY;
  state.timeSelection.lastScrollY = event.clientY;
  if (delta) {
    const container = state.timeSelection.scrollContainer;
    if (container) {
      container.scrollTop += delta;
    } else {
      window.scrollBy(0, delta);
    }
  }
  event.preventDefault?.();
}

function timelineScrollContainer(slot) {
  const container = slot.closest(".calendar-timeline-content");
  if (container) return container;
  return null;
}

function finishTimeSelection(event) {
  if (state.suppressTimeSelectionPointerId === event.pointerId) {
    if (state.timeSelection?.pointerId === event.pointerId) {
      window.clearTimeout(state.timeSelectionHoldTimer);
      state.timeSelectionHoldTimer = null;
      state.timeSelection = null;
      clearSelectedTimeSlots();
    }
    clearSuppressedTimeSelectionPointer(event.pointerId);
    return;
  }
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
  if (state.timeSelection) clearSuppressedTimeSelectionPointer(state.timeSelection.pointerId);
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
    originalMetaText: card.querySelector(".item-meta")?.textContent || "",
    startX: event.clientX,
    startY: event.clientY,
    moved: false
  };
  try {
    handle.setPointerCapture?.(event.pointerId);
  } catch {
    // Pointer capture can fail when the browser does not consider the pointer active.
  }
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
  state.timelineResize.element.style.setProperty("--slot-start", timelineOffsetUnits(state.timelineResize.targetStartIndex));
  state.timelineResize.element.style.setProperty("--slot-span", timelineOffsetUnits(state.timelineResize.targetSpan));
  updateTimelineResizeMeta();
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

  const startTime = timelineOffsetToTime(targetStartIndex);
  const endTime = timelineOffsetToTime(targetStartIndex + targetSpan);

  try {
    await updateTimelineItemTime(item, startTime, endTime);
  } catch (error) {
    setStatus(error.message || "Could not update the time.");
    render();
  }
}

function cancelTimelineItemResize() {
  clearTimelineResizeState(true);
}

function startTimelineItemDrag(event) {
  const card = event.target.closest(".timeline-item");
  if (!card || event.target.closest(".checkbox, .fixed-skip-button, .edit-button, .timeline-resize-handle, input, textarea, select")) return;

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
    originalMetaText: card.querySelector(".item-meta")?.textContent || "",
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
  state.timelineDrag.element.style.setProperty("--slot-start", timelineOffsetUnits(state.timelineDrag.targetIndex));
  updateTimelineDragMeta();
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

  const startTime = timelineOffsetToTime(targetIndex);
  const endTime = timelineOffsetToTime(targetIndex + drag.span);

  try {
    await updateTimelineItemTime(item, startTime, endTime);
  } catch (error) {
    setStatus(error.message || "Could not update the time.");
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

  if (!isRecurringTemplateType(item.type)) {
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

  await patchItemFast(item.id, body);
}

function timelineDragTargetIndex(event) {
  const drag = state.timelineDrag;
  const slotHeight = parseFloat(getComputedStyle(drag.timeline).getPropertyValue("--slot-height")) || 56;
  const top = drag.timeline.getBoundingClientRect().top;
  const rawIndex = snapTimelineMinutes(((event.clientY - top - drag.offsetY) / slotHeight) * TIMELINE_ROW_MINUTES);
  const maxIndex = Math.max(0, timelineTotalMinutes() - drag.span);
  return Math.max(0, Math.min(maxIndex, rawIndex));
}

function updateTimelineResizeTarget(event) {
  const resize = state.timelineResize;
  const slotHeight = parseFloat(getComputedStyle(resize.timeline).getPropertyValue("--slot-height")) || 56;
  const top = resize.timeline.getBoundingClientRect().top;
  const rawIndex = snapTimelineMinutes(((event.clientY - top) / slotHeight) * TIMELINE_ROW_MINUTES);
  const originalEndIndex = resize.originalStartIndex + resize.originalSpan;

  if (resize.edge === "start") {
    const nextStartIndex = Math.max(0, Math.min(originalEndIndex - TIMELINE_RESIZE_MIN_MINUTES, rawIndex));
    resize.targetStartIndex = nextStartIndex;
    resize.targetSpan = originalEndIndex - nextStartIndex;
    return;
  }

  const nextEndIndex = Math.max(
    resize.originalStartIndex + TIMELINE_RESIZE_MIN_MINUTES,
    Math.min(timelineTotalMinutes(), rawIndex)
  );
  resize.targetStartIndex = resize.originalStartIndex;
  resize.targetSpan = nextEndIndex - resize.originalStartIndex;
}

function markTimelineDragSlots() {
  clearTimelineDragSlots();
  if (!state.timelineDrag) return;

  const { targetIndex, span, timeline } = state.timelineDrag;
  timeline.querySelectorAll("[data-time-slot]").forEach((slot) => {
    if (timeRangesOverlap(targetIndex, targetIndex + span, Number(slot.dataset.slotStartMinute), Number(slot.dataset.slotEndMinute))) {
      slot.classList.add("drag-target");
    }
  });
}

function markTimelineResizeSlots() {
  clearTimelineDragSlots();
  if (!state.timelineResize) return;

  const { targetStartIndex, targetSpan, timeline } = state.timelineResize;
  timeline.querySelectorAll("[data-time-slot]").forEach((slot) => {
    if (timeRangesOverlap(targetStartIndex, targetStartIndex + targetSpan, Number(slot.dataset.slotStartMinute), Number(slot.dataset.slotEndMinute))) {
      slot.classList.add("drag-target");
    }
  });
}

function clearTimelineDragSlots() {
  document.querySelectorAll(".slot.drag-target").forEach((slot) => slot.classList.remove("drag-target"));
}

function clearTimelineDragState(restorePosition) {
  if (!state.timelineDrag) return;
  const { element, originalIndex, originalMetaText } = state.timelineDrag;
  if (restorePosition) {
    element.style.setProperty("--slot-start", timelineOffsetUnits(originalIndex));
    const meta = element.querySelector(".item-meta");
    if (meta) meta.textContent = originalMetaText;
  }
  element.classList.remove("dragging");
  clearTimelineDragSlots();
  state.timelineDrag = null;
}

function clearTimelineResizeState(restorePosition) {
  if (!state.timelineResize) return;
  const { element, originalStartIndex, originalSpan, originalMetaText } = state.timelineResize;
  if (restorePosition) {
    element.style.setProperty("--slot-start", timelineOffsetUnits(originalStartIndex));
    element.style.setProperty("--slot-span", timelineOffsetUnits(originalSpan));
    const meta = element.querySelector(".item-meta");
    if (meta) meta.textContent = originalMetaText;
  }
  element.classList.remove("resizing");
  clearTimelineDragSlots();
  state.timelineResize = null;
}

function updateTimelineDragMeta() {
  if (!state.timelineDrag) return;
  const { element, targetIndex, span } = state.timelineDrag;
  const meta = element.querySelector(".item-meta");
  if (meta) meta.textContent = timelineRangeText(targetIndex, span);
}

function updateTimelineResizeMeta() {
  if (!state.timelineResize) return;
  const { element, targetStartIndex, targetSpan } = state.timelineResize;
  const meta = element.querySelector(".item-meta");
  if (meta) meta.textContent = timelineRangeText(targetStartIndex, targetSpan);
}

function timelineRangeText(startIndex, span) {
  return `${timelineOffsetToTime(startIndex)} - ${timelineOffsetToTime(startIndex + span)}`;
}

function selectCalendarSchedule(id, date) {
  const item = findItem(id);
  if (!item || item.type !== "일정") return;
  state.selectedCalendarSchedule = { id, date };
  state.calendarSelectedDate = null;
  state.selectedDate = date || item.date || state.selectedDate;
  clearSelectedTimelineRange();
  render();
}

function selectedCalendarScheduleMatches(id) {
  return Boolean(state.selectedCalendarSchedule && state.selectedCalendarSchedule.id === id);
}

function registerCalendarScheduleTap(id) {
  const now = Date.now();
  const lastTap = state.lastCalendarScheduleTap;
  state.lastCalendarScheduleTap = { id, at: now };
  return Boolean(lastTap && lastTap.id === id && now - lastTap.at <= 360);
}

async function adjustCalendarScheduleSpan(id, edge) {
  const item = findItem(id);
  if (!item || item.type !== "일정" || (edge !== "start" && edge !== "end")) return;

  const range = selectedDateRange(item.date, item.endDate || item.date);
  const startDate = edge === "start" ? addDays(range.startDate, -1) : range.startDate;
  const endDate = edge === "end" ? addDays(range.endDate, 1) : range.endDate;
  state.selectedCalendarSchedule = { id: item.id, date: edge === "start" ? startDate : endDate };
  state.calendarSelectedDate = null;
  clearSelectedTimelineRange();

  try {
    await updateCalendarScheduleRange(item, startDate, endDate);
  } catch (error) {
    setStatus(error.message || "Could not update the event range.");
    render();
  }
}

async function deleteCalendarSchedule(id) {
  const item = findItem(id);
  if (!item || item.type !== "일정") return;
  state.selectedCalendarSchedule = null;
  state.calendarSelectedDate = null;
  state.lastCalendarScheduleTap = null;
  clearSelectedTimelineRange();

  try {
    await deleteItemFast(id);
    setStatus("Deleted.");
  } catch (error) {
    setStatus(error.message || "Could not delete.");
  }
}

function suppressCalendarInteractionAfterScheduleGesture() {
  state.suppressCalendarScheduleClick = true;
  state.suppressCalendarClick = true;
  state.suppressCalendarControlClick = true;
  window.setTimeout(() => {
    state.suppressCalendarScheduleClick = false;
    state.suppressCalendarClick = false;
    state.suppressCalendarControlClick = false;
  }, 380);
}

function startCalendarScheduleResize(event) {
  const handle = event.target.closest("[data-calendar-resize-edge]");
  if (!handle) return;

  const chip = handle.closest(".schedule-chip");
  const control = handle.closest("[data-calendar-schedule-control]");
  const id = chip?.dataset.id || control?.dataset.id;
  const item = findItem(id);
  if ((!chip && !control) || !item || item.type !== "일정" || !selectedCalendarScheduleMatches(item.id)) return;

  const range = selectedDateRange(item.date, item.endDate || item.date);
  const fromControl = Boolean(control && !chip);
  state.calendarScheduleResize = {
    pointerId: event.pointerId,
    id: item.id,
    edge: handle.dataset.calendarResizeEdge,
    element: chip || control,
    fromControl,
    dayWidth: calendarAverageDayWidth(),
    originalStartDate: range.startDate,
    originalEndDate: range.endDate,
    targetStartDate: range.startDate,
    targetEndDate: range.endDate,
    startX: event.clientX,
    startY: event.clientY,
    row: chip ? Number(chip.style.getPropertyValue("--schedule-row")) || 0 : 0,
    moved: false
  };
  state.calendarSelectedDate = null;
  try {
    handle.setPointerCapture?.(event.pointerId);
  } catch {
    // Pointer capture can fail when the browser does not consider the pointer active.
  }
  if (!fromControl) event.preventDefault();
  event.stopPropagation();
}

function moveCalendarScheduleResize(event) {
  if (!state.calendarScheduleResize || state.calendarScheduleResize.pointerId !== event.pointerId) return;

  const resize = state.calendarScheduleResize;
  const distance = Math.abs(event.clientX - resize.startX) + Math.abs(event.clientY - resize.startY);
  if (distance <= 8 && !resize.moved) return;

  const wasMoved = resize.moved;
  resize.moved = true;
  const changed = updateCalendarScheduleResizeTarget(event);
  if (!wasMoved || changed) renderCalendarScheduleResizePreview();
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

  suppressCalendarInteractionAfterScheduleGesture();

  const item = findItem(resize.id);
  if (!item) return;

  try {
    await updateCalendarScheduleRange(item, startDate, endDate);
  } catch (error) {
    setStatus(error.message || "Could not update the event range.");
    render();
  }
}

function cancelCalendarScheduleResize() {
  clearCalendarScheduleResizeState(true);
}

function startCalendarScheduleDrag(event) {
  const chip = event.target.closest(".schedule-chip[data-action='select-calendar-schedule']");
  const controlMove = event.target.closest("[data-calendar-control-action='move']");
  const control = controlMove?.closest("[data-calendar-schedule-control]");
  const id = chip?.dataset.id || control?.dataset.id;
  if (
    (!chip && !control) ||
    event.target.closest("[data-calendar-resize-edge]") ||
    !selectedCalendarScheduleMatches(id)
  ) return;

  const item = findItem(id);
  if (!item || item.type !== "일정") return;

  const range = selectedDateRange(item.date, item.endDate || item.date);
  const grabbedDate = chip?.dataset.date || control?.dataset.date || range.startDate;
  const grabbedDay = chip
    ? chip.closest(".schedule-calendar [data-date]")
    : calendarDayElement(grabbedDate);
  const grabbedRect = grabbedDay?.getBoundingClientRect();
  const pointerOffsetX = chip && grabbedRect ? event.clientX - grabbedRect.left : (grabbedRect?.width || 0) / 2;
  const pointerOffsetY = chip && grabbedRect ? event.clientY - grabbedRect.top : (grabbedRect?.height || 0) / 2;
  state.calendarScheduleDrag = {
    pointerId: event.pointerId,
    id: item.id,
    element: chip || control,
    grabbedDate,
    targetGrabbedDate: grabbedDate,
    originalStartDate: range.startDate,
    originalEndDate: range.endDate,
    targetStartDate: range.startDate,
    targetEndDate: range.endDate,
    startX: event.clientX,
    startY: event.clientY,
    pointerOffsetX,
    pointerOffsetY,
    dayWidth: grabbedRect?.width || 0,
    dayHeight: grabbedRect?.height || 0,
    visualX: 0,
    visualY: 0,
    row: chip ? Number(chip.style.getPropertyValue("--schedule-row")) || 0 : 0,
    moved: false
  };
  state.calendarSelectedDate = null;
  try {
    (chip || controlMove || control)?.setPointerCapture?.(event.pointerId);
  } catch {
    // Pointer capture can fail when the browser does not consider the pointer active.
  }
}

function moveCalendarScheduleDrag(event) {
  if (!state.calendarScheduleDrag || state.calendarScheduleDrag.pointerId !== event.pointerId) return;

  const drag = state.calendarScheduleDrag;
  const distance = Math.abs(event.clientX - drag.startX) + Math.abs(event.clientY - drag.startY);
  if (distance <= 8 && !drag.moved) return;

  const wasMoved = drag.moved;
  drag.moved = true;
  const changed = updateCalendarScheduleDragTarget(event);
  if (!wasMoved || changed || !document.querySelector(".schedule-drag-preview")) {
    renderCalendarScheduleDragPreview();
  } else {
    scheduleCalendarScheduleDragPreviewTransform();
  }
  event.preventDefault();
}

async function finishCalendarScheduleDrag(event) {
  if (!state.calendarScheduleDrag || state.calendarScheduleDrag.pointerId !== event.pointerId) return;

  const drag = state.calendarScheduleDrag;
  const moved = drag.moved;
  const startDate = drag.targetStartDate;
  const endDate = drag.targetEndDate;
  clearCalendarScheduleDragState(false);

  if (!moved) return;

  suppressCalendarInteractionAfterScheduleGesture();

  const item = findItem(drag.id);
  if (!item) {
    render();
    return;
  }

  try {
    await updateCalendarScheduleRange(item, startDate, endDate);
  } catch (error) {
    setStatus(error.message || "Could not move the event.");
    render();
  }
}

function cancelCalendarScheduleDrag() {
  clearCalendarScheduleDragState(true);
}

function updateCalendarScheduleDragTarget(event) {
  const drag = state.calendarScheduleDrag;
  const anchor = calendarScheduleDragAnchorPoint(event, drag);
  const targetDate = calendarDateFromPoint(anchor) || drag.targetGrabbedDate;
  if (!targetDate) return false;

  const previousStartDate = drag.targetStartDate;
  const previousEndDate = drag.targetEndDate;
  const previousGrabbedDate = drag.targetGrabbedDate;

  const delta = daysBetween(drag.grabbedDate, targetDate);
  drag.targetGrabbedDate = targetDate;
  drag.targetStartDate = addDays(drag.originalStartDate, delta);
  drag.targetEndDate = addDays(drag.originalEndDate, delta);
  updateCalendarScheduleDragVisualOffset(event, targetDate);
  return drag.targetStartDate !== previousStartDate ||
    drag.targetEndDate !== previousEndDate ||
    drag.targetGrabbedDate !== previousGrabbedDate;
}

function calendarScheduleDragAnchorPoint(event, drag) {
  return {
    clientX: event.clientX - (drag.pointerOffsetX || 0) + (drag.dayWidth || 0) / 2,
    clientY: event.clientY - (drag.pointerOffsetY || 0) + (drag.dayHeight || 0) / 2
  };
}

function updateCalendarScheduleDragVisualOffset(event, targetDate) {
  const drag = state.calendarScheduleDrag;
  if (!drag) return;

  const targetDay = calendarDayElement(targetDate);
  const rect = targetDay?.getBoundingClientRect();
  if (!rect) {
    drag.visualX = 0;
    drag.visualY = 0;
    return;
  }

  drag.visualX = event.clientX - (drag.pointerOffsetX || 0) - rect.left;
  drag.visualY = event.clientY - (drag.pointerOffsetY || 0) - rect.top;
}

function clearCalendarScheduleDragDates() {
  document.querySelectorAll(".day-cell.calendar-drag-target").forEach((day) => day.classList.remove("calendar-drag-target"));
}

function renderCalendarScheduleDragPreview() {
  const drag = state.calendarScheduleDrag;
  if (!drag?.moved) return;

  clearCalendarScheduleDragPreview(false);

  const item = findItem(drag.id);
  if (!item) return;

  document.querySelectorAll(".schedule-chip[data-id]").forEach((chip) => {
    if (chip.dataset.id === drag.id) chip.classList.add("drag-source-hidden");
  });

  const range = selectedDateRange(drag.targetStartDate, drag.targetEndDate);
  const { previewItem, row, rowCount } = calendarSchedulePreviewPlacement(item, range.startDate, range.endDate);
  applyCalendarScheduleRowCount(rowCount);
  const title = String(item.title || "").trim() || "Untitled";

  document.querySelectorAll(".schedule-calendar [data-date]").forEach((day) => {
    const date = day.dataset.date;
    if (date < range.startDate || date > range.endDate) return;

    const schedules = day.querySelector(".day-schedules");
    if (!schedules) return;

    const rangeClass = calendarScheduleRangeClass(previewItem, date);
    const rangeTokens = rangeClass.split(/\s+/);
    const showTitle = rangeTokens.includes("single") || rangeTokens.includes("segment-start");
    const preview = document.createElement("span");
    preview.className = [
      "schedule-chip",
      "schedule-drag-preview",
      rangeClass,
      showTitle ? "has-title" : "continuation",
      "selected",
      "dragging"
    ].join(" ");
    preview.dataset.id = item.id;
    preview.dataset.date = date;
    preview.style.setProperty("--schedule-row", String(row));
    preview.title = title;
    preview.textContent = showTitle ? title : "\u00a0";
    schedules.append(preview);
  });
  applyCalendarScheduleDragPreviewTransform();
}

function scheduleCalendarScheduleDragPreviewTransform() {
  if (state.calendarScheduleDragFrame) return;
  state.calendarScheduleDragFrame = window.requestAnimationFrame(() => {
    state.calendarScheduleDragFrame = null;
    applyCalendarScheduleDragPreviewTransform();
  });
}

function applyCalendarScheduleDragPreviewTransform() {
  const drag = state.calendarScheduleDrag;
  if (!drag) return;

  const x = `${roundDragPixel(drag.visualX || 0)}px`;
  const y = `${roundDragPixel(drag.visualY || 0)}px`;
  document.querySelectorAll(".schedule-drag-preview").forEach((chip) => {
    chip.style.setProperty("--calendar-drag-x", x);
    chip.style.setProperty("--calendar-drag-y", y);
  });
}

function roundDragPixel(value) {
  return Math.round(value * 10) / 10;
}

function clearCalendarScheduleDragPreview(showSource = true) {
  document.querySelectorAll(".schedule-drag-preview").forEach((chip) => chip.remove());
  if (!showSource) return;
  document.querySelectorAll(".schedule-chip.drag-source-hidden").forEach((chip) => {
    chip.classList.remove("drag-source-hidden");
  });
  resetCalendarScheduleRowCount();
}

function clearCalendarScheduleDragState(restorePreview = true) {
  if (!state.calendarScheduleDrag) return;
  if (state.calendarScheduleDragFrame) {
    window.cancelAnimationFrame(state.calendarScheduleDragFrame);
    state.calendarScheduleDragFrame = null;
  }
  const moved = state.calendarScheduleDrag.moved;
  state.calendarScheduleDrag.element.classList.remove("dragging");
  clearCalendarScheduleDragDates();
  state.calendarScheduleDrag = null;
  if (restorePreview || !moved) clearCalendarScheduleDragPreview(true);
}

function startCalendarMonthSwipe(event) {
  if (state.tab !== "calendar") return;
  const grid = event.target.closest(".schedule-calendar");
  const day = event.target.closest(".schedule-calendar [data-date]");
  const startsOnSelectedDate = Boolean(day && day.dataset.date === state.calendarSelectedDate);
  if (
    !grid ||
    startsOnSelectedDate ||
    event.target.closest(".calendar-schedule-control, .schedule-chip, [data-calendar-resize-edge]") ||
    state.calendarScheduleDrag ||
    state.calendarScheduleResize
  ) return;

  state.calendarMonthSwipe = {
    pointerId: event.pointerId,
    grid,
    startX: event.clientX,
    startY: event.clientY,
    currentX: event.clientX,
    currentY: event.clientY,
    horizontal: false,
    captured: false,
    cancelled: false
  };
  resetCalendarMonthSwipeVisual(grid, true);
}

function moveCalendarMonthSwipe(event) {
  if (!state.calendarMonthSwipe || state.calendarMonthSwipe.pointerId !== event.pointerId) return;

  const swipe = state.calendarMonthSwipe;
  swipe.currentX = event.clientX;
  swipe.currentY = event.clientY;

  const dx = swipe.currentX - swipe.startX;
  const dy = swipe.currentY - swipe.startY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (!swipe.horizontal && absY > 32 && absY > absX) {
    swipe.cancelled = true;
    return;
  }

  if (absX > 10 && absX > absY * CALENDAR_MONTH_SWIPE_RATIO) {
    swipe.horizontal = true;
    if (!swipe.captured) {
      try {
        swipe.grid?.setPointerCapture?.(event.pointerId);
        swipe.captured = true;
      } catch {
        // Pointer capture can fail when the browser does not consider the pointer active.
      }
    }
    clearCalendarSelectionForMonthSwipe();
    updateCalendarMonthSwipeVisual(swipe.grid, dx);
    event.preventDefault();
  }
}

async function finishCalendarMonthSwipe(event) {
  if (!state.calendarMonthSwipe || state.calendarMonthSwipe.pointerId !== event.pointerId) return;

  const swipe = state.calendarMonthSwipe;
  state.calendarMonthSwipe = null;

  if (swipe.cancelled) return;

  const dx = swipe.currentX - swipe.startX;
  const dy = swipe.currentY - swipe.startY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (absX < CALENDAR_MONTH_SWIPE_DISTANCE || absX <= absY * CALENDAR_MONTH_SWIPE_RATIO) {
    resetCalendarMonthSwipeVisual(swipe.grid);
    return;
  }

  suppressCalendarGestureClicks();
  commitCalendarMonthSwipeVisual(swipe.grid, dx);
  await wait(110);
  await changeCalendarMonth(dx > 0 ? -1 : 1);
}

function cancelCalendarMonthSwipe() {
  if (state.calendarMonthSwipe?.grid) resetCalendarMonthSwipeVisual(state.calendarMonthSwipe.grid);
  state.calendarMonthSwipe = null;
}

function updateCalendarMonthSwipeVisual(grid, dx) {
  if (!grid) return;
  const visualX = Math.max(-CALENDAR_MONTH_SWIPE_VISUAL_LIMIT, Math.min(CALENDAR_MONTH_SWIPE_VISUAL_LIMIT, dx * 0.56));
  grid.classList.add("month-swiping");
  grid.classList.remove("month-swipe-commit");
  grid.style.setProperty("--calendar-swipe-x", `${roundDragPixel(visualX)}px`);
}

function clearCalendarSelectionForMonthSwipe() {
  if (!state.calendarSelectedDate && !state.selectedCalendarSchedule) return;
  state.calendarSelectedDate = null;
  state.selectedCalendarSchedule = null;
  document.querySelectorAll(".schedule-calendar .day-cell.selected").forEach((day) => {
    day.classList.remove("selected");
  });
  document.querySelectorAll(".schedule-calendar .schedule-chip.selected").forEach((chip) => {
    chip.classList.remove("selected");
  });
}

function resetCalendarMonthSwipeVisual(grid, immediate = false) {
  if (!grid) return;
  grid.classList.toggle("month-swiping", Boolean(immediate));
  grid.classList.remove("month-swipe-commit");
  grid.style.setProperty("--calendar-swipe-x", "0px");
  if (!immediate) {
    window.setTimeout(() => {
      grid.classList.remove("month-swiping");
    }, 190);
  }
}

function commitCalendarMonthSwipeVisual(grid, dx) {
  if (!grid) return;
  grid.classList.remove("month-swiping");
  grid.classList.add("month-swipe-commit");
  const direction = dx > 0 ? 1 : -1;
  grid.style.setProperty("--calendar-swipe-x", `${direction * CALENDAR_MONTH_SWIPE_VISUAL_LIMIT}px`);
}

async function changeCalendarMonth(delta) {
  if (!delta || state.loading) return;
  state.visibleMonth = addMonths(state.visibleMonth, delta);
  state.calendarSelectedDate = null;
  state.selectedCalendarSchedule = null;
  clearSelectedTimelineRange();
  await loadItems();
}

function suppressCalendarGestureClicks() {
  state.suppressCalendarClick = true;
  state.suppressCalendarScheduleClick = true;
  window.setTimeout(() => {
    state.suppressCalendarClick = false;
    state.suppressCalendarScheduleClick = false;
  }, 280);
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
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

function updateCalendarScheduleResizeTarget(event) {
  const resize = state.calendarScheduleResize;
  const targetDate = resize.fromControl
    ? calendarResizeControlTargetDate(event, resize)
    : calendarDateFromPoint(event);
  if (!targetDate) return false;

  const previousStartDate = resize.targetStartDate;
  const previousEndDate = resize.targetEndDate;

  if (resize.edge === "start") {
    resize.targetStartDate = targetDate <= resize.originalEndDate ? targetDate : resize.originalEndDate;
    resize.targetEndDate = resize.originalEndDate;
    return resize.targetStartDate !== previousStartDate || resize.targetEndDate !== previousEndDate;
  }

  resize.targetStartDate = resize.originalStartDate;
  resize.targetEndDate = targetDate >= resize.originalStartDate ? targetDate : resize.originalStartDate;
  return resize.targetStartDate !== previousStartDate || resize.targetEndDate !== previousEndDate;
}

function calendarResizeControlTargetDate(event, resize) {
  const dayWidth = resize.dayWidth || calendarAverageDayWidth();
  if (!dayWidth) return "";

  const deltaDays = Math.round((event.clientX - resize.startX) / dayWidth);
  return resize.edge === "start"
    ? addDays(resize.originalStartDate, deltaDays)
    : addDays(resize.originalEndDate, deltaDays);
}

function calendarAverageDayWidth() {
  const day = document.querySelector(".schedule-calendar [data-date]");
  const rect = day?.getBoundingClientRect();
  if (!rect?.width) return 0;
  const gap = Number.parseFloat(getComputedStyle(document.querySelector(".schedule-calendar")).getPropertyValue("--calendar-gap")) || 0;
  return rect.width + gap;
}

function calendarDateFromPoint(event) {
  const elements = document.elementsFromPoint
    ? document.elementsFromPoint(event.clientX, event.clientY)
    : [document.elementFromPoint(event.clientX, event.clientY)];
  for (const element of elements) {
    const day = element?.closest?.(".schedule-calendar [data-date]");
    if (day?.dataset.date) return day.dataset.date;
  }
  return "";
}

function calendarDayElement(date) {
  if (!date) return null;
  return document.querySelector(`.schedule-calendar [data-date="${date}"]`);
}

function clearCalendarScheduleResizeDates() {
  document.querySelectorAll(".day-cell.calendar-resize-target").forEach((day) => day.classList.remove("calendar-resize-target"));
}

function renderCalendarScheduleResizePreview() {
  const resize = state.calendarScheduleResize;
  if (!resize?.moved) return;

  clearCalendarScheduleResizePreview(false);

  const item = findItem(resize.id);
  if (!item) return;

  document.querySelectorAll(".schedule-chip[data-id]").forEach((chip) => {
    if (chip.dataset.id === resize.id) chip.classList.add("resize-source-hidden");
  });

  const range = selectedDateRange(resize.targetStartDate, resize.targetEndDate);
  const { previewItem, row, rowCount } = calendarSchedulePreviewPlacement(item, range.startDate, range.endDate);
  applyCalendarScheduleRowCount(rowCount);
  const title = String(item.title || "").trim() || "Untitled";

  document.querySelectorAll(".schedule-calendar [data-date]").forEach((day) => {
    const date = day.dataset.date;
    if (date < range.startDate || date > range.endDate) return;

    const schedules = day.querySelector(".day-schedules");
    if (!schedules) return;

    const rangeClass = calendarScheduleRangeClass(previewItem, date);
    const rangeTokens = rangeClass.split(/\s+/);
    const showTitle = rangeTokens.includes("single") || rangeTokens.includes("segment-start");
    const preview = document.createElement("span");
    preview.className = [
      "schedule-chip",
      "schedule-resize-preview",
      rangeClass,
      showTitle ? "has-title" : "continuation",
      "selected",
      "resizing"
    ].join(" ");
    preview.dataset.id = item.id;
    preview.dataset.date = date;
    preview.style.setProperty("--schedule-row", String(row));
    preview.title = title;
    preview.textContent = showTitle ? title : "\u00a0";
    schedules.append(preview);
  });
}

function clearCalendarScheduleResizePreview(showSource = true) {
  document.querySelectorAll(".schedule-resize-preview").forEach((chip) => chip.remove());
  if (!showSource) return;
  document.querySelectorAll(".schedule-chip.resize-source-hidden").forEach((chip) => {
    chip.classList.remove("resize-source-hidden");
  });
  resetCalendarScheduleRowCount();
}

function clearCalendarScheduleResizeState(restoreClass) {
  if (!state.calendarScheduleResize) return;
  const moved = state.calendarScheduleResize.moved;
  state.calendarScheduleResize.element.classList.remove("resizing");
  clearCalendarScheduleResizeDates();
  state.calendarScheduleResize = null;
  if (restoreClass || !moved) clearCalendarScheduleResizePreview(true);
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
  state.calendarSelectedDate = null;
  await patchItemFast(item.id, body);
}

function startCalendarSelection(event) {
  if (state.tab !== "calendar" || state.suppressCalendarClick) return;
  const day = event.target.closest(".schedule-calendar [data-date]");
  if (
    !day ||
    day.dataset.date !== state.calendarSelectedDate ||
    event.target.closest(".calendar-schedule-control, .schedule-chip, [data-calendar-resize-edge], button:not(.day-cell), input, textarea, select") ||
    state.calendarScheduleDrag ||
    state.calendarScheduleResize ||
    state.calendarMonthSwipe
  ) return;

  state.calendarSelection = {
    pointerId: event.pointerId,
    startDate: day.dataset.date,
    currentDate: day.dataset.date,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    cancelled: false
  };
  try {
    day.setPointerCapture?.(event.pointerId);
  } catch {
    // Pointer capture can fail when the pointer is no longer active.
  }
}

function moveCalendarSelection(event) {
  if (!state.calendarSelection || state.calendarSelection.pointerId !== event.pointerId) return;

  const dx = event.clientX - state.calendarSelection.startX;
  const dy = event.clientY - state.calendarSelection.startY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (!state.calendarSelection.moved) {
    if (absY > 14 && absY > absX) {
      state.calendarSelection.cancelled = true;
      cancelCalendarSelection();
      return;
    }
    if (absX <= 12 || absX <= absY) return;
    state.calendarSelection.moved = true;
  }

  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-date]");
  if (!target) return;

  state.calendarSelection.currentDate = target.dataset.date;
  markSelectedCalendarDates();
  event.preventDefault();
}

function finishCalendarSelection(event) {
  if (!state.calendarSelection || state.calendarSelection.pointerId !== event.pointerId) return;

  const selection = state.calendarSelection;
  const range = selectedDateRange(selection.startDate, selection.currentDate);
  state.calendarSelection = null;
  clearSelectedCalendarDates();

  if (!selection.moved || selection.cancelled) return;

  state.lastCalendarClick = null;
  state.suppressCalendarClick = true;
  window.setTimeout(() => {
    state.suppressCalendarClick = false;
  }, 250);
  state.selectedDate = range.startDate;
  state.calendarSelectedDate = range.startDate;
  state.selectedCalendarSchedule = null;
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
  document.querySelectorAll(".schedule-calendar [data-date]").forEach((day) => {
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

function clearTimelineItemOnOutsidePointer(event) {
  if (els.dialog.open || state.timelineDrag || state.timelineResize) return;
  if (state.selectedTimelineItem && !event.target?.closest?.(".timeline-item.selected")) {
    clearSelectedTimelineItem();
  }
  if (state.selectedTimeRange && !pointerIsInsideSelectedTimeRange(event)) {
    clearSelectedTimeRangeOnly();
  }
}

function clearTimelineItemOnScroll() {
  if (els.dialog.open || state.timelineDrag || state.timelineResize) return;
  clearSelectedTimelineItem();
  clearSelectedTimeRangeOnly();
}

function clearCalendarDateOnOutsidePointer(event) {
  if (
    state.tab !== "calendar" ||
    (!state.calendarSelectedDate && !state.selectedCalendarSchedule) ||
    els.dialog.open ||
    els.calendarTimelineDialog.open ||
    state.calendarSelection ||
    state.calendarScheduleDrag ||
    state.calendarScheduleResize
  ) return;
  if (event.target?.closest?.(".schedule-calendar [data-date]")) return;
  if (event.target?.closest?.(".calendar-schedule-control")) return;

  state.calendarSelectedDate = null;
  state.selectedCalendarSchedule = null;
  clearSelectedCalendarDates();
  render();
}

function suppressTimeSelectionForPointer(pointerId) {
  state.suppressTimeSelectionPointerId = pointerId;
  window.clearTimeout(state.suppressTimeSelectionTimer);
  state.suppressTimeSelectionTimer = window.setTimeout(() => {
    clearSuppressedTimeSelectionPointer(pointerId);
  }, 360);
}

function clearSuppressedTimeSelectionPointer(pointerId) {
  if (state.suppressTimeSelectionPointerId !== pointerId) return;
  state.suppressTimeSelectionPointerId = null;
  window.clearTimeout(state.suppressTimeSelectionTimer);
  state.suppressTimeSelectionTimer = null;
}

function clearSelectedTimelineItem() {
  if (!state.selectedTimelineItem) return false;
  state.selectedTimelineItem = null;
  document.querySelectorAll(".timeline-item.selected").forEach((card) => {
    card.classList.remove("selected");
  });
  return true;
}

function pointerIsInsideSelectedTimeRange(event) {
  const slot = event.target?.closest?.("[data-time-slot]");
  return Boolean(
    slot &&
    timeRangeContainsSlot(
      state.selectedTimeRange,
      timelineContextFromSlot(slot),
      state.selectedDate,
      slot.dataset.timeSlot
    )
  );
}

function clearSelectedTimeRangeOnly() {
  const selectedSlots = document.querySelectorAll(".slot.selected");
  if (!state.selectedTimeRange && !selectedSlots.length) return false;
  state.selectedTimeRange = null;
  window.clearTimeout(state.timeClickTimer);
  state.timeClickTimer = null;
  selectedSlots.forEach((slot) => {
    slot.classList.remove("selected");
  });
  return true;
}

function canSelectTimelineItem(item) {
  return Boolean(item && isTimedItemType(item.type));
}

async function deleteTimelineItem(id) {
  const item = findItem(id);
  if (!canSelectTimelineItem(item)) return;
  state.selectedTimelineItem = null;
  clearSelectedTimelineRange();

  try {
    await deleteItemFast(id);
    setStatus("Deleted.");
  } catch (error) {
    setStatus(error.message || "Could not delete.");
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
  const times = timelineHourSlots();
  const firstIndex = times.indexOf(firstTime);
  const secondIndex = times.indexOf(secondTime);
  const startIndex = Math.max(0, Math.min(firstIndex, secondIndex));
  const endIndex = Math.max(firstIndex, secondIndex) + 1;

  return {
    startTime: times[startIndex] || firstTime,
    endTime: addMinutesToTime(times[endIndex - 1] || secondTime, TIMELINE_ROW_MINUTES)
  };
}

function selectedDateRange(firstDate, secondDate) {
  return {
    startDate: firstDate <= secondDate ? firstDate : secondDate,
    endDate: firstDate <= secondDate ? secondDate : firstDate
  };
}

function nextTime(time) {
  return addMinutesToTime(time, 30);
}

function previousTime(time) {
  const value = addMinutesToTime(time, -30);
  return timeToMinutes(value) >= TIMELINE_START_MINUTES && timeToMinutes(value) < TIMELINE_END_MINUTES ? value : "";
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function isTimeString(value) {
  const match = String(value || "").match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute < 0 || minute > 59) return false;
  return (hour >= 0 && hour < 24) || (hour === 24 && minute === 0);
}

function timeParts(time) {
  const [hour, minute] = time.split(":").map(Number);
  if (hour === 24 && minute === 0) {
    return {
      period: "AM",
      hour24: 24,
      hour12: 12,
      minute: "00"
    };
  }

  return {
    period: hour < 12 ? "AM" : "PM",
    hour24: hour,
    hour12: hour % 12 || 12,
    minute: String(minute).padStart(2, "0")
  };
}

function formatKoreanTime(time) {
  if (!isTimeString(time)) return "";
  if (time === FULL_DAY_END_TIME) return FULL_DAY_END_TIME;
  const parts = timeParts(time);
  return `${parts.hour12}:${parts.minute} ${parts.period}`;
}

function timeToMinutes(time) {
  if (!isTimeString(time)) return 0;
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes) {
  const normalized = Math.max(0, Math.min(24 * 60, Math.round(minutes)));
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function addMinutesToTime(time, minutes) {
  return minutesToTime(timeToMinutes(time) + minutes);
}

function timelineTotalMinutes() {
  return TIMELINE_END_MINUTES - TIMELINE_START_MINUTES;
}

function timelineMinuteOffset(minutes) {
  return minutes - TIMELINE_START_MINUTES;
}

function timelineOffsetToTime(offset) {
  return minutesToTime(Math.max(TIMELINE_START_MINUTES, Math.min(TIMELINE_END_MINUTES, TIMELINE_START_MINUTES + Math.round(offset))));
}

function timelineOffsetUnits(minutes) {
  return Math.round((Number(minutes || 0) / TIMELINE_ROW_MINUTES) * 10000) / 10000;
}

function snapTimelineMinutes(minutes, step = TIMELINE_MANIPULATION_STEP_MINUTES) {
  return Math.round(Number(minutes || 0) / step) * step;
}

function clampTimelineTime(time, allowEnd) {
  const maxMinutes = allowEnd ? TIMELINE_END_MINUTES : TIMELINE_END_MINUTES - TIMELINE_TIME_STEP_MINUTES;
  return minutesToTime(Math.max(TIMELINE_START_MINUTES, Math.min(maxMinutes, timeToMinutes(time))));
}

function timeRangesOverlap(leftStart, leftEnd, rightStart, rightEnd) {
  return Number.isFinite(leftStart)
    && Number.isFinite(leftEnd)
    && Number.isFinite(rightStart)
    && Number.isFinite(rightEnd)
    && leftStart < rightEnd
    && rightStart < leftEnd;
}

async function saveEmotion(nextEmotion) {
  if (state.emotionSaving) return;
  const existing = emotionRecord(state.selectedDate);
  const comment = document.querySelector("#emotionComment")?.value || "";
  const emotion = normalizeEmotionValue(nextEmotion || (existing && (existing.emotion || existing.mood)));

  if (!emotion) {
    if (existing) {
      try {
        await patchItemFast(existing.id, { note: comment });
        setStatus("Comment saved.");
      } catch (error) {
        setStatus(error.message || "Could not save the comment.");
      }
      return;
    }

    setStatus("Choose an emotion color first.");
    return;
  }

  const payload = {
    title: `${state.selectedDate} Emotion Check`,
    type: "감정",
    date: state.selectedDate,
    emotion,
    note: comment,
    completed: true,
    status: "완료"
  };

  state.emotionSaving = true;
  try {
    await createItemFast(payload);
    setStatus("Emotion check saved.");
    if (els.emotionDialog.open && !nextEmotion) {
      els.emotionDialog.close();
    }
  } catch (error) {
    setStatus(error.message || "Could not save the emotion check.");
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

  els.emotionDialogTitle.textContent = "Emotion Comment";
  const normalizedEmotion = normalizeEmotionValue(emotion.emotion || emotion.mood);
  const palette = emotionPalette(normalizedEmotion);
  const swatchStyle = palette
    ? ` style="--emotion-swatch:${palette.color}; --emotion-swatch-border:${palette.border};"`
    : "";
  const note = emotion.note ? escapeHtml(emotion.note) : "No comment";

  els.emotionDialogContent.innerHTML = `
    <div class="emotion-dialog-date">${humanDate(date)}</div>
    <div class="emotion-dialog-row">
      <span class="emotion-dialog-swatch"${swatchStyle}></span>
      <span>${normalizedEmotion ? escapeHtml(displayEmotion(normalizedEmotion)) : "No color"}</span>
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
    await deleteItemFast(existing.id);
    setStatus("Emotion record removed.");
  } catch (error) {
    setStatus(error.message || "Could not remove the emotion record.");
  }
}

function setTab(tab) {
  const changed = state.tab !== tab;
  const today = todayString();
  state.tab = tab;
  state.lastCalendarClick = null;
  state.lastEmotionClick = null;
  state.calendarMonthSwipe = null;
  if (changed) {
    state.selectedDate = today;
    state.visibleMonth = monthStart(today);
    state.calendarSelectedDate = null;
    state.calendarZoomGesture = null;
    resetCalendarZoom(false);
  }
  if (tab !== "emotion") state.selectedEmotionDate = null;
  if (tab !== "emotion") state.selectedChallengeLayer = null;
  if (tab !== "calendar") {
    state.calendarSelectedDate = null;
    state.selectedCalendarSchedule = null;
  }
  if (tab !== "calendar" && els.calendarTimelineDialog.open) els.calendarTimelineDialog.close();
  clearSelectedTimelineRange();
  render();
  if (changed) resetAppScroll();
}

function resetAppScroll() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.scrollingElement?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
    document.querySelector(".shell")?.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
  });
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
  const weekCount = Number(
    grid.style.getPropertyValue("--calendar-week-count") ||
    getComputedStyle(grid).getPropertyValue("--calendar-week-count")
  ) || 6;

  calendarZoomStyle(scheduleRowCount, weekCount).split(";").forEach((rule) => {
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

function activeFixedSchedules(date) {
  return state.items.filter((item) =>
    item.type === "고정일정" &&
    isRoutineActive(item, date) &&
    !fixedScheduleSkipped(item.id, date)
  );
}

function isRecurringTemplateType(type) {
  return type === "루틴" || type === "고정일정";
}

function isTimedItemType(type) {
  return type === "일정" || type === "할일" || isRecurringTemplateType(type);
}

function isFixedScheduleType(type) {
  return type === "고정일정";
}

function isRoutineActive(routine, date) {
  if (!routine.repeatDays || routine.repeatDays.length === 0) return true;
  return routine.repeatDays.includes(ROUTINE_DAYS[new Date(`${date}T00:00:00`).getDay()]);
}

function routineRecord(routineId, date) {
  return state.items.find((item) => item.type === "루틴기록" && item.sourceRoutineId === routineId && item.date === date);
}

function fixedScheduleSkipped(scheduleId, date) {
  return routineRecord(scheduleId, date)?.status === "취소";
}

function skippedFixedSchedules() {
  return state.items
    .filter((item) => item.type === "루틴기록" && item.status === "취소" && item.sourceRoutineId)
    .map((record) => ({
      record,
      schedule: findItem(record.sourceRoutineId)
    }))
    .filter(({ schedule }) => schedule && schedule.type === "고정일정")
    .sort((left, right) =>
      String(right.record.date || "").localeCompare(String(left.record.date || "")) ||
      byStartTime(left.schedule, right.schedule) ||
      byTitle(left.schedule, right.schedule)
    );
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
  return routine.repeatDays && routine.repeatDays.length
    ? routine.repeatDays.map((day) => ROUTINE_DAY_LABELS[day] || day).join(", ")
    : "Every day";
}

function routineTimeLabel(routine) {
  if (!routine.startTime) return "";
  return routine.endTime ? `${routine.startTime}-${routine.endTime}` : routine.startTime;
}

function routineMeta(routine) {
  const parts = [routineTimeLabel(routine), routineDaysLabel(routine), `${routineStreak(routine.id)} day streak`]
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

function timelineHourSlots() {
  const slots = [];
  for (let minutes = TIMELINE_START_MINUTES; minutes < TIMELINE_END_MINUTES; minutes += TIMELINE_ROW_MINUTES) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
}

function minuteTimeSlots(allowEnd) {
  const start = allowEnd ? TIMELINE_START_MINUTES + TIMELINE_TIME_STEP_MINUTES : TIMELINE_START_MINUTES;
  const end = allowEnd ? TIMELINE_END_MINUTES : TIMELINE_END_MINUTES - TIMELINE_TIME_STEP_MINUTES;
  const slots = [];
  for (let minutes = start; minutes <= end; minutes += TIMELINE_TIME_STEP_MINUTES) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
}

function timeSlots() {
  return timelineHourSlots();
}

function formatTimelineHour(time) {
  if (!isTimeString(time)) return "";
  const parts = timeParts(time);
  return `${parts.hour12} ${parts.period}`;
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
  const label = target.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    weekday: "short"
  });
  return label;
}

function displayType(type) {
  return TYPE_LABELS[type] || type || "";
}

function normalizeItemType(type) {
  const normalized = String(type || "").trim();
  return TYPE_VALUE_ALIASES[normalized] || normalized;
}

function displayEmotion(emotion) {
  return EMOTION_LABELS[emotion] || emotion || "";
}

function byStartTime(a, b) {
  return String(a.startTime || "99:99").localeCompare(String(b.startTime || "99:99"));
}

function byDoneThenTitle(a, b) {
  return Number(a.completed) - Number(b.completed) || byTitle(a, b);
}

function byTitle(a, b) {
  return String(a.title || "").localeCompare(String(b.title || ""), "en");
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
    keepalive: Boolean(options.keepalive),
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || payload.error || "Request failed.");
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
