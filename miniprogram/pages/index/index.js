const { soundOptions, bodyOptions, contextOptions, translateCatSignal } = require('../../utils/translator');

const STORAGE_KEY = 'catTalkHistory';
const initialResult = {
  mood: '等待翻译',
  title: '先告诉我猫咪发生了什么吧',
  message: '选择叫声、身体语言和场景后，我会帮你生成一个“可能含义 + 回应方式”。',
  tips: ['猫咪翻译是行为推测，不替代兽医诊断。', '若持续嚎叫、排泄异常、拒食或精神差，请及时就医。'],
  level: 'calm'
};

Page({
  data: {
    catName: '',
    notes: '',
    soundIndex: 0,
    bodyIndex: 0,
    contextIndex: 0,
    selectedSoundLabel: soundOptions[0].label,
    selectedBodyLabel: bodyOptions[0].label,
    selectedContextLabel: contextOptions[0].label,
    soundOptions,
    bodyOptions,
    contextOptions,
    result: initialResult,
    history: []
  },

  onLoad() {
    const history = wx.getStorageSync(STORAGE_KEY) || [];
    this.setData({ history });
  },

  onNameInput(event) {
    this.setData({ catName: event.detail.value });
  },

  onNotesInput(event) {
    this.setData({ notes: event.detail.value });
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

  onTranslate() {
    const { catName, notes, soundIndex, bodyIndex, contextIndex } = this.data;
    const result = translateCatSignal({
      catName,
      notes,
      sound: soundOptions[soundIndex].value,
      body: bodyOptions[bodyIndex].value,
      context: contextOptions[contextIndex].value
    });
    const historyItem = {
      id: `${Date.now()}`,
      catName: catName.trim() || '猫咪',
      title: result.title,
      mood: result.mood,
      time: formatTime(new Date())
    };
    const history = [historyItem, ...this.data.history].slice(0, 5);

    wx.setStorageSync(STORAGE_KEY, history);
    this.setData({ result, history });
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
