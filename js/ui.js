(function (global) {
  const Game = global.VerityGame = global.VerityGame || {};
  const portraits = {
    normal: 'assets/verity-normal.png?v=transparent-2',
    speaking: 'assets/verity-speaking.png?v=transparent-2',
    angry: 'assets/verity-angry.png?v=transparent-2'
  };
  if (Game.EDITABLE_CONTENT && Game.EDITABLE_CONTENT.assets) {
    portraits.normal = Game.EDITABLE_CONTENT.assets.normalImage || portraits.normal;
    portraits.speaking = Game.EDITABLE_CONTENT.assets.speakingImage || portraits.speaking;
    portraits.angry = Game.EDITABLE_CONTENT.assets.angryImage || portraits.angry;
  }

  Game.endingPreviewUrl = function (endingId) {
    return `index.html?previewEnding=${encodeURIComponent(endingId)}`;
  };

  Game.getEndingPreviewId = function (search, endings) {
    const id = new URLSearchParams(search || '').get('previewEnding');
    return id && Object.prototype.hasOwnProperty.call(endings, id) ? id : null;
  };

  Game.eventPreviewUrl = function (eventId) {
    return `index.html?previewEvent=${encodeURIComponent(eventId)}`;
  };

  Game.getEventPreviewId = function (search, allowedIds) {
    const id = new URLSearchParams(search || '').get('previewEvent');
    return id && Array.isArray(allowedIds) && allowedIds.includes(id) ? id : null;
  };

  Game.createEndingPreviewLinks = function (container, endings) {
    container.innerHTML = '';
    Object.keys(endings).forEach(function (id) {
      const card = document.createElement('article');
      card.className = 'ending-preview-card';
      const title = document.createElement('h3');
      title.textContent = endings[id].title;
      const body = document.createElement('p');
      body.textContent = endings[id].body;
      const link = document.createElement('a');
      link.dataset.endingPreview = id;
      link.href = Game.endingPreviewUrl(id);
      link.textContent = '打开结局预览';
      card.append(title, body, link);
      container.appendChild(card);
    });

    const breakdownCard = document.createElement('article');
    breakdownCard.className = 'ending-preview-card';
    const breakdownTitle = document.createElement('h3');
    breakdownTitle.textContent = '完全崩坏结局';
    const breakdownBody = document.createElement('p');
    breakdownBody.textContent = '倒计时归零后，Verity 会变成怪物追猎玩家。预览从最后五秒开始，并播放最终嘶吼。';
    const breakdownLink = document.createElement('a');
    breakdownLink.dataset.eventEndingPreview = 'hunt-five';
    breakdownLink.href = Game.eventPreviewUrl('hunt-five');
    breakdownLink.textContent = '打开完全崩坏预览';
    breakdownCard.append(breakdownTitle, breakdownBody, breakdownLink);
    container.appendChild(breakdownCard);
  };

  Game.buildOnlyMeField = function (field) {
    field.innerHTML = '';
    ['top', 'right', 'bottom', 'left'].forEach(function (side) {
      const edge = document.createElement('div');
      edge.className = `only-me-edge edge-${side}`;
      for (let index = 0; index < 5; index += 1) {
        const text = document.createElement('strong');
        text.textContent = 'ONLY ME';
        edge.appendChild(text);
      }
      field.appendChild(edge);
    });
  };

  Game.buildMonsterWarningText = function (element) {
    const text = 'HE IS COMING';
    const bands = [
      [3, 91, -24, -1.1], [12, 80, 19, -.3], [22, 69, -15, -.8], [31, 59, 27, -.1],
      [41, 50, -20, -1.35], [52, 39, 14, -.55], [62, 29, -29, -.95], [72, 19, 22, -.2],
      [82, 9, -12, -1.5], [90, 2, 31, -.7]
    ];
    element.innerHTML = '';
    element.dataset.text = text;
    const main = document.createElement('span');
    main.className = 'glitch-main';
    main.textContent = text;
    element.appendChild(main);
    bands.forEach(function (band) {
      const slice = document.createElement('span');
      slice.className = 'glitch-slice';
      slice.textContent = text;
      slice.style.setProperty('--slice-top', `${band[0]}%`);
      slice.style.setProperty('--slice-bottom', `${band[1]}%`);
      slice.style.setProperty('--slice-shift', `${band[2]}px`);
      slice.style.setProperty('--slice-shift-reverse', `${Math.round(band[2] * -.55)}px`);
      slice.style.setProperty('--slice-shift-small', `${Math.round(band[2] * .3)}px`);
      slice.style.setProperty('--slice-delay', `${band[3]}s`);
      element.appendChild(slice);
    });
  };

  Game.createDeveloperTools = function (options) {
    const panel = options.panel;
    const toggle = options.toggle;
    const endings = options.endings;
    const onPreview = options.onPreview;
    panel.innerHTML = '<h3>结局快速预览</h3><p>直接切换终局画面，便于修改文本和特效。</p>';
    Object.keys(endings).forEach(function (id) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.endingId = id;
      button.textContent = endings[id].title;
      button.addEventListener('click', function () { onPreview(id); });
      panel.appendChild(button);
    });
    if (typeof options.onEventPreview === 'function') {
      const label = document.createElement('p');
      label.textContent = '事件快速预览';
      panel.appendChild(label);
      [
        { id: 'monster-warning', label: '聚光灯警告事件' },
        { id: 'breakdown', label: '完全崩坏章节' },
        { id: 'hunt-five', label: '追猎倒计时：剩余 5 秒' }
      ].forEach(function (preview) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.eventPreview = preview.id;
        button.textContent = preview.label;
        button.addEventListener('click', function () { options.onEventPreview(preview.id); });
        panel.appendChild(button);
      });
    }
    const api = {
      open: function () { panel.hidden = false; toggle.setAttribute('aria-expanded', 'true'); },
      close: function () { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
    };
    toggle.addEventListener('click', function () { panel.hidden ? api.open() : api.close(); });
    return api;
  };

  Game.createWarningController = function (options) {
    options.continueButton.addEventListener('click', function () {
      options.warningScreen.hidden = true;
      options.startScreen.hidden = false;
      options.onContinue(Boolean(options.reduceEffects.checked));
    });
  };

  Game.createUI = function (root) {
    const portrait = root.querySelector('#portrait');
    const speaker = root.querySelector('#speaker');
    const history = root.querySelector('#dialogue-history');
    const psychologicalHint = root.querySelector('#psychological-hint');
    const choices = root.querySelector('#choices');
    const question = root.querySelector('#free-question');
    const askButton = root.querySelector('#ask-button');
    const endingPanel = root.querySelector('#ending-panel');
    const trust = root.querySelector('#status-trust');
    const anomaly = root.querySelector('#status-anomaly');
    const clueCount = root.querySelector('#status-clues');
    const eventOverlay = root.querySelector('#event-overlay');
    const eventPortrait = root.querySelector('#event-portrait');
    const onlyMeField = root.querySelector('#only-me-field');
    const monsterWarningText = root.querySelector('#monster-warning-text');
    const breakdownScreen = root.querySelector('#breakdown-screen');
    const breakdownTimer = root.querySelector('#breakdown-timer');
    const breakdownPortrait = root.querySelector('#breakdown-portrait');
    const breakdownPrompt = root.querySelector('#breakdown-prompt');
    const breakdownResponse = root.querySelector('#breakdown-response');
    const breakdownChoices = root.querySelector('#breakdown-choices');
    const huntResult = root.querySelector('#hunt-result');
    function reducedMotion() {
      return document.body.classList.contains('manual-reduced-effects') ||
        (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    const timing = (Game.EDITABLE_CONTENT && Game.EDITABLE_CONTENT.timing) || {
      angryHold: 1100, speakingHold: 650, typewriterStep: 44, typewriterBatch: 2
    };

    function delay(ms) {
      return new Promise(function (resolve) { global.setTimeout(resolve, reducedMotion() ? 0 : ms); });
    }

    function hold(ms) {
      return new Promise(function (resolve) { global.setTimeout(resolve, ms); });
    }

    function setPortrait(value) {
      portrait.src = portraits[value];
      portrait.classList.toggle('is-angry', value === 'angry');
      portrait.alt = value === 'speaking' ? 'Verity 正在说话' : value === 'angry' ? 'Verity 露出愤怒的怪物笑容' : 'Verity 正在等待你的问题';
      if (speaker) speaker.textContent = `VERITY / ${value.toUpperCase()}`;
    }

    function renderHistory(items) {
      history.innerHTML = '';
      items.forEach(function (message) {
        const article = document.createElement('article');
        article.className = `message ${message.role}${message.altered ? ' altered' : ''}`;
        const meta = document.createElement('span');
        meta.className = 'message-meta';
        meta.textContent = message.role === 'verity' ? 'VERITY' : 'YOU';
        const paragraph = document.createElement('p');
        paragraph.textContent = message.text;
        article.append(meta, paragraph);
        history.appendChild(article);
      });
      history.scrollTop = history.scrollHeight;
    }

    function showPsychologicalHint(index) {
      if (!psychologicalHint) return;
      const whispers = (Game.EDITABLE_CONTENT && Game.EDITABLE_CONTENT.psychology && Game.EDITABLE_CONTENT.psychology.whispers) || [];
      const interval = (Game.EDITABLE_CONTENT && Game.EDITABLE_CONTENT.timing && Game.EDITABLE_CONTENT.timing.psychologicalHintEvery) || 3;
      const completedQuestions = Math.max(0, Math.floor((index - 1) / 2));
      if (!whispers.length || completedQuestions < 1 || completedQuestions % interval !== 0) {
        psychologicalHint.textContent = '';
        psychologicalHint.classList.remove('is-visible');
        return;
      }
      psychologicalHint.textContent = whispers[Math.floor(completedQuestions / interval - 1) % whispers.length];
      psychologicalHint.classList.add('is-visible');
    }

    function renderState(state) {
      if (trust) trust.textContent = state.trust;
      if (anomaly) anomaly.textContent = state.anomaly;
      if (clueCount) clueCount.textContent = `${state.clues.length}/${Object.keys(Game.CLUES).length}`;
      renderHistory(state.history);
    }

    function showChoices(items, onChoose) {
      choices.innerHTML = '';
      items.forEach(function (choice) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-button';
        button.dataset.choiceId = choice.id;
        button.textContent = choice.label;
        button.addEventListener('click', function () { onChoose(choice.id); });
        choices.appendChild(button);
      });
    }

    function setLocked(value) {
      choices.querySelectorAll('button').forEach(function (button) { button.disabled = value; });
      if (question) question.disabled = value;
      if (askButton) askButton.disabled = value;
    }

    async function typeLine(text) {
      const temporary = document.createElement('article');
      temporary.className = 'message verity typing';
      temporary.innerHTML = '<span class="message-meta">VERITY</span><p></p>';
      history.appendChild(temporary);
      const paragraph = temporary.querySelector('p');
      if (reducedMotion()) paragraph.textContent = text;
      else {
        for (let index = 0; index < text.length; index += 1) {
          paragraph.textContent += text[index];
          if (index % timing.typewriterBatch === 0) await delay(timing.typewriterStep);
        }
      }
      history.scrollTop = history.scrollHeight;
    }

    async function playTransition(transition) {
      if (transition.events.some(function (event) { return event.type === 'scare-approach'; })) {
        await playScare();
      }
      if (transition.events.some(function (event) { return event.type === 'forced-correct'; })) {
        await playOnlyMe();
      }
      const hasAngry = transition.events.some(function (event) { return event.portrait === 'angry'; });
      if (hasAngry) {
        setPortrait('angry');
        await hold(reducedMotion() ? timing.speakingHold : timing.angryHold);
      }
      if (transition.events.some(function (event) { return event.type === 'alter-history'; })) {
        const prior = history.querySelector('.message.verity');
        if (prior) {
          prior.classList.add('altered');
          prior.querySelector('.message-meta').textContent = 'VERITY / RECORD ALTERED';
        }
      }
      setPortrait('speaking');
      await typeLine(transition.response);
      await hold(reducedMotion() ? timing.speakingHold : Math.round(timing.speakingHold / 2));
      setPortrait('normal');
    }

    async function playScare() {
      if (!eventOverlay || !eventPortrait) return;
      eventOverlay.hidden = false;
      eventOverlay.className = 'event-overlay scare-active scare-close';
      eventPortrait.src = portraits.normal;
      await hold(reducedMotion() ? 450 : 700);
      eventPortrait.src = portraits.angry;
      eventOverlay.classList.add('scare-angry', 'face-breakdown');
      await hold(reducedMotion() ? 900 : 1800);
      eventOverlay.hidden = true;
      eventOverlay.className = 'event-overlay';
    }

    async function playOnlyMe() {
      if (!eventOverlay || !onlyMeField) return;
      Game.buildOnlyMeField(onlyMeField);
      eventOverlay.hidden = false;
      eventOverlay.className = 'event-overlay only-me-active';
      await hold(reducedMotion() ? 1000 : 2200);
      eventOverlay.hidden = true;
      eventOverlay.className = 'event-overlay';
    }

    async function playMonsterWarning() {
      if (!eventOverlay || !eventPortrait) return;
      if (onlyMeField) onlyMeField.innerHTML = '';
      eventOverlay.hidden = false;
      eventOverlay.className = 'event-overlay monster-warning-active';
      eventPortrait.src = 'assets/verity-monster-distant.png';
      eventPortrait.classList.add('monster-static');
      eventPortrait.alt = '聚光灯远处站着 Verity 的怪物形态';
      if (monsterWarningText) Game.buildMonsterWarningText(monsterWarningText);
      await hold(reducedMotion() ? 6000 : timing.monsterWarningHold);
      eventOverlay.hidden = true;
      eventOverlay.className = 'event-overlay';
      if (onlyMeField) onlyMeField.innerHTML = '';
      eventPortrait.src = portraits.normal;
      eventPortrait.alt = '';
      eventPortrait.classList.remove('monster-static');
    }

    function formatBreakdownTime(seconds) {
      const total = Math.max(0, Math.ceil(seconds));
      const minutes = Math.floor(total / 60);
      const remainder = total % 60;
      return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
    }

    function updateBreakdown(state, onChoose) {
      if (!breakdownScreen) return;
      breakdownTimer.textContent = formatBreakdownTime(state.remaining);
      breakdownScreen.classList.toggle('is-warning', state.remaining <= 30);
      breakdownScreen.classList.toggle('is-critical', state.remaining <= 10);
      breakdownScreen.style.setProperty('--breakdown-errors', state.wrongCount || 0);
      const node = Game.EDITABLE_CONTENT.breakdown.nodes[state.nodeIndex];
      if (breakdownPrompt) breakdownPrompt.textContent = node ? node.prompt : Game.EDITABLE_CONTENT.breakdown.successText;
      if (breakdownResponse) breakdownResponse.textContent = state.lastResponse || '';
      if (breakdownPortrait) breakdownPortrait.src = portraits.angry;
      if (!breakdownChoices) return;
      breakdownChoices.innerHTML = '';
      Game.getBreakdownChoices(state).forEach(function (choice) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.breakdownChoiceId = choice.id;
        button.textContent = choice.label;
        button.addEventListener('click', function () { onChoose(choice.id); });
        breakdownChoices.appendChild(button);
      });
    }

    function showBreakdown(state, onChoose) {
      if (!breakdownScreen) return;
      breakdownScreen.hidden = false;
      breakdownScreen.className = 'breakdown-screen is-active';
      if (huntResult) huntResult.hidden = true;
      updateBreakdown(state, onChoose);
    }

    function hideBreakdown() {
      if (!breakdownScreen) return;
      breakdownScreen.hidden = true;
      breakdownScreen.className = 'breakdown-screen';
    }

    async function playHunt() {
      if (!breakdownScreen) return;
      if (breakdownChoices) breakdownChoices.innerHTML = '';
      breakdownScreen.classList.add('is-hunting');
      await hold(reducedMotion() ? 1300 : 3600);
      breakdownScreen.classList.add('is-hunted');
      if (huntResult) huntResult.hidden = false;
    }

    async function playForcedCorrection(choiceId) {
      const target = choices.querySelector(`[data-choice-id="${choiceId}"]`);
      if (!target) return;
      target.classList.add('forced-choice');
      target.scrollIntoView({ block: 'nearest' });
      await hold(reducedMotion() ? 700 : 1300);
      target.classList.remove('forced-choice');
    }

    function showEnding(ending, onRestart, endingId) {
      root.classList.remove('perfect-ending', 'rage-ending');
      if (endingId === 'letting-go') {
        root.classList.add('perfect-ending');
        setPortrait('normal');
      }
      if (endingId === 'rage') {
        root.classList.add('rage-ending');
        setPortrait('angry');
      }
      choices.innerHTML = '';
      if (question) question.disabled = true;
      if (askButton) askButton.disabled = true;
      endingPanel.hidden = false;
      endingPanel.innerHTML = '';
      const title = document.createElement('h3');
      title.textContent = ending.title;
      const body = document.createElement('p');
      body.textContent = ending.body;
      const restart = document.createElement('button');
      restart.type = 'button';
      restart.textContent = '重新打开盒子';
      restart.addEventListener('click', onRestart);
      endingPanel.append(title, body, restart);
    }

    return { setPortrait, renderState, showChoices, setLocked, showPsychologicalHint, playTransition, playForcedCorrection, showEnding, playMonsterWarning, showBreakdown, updateBreakdown, hideBreakdown, playHunt };
  };
}(window));
