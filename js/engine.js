(function (global) {
  const Game = global.VerityGame = global.VerityGame || {};
  const clueByIntent = {
    'identity': 'box',
    'omniscience': 'invasive-answer',
    'former-players': 'twixxel',
    'minecraft': 'monster-report',
    'death': 'laboratory'
  };

  function chapterData(state) {
    return Game.STORY[state.chapter] || Game.STORY[1];
  }

  function choicesFor(state) {
    const chapter = chapterData(state);
    const used = state.usedChoiceIds || [];
    if (state.scene === 'recovery') return (chapter.recovery || []).filter(function (choice) { return !used.includes(choice.id); });
    if (state.scene === 'ending' && state.chapter === 15) return [];
    const available = (chapter.choices || []).filter(function (choice) { return !used.includes(choice.id); });
    return available;
  }

  function withHistory(state, role, text) {
    const history = state.history.concat([{ id: `m-${state.history.length + 1}`, role: role, text: text, altered: false }]);
    return Game.applyEffects(state, { history: history });
  }

  function portraitEvents(critical, extraEvents) {
    const events = [];
    if (critical) events.push({ portrait: 'angry', type: 'portrait', duration: 650 });
    events.push({ portrait: 'speaking', type: 'portrait' });
    (extraEvents || []).forEach(function (type) { events.push({ type: type }); });
    events.push({ portrait: 'normal', type: 'portrait' });
    return events;
  }

  Game.getChoices = choicesFor;

  Game.choose = function (state, choiceId) {
    const choice = choicesFor(state).find(function (item) { return item.id === choiceId; });
    if (!choice) throw new Error(`Unknown choice: ${choiceId}`);
    let next = withHistory(state, 'player', choice.label);
    const effects = Object.assign({}, choice.effects || {}, {
      chapter: choice.advanceChapter || next.chapter,
      scene: choice.nextScene || next.scene,
      usedChoiceIds: (next.usedChoiceIds || []).concat(choice.id)
    });
    next = Game.applyEffects(next, effects);
    if ((choice.events || []).includes('alter-history')) {
      const alteredHistory = next.history.map(function (message) { return Object.assign({}, message); });
      let target = -1;
      for (let index = alteredHistory.length - 1; index >= 0; index -= 1) {
        if (alteredHistory[index].role === 'verity') { target = index; break; }
      }
      if (target < 0) target = 0;
      if (alteredHistory[target]) alteredHistory[target].altered = true;
      next = Game.applyEffects(next, { history: alteredHistory });
    }
    next = withHistory(next, 'verity', choice.response);
    const events = portraitEvents(choice.critical, choice.events);
    if (choice.scare) events.unshift({ type: 'scare-approach' });
    if (choice.id === 'ask-monster') events.unshift({ type: 'monster-breakdown' });
    if (choice.forceCorrectTo) events.unshift({ type: 'forced-correct', target: choice.forceCorrectTo });
    return {
      state: next,
      response: choice.response,
      events: events,
      choices: choicesFor(next),
      forcedChoiceId: choice.forceCorrectTo || null
    };
  };

  Game.ask = function (state, text) {
    const question = String(text || '').trim();
    const match = Game.matchIntent(question, state.chapter);
    const count = (state.repeatCounts[match.id] || 0) + 1;
    const counts = Object.assign({}, state.repeatCounts);
    counts[match.id] = count;
    const asked = state.askedIntents.concat(match.id);
    let effects = { repeatCounts: counts, askedIntents: asked };
    if (count >= 3 && match.id !== 'unknown') effects.anomaly = 5;
    const clue = clueByIntent[match.id];
    if (clue) effects.addClues = [clue];
    if (match.id === 'former-players' && state.chapter >= 2) {
      effects.flags = { twixxelContradiction: true };
    }
    if (match.id === 'comfort') effects.flags = Object.assign({}, effects.flags, { empathy: true });
    if (match.id === 'escape' && state.clues.includes('countdown')) {
      effects.flags = Object.assign({}, effects.flags, { interruptionPhrase: true });
    }
    let next = withHistory(state, 'player', question);
    next = Game.applyEffects(next, effects);
    const variants = Game.INTENT_RESPONSES[match.id] || Game.INTENT_RESPONSES.unknown;
    const responseIndex = Math.floor(state.history.length / 2) % variants.length;
    let response = variants[responseIndex] || variants[0];
    if (count >= 3 && match.id !== 'unknown') response = `这个问题我已经回答过了。${response}`;
    next = withHistory(next, 'verity', response);
    return {
      state: next,
      response: response,
      intent: match.id,
      events: portraitEvents(match.id === 'provocation' && next.anomaly >= 60),
      choices: choicesFor(next)
    };
  };

  Game.resolveEnding = function (state) {
    if (state.chapter !== 15) return null;
    if (!state.flags.finale) return null;
    const clueCount = state.clues.length;
    const balanceScore = [state.trust >= 60, clueCount >= 6, state.anomaly <= 70].filter(Boolean).length;
    if (state.flags.lettingGoChoice && state.anomaly < 85 && balanceScore >= 2) return 'letting-go';
    if (state.anomaly >= 90) return 'rage';
    if (state.trust >= 85 && state.flags.promisedToStay) return 'assimilation';
    if (state.flags.interruptionPhrase) return 'escape';
    if (state.clues.length >= 3 && state.flags.twixxelContradiction) return 'truth';
    return state.trust >= 70 ? 'assimilation' : 'rage';
  };
}(window));
