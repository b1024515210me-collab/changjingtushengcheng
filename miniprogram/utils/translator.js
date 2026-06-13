const soundOptions = [
  { label: '短促喵一声', value: 'short-meow' },
  { label: '拉长的喵呜', value: 'long-meow' },
  { label: '呼噜呼噜', value: 'purr' },
  { label: '咯咯/啾啾叫', value: 'chirp' },
  { label: '哈气或低吼', value: 'hiss' },
  { label: '不叫但一直盯着你', value: 'silent' }
];

const bodyOptions = [
  { label: '尾巴竖起，尾尖微弯', value: 'tail-up' },
  { label: '尾巴快速甩动', value: 'tail-flick' },
  { label: '慢慢眨眼', value: 'slow-blink' },
  { label: '耳朵后压', value: 'ears-flat' },
  { label: '踩奶/蹭人', value: 'kneading' },
  { label: '躲起来或压低身体', value: 'hiding' }
];

const contextOptions = [
  { label: '饭点前后', value: 'meal' },
  { label: '拿玩具或你刚回家', value: 'play' },
  { label: '被抚摸或靠近你', value: 'petting' },
  { label: '猫砂盆附近', value: 'litter' },
  { label: '陌生人/新环境', value: 'stranger' },
  { label: '半夜或清晨', value: 'night' }
];

const humanIntentOptions = [
  { label: '日常', value: 'hello', meow: '喵～喵', meaning: '我在这里，想温柔靠近你。' },
  { label: '喂食', value: 'meal', meow: '喵呜——喵！', meaning: '饭饭/水水在这里，可以来看看。' },
  { label: '玩耍', value: 'play', meow: '咪呀！喵喵！', meaning: '我们来玩一会儿，追追玩具吧。' },
  { label: '训练', value: 'train', meow: '喵！喵～咕噜', meaning: '做得好，跟着这个节奏再试一次。' },
  { label: '关心', value: 'comfort', meow: '咕噜咕噜…喵～', meaning: '别害怕，我会慢慢来，不会逼你。' },
  { label: '表达爱意', value: 'love', meow: '喵～咕噜～喵', meaning: '我喜欢你，想和你待在一起。' }
];

const catQuickPhrases = [
  { icon: '🍲', text: '我饿了，想吃饭', sound: 'long-meow', body: 'tail-up', context: 'meal' },
  { icon: '🚽', text: '猫砂盆有点脏啦', sound: 'long-meow', body: 'tail-flick', context: 'litter' },
  { icon: '🧶', text: '我想和你玩耍！', sound: 'chirp', body: 'tail-up', context: 'play' }
];

const humanQuickPhrases = [
  { text: '宝贝，吃饭啦！', intent: 'meal' },
  { text: '点点，过来～', intent: 'hello' },
  { text: '你真棒，真聪明！', intent: 'train' }
];

const liveCatFrames = [
  { sound: 'short-meow', body: 'tail-up', context: 'petting', waveform: '▂▅▃▆▂', confidence: 72 },
  { sound: 'chirp', body: 'tail-up', context: 'play', waveform: '▃▆▇▅▃', confidence: 78 },
  { sound: 'long-meow', body: 'tail-flick', context: 'meal', waveform: '▂▃▇▇▅', confidence: 81 },
  { sound: 'purr', body: 'slow-blink', context: 'petting', waveform: '▅▅▅▅▅', confidence: 76 },
  { sound: 'hiss', body: 'ears-flat', context: 'stranger', waveform: '▇▅▂▂▃', confidence: 84 }
];

const liveHumanFrames = [
  { text: '宝贝，过来吃饭啦', intent: 'meal', waveform: '▃▅▇▅▃', confidence: 74 },
  { text: '别怕，我在这里', intent: 'comfort', waveform: '▂▃▅▅▂', confidence: 79 },
  { text: '我们来玩逗猫棒吧', intent: 'play', waveform: '▃▆▆▃▂', confidence: 76 },
  { text: '你真棒，真聪明', intent: 'train', waveform: '▅▇▅▃▂', confidence: 82 },
  { text: '我喜欢你，想抱抱你', intent: 'love', waveform: '▂▅▇▆▃', confidence: 77 }
];

const soundMap = {
  'short-meow': { mood: '好奇/打招呼', intent: '可能是在确认你是否注意到它。', weight: 1 },
  'long-meow': { mood: '需求明确', intent: '多半有具体诉求，比如食物、开门或陪伴。', weight: 2 },
  purr: { mood: '放松/求安抚', intent: '通常表示舒适，也可能是在紧张时自我安抚。', weight: 1 },
  chirp: { mood: '兴奋', intent: '可能发现了猎物、玩具或想邀请你互动。', weight: 1 },
  hiss: { mood: '警戒/害怕', intent: '正在表达边界：请不要继续靠近。', weight: 4 },
  silent: { mood: '专注观察', intent: '它可能在等待你读懂某个提示。', weight: 1 }
};

const bodyMap = {
  'tail-up': { signal: '友好靠近', tip: '蹲低身体，伸出手背让它自己靠近。', stress: 0 },
  'tail-flick': { signal: '不耐烦或过度兴奋', tip: '暂停抚摸，给它一点空间。', stress: 2 },
  'slow-blink': { signal: '信任与放松', tip: '你可以慢眨眼回应它。', stress: 0 },
  'ears-flat': { signal: '紧张或防御', tip: '降低声音，移开刺激源，不要强抱。', stress: 3 },
  kneading: { signal: '安心撒娇', tip: '给它柔软毯子，并保持温柔稳定的互动。', stress: 0 },
  hiding: { signal: '害怕或身体不适', tip: '提供安静藏身处，观察是否伴随食欲或排泄变化。', stress: 3 }
};

