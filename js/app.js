(function (global) {
  const Game = global.VerityGame;
  global.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('#app');
    const warningScreen = document.querySelector('#warning-screen');
    const startScreen = document.querySelector('#start-screen');
    const gameScreen = document.querySelector('#game-screen');
    const warningContinue = document.querySelector('#warning-continue');
    const startButton = document.querySelector('#start-button');
    const form = document.querySelector('#question-form');
    const question = document.querySelector('#free-question');
    const inputMessage = document.querySelector('#input-message');
    const muteButton = document.querySelector('#mute-button');
    const replayButton = document.querySelector('#replay-button');
    const audio = document.querySelector('#opening-audio');
    const victoryAudio = document.querySelector('#victory-audio');
    const prophecyAudio = document.querySelector('#prophecy-audio');
    const monsterShoutAudio = document.querySelector('#monster-shout-audio');
    const assets = Game.EDITABLE_CONTENT.assets || {};
    if (assets.openingAudio) audio.src = assets.openingAudio;
    if (assets.prophecyAudio) prophecyAudio.src = assets.prophecyAudio;
    if (assets.shoutAudio) monsterShoutAudio.src = assets.shoutAudio;
    if (assets.victoryAudio) victoryAudio.src = assets.victoryAudio;
    const subtitle = document.querySelector('#subtitle');
    const developerToggle = document.querySelector('#developer-toggle');
    const developerPanel = document.querySelector('#developer-panel');
    const reduceEffects = document.querySelector('#reduce-effects');
    const huntRestart = document.querySelector('#hunt-restart');
    const ui = Game.createUI(root);
    let state = Game.createInitialState();
    let locked = false;
    let muted = false;
    let breakdownState = null;
    let breakdownFrame = null;
    let breakdownLastTime = 0;
    let breakdownLastSecond = null;
    const audioController = Game.createAudioController({
      audio: audio,
      subtitle: subtitle,
      cues: Game.OPENING_SUBTITLES,
      onPortrait: ui.setPortrait
    });
    const effectAudio = Game.createEffectAudioController({ prophecy: prophecyAudio, shout: monsterShoutAudio });
    const developerTools = Game.createDeveloperTools({
      panel: developerPanel,
      toggle: developerToggle,
      endings: Game.ENDINGS,
      onPreview: previewEnding,
      onEventPreview: previewEvent
    });
    Game.createWarningController({
      warningScreen: warningScreen,
      startScreen: startScreen,
      continueButton: warningContinue,
      reduceEffects: reduceEffects,
      onContinue: function (shouldReduce) {
        document.body.classList.toggle('manual-reduced-effects', shouldReduce);
      }
    });
    const requestedEnding = Game.getEndingPreviewId(global.location.search, Game.ENDINGS);
    const requestedEvent = Game.getEventPreviewId(global.location.search, ['monster-warning', 'breakdown', 'hunt-five']);
    if (requestedEnding) previewEnding(requestedEnding);
    else if (requestedEvent) previewEvent(requestedEvent);

    function previewEnding(endingId) {
      stopBreakdownClock();
      effectAudio.stopAll();
      ui.hideBreakdown();
      warningScreen.hidden = true;
      startScreen.hidden = true;
      gameScreen.hidden = false;
      state = Game.createInitialState();
      state = Game.applyEffects(state, { ending: endingId, flags: { finale: true } });
      ui.renderState(state);
      ui.showPsychologicalHint(state.history.length);
      ui.showEnding(Game.ENDINGS[endingId], restart, endingId);
      victoryAudio.pause();
      victoryAudio.currentTime = 0;
      if (endingId === 'letting-go') victoryAudio.play().catch(function () {});
      developerTools.close();
    }

    async function previewEvent(eventId) {
      warningScreen.hidden = true;
      startScreen.hidden = true;
      gameScreen.hidden = false;
      stopBreakdownClock();
      effectAudio.stopAll();
      ui.hideBreakdown();
      root.classList.remove('perfect-ending', 'rage-ending');
      developerTools.close();
      if (eventId === 'monster-warning') {
        ui.setLocked(true);
        await ui.playMonsterWarning();
        ui.setLocked(false);
        return;
      }
      state = Game.createInitialState();
      ui.renderState(state);
      ui.showPsychologicalHint(state.history.length);
      startBreakdown(eventId === 'hunt-five' ? 5 : undefined);
    }

    function prepareChapter() {
      if (!state.history.length) {
        state = Game.applyEffects(state, { history: [{ id: 'm-0', role: 'verity', text: Game.STORY[state.chapter].intro, altered: false }] });
      }
      ui.renderState(state);
      ui.showPsychologicalHint(state.history.length);
      ui.showChoices(Game.getChoices(state), runChoice);
      ui.setLocked(false);
      const first = document.querySelector('.choice-button');
      if (first) first.focus();
    }

    async function runTransition(transition, internal) {
      if (locked && !internal) return;
      locked = true;
      ui.setLocked(true);
      if (transition.events.some(function (event) { return event.type === 'monster-breakdown'; })) {
        state = transition.state;
        await runMonsterBreakdownIntro();
        return;
      }
      await ui.playTransition(transition);
      state = transition.state;
      ui.renderState(state);
      ui.showPsychologicalHint(state.history.length);
      if (transition.forcedChoiceId) {
        ui.showChoices(transition.choices, runChoice);
        ui.setLocked(true);
        await ui.playForcedCorrection(transition.forcedChoiceId);
        return runTransition(Game.choose(state, transition.forcedChoiceId), true);
      }
      const endingId = Game.resolveEnding(state);
      if (endingId) {
        state = Game.applyEffects(state, { ending: endingId });
        ui.showEnding(Game.ENDINGS[endingId], restart, endingId);
        if (endingId === 'letting-go') {
          victoryAudio.currentTime = 0;
          victoryAudio.play().catch(function () {});
        }
      } else {
        ui.showChoices(transition.choices, runChoice);
        ui.setLocked(false);
      }
      locked = false;
    }

    function playEffectAndWait(name, audioElement, maxDuration) {
      return new Promise(function (resolve) {
        let finished = false;
        function finish() {
          if (finished) return;
          finished = true;
          global.clearTimeout(timeout);
          audioElement.removeEventListener('ended', finish);
          audioElement.removeEventListener('error', finish);
          resolve();
        }
        const timeout = global.setTimeout(finish, maxDuration);
        audioElement.addEventListener('ended', finish);
        audioElement.addEventListener('error', finish);
        effectAudio.play(name).then(function (played) { if (!played) finish(); });
      });
    }

    async function runMonsterBreakdownIntro() {
      await ui.playMonsterWarning();
      ui.setPortrait('speaking');
      subtitle.textContent = Game.EDITABLE_CONTENT.breakdown.prophecy;
      await playEffectAndWait('prophecy', prophecyAudio, 8000);
      subtitle.textContent = '';
      ui.setPortrait('angry');
      startBreakdown();
    }

    function stopBreakdownClock() {
      if (breakdownFrame !== null) global.cancelAnimationFrame(breakdownFrame);
      breakdownFrame = null;
      breakdownLastTime = 0;
      breakdownLastSecond = null;
    }

    function scheduleBreakdownClock() {
      if (!breakdownState || breakdownState.status !== 'active' || document.hidden) return;
      breakdownFrame = global.requestAnimationFrame(tickBreakdown);
    }

    function tickBreakdown(now) {
      if (!breakdownState || breakdownState.status !== 'active' || document.hidden) return;
      if (!breakdownLastTime) breakdownLastTime = now;
      const elapsed = Math.max(0, (now - breakdownLastTime) / 1000);
      breakdownLastTime = now;
      breakdownState = Game.elapseBreakdown(breakdownState, elapsed);
      const visibleSecond = Math.ceil(breakdownState.remaining);
      if (visibleSecond !== breakdownLastSecond) {
        breakdownLastSecond = visibleSecond;
        ui.updateBreakdown(breakdownState, chooseBreakdown);
      }
      if (breakdownState.status === 'hunted') {
        finishHunt();
        return;
      }
      scheduleBreakdownClock();
    }

    function startBreakdown(seconds) {
      stopBreakdownClock();
      breakdownState = Game.createBreakdownState();
      if (Number.isFinite(seconds)) breakdownState.remaining = Math.max(0, seconds);
      locked = true;
      ui.setLocked(true);
      ui.showBreakdown(breakdownState, chooseBreakdown);
      scheduleBreakdownClock();
    }

    function chooseBreakdown(choiceId) {
      if (!breakdownState || breakdownState.status !== 'active') return;
      breakdownState = Game.chooseBreakdown(breakdownState, choiceId);
      ui.updateBreakdown(breakdownState, chooseBreakdown);
      if (breakdownState.status === 'complete') finishBreakdownSuccess();
      if (breakdownState.status === 'hunted') finishHunt();
    }

    function finishBreakdownSuccess() {
      stopBreakdownClock();
      ui.hideBreakdown();
      state = Game.applyEffects(state, {
        anomaly: 12,
        addClues: [Game.EDITABLE_CONTENT.breakdown.clue.id],
        history: state.history.concat([{ id: `m-${state.history.length + 1}`, role: 'verity', text: Game.EDITABLE_CONTENT.breakdown.successText, altered: false }])
      });
      ui.setPortrait('normal');
      ui.renderState(state);
      ui.showChoices(Game.getChoices(state), runChoice);
      ui.setLocked(false);
      breakdownState = null;
      locked = false;
    }

    async function finishHunt() {
      if (!breakdownState || breakdownState.status !== 'hunted') return;
      stopBreakdownClock();
      effectAudio.play('shout');
      await ui.playHunt();
    }

    function runChoice(choiceId) {
      inputMessage.textContent = '';
      if (choiceId === 'ask-monster') effectAudio.unlock();
      try { runTransition(Game.choose(state, choiceId)); }
      catch (error) { fatal(error); }
    }

    function runQuestion(text) {
      try { runTransition(Game.ask(state, text)); }
      catch (error) { fatal(error); }
    }

    function fatal(error) {
      console.error(error);
      locked = false;
      document.querySelector('#choices').innerHTML = '<button type="button" class="choice-button" id="fatal-restart">记录损坏。重新开始</button>';
      document.querySelector('#fatal-restart').addEventListener('click', restart);
      ui.setLocked(false);
    }

    function restart() {
      stopBreakdownClock();
      breakdownState = null;
      effectAudio.stopAll();
      ui.hideBreakdown();
      state = Game.createInitialState();
      locked = false;
      document.querySelector('#ending-panel').hidden = true;
      document.querySelector('#ending-panel').innerHTML = '';
      question.value = '';
      inputMessage.textContent = '';
      ui.setPortrait('normal');
      root.classList.remove('perfect-ending', 'rage-ending');
      victoryAudio.pause();
      victoryAudio.currentTime = 0;
      prepareChapter();
    }

    startButton.addEventListener('click', async function () {
      startButton.disabled = true;
      startScreen.hidden = true;
      gameScreen.hidden = false;
      ui.setLocked(true);
      try { await audioController.playOpening(); }
      finally { prepareChapter(); }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const text = question.value.trim();
      if (!text) {
        inputMessage.textContent = '请输入一个问题。';
        question.focus();
        return;
      }
      question.value = '';
      inputMessage.textContent = '';
      runQuestion(text);
    });

    muteButton.addEventListener('click', function () {
      muted = !muted;
      audioController.setMuted(muted);
      effectAudio.setMuted(muted);
      muteButton.textContent = muted ? '×' : '♪';
      muteButton.setAttribute('aria-label', muted ? '取消静音' : '静音');
    });

    replayButton.addEventListener('click', function () { audioController.replay(); });
    if (huntRestart) huntRestart.addEventListener('click', restart);
    document.addEventListener('visibilitychange', function () {
      if (!breakdownState || breakdownState.status !== 'active') return;
      if (document.hidden) stopBreakdownClock();
      else {
        breakdownLastTime = 0;
        scheduleBreakdownClock();
      }
    });
  });
}(window));
