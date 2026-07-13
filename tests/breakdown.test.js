test('breakdown starts with ninety seconds and two choices', function () {
  const state = VerityGame.createBreakdownState();
  equal(state.remaining, 90);
  equal(state.nodeIndex, 0);
  equal(state.status, 'active');
  equal(VerityGame.getBreakdownChoices(state).length, 2);
});

test('correct breakdown choice advances through four nodes', function () {
  let state = VerityGame.createBreakdownState();
  VerityGame.EDITABLE_CONTENT.breakdown.nodes.forEach(function (node, index) {
    state = VerityGame.chooseBreakdown(state, node.correct.id);
    equal(state.nodeIndex, index + 1);
  });
  equal(state.status, 'complete');
});

test('wrong breakdown choices stay on node and deduct twelve fifteen then twenty seconds', function () {
  let state = VerityGame.createBreakdownState();
  const wrong = VerityGame.EDITABLE_CONTENT.breakdown.nodes[0].wrong;
  state = VerityGame.chooseBreakdown(state, wrong[0].id);
  equal(state.remaining, 78);
  equal(state.nodeIndex, 0);
  state = VerityGame.chooseBreakdown(state, wrong[1].id);
  equal(state.remaining, 63);
  state = VerityGame.chooseBreakdown(state, wrong[2].id);
  equal(state.remaining, 43);
  state = VerityGame.chooseBreakdown(state, wrong[3].id);
  equal(state.remaining, 23);
});

test('breakdown elapsed time reaches hunted state and locks choices', function () {
  const state = VerityGame.elapseBreakdown(VerityGame.createBreakdownState(), 90);
  equal(state.remaining, 0);
  equal(state.status, 'hunted');
  equal(VerityGame.getBreakdownChoices(state).length, 0);
});
