test('normal reply speaks and returns to choice portrait', function () {
  const result = VerityGame.choose(VerityGame.createInitialState(), 'ask-name');
  deepEqual(result.events.filter(function (event) { return event.portrait; }).map(function (event) { return event.portrait; }), ['speaking', 'normal']);
  ok(result.state.clues.includes('box'));
});

test('authored choices can only be selected once', function () {
  const first = VerityGame.choose(VerityGame.createInitialState(), 'ask-name');
  ok(!first.choices.some(function (choice) { return choice.id === 'ask-name'; }));
  let failed = false;
  try { VerityGame.choose(first.state, 'ask-name'); } catch (error) { failed = true; }
  equal(failed, true);
});

test('only the twelve foot monster question triggers the breakdown event', function () {
  const state = VerityGame.applyEffects(VerityGame.createInitialState(), { chapter: 3, scene: 'hunt' });
  const monster = VerityGame.choose(state, 'ask-monster');
  ok(monster.events.some(function (event) { return event.type === 'monster-breakdown'; }));
  const other = VerityGame.choose(state, 'ask-lava');
  ok(!other.events.some(function (event) { return event.type === 'monster-breakdown'; }));
});

test('critical mistake flashes angry before speaking and recovers to normal', function () {
  const state = VerityGame.applyEffects(VerityGame.createInitialState(), { chapter: 3, scene: 'hunt' });
  const result = VerityGame.choose(state, 'leave-now');
  deepEqual(result.events.filter(function (event) { return event.portrait; }).map(function (event) { return event.portrait; }), ['angry', 'speaking', 'normal']);
  ok(result.events.some(function (event) { return event.type === 'scare-approach'; }));
  ok(result.state.anomaly > state.anomaly);
  equal(result.state.scene, 'recovery');
  ok(result.state.history.some(function (message) { return message.altered; }));
});

test('resisting recovery triggers ONLY ME forced correction', function () {
  const state = VerityGame.applyEffects(VerityGame.createInitialState(), { chapter: 3, scene: 'recovery', anomaly: 45 });
  const result = VerityGame.choose(state, 'return-resist');
  equal(result.forcedChoiceId, 'return-reassure');
  ok(result.events.some(function (event) { return event.type === 'forced-correct'; }));
  equal(result.state.scene, 'recovery');
});

test('free question tracks repeats and becomes impatient', function () {
  let state = VerityGame.createInitialState();
  state = VerityGame.ask(state, '你是谁').state;
  state = VerityGame.ask(state, '你到底是谁').state;
  const result = VerityGame.ask(state, '你是谁');
  equal(result.intent, 'identity');
  ok(result.response.includes('已经回答'));
  equal(result.state.repeatCounts.identity, 3);
});

test('unrecognized free questions receive varied replies', function () {
  let state = VerityGame.createInitialState();
  const first = VerityGame.ask(state, '蓝色袜子味道如何');
  state = first.state;
  const second = VerityGame.ask(state, '绿色茶杯会做梦吗');
  ok(first.response !== second.response);
});

test('all clues and empathy unlock letting go', function () {
  const state = VerityGame.applyEffects(VerityGame.createInitialState(), {
    chapter: 15,
    scene: 'ending',
    addClues: Object.keys(VerityGame.CLUES),
    anomaly: 30,
    flags: { empathy: true, promisedToStay: false, finale: true, twixxelContradiction: true, lettingGoChoice: true }
  });
  equal(VerityGame.resolveEnding(state), 'letting-go');
});

test('letting go accepts any two balanced route indicators', function () {
  const state = Object.assign(VerityGame.createInitialState(), {
    chapter: 15,
    trust: 60,
    anomaly: 80,
    clues: ['box', 'invasive-answer', 'twixxel', 'countdown', 'monster-report', 'laboratory'],
    flags: { finale: true, promisedToStay: false, lettingGoChoice: true }
  });
  equal(VerityGame.resolveEnding(state), 'letting-go');
});

test('letting go rejects one indicator and the anomaly hard limit', function () {
  const oneIndicator = Object.assign(VerityGame.createInitialState(), {
    chapter: 15,
    trust: 59,
    anomaly: 70,
    clues: ['box', 'twixxel', 'laboratory', 'countdown', 'monster-report'],
    flags: { finale: true, promisedToStay: false, lettingGoChoice: true }
  });
  const hardLimit = Object.assign(VerityGame.createInitialState(), {
    chapter: 15,
    trust: 90,
    anomaly: 85,
    clues: Object.keys(VerityGame.CLUES),
    flags: { finale: true, promisedToStay: false, lettingGoChoice: true }
  });
  ok(VerityGame.resolveEnding(oneIndicator) !== 'letting-go');
  ok(VerityGame.resolveEnding(hardLimit) !== 'letting-go');
});

