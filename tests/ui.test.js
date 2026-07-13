test('UI maps all three portrait states to supplied assets', function () {
  const fixture = document.createElement('div');
  fixture.innerHTML = '<img id="portrait"><p id="speaker"></p><div id="dialogue-history"></div><div id="choices"></div><span id="status-trust"></span><span id="status-anomaly"></span><span id="status-clues"></span><div id="ending-panel"></div><input id="free-question"><button id="ask-button"></button>';
  const ui = VerityGame.createUI(fixture);
  ui.setPortrait('normal');
  ok(fixture.querySelector('#portrait').src.includes('verity-normal.png'));
  ui.setPortrait('speaking');
  ok(fixture.querySelector('#portrait').src.includes('verity-speaking.png'));
  ui.setPortrait('angry');
  ok(fixture.querySelector('#portrait').src.includes('verity-angry.png'));
});

test('UI renders choices and locks question controls', function () {
  const fixture = document.createElement('div');
  fixture.innerHTML = '<img id="portrait"><p id="speaker"></p><div id="dialogue-history"></div><div id="choices"></div><span id="status-trust"></span><span id="status-anomaly"></span><span id="status-clues"></span><div id="ending-panel"></div><input id="free-question"><button id="ask-button"></button>';
  const ui = VerityGame.createUI(fixture);
  ui.showChoices([{ id: 'x', label: '问题' }], function () {});
  equal(fixture.querySelectorAll('#choices button').length, 1);
  ui.setLocked(true);
  equal(fixture.querySelector('#free-question').disabled, true);
  equal(fixture.querySelector('#choices button').disabled, true);
});

test('UI shows editable psychological hints only at the configured interval', function () {
  const fixture = document.createElement('div');
  fixture.innerHTML = '<img id="portrait"><p id="speaker"></p><div id="dialogue-history"></div><p id="psychological-hint"></p><div id="choices"></div><span id="status-trust"></span><span id="status-anomaly"></span><span id="status-clues"></span><div id="ending-panel"></div><input id="free-question"><button id="ask-button"></button>';
  const ui = VerityGame.createUI(fixture);
  ui.showPsychologicalHint(5);
  equal(fixture.querySelector('#psychological-hint').textContent, '');
  ui.showPsychologicalHint(7);
  ok(fixture.querySelector('#psychological-hint').textContent.length > 0);
  ok(fixture.querySelector('#psychological-hint').classList.contains('is-visible'));
});

test('UI renders breakdown countdown angry portrait and exactly two choices', function () {
  const fixture = document.createElement('div');
  fixture.innerHTML = '<img id="portrait"><p id="speaker"></p><div id="dialogue-history"></div><div id="choices"></div><span id="status-trust"></span><span id="status-anomaly"></span><span id="status-clues"></span><div id="ending-panel"></div><input id="free-question"><button id="ask-button"></button><div id="breakdown-screen" hidden><time id="breakdown-timer"></time><img id="breakdown-portrait"><p id="breakdown-prompt"></p><p id="breakdown-response"></p><div id="breakdown-choices"></div></div>';
  const ui = VerityGame.createUI(fixture);
  const state = VerityGame.createBreakdownState();
  ui.showBreakdown(state, function () {});
  equal(fixture.querySelector('#breakdown-screen').hidden, false);
  equal(fixture.querySelector('#breakdown-timer').textContent, '01:30');
  ok(fixture.querySelector('#breakdown-portrait').src.includes('verity-angry.png'));
  equal(fixture.querySelectorAll('#breakdown-choices button').length, 2);
});

test('UI updates breakdown warning state and can hide the chapter', function () {
  const fixture = document.createElement('div');
  fixture.innerHTML = '<img id="portrait"><p id="speaker"></p><div id="dialogue-history"></div><div id="choices"></div><span id="status-trust"></span><span id="status-anomaly"></span><span id="status-clues"></span><div id="ending-panel"></div><input id="free-question"><button id="ask-button"></button><div id="breakdown-screen" hidden><time id="breakdown-timer"></time><img id="breakdown-portrait"><p id="breakdown-prompt"></p><p id="breakdown-response"></p><div id="breakdown-choices"></div></div>';
  const ui = VerityGame.createUI(fixture);
  const state = Object.assign(VerityGame.createBreakdownState(), { remaining: 9, wrongCount: 3 });
  ui.showBreakdown(state, function () {});
  ok(fixture.querySelector('#breakdown-screen').classList.contains('is-critical'));
  ui.hideBreakdown();
  equal(fixture.querySelector('#breakdown-screen').hidden, true);
});

test('UI applies distinct perfect and rage ending modes', function () {
  const fixture = document.createElement('div');
  fixture.innerHTML = '<img id="portrait"><p id="speaker"></p><div id="dialogue-history"></div><div id="choices"></div><span id="status-trust"></span><span id="status-anomaly"></span><span id="status-clues"></span><div id="ending-panel"></div><input id="free-question"><button id="ask-button"></button>';
  const ui = VerityGame.createUI(fixture);
  ui.showEnding({ title: '完成', body: '完成内容' }, function () {}, 'letting-go');
  ok(fixture.classList.contains('perfect-ending'));
  ui.showEnding({ title: '愤怒', body: '愤怒内容' }, function () {}, 'rage');
  ok(fixture.classList.contains('rage-ending'));
});

test('ONLY ME field is built on all four screen edges', function () {
  const field = document.createElement('div');
  VerityGame.buildOnlyMeField(field);
  deepEqual(Array.from(field.children).map(function (edge) { return edge.className; }), [
    'only-me-edge edge-top', 'only-me-edge edge-right',
    'only-me-edge edge-bottom', 'only-me-edge edge-left'
  ]);
  equal(field.querySelectorAll('strong').length, 20);
});

