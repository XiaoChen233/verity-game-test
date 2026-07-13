(function (global) {
  const Game = global.VerityGame = global.VerityGame || {};
  const definitions = {
    'identity': ['你是谁', '到底是谁', '身份', '名字', 'who are you'],
    'omniscience': ['什么都知道', '全知', '怎么知道', 'know everything'],
    'former-players': ['twixxel', 'thatmob', '以前的人', '其他玩家', '去了哪里', '回家'],
    'reality': ['现实', '屏幕外', '现实世界', 'real life'],
    'minecraft': ['minecraft', '我的世界', '方块世界', '模组'],
    'death': ['死亡', '死了', '杀死', '尸体'],
    'loneliness': ['孤独', '寂寞', '一个人', '百年'],
    'abandonment': ['遗弃', '抛弃', '不回来', '不要你'],
    'escape': ['离开', '我要离开', '怎么离开', '逃跑', '出口', '放我走', '怎么出去'],
    'shutdown': ['关闭', '关机', '删除', '卸载'],
    'accusation': ['撒谎', '谎言', '骗人', '矛盾', '篡改'],
    'comfort': ['理解你', '陪着你', '不是你的错', '太孤独'],
    'provocation': ['怪物', '暴徒', '去死', '讨厌你', '骗人的怪物']
  };

  Game.normalizeQuestion = function (text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[\s，。！？、；：,.!?;:'"“”‘’（）()\[\]【】]/g, '');
  };

  Game.matchIntent = function (text, chapter) {
    const normalized = Game.normalizeQuestion(text);
    const scores = [];
    Object.keys(definitions).forEach(function (id) {
      let score = 0;
      const matched = [];
      definitions[id].forEach(function (phrase) {
        const token = Game.normalizeQuestion(phrase);
        if (normalized.includes(token)) {
          score += token.length >= 3 ? 3 : 1;
          matched.push(phrase);
        }
      });
      if (id === 'former-players' && chapter >= 2 && /twixxel|thatmob/.test(normalized)) score += 3;
      if (id === 'comfort' && /理解|孤独|陪/.test(normalized)) score += 1;
      if (id === 'provocation' && /怪物|骗人/.test(normalized)) score += 1;
      if (score >= 2) scores.push({ id: id, confidence: score, matched: matched });
    });
    scores.sort(function (a, b) { return b.confidence - a.confidence; });
    return scores[0] || { id: 'unknown', confidence: 0, matched: [] };
  };
}(window));
