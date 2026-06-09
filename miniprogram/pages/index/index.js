const {
  soundOptions,
  bodyOptions,
  contextOptions,
  humanIntentOptions,
  catQuickPhrases,
  humanQuickPhrases,
  translateCatSignal,
  translateHumanToCat,
  createRealtimeCatFrame,
  createRealtimeHumanFrame
} = require('../../utils/translator');

const STORAGE_KEY = 'catTalkHistory';
const LIVE_INTERVAL = 1500;
const defaultCatName = '点点';
const initialCatResult = {
  mood: '等待录音',
  title: '按住录音，翻译猫咪说的话',
  message: '松开翻译，听懂喵喵的心声～',
  tips: ['把手机靠近猫咪，结合场景和行为进行本地推测。', '持续嚎叫、排泄异常、拒食或精神差，请及时就医。'],
  level: 'calm',
  waveform: '▂▃▅▃▂'
};
const initialHumanResult = {
  mood: '等待录音',
  title: '按住录音，把你想说的话翻译成咪语',
  message: '也可以输入文字或点击快捷句，生成猫咪更容易接受的咪语～',
  tips: ['用轻柔、偏高一点的声音慢慢说。', '说完后停 3 秒，观察猫咪是否愿意靠近。'],
  level: 'calm',
  waveform: '▂▃▅▃▂'
};