test('monster warning clears stale ONLY ME content before it starts', function () {
  const fixture = document.createElement('div');
  fixture.innerHTML = '<img id="portrait"><p id="speaker"></p><div id="dialogue-history"></div><div id="choices"></div><span id="status-trust"></span><span id="status-anomaly"></span><span id="status-clues"></span><div id="ending-panel"></div><input id="free-question"><button id="ask-button"></button><div id="event-overlay" hidden><img id="event-portrait"><strong id="monster-warning-text"></strong><div id="only-me-field"><strong>ONLY ME</strong></div></div>';
  const ui = VerityGame.createUI(fixture);
  ui.playMonsterWarning();
  equal(fixture.querySelector('#only-me-field').innerHTML, '');
  equal(fixture.querySelector('#event-overlay').className, 'event-overlay monster-warning-active');
});

test('monster warning builds red glitch text with ten horizontal slices', function () {
  const warning = document.createElement('strong');
  VerityGame.buildMonsterWarningText(warning);
  equal(warning.dataset.text, 'HE IS COMING');
  equal(warning.querySelector('.glitch-main').textContent, 'HE IS COMING');
  equal(warning.querySelectorAll('.glitch-slice').length, 10);
});

test('monster warning marks the distant portrait as centered and static', function () {
  const fixture = document.createElement('div');
  fixture.innerHTML = '<img id="portrait"><p id="speaker"></p><div id="dialogue-history"></div><div id="choices"></div><span id="status-trust"></span><span id="status-anomaly"></span><span id="status-clues"></span><div id="ending-panel"></div><input id="free-question"><button id="ask-button"></button><div id="event-overlay" hidden><img id="event-portrait"><strong id="monster-warning-text"></strong><div id="only-me-field"></div></div>';
  const ui = VerityGame.createUI(fixture);
  ui.playMonsterWarning();
  ok(fixture.querySelector('#event-portrait').classList.contains('monster-static'));
});

test('developer tools expose all five ending previews', function () {
  const panel = document.createElement('div');
  const toggle = document.createElement('button');
  const requested = [];
  const tools = VerityGame.createDeveloperTools({
    panel: panel,
    toggle: toggle,
    endings: VerityGame.ENDINGS,
    onPreview: function (id) { requested.push(id); }
  });
  equal(panel.querySelectorAll('button[data-ending-id]').length, 5);
  tools.open();
  equal(panel.hidden, false);
  panel.querySelector('button[data-ending-id="rage"]').click();
  deepEqual(requested, ['rage']);
});

test('ending preview helpers build safe links and reject unknown endings', function () {
  equal(VerityGame.endingPreviewUrl('rage'), 'index.html?previewEnding=rage');
  equal(VerityGame.getEndingPreviewId('?previewEnding=letting-go', VerityGame.ENDINGS), 'letting-go');
  equal(VerityGame.getEndingPreviewId('?previewEnding=not-real', VerityGame.ENDINGS), null);
});

test('event preview helpers allow only approved developer events', function () {
  equal(VerityGame.eventPreviewUrl('hunt-five'), 'index.html?previewEvent=hunt-five');
  equal(VerityGame.getEventPreviewId('?previewEvent=hunt-five', ['monster-warning', 'breakdown', 'hunt-five']), 'hunt-five');
  equal(VerityGame.getEventPreviewId('?previewEvent=not-real', ['monster-warning', 'breakdown', 'hunt-five']), null);
});

test('ending preview link builder exposes five endings and the complete breakdown ending', function () {
  const container = document.createElement('div');
  VerityGame.createEndingPreviewLinks(container, VerityGame.ENDINGS);
  equal(container.querySelectorAll('a[data-ending-preview]').length, 5);
  const rageLink = container.querySelector('a[data-ending-preview="rage"]');
  equal(rageLink.getAttribute('href'), 'index.html?previewEnding=rage');
  equal(rageLink.getAttribute('target'), null);
  const breakdownLink = container.querySelector('a[data-event-ending-preview="hunt-five"]');
  ok(breakdownLink);
  equal(breakdownLink.getAttribute('href'), 'index.html?previewEvent=hunt-five');
  equal(breakdownLink.closest('article').querySelector('h3').textContent, '完全崩坏结局');
});

test('developer tools expose monster warning breakdown and five second hunt previews', function () {
  const panel = document.createElement('div');
  const toggle = document.createElement('button');
  const requested = [];
  VerityGame.createDeveloperTools({
    panel: panel,
    toggle: toggle,
    endings: VerityGame.ENDINGS,
    onPreview: function () {},
    onEventPreview: function (id) { requested.push(id); }
  });
  equal(panel.querySelectorAll('button[data-event-preview]').length, 3);
  panel.querySelector('button[data-event-preview="monster-warning"]').click();
  panel.querySelector('button[data-event-preview="breakdown"]').click();
  panel.querySelector('button[data-event-preview="hunt-five"]').click();
  deepEqual(requested, ['monster-warning', 'breakdown', 'hunt-five']);
});

test('warning controller reveals title screen and reports reduced effects', function () {
  const warning = document.createElement('section');
  const start = document.createElement('section');
  start.hidden = true;
  const button = document.createElement('button');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = true;
  warning.append(button, checkbox);
  const values = [];
  VerityGame.createWarningController({
    warningScreen: warning,
    startScreen: start,
    continueButton: button,
    reduceEffects: checkbox,
    onContinue: function (value) { values.push(value); }
  });
  button.click();
  equal(warning.hidden, true);
  equal(start.hidden, false);
  deepEqual(values, [true]);
});
