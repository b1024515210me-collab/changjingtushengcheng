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
  const name = catName.trim() || '猫咪';
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

function buildCatQuote(sound, body, context) {
  if (sound === 'hiss' || body === 'ears-flat' || body === 'hiding') return '我现在有点害怕，先别靠太近。';
  if (context === 'meal') return '铲屎官，饭碗好像需要检查一下。';
  if (context === 'play' || sound === 'chirp') return '来陪我玩一会儿吧！';
  if (body === 'slow-blink' || sound === 'purr') return '我很信任你，继续温柔一点。';
  if (context === 'night') return '我还不困，想获得你的注意。';
  return '你看懂我的小暗示了吗？';
}

module.exports = {
  soundOptions,
  bodyOptions,
  contextOptions,
  translateCatSignal
};