const contextMap = {
  meal: '它可能在提醒你检查饭碗、水碗或零食时间。',
  play: '它可能想把你的注意力切换到玩耍或狩猎游戏。',
  petting: '它正在评价这次接触是否舒服，留意尾巴和耳朵变化。',
  litter: '请特别留意排泄是否顺畅、是否频繁进出猫砂盆。',
  stranger: '环境变化会放大警戒反应，先给它安全距离。',
  night: '可能是精力没释放、作息期待或想获得回应。'
};

function translateCatSignal({ catName = '', sound, body, context, notes = '' }) {
  const soundInfo = soundMap[sound] || soundMap['short-meow'];
  const bodyInfo = bodyMap[body] || bodyMap['tail-up'];
  const contextInfo = contextMap[context] || contextMap.play;
  const stressScore = soundInfo.weight + bodyInfo.stress;
  const name = catName.trim() || '点点';
  const mood = stressScore >= 6 ? '需要空间' : stressScore >= 4 ? '有点紧张' : soundInfo.mood;
  const title = `${name}可能在说：“${buildCatQuote(sound, body, context)}”`;
  const tips = [
    contextInfo,
    bodyInfo.tip,
    stressScore >= 4 ? '先降低刺激、不要追逐或强行抱起，等它主动靠近。' : '用轻柔声音回应，并观察它是否继续靠近。'
  ];

  if (context === 'litter' || notes.includes('尿') || notes.includes('拉') || notes.includes('吐')) {
    tips.push('如果排泄、呕吐或食欲异常持续出现，请尽快联系兽医。');
  }

  return {
    mood,
    title,
    message: `${soundInfo.intent}结合身体语言“${bodyInfo.signal}”，这次沟通更像是：${contextInfo}`,
    tips,
    stressScore,
    level: stressScore >= 4 ? 'alert' : 'calm'
  };
}

function translateHumanToCat({ text = '', intent = 'hello', catName = '' }) {
  const cleanText = text.trim();
  const detectedIntent = cleanText ? detectHumanIntent(cleanText, intent) : intent;
  const intentInfo = humanIntentOptions.find((item) => item.value === detectedIntent) || humanIntentOptions[0];
  const name = catName.trim() || '点点';
  const meowLine = buildMeowLine(cleanText, intentInfo);

  return {
    mood: '人话转咪语',
    title: `对${name}说：“${meowLine}”`,
    message: `这句咪语大概表示：${intentInfo.meaning}`,
    meowLine,
    tips: [
      '用轻柔、偏高一点的声音慢慢说，音量不要突然变大。',
      '说完后停 3 秒，观察猫咪是否眨眼、靠近、甩尾或躲开。',
      cleanText ? `你的原句：“${cleanText}”已转换为更短、更温和的猫咪沟通信号。` : '也可以输入你想说的话，我会帮你转换成更贴近猫咪交流节奏的咪语。'
    ],
    level: 'calm'
  };
}

function createRealtimeCatFrame({ tick = 0, catName = '', notes = '' }) {
  const frame = liveCatFrames[tick % liveCatFrames.length];
  const result = translateCatSignal({ catName, notes, sound: frame.sound, body: frame.body, context: frame.context });
  return {
    ...result,
    waveform: frame.waveform,
    confidence: frame.confidence,
    liveText: `${frame.waveform} 识别猫咪声音｜可信度 ${frame.confidence}%`,
    source: 'cat-live'
  };
}

function createRealtimeHumanFrame({ tick = 0, catName = '' }) {
  const frame = liveHumanFrames[tick % liveHumanFrames.length];
  const result = translateHumanToCat({ catName, text: frame.text, intent: frame.intent });
  return {
    ...result,
    recognizedText: frame.text,
    waveform: frame.waveform,
    confidence: frame.confidence,
    liveText: `${frame.waveform} 识别人话｜可信度 ${frame.confidence}%`,
    source: 'human-live'
  };
}

function detectHumanIntent(text, fallback) {
  if (/爱|喜欢|乖|宝贝|亲/.test(text)) return 'love';
  if (/训练|真棒|聪明|奖励|坐下|握手/.test(text)) return 'train';
  if (/玩|逗猫|球|逗猫棒/.test(text)) return 'play';
  if (/吃|饭|罐头|零食|水/.test(text)) return 'meal';
  if (/别怕|没事|安静|放心/.test(text)) return 'comfort';
  if (/过来|来|这里|抱|你好|早|晚安|回来/.test(text)) return 'hello';
  return fallback;
}

function buildMeowLine(text, intentInfo) {
  const length = text.length;
  if (!text) return intentInfo.meow;
  if (length > 18) return `${intentInfo.meow} 喵呜～喵`;
  if (/[!！?？]/.test(text)) return `${intentInfo.meow}？`;
  return intentInfo.meow;
}

function buildCatQuote(sound, body, context) {
  if (sound === 'hiss' || body === 'ears-flat' || body === 'hiding') return '我现在有点害怕，先别靠太近。';
  if (context === 'meal') return '我饿了，想吃饭。';
  if (context === 'litter') return '猫砂盆有点脏啦。';
  if (context === 'play' || sound === 'chirp') return '我想和你玩耍！';
  if (body === 'slow-blink' || sound === 'purr') return '我很信任你，继续温柔一点。';
  if (context === 'night') return '我还不困，想获得你的注意。';
  return '你看懂我的小暗示了吗？';
}

module.exports = {
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
};
