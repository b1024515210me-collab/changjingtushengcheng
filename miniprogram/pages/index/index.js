const {
  soundOptions,
  bodyOptions,
  contextOptions,
  humanIntentOptions,
  translateCatSignal,
  translateHumanToCat,
  createRealtimeCatFrame
} = require('../../utils/translator');

const STORAGE_KEY = 'catTalkHistory';
const LIVE_INTERVAL = 1600;
const initialResult = {
  mood: '等待翻译',
  title: '选择一种交流模式吧',
  message: '可以实时把猫叫翻译成中文，也可以把你想说的话翻译成猫叫。',
  tips: ['实时翻译是基于声音时长、沟通场景和行为信号的规则推测，不替代兽医诊断。', '若持续嚎叫、排泄异常、拒食或精神差，请及时就医。'],
  level: 'calm'
};

Page({
  liveTimer: null,
  recorderManager: null,
  liveTick: 0,

  data: {
    mode: 'catToHuman',
    catName: '',
    notes: '',
    humanText: '',
    isListening: false,
    liveStatus: '点击开始后，把手机靠近猫咪，系统会持续滚动翻译。',
    soundIndex: 0,
    bodyIndex: 0,
    contextIndex: 0,
    humanIntentIndex: 0,
    selectedSoundLabel: soundOptions[0].label,
    selectedBodyLabel: bodyOptions[0].label,
    selectedContextLabel: contextOptions[0].label,
    selectedHumanIntentLabel: humanIntentOptions[0].label,
    soundOptions,
    bodyOptions,
    contextOptions,
    humanIntentOptions,
    result: initialResult,
    history: []
  },

  onLoad() {
    const history = wx.getStorageSync(STORAGE_KEY) || [];
    this.recorderManager = wx.getRecorderManager ? wx.getRecorderManager() : null;
    if (this.recorderManager) {
      this.recorderManager.onError(() => {
        this.setData({ liveStatus: '麦克风不可用或未授权，仍可用下方校准信息手动翻译。' });
      });
    }
    this.setData({ history });
  },

  onUnload() {
    this.stopCatRealtime();
  },

  switchMode(event) {
    const mode = event.currentTarget.dataset.mode;
    if (mode === this.data.mode) return;
    if (this.data.isListening) this.stopCatRealtime();
    this.setData({
      mode,
      result: mode === 'catToHuman' ? initialResult : translateHumanToCat({ catName: this.data.catName, intent: humanIntentOptions[this.data.humanIntentIndex].value })
    });
  },

  onNameInput(event) {
    this.setData({ catName: event.detail.value });
  },

  onNotesInput(event) {
    this.setData({ notes: event.detail.value });
  },

  onHumanTextInput(event) {
    this.setData({ humanText: event.detail.value });
  },

  onSoundChange(event) {
    const soundIndex = Number(event.detail.value);
    this.setData({ soundIndex, selectedSoundLabel: soundOptions[soundIndex].label });
  },

  onBodyChange(event) {
    const bodyIndex = Number(event.detail.value);
    this.setData({ bodyIndex, selectedBodyLabel: bodyOptions[bodyIndex].label });
  },

  onContextChange(event) {
    const contextIndex = Number(event.detail.value);
    this.setData({ contextIndex, selectedContextLabel: contextOptions[contextIndex].label });
  },

  onHumanIntentChange(event) {
    const humanIntentIndex = Number(event.detail.value);
    this.setData({ humanIntentIndex, selectedHumanIntentLabel: humanIntentOptions[humanIntentIndex].label });
  },

  toggleCatRealtime() {
    if (this.data.isListening) {
      this.stopCatRealtime();
      return;
    }
    this.startCatRealtime();
  },

  startCatRealtime() {
    this.liveTick = 0;
    this.setData({ isListening: true, liveStatus: '正在实时监听猫咪声音…' });
    if (this.recorderManager) {
      this.recorderManager.start({ duration: 600000, sampleRate: 16000, numberOfChannels: 1, encodeBitRate: 48000, format: 'mp3' });
    }
    this.pushLiveFrame();
    this.liveTimer = setInterval(() => this.pushLiveFrame(), LIVE_INTERVAL);
  },

  stopCatRealtime() {
    if (this.liveTimer) {
      clearInterval(this.liveTimer);
      this.liveTimer = null;
    }
    if (this.recorderManager) this.recorderManager.stop();
    this.setData({ isListening: false, liveStatus: '已停止监听。可以再次点击开始，或用下方手动校准翻译。' });
  },

  pushLiveFrame() {
    const result = createRealtimeCatFrame({ tick: this.liveTick, catName: this.data.catName, notes: this.data.notes });
    this.liveTick += 1;
    this.setData({ result, liveStatus: result.liveText });
    this.addHistory('猫语→中文', result);
  },

  onTranslate() {
    const { catName, notes, soundIndex, bodyIndex, contextIndex } = this.data;
    const result = translateCatSignal({
      catName,
      notes,
      sound: soundOptions[soundIndex].value,
      body: bodyOptions[bodyIndex].value,
      context: contextOptions[contextIndex].value
    });
    this.setData({ result });
    this.addHistory('猫语→中文', result);
  },

  onHumanTranslate() {
    const { catName, humanText, humanIntentIndex } = this.data;
    const result = translateHumanToCat({
      catName,
      text: humanText,
      intent: humanIntentOptions[humanIntentIndex].value
    });
    this.setData({ result });
    this.addHistory('人话→猫叫', result);
  },

  copyMeow() {
    if (!this.data.result.meowLine) return;
    wx.setClipboardData({ data: this.data.result.meowLine });
  },

  addHistory(direction, result) {
    const historyItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      catName: this.data.catName.trim() || '猫咪',
      direction,
      title: result.title,
      mood: result.mood,
      time: formatTime(new Date())
    };
    const history = [historyItem, ...this.data.history].slice(0, 8);

    wx.setStorageSync(STORAGE_KEY, history);
    this.setData({ history });
  },

  clearHistory() {
    wx.removeStorageSync(STORAGE_KEY);
    this.setData({ history: [] });
  }
});

function formatTime(date) {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}