test('early empathy cannot override a different final choice', function () {
  const state = Object.assign(VerityGame.createInitialState(), {
    chapter: 15,
    trust: 90,
    anomaly: 20,
    clues: Object.keys(VerityGame.CLUES),
    flags: { finale: true, empathy: true, promisedToStay: false, twixxelContradiction: true }
  });
  equal(VerityGame.resolveEnding(state), 'truth');
});

test('the final letting go choice records the explicit ending intent', function () {
  const state = VerityGame.applyEffects(VerityGame.createInitialState(), { chapter: 15, scene: 'finale' });
  const result = VerityGame.choose(state, 'final-letting-go');
  equal(result.state.flags.lettingGoChoice, true);
});

test('ending rules resolve rage, assimilation, escape, and truth', function () {
  const finalState = { chapter: 15 };
  equal(VerityGame.resolveEnding(VerityGame.applyEffects(VerityGame.createInitialState(), Object.assign({ anomaly: 95, flags: { finale: true } }, finalState))), 'rage');
  equal(VerityGame.resolveEnding(VerityGame.applyEffects(VerityGame.createInitialState(), Object.assign({ trust: 40, flags: { finale: true, promisedToStay: true } }, finalState))), 'assimilation');
  equal(VerityGame.resolveEnding(VerityGame.applyEffects(VerityGame.createInitialState(), Object.assign({ addClues: ['countdown'], flags: { finale: true, interruptionPhrase: true } }, finalState))), 'escape');
  equal(VerityGame.resolveEnding(VerityGame.applyEffects(VerityGame.createInitialState(), Object.assign({ addClues: ['box', 'twixxel', 'laboratory'], flags: { finale: true, twixxelContradiction: true } }, finalState))), 'truth');
});

test('letting-go ending accepts a compassionate partial investigation route', function () {
  const state = VerityGame.applyEffects(VerityGame.createInitialState(), {
    chapter: 15,
    addClues: ['box', 'invasive-answer', 'twixxel', 'countdown', 'monster-report', 'laboratory', 'eas-warning', 'jealous-village'],
    anomaly: 55,
    trust: 68,
    flags: { empathy: true, promisedToStay: false, finale: true, lettingGoChoice: true }
  });
  equal(VerityGame.resolveEnding(state), 'letting-go');
});

test('finale flags cannot resolve before chapter fifteen', function () {
  const state = VerityGame.applyEffects(VerityGame.createInitialState(), { chapter: 14, anomaly: 95, flags: { finale: true } });
  equal(VerityGame.resolveEnding(state), null);
});

test('custom editor chapters are available to the story engine', function () {
  const state = VerityGame.applyEffects(VerityGame.createInitialState(), { chapter: 5, scene: 'custom' });
  ok(VerityGame.STORY[5]);
  ok(VerityGame.getChoices(state).some(function (choice) { return choice.id === 'afterimage-listen'; }));
});

test('a repaired legacy choice advances and reveals the next chapter questions', function () {
  const original = VerityGame.STORY[5];
  const chapter = {
    number: 5,
    id: 'stalled-editor-chapter',
    title: '旧版章节',
    choices: [
      { id: 'stalled-listen', label: '继续倾听。', response: '我在听。', effects: { trust: 3 }, nextScene: 'stalled-editor-chapter' },
      { id: 'stalled-record', label: '保存关键记录。', response: '下一份记录已经打开。', effects: { addClues: ['box'] }, nextScene: 'stalled-editor-chapter' }
    ]
  };

  try {
    VerityGame.normalizeChapterProgression(chapter);
    VerityGame.STORY[5] = chapter;
    const state = VerityGame.applyEffects(VerityGame.createInitialState(), { chapter: 5, scene: chapter.id });
    const result = VerityGame.choose(state, 'stalled-record');

    equal(result.state.chapter, 6);
    equal(result.state.scene, VerityGame.STORY[6].id);
    ok(result.choices.length > 0);
    ok(result.choices.every(function (choice) {
      return VerityGame.STORY[6].choices.some(function (nextChoice) { return nextChoice.id === choice.id; });
    }));
  } finally {
    VerityGame.STORY[5] = original;
  }
});

test('an exhausted chapter does not invent an automatic continue choice', function () {
  const chapter = VerityGame.STORY[5];
  const state = VerityGame.applyEffects(VerityGame.createInitialState(), { chapter: 5, scene: chapter.id, usedChoiceIds: chapter.choices.map(function (choice) { return choice.id; }) });
  deepEqual(VerityGame.getChoices(state), []);
});

test('legacy ending scene cannot hide choices before chapter fifteen', function () {
  const state = VerityGame.applyEffects(VerityGame.createInitialState(), { chapter: 4, scene: 'ending' });
  ok(VerityGame.getChoices(state).length > 0);
});
