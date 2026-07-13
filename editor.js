(function () {
  const STORAGE = 'verity-editor-config';
  const Game = window.VerityGame;
  const area = document.querySelector('#form-area');
  const status = document.querySelector('#save-status');
  const previewHint = document.querySelector('#preview-hint');
  const config = {
    timing: Object.assign({}, Game.EDITABLE_CONTENT.timing),
    psychology: { whispers: Game.EDITABLE_CONTENT.psychology.whispers.slice() },
    randomReplies: Game.EDITABLE_CONTENT.randomReplies.slice(),
    breakdown: { duration: Game.EDITABLE_CONTENT.breakdown.duration, wrongPenalties: Game.EDITABLE_CONTENT.breakdown.wrongPenalties.slice() },
    assets: Object.assign({}, Game.EDITABLE_CONTENT.assets || {}),
    chapters: clone(Game.EDITABLE_CONTENT.chapters || []),
    customQuestions: []
  };
  Object.keys(Game.STORY).forEach(function (chapter) {
    Game.STORY[chapter].choices.forEach(function (question) {
      config.customQuestions.push({ id: question.id, chapter: Number(chapter), label: question.label, response: question.response, effects: question.effects || {}, nextScene: question.nextScene, advanceChapter: question.advanceChapter });
    });
  });

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function save() {
    localStorage.setItem(STORAGE, JSON.stringify(config));
    status.textContent = `已保存 ${new Date().toLocaleTimeString()}。游戏页面重新打开后读取新配置。`;
  }
  function field(label, value, onInput, type) {
    const wrap = document.createElement('div'); wrap.className = 'field';
    const labelEl = document.createElement('label'); labelEl.textContent = label; wrap.appendChild(labelEl);
    const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') input.type = type || 'text'; input.value = value == null ? '' : value;
    input.addEventListener('input', function () { onInput(input.value); preview(); }); wrap.appendChild(input); return wrap;
  }
  function card(title) { const el = document.createElement('div'); el.className = 'card'; const h = document.createElement('h3'); h.textContent = title; el.appendChild(h); return el; }
  function fileField(label, key, accept) {
    const wrap = document.createElement('div'); wrap.className = 'field'; const text = document.createElement('label'); text.textContent = label; wrap.appendChild(text);
    const input = document.createElement('input'); input.type = 'file'; input.accept = accept; input.addEventListener('change', function () { const file = input.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function () { config.assets[key] = reader.result; status.textContent = `${label} 已载入，点击保存配置写入浏览器。`; }; reader.readAsDataURL(file); }); wrap.appendChild(input); return wrap;
  }
  function renderOverview() {
    area.innerHTML = '<h2>总览</h2><p class="section-copy">所有修改保存在当前浏览器。保存后重新打开游戏页面即可读取配置，也可以随时导出 JSON 给其他开发者。</p>';
    const c = card('当前配置'); c.appendChild(field('配置名称', 'Verity 心理恐怖版本', function () {}));
    const info = document.createElement('p'); info.className = 'section-copy'; info.textContent = `${config.chapters.length + 4} 个章节 / ${config.customQuestions.length} 个问题 / ${config.psychology.whispers.length} 条心理暗示 / ${Object.keys(config.assets).length} 个资源覆盖`; c.appendChild(info); area.appendChild(c);
    const actions = document.createElement('div'); actions.className = 'card-actions'; const open = document.createElement('a'); open.href = 'index.html'; open.textContent = '打开游戏预览'; actions.appendChild(open); area.appendChild(actions);
  }
  function renderText() {
    area.innerHTML = '<h2>文字与心理暗示</h2><p class="section-copy">修改 Verity 的随机回复和低频心理暗示。每三次问答显示一条暗示。</p>';
    const c = card('随机问题回复'); c.appendChild(field('每行一条回复', config.randomReplies.join('\n'), function (v) { config.randomReplies = v.split('\n').map(s => s.trim()).filter(Boolean); }, 'textarea')); area.appendChild(c);
    const w = card('心理暗示'); w.appendChild(field('每行一条暗示', config.psychology.whispers.join('\n'), function (v) { config.psychology.whispers = v.split('\n').map(s => s.trim()).filter(Boolean); }, 'textarea')); area.appendChild(w);
    const b = card('完全崩坏预言'); b.appendChild(field('倒计时秒数', config.breakdown.duration, function (v) { config.breakdown.duration = Math.max(1, Number(v) || 90); }, 'number')); area.appendChild(b);
  }
  function renderEndings() {
    area.innerHTML = '<h2>结局预览</h2><p class="section-copy">直接打开终局画面检查文字、人物状态、音频和动画。预览不会改变正式剧情条件。</p>';
    const grid = document.createElement('div');
    grid.className = 'ending-preview-grid';
    Game.createEndingPreviewLinks(grid, Game.ENDINGS);
    area.appendChild(grid);
  }
  function renderQuestions() {
    area.innerHTML = '<h2>问题与剧情</h2><p class="section-copy">每个问题都可以修改文字、回答和所在章节。删除后不会再出现在游戏中。</p>';
    const toolbar = document.createElement('div'); toolbar.className = 'question-toolbar'; const add = document.createElement('button'); add.textContent = '新增问题'; add.onclick = function () { config.customQuestions.push({ id: `custom-${Date.now()}`, chapter: 1, label: '新的问题', response: '新的回答', effects: {}, nextScene: 'arrival' }); renderQuestions(); }; toolbar.appendChild(add); area.appendChild(toolbar);
    const list = document.createElement('div'); list.className = 'question-list';
    config.customQuestions.forEach(function (q, index) {
      const c = card(`${index + 1}. ${q.id}`); c.classList.add('question-card'); c.dataset.chapter = q.chapter;
      c.appendChild(field('问题文字', q.label, v => q.label = v)); c.appendChild(field('Verity 回答', q.response, v => q.response = v, 'textarea'));
      const row = document.createElement('div'); row.className = 'field-row'; const chapter = field('章节编号', q.chapter, v => q.chapter = Math.min(99, Math.max(1, Number(v) || 1)), 'number'); row.appendChild(chapter); const id = field('问题 ID', q.id, v => q.id = v.trim()); row.appendChild(id); c.appendChild(row);
      const effectsRow = document.createElement('div'); effectsRow.className = 'field-row'; effectsRow.appendChild(field('信任变化', (q.effects && q.effects.trust) || 0, v => { q.effects = q.effects || {}; q.effects.trust = Number(v) || 0; }, 'number')); effectsRow.appendChild(field('异常变化', (q.effects && q.effects.anomaly) || 0, v => { q.effects = q.effects || {}; q.effects.anomaly = Number(v) || 0; }, 'number')); c.appendChild(effectsRow);
      c.appendChild(field('推进到章节（留空则不推进）', q.advanceChapter || '', v => q.advanceChapter = v ? Math.max(1, Number(v) || 1) : undefined, 'number'));
      const actions = document.createElement('div'); actions.className = 'card-actions'; const remove = document.createElement('button'); remove.className = 'danger'; remove.textContent = '删除问题'; remove.onclick = function () { config.customQuestions.splice(index, 1); renderQuestions(); }; actions.appendChild(remove); c.appendChild(actions); list.appendChild(c);
    }); area.appendChild(list);
  }
  function renderChapters() {
    area.innerHTML = '<h2>章节管理</h2><p class="section-copy">新增章节会在游戏状态机中注册。章节编号应连续且不要与现有章节重复。</p>';
    const toolbar = document.createElement('div'); toolbar.className = 'question-toolbar'; const add = document.createElement('button'); add.textContent = '新增章节'; add.onclick = function () { const number = Math.max(4, ...config.chapters.map(c => Number(c.number) || 0)) + 1; config.chapters.push({ number: number, id: `chapter-${number}`, title: `第${number}章 / 新章节`, intro: '新的章节开场白。', choices: [{ id: `chapter-${number}-q1`, label: '新的问题', response: '新的回答', effects: {}, nextScene: 'custom' }] }); renderChapters(); }; toolbar.appendChild(add); area.appendChild(toolbar);
    config.chapters.forEach(function (chapter, index) { const c = card(`第 ${chapter.number} 章`); c.appendChild(field('章节标题', chapter.title, v => chapter.title = v)); c.appendChild(field('章节开场白', chapter.intro, v => chapter.intro = v, 'textarea')); const row = document.createElement('div'); row.className = 'field-row'; row.appendChild(field('章节 ID', chapter.id, v => chapter.id = v)); row.appendChild(field('下一章编号', chapter.nextChapter || Number(chapter.number) + 1, v => chapter.nextChapter = Math.max(1, Number(v) || 1), 'number')); c.appendChild(row); const q = document.createElement('p'); q.className = 'section-copy'; q.textContent = `${(chapter.choices || []).length} 个问题`; c.appendChild(q); const actions = document.createElement('div'); actions.className = 'card-actions'; const copy = document.createElement('button'); copy.textContent = '复制章节'; copy.onclick = function () { const duplicate = clone(chapter); duplicate.number = Math.max(15, ...config.chapters.map(item => Number(item.number) || 0)) + 1; duplicate.id = `${chapter.id}-copy-${duplicate.number}`; duplicate.title = `${chapter.title}（副本）`; config.chapters.push(duplicate); renderChapters(); }; actions.appendChild(copy); const remove = document.createElement('button'); remove.className = 'danger'; remove.textContent = '删除章节'; remove.onclick = function () { config.chapters.splice(index, 1); renderChapters(); }; actions.appendChild(remove); c.appendChild(actions); area.appendChild(c); });
  }
  function renderAudio() {
    area.innerHTML = '<h2>音频与图片</h2><p class="section-copy">可以填写本地相对路径或网络地址。文件选择会转为浏览器本地配置，适合快速原型预览。</p>';
    const c = card('音频路径');
    ['opening', 'prophecy', 'shout', 'victory'].forEach(function (key) { c.appendChild(field(`${key} 音频路径`, config.assets[`${key}Audio`] || `assets/verity-${key}.mpeg`, v => config.assets[`${key}Audio`] = v)); c.appendChild(fileField(`${key} 选择本地音频`, `${key}Audio`, 'audio/*')); }); area.appendChild(c);
    const p = card('图片路径'); ['normal', 'speaking', 'angry', 'monsterDistant', 'monsterHunt'].forEach(function (key) { p.appendChild(field(`${key} 图片路径`, config.assets[`${key}Image`] || '', v => config.assets[`${key}Image`] = v)); p.appendChild(fileField(`${key} 选择本地图片`, `${key}Image`, 'image/*')); }); area.appendChild(p);
  }
  function renderAnimation() {
    area.innerHTML = '<h2>动画配置</h2><p class="section-copy">数值越大，动画越慢。改动后保存并重新打开游戏预览。</p>';
    const c = card('时间与强度');
    [['monsterWarningHold', '聚光灯事件时长（毫秒）'], ['angryHold', '愤怒停留（毫秒）'], ['speakingHold', '说话停留（毫秒）'], ['psychologicalHintEvery', '心理暗示间隔（问答次数）']].forEach(function (item) { c.appendChild(field(item[1], config.timing[item[0]], v => config.timing[item[0]] = Math.max(1, Number(v) || 1), 'number')); });
    c.appendChild(field('错误扣时（逗号分隔）', config.breakdown.wrongPenalties.join(','), v => { config.breakdown.wrongPenalties = v.split(',').map(Number).filter(n => n > 0); })); area.appendChild(c);
  }
  function render(section) { ({ overview: renderOverview, endings: renderEndings, text: renderText, chapters: renderChapters, questions: renderQuestions, audio: renderAudio, animation: renderAnimation }[section] || renderOverview)(); }
  function preview() { previewHint.textContent = config.psychology.whispers[0] || ''; }
  document.querySelectorAll('.nav-item').forEach(function (button) { button.addEventListener('click', function () { document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('is-active')); button.classList.add('is-active'); render(button.dataset.section); }); });
  document.querySelector('#save').onclick = save;
  document.querySelector('#export').onclick = function () { const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'verity-editor-config.json'; a.click(); URL.revokeObjectURL(a.href); status.textContent = '配置已导出。'; };
  document.querySelector('#import').onchange = function (event) { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function () { try { Object.assign(config, JSON.parse(reader.result)); save(); render('overview'); } catch (error) { status.textContent = '导入失败：JSON 格式不正确。'; } }; reader.readAsText(file); };
  document.querySelector('#reset').onclick = function () { localStorage.removeItem(STORAGE); location.reload(); };
  render('overview'); preview();
}());
