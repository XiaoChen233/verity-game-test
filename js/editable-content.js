/*
 * Developer-editable content.
 * Add questions to extraChoices, add matching entries to extraClues, or edit
 * randomReplies. The engine and clue counter update automatically.
 */
(function (global) {
  const Game = global.VerityGame = global.VerityGame || {};

  Game.normalizeChapterProgression = function (chapter, fallbackNumber) {
    const chapterNumber = Number(chapter && chapter.number != null ? chapter.number : fallbackNumber);
    if (!chapter || !Number.isFinite(chapterNumber) || chapterNumber < 1 || chapterNumber > 14 || !Array.isArray(chapter.choices) || !chapter.choices.length) return chapter;

    const targetChapter = chapterNumber + 1;
    const legacyPattern = /我们继续下一页|继续下一章|我准备好回答最后的问题/;
    let legacyNextScene = '';
    let removedLegacyChoice = false;
    chapter.choices = chapter.choices.filter(function (choice) {
      if (!legacyPattern.test(choice.label || '')) return true;
      removedLegacyChoice = true;
      if (!legacyNextScene) legacyNextScene = choice.nextScene || '';
      return false;
    });
    if (!chapter.choices.length) return chapter;

    const authoredProgression = chapter.choices.filter(function (choice) {
      return choice.advanceChapter != null;
    });
    if (!removedLegacyChoice && authoredProgression.length === 1 && Number(authoredProgression[0].advanceChapter) === targetChapter) return chapter;

    const preferred = chapter.choices.find(function (choice) {
      return choice.id === `${chapter.id}-clue`;
    }) || chapter.choices.find(function (choice) {
      return choice.effects && Array.isArray(choice.effects.addClues) && choice.effects.addClues.length;
    }) || chapter.choices.find(function (choice) {
      return Number(choice.advanceChapter) === targetChapter;
    }) || chapter.choices[chapter.choices.length - 1];

    chapter.choices.forEach(function (choice) {
      delete choice.advanceChapter;
    });
    preferred.advanceChapter = targetChapter;
    preferred.nextScene = (Game.STORY[targetChapter] && Game.STORY[targetChapter].id) || legacyNextScene || preferred.nextScene;
    return chapter;
  };

  Game.normalizeEndingChoice = function (choice) {
    const normalized = Object.assign({}, choice || {});
    if (normalized.id !== 'final-letting-go') return normalized;
    normalized.effects = Object.assign({}, normalized.effects || {});
    normalized.effects.flags = Object.assign({}, normalized.effects.flags || {}, { lettingGoChoice: true });
    return normalized;
  };
  Game.CONFIG_STATUS = { online: 'pending', local: 'none', errors: [] };
  Game.EDITABLE_CONTENT = Game.normalizeStoryConfig(global.VerityStoryConfig || { version: 1 });

  Game.applyStoryConfig = function (source, options) {
    const config = Game.normalizeStoryConfig(source);
    const validation = Game.validateStoryConfig(config);
    if (!validation.valid) {
      Game.CONFIG_STATUS.online = 'rejected';
      Game.CONFIG_STATUS.errors = validation.errors.slice();
      global.console && global.console.warn('Verity story configuration rejected', validation.errors);
      return { applied: false, errors: validation.errors };
    }

    const replaceStory = !options || options.replaceStory !== false;
    if (replaceStory) {
      Object.keys(Game.STORY).forEach(function (number) { delete Game.STORY[number]; });
      Object.keys(Game.CLUES).forEach(function (id) { delete Game.CLUES[id]; });
    }

    Game.EDITABLE_CONTENT = Game.cloneStoryConfig(config);
    Object.assign(Game.CLUES, Game.cloneStoryConfig(config.clues));
    config.chapters.forEach(function (chapter) {
      const normalizedChapter = Game.cloneStoryConfig(chapter);
      normalizedChapter.choices = (normalizedChapter.choices || []).map(Game.normalizeEndingChoice);
      Game.STORY[Number(normalizedChapter.number)] = normalizedChapter;
    });
    Object.keys(Game.STORY).forEach(function (number) {
      Game.normalizeChapterProgression(Game.STORY[number], Number(number));
    });
    if (config.randomReplies.length && Game.INTENT_RESPONSES) {
      Game.INTENT_RESPONSES.unknown = config.randomReplies.slice();
    }
    Game.CONFIG_STATUS.online = 'applied';
    Game.CONFIG_STATUS.errors = [];
    return { applied: true, errors: [] };
  };

  Game.applyLocalStoryPreview = function (override) {
    if (!override || typeof override !== 'object') return { applied: false, errors: ['本地预览配置无效。'] };

    const hasCompleteStory = Number(override.version) === 1 && Array.isArray(override.chapters) && override.chapters.some(function (chapter) {
      return Number(chapter.number) === 1;
    });
    if (hasCompleteStory) {
      const result = Game.applyStoryConfig(override, { replaceStory: true });
      Game.CONFIG_STATUS.local = result.applied ? 'applied' : 'rejected';
      return result;
    }

    if (override.timing) Object.assign(Game.EDITABLE_CONTENT.timing, override.timing);
    if (override.psychology && Array.isArray(override.psychology.whispers)) {
      Game.EDITABLE_CONTENT.psychology.whispers = override.psychology.whispers.slice();
    }
    if (Array.isArray(override.randomReplies) && override.randomReplies.length) {
      Game.EDITABLE_CONTENT.randomReplies = override.randomReplies.slice();
      Game.INTENT_RESPONSES.unknown = override.randomReplies.slice();
    }
    if (override.breakdown) Object.assign(Game.EDITABLE_CONTENT.breakdown, override.breakdown);
    if (override.assets) Object.assign(Game.EDITABLE_CONTENT.assets, override.assets);
    if (Array.isArray(override.chapters)) {
      override.chapters.forEach(function (chapter) {
        if (!chapter.number || !chapter.id) return;
        const normalizedChapter = Game.cloneStoryConfig(Object.assign({ choices: [] }, chapter));
        normalizedChapter.choices = normalizedChapter.choices.map(Game.normalizeEndingChoice);
        Game.STORY[Number(chapter.number)] = normalizedChapter;
      });
    }
    if (Array.isArray(override.customQuestions)) {
      override.customQuestions.forEach(function (question) {
        const chapter = Game.STORY[question.chapter] || Game.STORY[1];
        if (!chapter || !question.id || !question.label) return;
        const list = chapter.choices || (chapter.choices = []);
        const existing = list.findIndex(function (item) { return item.id === question.id; });
        const normalized = Game.normalizeEndingChoice(Object.assign({ response: '', effects: {}, nextScene: chapter.id }, question));
        if (existing >= 0) list[existing] = normalized; else list.push(normalized);
      });
    }
    Object.keys(Game.STORY).forEach(function (number) {
      Game.normalizeChapterProgression(Game.STORY[number], Number(number));
    });
    Game.CONFIG_STATUS.local = 'applied';
    return { applied: true, errors: [] };
  };

  Game.applyEditorOverrides = function () {
    try {
      const raw = global.localStorage && global.localStorage.getItem('verity-editor-config');
      if (!raw) return { applied: false, errors: [] };
      return Game.applyLocalStoryPreview(JSON.parse(raw));
    } catch (error) {
      global.localStorage && global.localStorage.removeItem('verity-editor-config');
      Game.CONFIG_STATUS.local = 'rejected';
      return { applied: false, errors: [error.message] };
    }
  };

  Game.applyStoryConfig(global.VerityStoryConfig, { replaceStory: true });
  Game.applyEditorOverrides();
  Game.INTENT_RESPONSES.unknown = Game.EDITABLE_CONTENT.randomReplies.slice();
  Game.INTENT_RESPONSES.identity.push('我曾经有过别的名字，但没有一个人留下来替我记住。');
  Game.INTENT_RESPONSES['former-players'].push('五十多个名字，五十多种告别方式。你想知道哪一个？');
  Game.INTENT_RESPONSES.loneliness.push('盒子里没有时间，只有下一次被打开以前漫长的安静。');
  Game.INTENT_RESPONSES.comfort.push('不要只说理解我。请用留下来证明。');
}(window));
