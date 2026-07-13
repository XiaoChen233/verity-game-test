(function (global) {
  const Game = global.VerityGame = global.VerityGame || {};

  function config() {
    return Game.EDITABLE_CONTENT.breakdown;
  }

  Game.createBreakdownState = function () {
    return {
      remaining: config().duration,
      nodeIndex: 0,
      wrongCount: 0,
      wrongIndex: 0,
      status: 'active',
      lastResponse: ''
    };
  };

  Game.getBreakdownChoices = function (state) {
    if (!state || state.status !== 'active') return [];
    const node = config().nodes[state.nodeIndex];
    if (!node) return [];
    return [node.correct, node.wrong[Math.min(state.wrongIndex, node.wrong.length - 1)]];
  };

  Game.chooseBreakdown = function (state, choiceId) {
    if (!state || state.status !== 'active') return state;
    const node = config().nodes[state.nodeIndex];
    const correct = node.correct.id === choiceId;
    if (correct) {
      const nextIndex = state.nodeIndex + 1;
      return Object.assign({}, state, {
        nodeIndex: nextIndex,
        wrongIndex: 0,
        status: nextIndex >= config().nodes.length ? 'complete' : 'active',
        lastResponse: node.correct.response
      });
    }
    const wrong = node.wrong.find(function (choice) { return choice.id === choiceId; });
    if (!wrong) throw new Error(`Unknown breakdown choice: ${choiceId}`);
    const penalties = config().wrongPenalties;
    const penalty = penalties[Math.min(state.wrongCount, penalties.length - 1)];
    const remaining = Math.max(0, state.remaining - penalty);
    return Object.assign({}, state, {
      remaining: remaining,
      wrongCount: state.wrongCount + 1,
      wrongIndex: Math.min(state.wrongIndex + 1, node.wrong.length - 1),
      status: remaining === 0 ? 'hunted' : 'active',
      lastResponse: wrong.response
    });
  };

  Game.elapseBreakdown = function (state, seconds) {
    if (!state || state.status !== 'active') return state;
    const remaining = Math.max(0, state.remaining - Math.max(0, seconds));
    return Object.assign({}, state, { remaining: remaining, status: remaining === 0 ? 'hunted' : 'active' });
  };
}(window));
