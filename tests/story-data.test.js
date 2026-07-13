test('story exposes fifteen chapters and thirteen discoverable clues', function () {
  equal(Object.keys(VerityGame.STORY).length, 15);
  equal(Object.keys(VerityGame.CLUES).length, 13);
  ok(Object.keys(VerityGame.CLUES).includes('box'));
  ok(Object.keys(VerityGame.CLUES).includes('home-coordinates'));
});

test('the first fourteen chapters offer five questions and trust-building choices', function () {
  Object.values(VerityGame.STORY).filter(function (chapter) { return chapter.number !== 15 && chapter.id !== 'finale'; }).forEach(function (chapter) {
    ok(chapter.choices.length >= 5, `${chapter.id} has only ${chapter.choices.length} choices`);
    ok(chapter.choices.filter(function (choice) { return choice.effects && choice.effects.trust > 0; }).length >= 2, `${chapter.id} needs two trust choices`);
  });
});

test('the first fourteen chapters each have one meaningful advancing choice', function () {
  Object.values(VerityGame.STORY).filter(function (chapter) { return chapter.number < 15; }).forEach(function (chapter) {
    const advancing = chapter.choices.filter(function (choice) { return Number(choice.advanceChapter) === chapter.number + 1; });
    equal(advancing.length, 1);
    ok(!/我们继续下一页|继续下一章/.test(advancing[0].label), `${chapter.id} still uses generic continuation copy`);
  });
});

test('legacy generated continuation choices migrate onto the clue choice', function () {
  const chapter = {
    number: 5,
    id: 'legacy',
    choices: [
      { id: 'legacy-clue', label: '保存记录。', nextScene: 'legacy' },
      { id: 'legacy-advance', label: '我们继续下一页。', nextScene: 'next', advanceChapter: 6 }
    ]
  };
  VerityGame.normalizeChapterProgression(chapter);
  equal(chapter.choices.some(function (choice) { return choice.id === 'legacy-advance'; }), false);
  equal(chapter.choices.find(function (choice) { return choice.id === 'legacy-clue'; }).advanceChapter, 6);
});

test('legacy chapters without progression repair an existing story choice', function () {
  const nextChapter = VerityGame.STORY[6];
  const chapter = {
    number: 5,
    id: 'legacy-stalled',
    choices: [
      { id: 'legacy-stalled-listen', label: '继续倾听。', effects: { trust: 5 }, nextScene: 'legacy-stalled' },
      { id: 'legacy-stalled-record', label: '保存这份关键记录。', effects: { addClues: ['box'] }, nextScene: 'legacy-stalled' },
      { id: 'legacy-stalled-doubt', label: '这份记录是假的。', effects: { anomaly: 5 }, nextScene: 'legacy-stalled' }
    ]
  };

  VerityGame.normalizeChapterProgression(chapter);

  const advancing = chapter.choices.filter(function (choice) { return choice.advanceChapter === 6; });
  equal(advancing.length, 1);
  equal(advancing[0].id, 'legacy-stalled-record');
  equal(advancing[0].nextScene, nextChapter.id);
});

test('progression normalization keeps only one correct advancing choice', function () {
  const chapter = {
    number: 8,
    id: 'legacy-duplicates',
    choices: [
      { id: 'legacy-duplicates-clue', label: '保存关键记录。', effects: { addClues: ['box'] }, advanceChapter: 9 },
      { id: 'legacy-duplicates-other', label: '打开下一份记录。', effects: { trust: 2 }, advanceChapter: 9 }
    ]
  };

  VerityGame.normalizeChapterProgression(chapter);

  equal(chapter.choices.filter(function (choice) { return choice.advanceChapter === 9; }).length, 1);
  equal(chapter.choices.find(function (choice) { return choice.id === 'legacy-duplicates-clue'; }).advanceChapter, 9);
});

