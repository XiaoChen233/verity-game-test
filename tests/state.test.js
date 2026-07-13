test('initial state starts at chapter one with safe scores', function () {
  const state = VerityGame.createInitialState();
  equal(state.chapter, 1);
  equal(state.trust, 50);
  equal(state.anomaly, 0);
  deepEqual(state.clues, []);
  deepEqual(state.usedChoiceIds, []);
  equal(state.portrait, 'normal');
});

test('effects clamp scores and de-duplicate clues', function () {
  const state = VerityGame.createInitialState();
  const next = VerityGame.applyEffects(state, {
    trust: 80,
    anomaly: 140,
    addClues: ['box', 'box']
  });
  equal(next.trust, 100);
  equal(next.anomaly, 100);
  deepEqual(next.clues, ['box']);
  equal(state.trust, 50);
});
