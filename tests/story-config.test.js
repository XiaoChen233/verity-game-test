test('online story configuration exposes a supported version and all editable sections', function () {
  equal(VerityStoryConfig.version, 1);
  ok(Array.isArray(VerityStoryConfig.chapters));
  ok(Array.isArray(VerityStoryConfig.randomReplies));
  ok(VerityStoryConfig.psychology && Array.isArray(VerityStoryConfig.psychology.whispers));
  ok(VerityStoryConfig.breakdown && Array.isArray(VerityStoryConfig.breakdown.nodes));
});

test('configuration validator rejects duplicate chapters questions and broken progression', function () {
  const invalid = VerityGame.cloneStoryConfig(VerityStoryConfig);
  invalid.chapters[1].number = invalid.chapters[0].number;
  invalid.chapters[1].choices[0].id = invalid.chapters[0].choices[0].id;
  invalid.chapters[0].choices.forEach(function (choice) { delete choice.advanceChapter; });
  const result = VerityGame.validateStoryConfig(invalid);
  equal(result.valid, false);
  ok(result.errors.some(function (message) { return message.includes('章节编号'); }));
  ok(result.errors.some(function (message) { return message.includes('问题 ID'); }));
  ok(result.errors.some(function (message) { return message.includes('推进选项'); }));
});

test('configuration normalization keeps the original object untouched', function () {
  const source = VerityGame.cloneStoryConfig(VerityStoryConfig);
  const normalized = VerityGame.normalizeStoryConfig(source);
  ok(normalized !== source);
  ok(normalized.chapters !== source.chapters);
  deepEqual(source, VerityStoryConfig);
});

test('configuration validator rejects invalid numeric effects and finale progression', function () {
  const invalid = VerityGame.cloneStoryConfig(VerityStoryConfig);
  invalid.timing.angryHold = 'fast';
  invalid.breakdown.duration = 0;
  invalid.chapters[0].choices[0].effects.trust = 'high';
  invalid.chapters.find(function (chapter) { return chapter.number === 15; }).choices[0].advanceChapter = 16;
  const result = VerityGame.validateStoryConfig(invalid);
  equal(result.valid, false);
  ok(result.errors.some(function (message) { return message.includes('动画时间'); }));
  ok(result.errors.some(function (message) { return message.includes('倒计时'); }));
  ok(result.errors.some(function (message) { return message.includes('信任变化'); }));
  ok(result.errors.some(function (message) { return message.includes('最终章节'); }));
});

test('test runner loads online configuration before the loader and engine', function () {
  const sources = Array.from(document.scripts).map(function (script) { return script.src; });
  const configIndex = sources.findIndex(function (src) { return src.includes('/story-config.js'); });
  const loaderIndex = sources.findIndex(function (src) { return src.includes('/editable-content.js'); });
  const engineIndex = sources.findIndex(function (src) { return src.includes('/engine.js'); });
  ok(configIndex >= 0 && configIndex < loaderIndex && loaderIndex < engineIndex);
});

test('valid online configuration can replace a chapter and its questions', function () {
  const config = VerityGame.cloneStoryConfig(VerityStoryConfig);
  try {
    config.chapters[0].title = '测试线上标题';
    const result = VerityGame.applyStoryConfig(config, { replaceStory: true });
    equal(result.applied, true);
    equal(VerityGame.STORY[config.chapters[0].number].title, '测试线上标题');
  } finally {
    if (VerityGame.applyStoryConfig) VerityGame.applyStoryConfig(VerityStoryConfig, { replaceStory: true });
  }
});

test('invalid online configuration is rejected without deleting the playable base story', function () {
  const originalTitle = VerityGame.STORY[1].title;
  const result = VerityGame.applyStoryConfig({ version: 99, chapters: [] }, { replaceStory: true });
  equal(result.applied, false);
  equal(VerityGame.STORY[1].title, originalTitle);
  ok(result.errors.length > 0);
});

test('local preview overrides the same online question by stable id', function () {
  const chapter = VerityGame.STORY[1];
  const question = chapter.choices[0];
  const local = {
    version: 1,
    customQuestions: [{
      id: question.id,
      chapter: 1,
      label: '本地预览问题',
      response: question.response,
      effects: question.effects,
      nextScene: question.nextScene,
      advanceChapter: question.advanceChapter
    }]
  };
  try {
    VerityGame.applyLocalStoryPreview(local);
    equal(VerityGame.STORY[1].choices.find(function (item) { return item.id === question.id; }).label, '本地预览问题');
  } finally {
    if (VerityGame.applyStoryConfig) VerityGame.applyStoryConfig(VerityStoryConfig, { replaceStory: true });
  }
});

test('JSON export round trips through validation', function () {
  const text = VerityGame.serializeStoryConfigJson(VerityStoryConfig);
  const parsed = VerityGame.parseStoryConfigJson(text);
  equal(parsed.errors.length, 0);
  deepEqual(parsed.config, VerityGame.normalizeStoryConfig(VerityStoryConfig));
});

test('JavaScript export creates the exact deployable global assignment', function () {
  const text = VerityGame.serializeStoryConfigScript(VerityStoryConfig);
  ok(text.startsWith('(function (global) {'));
  ok(text.includes('global.VerityStoryConfig ='));
  ok(text.endsWith('}(window));\n'));
});

test('invalid imported JSON reports errors without returning a config', function () {
  const syntax = VerityGame.parseStoryConfigJson('{broken');
  equal(syntax.config, null);
  ok(syntax.errors[0].includes('JSON'));
  const structure = VerityGame.parseStoryConfigJson(JSON.stringify({ version: 99, chapters: [] }));
  equal(structure.config, null);
  ok(structure.errors.length > 0);
});

test('editor model exports every active chapter and question in one configuration', function () {
  const config = VerityGame.createEditorStoryConfig(VerityGame.EDITABLE_CONTENT, VerityGame.STORY);
  equal(config.version, 1);
  equal(config.chapters.length, Object.keys(VerityGame.STORY).length);
  ok(config.chapters.every(function (chapter) { return chapter.choices.length > 0; }));
  equal(VerityGame.validateStoryConfig(config).valid, true);
});
