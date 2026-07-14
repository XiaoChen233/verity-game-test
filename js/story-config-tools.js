(function (global) {
  const Game = global.VerityGame = global.VerityGame || {};

  Game.cloneStoryConfig = function (value) {
    return JSON.parse(JSON.stringify(value));
  };

  Game.normalizeStoryConfig = function (value) {
    const config = Game.cloneStoryConfig(value || {});
    config.version = Number(config.version) || 1;
    config.timing = config.timing || {};
    config.psychology = config.psychology || { whispers: [] };
    config.psychology.whispers = Array.isArray(config.psychology.whispers) ? config.psychology.whispers : [];
    config.assets = config.assets || {};
    config.chapters = Array.isArray(config.chapters) ? config.chapters : [];
    config.randomReplies = Array.isArray(config.randomReplies) ? config.randomReplies : [];
    config.clues = config.clues || {};
    config.breakdown = config.breakdown || { nodes: [] };
    config.breakdown.nodes = Array.isArray(config.breakdown.nodes) ? config.breakdown.nodes : [];
    return config;
  };

  Game.validateStoryConfig = function (value) {
    const config = Game.normalizeStoryConfig(value);
    const errors = [];
    const finiteNumber = function (candidate) {
      return typeof candidate === 'number' && Number.isFinite(candidate);
    };

    if (config.version !== 1) errors.push('不支持的配置版本。');
    Object.keys(config.timing).forEach(function (key) {
      if (!finiteNumber(config.timing[key]) || config.timing[key] <= 0) errors.push(`动画时间 ${key} 必须是正数。`);
    });
    if (!finiteNumber(config.breakdown.duration) || config.breakdown.duration <= 0) errors.push('崩坏倒计时必须是正数。');
    (config.breakdown.wrongPenalties || []).forEach(function (penalty) {
      if (!finiteNumber(penalty) || penalty <= 0) errors.push('错误扣时必须全部是正数。');
    });

    const chapterNumbers = new Set();
    const chapterIds = new Set();
    const questionIds = new Set();
    config.chapters.forEach(function (chapter) {
      const number = Number(chapter.number);
      if (!number || chapterNumbers.has(number)) errors.push(`章节编号 ${chapter.number} 重复或无效。`);
      chapterNumbers.add(number);
      if (!chapter.id || chapterIds.has(chapter.id)) errors.push(`章节 ID ${chapter.id || '(空)'} 重复或无效。`);
      chapterIds.add(chapter.id);
      const choices = Array.isArray(chapter.choices) ? chapter.choices : [];
      choices.forEach(function (choice) {
        if (!choice.id || questionIds.has(choice.id)) errors.push(`问题 ID ${choice.id || '(空)'} 重复或无效。`);
        questionIds.add(choice.id);
        if (!String(choice.label || '').trim()) errors.push(`问题 ${choice.id || '(空)'} 缺少文字。`);
        ['trust', 'anomaly'].forEach(function (key) {
          if (choice.effects && choice.effects[key] != null && !finiteNumber(choice.effects[key])) {
            errors.push(`问题 ${choice.id || '(空)'} 的${key === 'trust' ? '信任变化' : '异常变化'}必须是数字。`);
          }
        });
      });
      if (number >= 1 && number < 15) {
        const advancing = choices.filter(function (choice) { return Number(choice.advanceChapter) === number + 1; });
        if (advancing.length !== 1) errors.push(`第 ${number} 章必须有且只有一个推进选项。`);
      }
    });

    config.chapters.forEach(function (chapter) {
      (chapter.choices || []).forEach(function (choice) {
        if (choice.advanceChapter != null && !chapterNumbers.has(Number(choice.advanceChapter))) {
          errors.push(`问题 ${choice.id} 的推进章节不存在。`);
        }
      });
    });

    const finale = config.chapters.find(function (chapter) { return Number(chapter.number) === 15; });
    if (!finale || !(finale.choices || []).length) errors.push('最终章节必须存在并包含结局选项。');
    if (finale && (finale.choices || []).some(function (choice) {
      return choice.advanceChapter != null || !(choice.effects && choice.effects.flags && choice.effects.flags.finale);
    })) errors.push('最终章节只能包含不再推进的结局选项。');

    return { valid: errors.length === 0, errors: errors };
  };

  Game.parseStoryConfigJson = function (text) {
    try {
      const config = Game.normalizeStoryConfig(JSON.parse(text));
      const validation = Game.validateStoryConfig(config);
      return validation.valid ? { config: config, errors: [] } : { config: null, errors: validation.errors };
    } catch (error) {
      return { config: null, errors: [`JSON 格式不正确：${error.message}`] };
    }
  };

  Game.serializeStoryConfigJson = function (config) {
    const normalized = Game.normalizeStoryConfig(config);
    const validation = Game.validateStoryConfig(normalized);
    if (!validation.valid) throw new Error(validation.errors.join('\n'));
    return `${JSON.stringify(normalized, null, 2)}\n`;
  };

  Game.serializeStoryConfigScript = function (config) {
    const json = Game.serializeStoryConfigJson(config).trimEnd();
    return `(function (global) {\n  global.VerityStoryConfig = ${json};\n}(window));\n`;
  };

  Game.createEditorStoryConfig = function (editableContent, story) {
    const config = Game.cloneStoryConfig(editableContent || {});
    config.version = 1;
    config.chapters = Object.keys(story).map(function (number) {
      const chapter = Game.cloneStoryConfig(story[number]);
      chapter.number = Number(chapter.number || number);
      return chapter;
    }).sort(function (left, right) { return left.number - right.number; });
    delete config.customQuestions;
    return Game.normalizeStoryConfig(config);
  };
}(window));