test('progression normalization preserves an existing authored correct choice', function () {
  const chapter = {
    number: 2,
    id: 'authored',
    choices: [
      { id: 'authored-clue', label: '检查线索。', effects: { addClues: ['box'] }, nextScene: 'authored' },
      { id: 'authored-answer', label: '说出正确答案。', effects: { trust: 3 }, nextScene: 'hunt', advanceChapter: 3 }
    ]
  };

  VerityGame.normalizeChapterProgression(chapter);

  equal(chapter.choices.find(function (choice) { return choice.id === 'authored-answer'; }).advanceChapter, 3);
  equal(chapter.choices.find(function (choice) { return choice.id === 'authored-clue'; }).advanceChapter, undefined);
});

test('editor normalization preserves progression when early chapters omit number metadata', function () {
  const chapter = {
    id: 'arrival-copy',
    choices: [
      { id: 'arrival-copy-question', label: '修改后的普通问题。', nextScene: 'arrival-copy' },
      { id: 'arrival-copy-answer', label: '修改后的正确问题。', nextScene: 'cracks', advanceChapter: 2 }
    ]
  };

  VerityGame.normalizeChapterProgression(chapter, 1);

  equal(chapter.choices.find(function (choice) { return choice.id === 'arrival-copy-answer'; }).advanceChapter, 2);
  equal(chapter.choices.find(function (choice) { return choice.id === 'arrival-copy-question'; }).advanceChapter, undefined);
});

test('only chapter fifteen contains finale choices', function () {
  Object.keys(VerityGame.STORY).forEach(function (number) {
    const choices = VerityGame.STORY[number].choices || [];
    const hasFinale = choices.some(function (choice) { return choice.effects && choice.effects.flags && choice.effects.flags.finale; });
    equal(hasFinale, Number(number) === 15);
  });
});

test('developer editable content is loaded', function () {
  ok(VerityGame.EDITABLE_CONTENT);
  ok(VerityGame.EDITABLE_CONTENT.randomReplies.length >= 8);
  ok(VerityGame.INTENT_RESPONSES['former-players'].length >= 3);
});

test('legacy editor copies of the final letting go choice receive the explicit intent flag', function () {
  const legacy = {
    id: 'final-letting-go',
    label: '修改后的放手选项',
    effects: { trust: 10, flags: { finale: true, empathy: true, promisedToStay: false } }
  };
  const normalized = VerityGame.normalizeEndingChoice(legacy);
  equal(normalized.effects.flags.lettingGoChoice, true);
  equal(normalized.label, '修改后的放手选项');
});

test('breakdown chapter exposes four editable nodes and approved audio copy', function () {
  const breakdown = VerityGame.EDITABLE_CONTENT.breakdown;
  equal(breakdown.duration, 90);
  deepEqual(breakdown.wrongPenalties, [12, 15, 20]);
  equal(breakdown.prophecy, 'SOMETHING IS COMING IN THREE DAYS');
  equal(breakdown.nodes.length, 4);
  breakdown.nodes.forEach(function (node) {
    ok(node.prompt.length > 10);
    ok(node.correct.id);
    equal(node.wrong.length, 4);
  });
});

test('monster warning uses the approved eleven second timing', function () {
  equal(VerityGame.EDITABLE_CONTENT.timing.monsterWarningHold, 11000);
});

test('psychological atmosphere exposes editable low-frequency whispers', function () {
  ok(VerityGame.EDITABLE_CONTENT.psychology.whispers.length >= 6);
  equal(VerityGame.EDITABLE_CONTENT.timing.psychologicalHintEvery, 3);
});

test('all five endings have substantial Chinese copy', function () {
  equal(Object.keys(VerityGame.ENDINGS).length, 5);
  Object.values(VerityGame.ENDINGS).forEach(function (ending) {
    ok(ending.title.length > 0);
    ok(ending.body.length > 20);
  });
});

test('opening subtitle contains the approved greeting', function () {
  const transcript = VerityGame.OPENING_SUBTITLES.map(function (cue) { return cue.text; }).join('');
  equal(transcript, '你好，我是 Verity，你的私人助手朋友。有什么问题尽管问，我什么都知道。');
});
