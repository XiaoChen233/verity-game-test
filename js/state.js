(function (global) {
  const Game = global.VerityGame = global.VerityGame || {};

  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  Game.createInitialState = function () {
    return {
      chapter: 1,
      scene: 'arrival',
      trust: 50,
      anomaly: 0,
      clues: [],
      usedChoiceIds: [],
      askedIntents: [],
      repeatCounts: {},
      portrait: 'normal',
      history: [],
      flags: {},
      settings: { muted: false, reducedMotion: false },
      ending: null
    };
  };

  Game.applyEffects = function (state, effects) {
    const changes = effects || {};
    const next = Object.assign({}, state, changes);
    next.trust = clamp(state.trust + (changes.trust || 0));
    next.anomaly = clamp(state.anomaly + (changes.anomaly || 0));
    next.clues = Array.from(new Set(state.clues.concat(changes.addClues || [])));
    next.usedChoiceIds = (changes.usedChoiceIds || state.usedChoiceIds || []).slice();
    next.flags = Object.assign({}, state.flags, changes.flags || {});
    next.repeatCounts = Object.assign({}, state.repeatCounts, changes.repeatCounts || {});
    next.history = (changes.history || state.history).slice();
    next.askedIntents = (changes.askedIntents || state.askedIntents).slice();
    delete next.addClues;
    return next;
  };

  Game.hasClues = function (state, ids) {
    return ids.every(function (id) { return state.clues.includes(id); });
  };
}(window));