Page({
  liveTimer: null,
  recorderManager: null,
  liveTick: 0,
  recordingMode: '',

  data: {
    activeTab: 'catToHuman',
    catName: defaultCatName,
    notes: '',
    humanText: '',
    humanTextCount: 0,
    catResult: initialCatResult,
    humanResult: initialHumanResult,
    isCatRecording: false,
    isHumanRecording: false,
    catLiveStatus: '按住录音，翻译猫咪说的话',
    humanLiveStatus: '按住录音，把人话翻译成咪语',
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
    catQuickPhrases,
    humanQuickPhrases,
    history: [],
    catProfile: {
      name: defaultCatName,
      gender: '弟弟',
      birthday: '2026.02.25',
      age: '3个月',
      breed: '中华田园猫',
      weight: '1.2 kg',
      vaccine: '未接种',
      deworm: '未驱虫',
      lastRecord: '2025.05.25'
    }
  },

  onLoad() {
    const history = wx.getStorageSync(STORAGE_KEY) || [];
    this.recorderManager = wx.getRecorderManager ? wx.getRecorderManager() : null;
    if (this.recorderManager) {
      this.recorderManager.onError(() => {
        this.setData({ catLiveStatus: '麦克风不可用或未授权，请检查权限后重试。', humanLiveStatus: '麦克风不可用或未授权，请检查权限后重试。' });
      });
    }
    this.setData({ history });
  },

  onUnload() {
    this.stopRecording();
  },

  switchTab(event) {
    const activeTab = event.currentTarget.dataset.tab;
    if (activeTab === this.data.activeTab) return;
    this.stopRecording();
    this.setData({ activeTab });
  },

  onNameInput(event) {
    const catName = event.detail.value || defaultCatName;
    this.setData({ catName, 'catProfile.name': catName });
  },

  onNotesInput(event) {
    this.setData({ notes: event.detail.value });
  },

  onHumanTextInput(event) {
    this.setData({ humanText: event.detail.value, humanTextCount: event.detail.value.length });
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
    this.setHumanIntent(humanIntentIndex);
  },

  onHumanIntentTap(event) {
    const humanIntentIndex = Number(event.currentTarget.dataset.index);
    this.setHumanIntent(humanIntentIndex);
  },

  setHumanIntent(humanIntentIndex) {
    this.setData({ humanIntentIndex, selectedHumanIntentLabel: humanIntentOptions[humanIntentIndex].label });
  },

  startCatRecording() {
    this.startRecording('cat');
  },

  startHumanRecording() {
    this.startRecording('human');
  },

  startRecording(mode) {
    this.stopRecording();
    this.recordingMode = mode;
    this.liveTick = 0;
    if (mode === 'cat') {
      this.setData({ isCatRecording: true, catLiveStatus: '正在听猫咪说话…松开后保留最新翻译' });
    } else {
      this.setData({ isHumanRecording: true, humanLiveStatus: '正在听你说话…松开后保留最新咪语' });
    }
    if (this.recorderManager) {
      this.recorderManager.start({ duration: 600000, sampleRate: 16000, numberOfChannels: 1, encodeBitRate: 48000, format: 'mp3' });
    }
    this.pushRealtimeFrame();
    this.liveTimer = setInterval(() => this.pushRealtimeFrame(), LIVE_INTERVAL);
  },

  stopRecording() {
    if (this.liveTimer) {
      clearInterval(this.liveTimer);
      this.liveTimer = null;
    }
    if (this.recorderManager) this.recorderManager.stop();
    if (this.recordingMode === 'cat') {
      this.setData({ isCatRecording: false, catLiveStatus: '翻译完成，可再次按住录音。' });
    }
    if (this.recordingMode === 'human') {
      this.setData({ isHumanRecording: false, humanLiveStatus: '翻译完成，可再次按住录音。' });
    }
    this.recordingMode = '';
  },

  pushRealtimeFrame() {
    if (this.recordingMode === 'cat') {
      const catResult = createRealtimeCatFrame({ tick: this.liveTick, catName: this.data.catName, notes: this.data.notes });
      this.liveTick += 1;
      this.setData({ catResult, catLiveStatus: catResult.liveText });
      this.addHistory('咪语→人话', catResult);
      return;
    }
    if (this.recordingMode === 'human') {
      const humanResult = createRealtimeHumanFrame({ tick: this.liveTick, catName: this.data.catName });
      this.liveTick += 1;
      this.setData({ humanResult, humanText: humanResult.recognizedText, humanTextCount: humanResult.recognizedText.length, humanLiveStatus: humanResult.liveText });
      this.addHistory('人话→咪语', humanResult);
    }
  },

  translateCatWithSettings() {
    const { catName, notes, soundIndex, bodyIndex, contextIndex } = this.data;
    const catResult = translateCatSignal({
      catName,
      notes,
      sound: soundOptions[soundIndex].value,
      body: bodyOptions[bodyIndex].value,
      context: contextOptions[contextIndex].value
    });
    this.setData({ catResult });
    this.addHistory('咪语→人话', catResult);
  },

  translateHumanText() {
    const { catName, humanText, humanIntentIndex } = this.data;
    const humanResult = translateHumanToCat({
      catName,
      text: humanText,
      intent: humanIntentOptions[humanIntentIndex].value
    });
    this.setData({ humanResult });
    this.addHistory('人话→咪语', humanResult);
  },

  useCatQuickPhrase(event) {
    const index = Number(event.currentTarget.dataset.index);
    const phrase = catQuickPhrases[index];
    if (!phrase) return;
    const catResult = translateCatSignal({ catName: this.data.catName, sound: phrase.sound, body: phrase.body, context: phrase.context, notes: phrase.text });
    this.setData({ catResult, notes: phrase.text });
    this.addHistory('咪语→人话', catResult);
  },

  useHumanQuickPhrase(event) {
    const index = Number(event.currentTarget.dataset.index);
    const phrase = humanQuickPhrases[index];
    if (!phrase) return;
    const humanResult = translateHumanToCat({ catName: this.data.catName, text: phrase.text, intent: phrase.intent });
    this.setData({ humanText: phrase.text, humanTextCount: phrase.text.length, humanResult });
    this.addHistory('人话→咪语', humanResult);
  },

  copyMeow() {
    if (!this.data.humanResult.meowLine) return;
    wx.setClipboardData({ data: this.data.humanResult.meowLine });
  },

  addHistory(direction, result) {
    const historyItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      catName: this.data.catName.trim() || defaultCatName,
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
