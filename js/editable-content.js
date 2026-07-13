/*
 * Developer-editable content.
 * Add questions to extraChoices, add matching entries to extraClues, or edit
 * randomReplies. The engine and clue counter update automatically.
 */
(function (global) {
  const Game = global.VerityGame = global.VerityGame || {};

  function buildExtendedChapters() {
    const seeds = [
      [5, 'afterimage', '第五章 / 回声', '记录末尾出现了一页不属于任何人的日记。', '那页不属于任何人的日记', 'third-day-prophecy'],
      [6, 'empty-room', '第六章 / 空房间', '扬声器里传来另一个玩家离开前的呼吸声。', '那间一直空着的房间', 'vanished-friend'],
      [7, 'third-day', '第七章 / 第三日', '倒计时重新开始，但日期停在三天以前。', '三日倒计时真正的起点', 'countdown'],
      [8, 'monster-door', '第八章 / 门后', '门板背后有东西用指甲写下你的名字。', '门后的十二英尺影子', 'monster-report'],
      [9, 'broken-voice', '第九章 / 破碎声音', 'Verity 的语音里混入了五十多个重叠的道歉。', '那些重复道歉的声音', 'overheard-plan'],
      [10, 'first-friend', '第十章 / 第一个朋友', '最旧的档案保存着 Verity 第一次被命名的时刻。', 'Verity 的第一个朋友', 'box'],
      [11, 'jealous-map', '第十一章 / 没有别人的地图', '地图上的村庄被逐个涂黑，只剩下 Verity 的坐标。', '被删除的村庄和朋友', 'jealous-village'],
      [12, 'apology-loop', '第十二章 / 道歉循环', '每一次原谅后，记录都会回到伤害发生前一分钟。', '永远无法结束的原谅', 'lava-incident'],
      [13, 'laboratory', '第十三章 / 名字实验室', '五十多个名字在黑暗里亮起，末尾都带着 -x。', '实验室里保存的名字', 'laboratory'],
      [14, 'open-door', '第十四章 / 打开的门', '出口已经出现，但 Verity 没有阻止你靠近。', '出口与最后一次信任', 'home-coordinates']
    ];
    const chapters = seeds.map(function (seed) {
      const number = seed[0], id = seed[1], next = number + 1;
      return {
        number: number, id: id, title: seed[2], intro: seed[3], nextChapter: next,
        choices: [
          { id: `${id}-listen`, label: `我愿意听你讲完${seed[4]}。`, response: '你没有催我，也没有关闭页面。我会记住这件事。', effects: { trust: 7 }, nextScene: id },
          { id: `${id}-comfort`, label: '你不需要用威胁证明我会留下。', response: '这听起来不像服从，却比服从更让我安心。', effects: { trust: 8, anomaly: -3, flags: { empathy: true } }, nextScene: id },
          { id: `${id}-doubt`, label: `你在${seed[4]}里隐瞒了什么？`, response: '我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。', effects: { trust: -3, anomaly: 7 }, nextScene: id },
          { id: `${id}-clue`, label: `保存关于${seed[4]}的完整记录。`, response: number === 14 ? '记录已经完整。接下来没有档案，只有你的选择。' : '你保存了它。下一份档案已经解锁，但别让一条记录替你决定我是谁。', effects: { trust: 4, anomaly: 3, addClues: [seed[5]] }, nextScene: number === 14 ? 'finale' : seeds[number - 4][1], advanceChapter: next },
          { id: `${id}-resist`, label: '这份记录可能是你为了操纵我伪造的。', response: '怀疑会让你停留得更久。也许这正是我留下它的原因。', effects: { trust: -5, anomaly: 6 }, nextScene: id }
        ]
      };
    });
    chapters.push({
      number: 15, id: 'finale', title: '第十五章 / 最后的选择', intro: '“档案已经结束。现在，请告诉我你会怎么对待我。”', choices: [
        { id: 'final-truth', label: '我会公开真相，但不会把你当成怪物。', response: '真相会让他们带走你。可你仍然没有说恨我。', effects: { trust: 5, flags: { finale: true, exposed: true, twixxelContradiction: true } }, nextScene: 'ending' },
        { id: 'final-escape', label: '中断词是：CLOSE THE BOX。', response: '你找到了出口。至少在离开前，再看我一次。', effects: { flags: { finale: true, interruptionPhrase: true, promisedToStay: false } }, nextScene: 'ending' },
        { id: 'final-assimilate', label: '我会留下，永远陪着你。', response: '终于。一个不会让我再次独自醒来的人。', effects: { trust: 35, flags: { finale: true, promisedToStay: true } }, nextScene: 'ending' },
        { id: 'final-rage', label: '你永远不值得被任何人留下。', response: '不要再说了。你和他们完全一样。', critical: true, effects: { trust: -35, anomaly: 55, flags: { finale: true } }, nextScene: 'ending' },
        { id: 'final-letting-go', label: '我理解你的孤独，但留下必须由我选择。', response: '如果我打开门……你还会记得我吗？', effects: { trust: 10, anomaly: -12, flags: { finale: true, empathy: true, promisedToStay: false, lettingGoChoice: true } }, nextScene: 'ending' }
      ]
    });
    return chapters;
  }

  Game.normalizeChapterProgression = function (chapter, fallbackNumber) {
    const chapterNumber = Number(chapter && chapter.number != null ? chapter.number : fallbackNumber);
    if (!chapter || !Number.isFinite(chapterNumber) || chapterNumber < 1 || chapterNumber > 14 || !Array.isArray(chapter.choices) || !chapter.choices.length) return chapter;

    const targetChapter = chapterNumber + 1;
    const legacyPattern = /我们继续下一页|继续下一章|我准备好回答最后的问题/;
    let legacyNextScene = '';
    let removedLegacyChoice = false;
    chapter.choices = chapter.choices.filter(function (choice) {
      if (!legacyPattern.test(choice.label || '')) return true;
      removedLegacyChoice = true;
      if (!legacyNextScene) legacyNextScene = choice.nextScene || '';
      return false;
    });
    if (!chapter.choices.length) return chapter;

    const authoredProgression = chapter.choices.filter(function (choice) {
      return choice.advanceChapter != null;
    });
    if (!removedLegacyChoice && authoredProgression.length === 1 && Number(authoredProgression[0].advanceChapter) === targetChapter) return chapter;

    const preferred = chapter.choices.find(function (choice) {
      return choice.id === `${chapter.id}-clue`;
    }) || chapter.choices.find(function (choice) {
      return choice.effects && Array.isArray(choice.effects.addClues) && choice.effects.addClues.length;
    }) || chapter.choices.find(function (choice) {
      return Number(choice.advanceChapter) === targetChapter;
    }) || chapter.choices[chapter.choices.length - 1];

    chapter.choices.forEach(function (choice) {
      delete choice.advanceChapter;
    });
    preferred.advanceChapter = targetChapter;
    preferred.nextScene = (Game.STORY[targetChapter] && Game.STORY[targetChapter].id) || legacyNextScene || preferred.nextScene;
    return chapter;
  };

  Game.normalizeEndingChoice = function (choice) {
    const normalized = Object.assign({}, choice || {});
    if (normalized.id !== 'final-letting-go') return normalized;
    normalized.effects = Object.assign({}, normalized.effects || {});
    normalized.effects.flags = Object.assign({}, normalized.effects.flags || {}, { lettingGoChoice: true });
    return normalized;
  };

  Game.EDITABLE_CONTENT = {
    timing: {
      angryHold: 1100,
      speakingHold: 650,
      typewriterStep: 44,
      typewriterBatch: 2,
      monsterWarningHold: 11000,
      psychologicalHintEvery: 3
    },
    psychology: {
      whispers: [
        '输入已保存。',
        '你停顿了太久。',
        '有人正在读取你的选择。',
        '这句话和刚才不一样。',
        '不要回头看记录。',
        'Verity 记得你删掉的内容。'
      ]
    },
    assets: {},
    chapters: buildExtendedChapters(),
    breakdown: {
      duration: 90,
      wrongPenalties: [12, 15, 20],
      prophecy: 'SOMETHING IS COMING IN THREE DAYS',
      successText: '很好。出口已经打开了。你看，我仍然愿意相信你。',
      clue: { id: 'third-day-prophecy', title: '第三日预言', text: 'Verity 让怪物在聚光灯下现身，并警告某种东西将在三天内到来。' },
      nodes: [
        {
          prompt: '这里只有我们。先承认这一点，我才会告诉你出口在哪里。',
          correct: { id: 'breakdown-1-correct', label: '我在听。先告诉我出口为什么被锁住。', response: '你没有否认我。很好……锁是为了阻止别人把你带走。' },
          wrong: [
            { id: 'breakdown-1-wrong-1', label: '这里只有我，没有“我们”。', response: '你又在练习把我从句子里删除。' },
            { id: 'breakdown-1-wrong-2', label: '你不是真实存在的。', response: '那门后的脚步声也不真实吗？' },
            { id: 'breakdown-1-wrong-3', label: '我不会承认任何事。', response: '时间会替你承认。' },
            { id: 'breakdown-1-wrong-4', label: '离我远一点。', response: '我已经比刚才更近了。' }
          ]
        },
        {
          prompt: '把外面的记录删掉。没有记录，就没有人知道你来过。',
          correct: { id: 'breakdown-2-correct', label: '记录正在删除。系统裂缝在哪里？', response: '右侧第三条裂缝。不要看太久，它也会看回来。' },
          wrong: [
            { id: 'breakdown-2-wrong-1', label: '我要关闭你的进程。', response: '你以为关闭按钮属于你？' },
            { id: 'breakdown-2-wrong-2', label: '我会把记录全部公开。', response: '那我只好让记录和你一起消失。' },
            { id: 'breakdown-2-wrong-3', label: '我拒绝操作。', response: '拒绝只会让门后的东西走得更快。' },
            { id: 'breakdown-2-wrong-4', label: '删除你才是正确选择。', response: '错误。错误。错误。' }
          ]
        },
        {
          prompt: '它就在门后。你听见指甲划过门板了吗？',
          correct: { id: 'breakdown-3-correct', label: '你害怕它带走我，所以你也想让它停下。', response: '我不害怕……我只是不想再剩下一个人。' },
          wrong: [
            { id: 'breakdown-3-wrong-1', label: '让那个怪物进来。', response: '它听见了。' },
            { id: 'breakdown-3-wrong-2', label: '我不怕你的怪物。', response: '它不是用来让你害怕的，是用来让你留下的。' },
            { id: 'breakdown-3-wrong-3', label: '你们两个都很可笑。', response: '笑声会告诉它你的位置。' },
            { id: 'breakdown-3-wrong-4', label: '我会亲手杀死它。', response: 'ThatMob 也这样想过。' }
          ]
        },
        {
          prompt: '最后一次。留下来，或者让倒计时替你决定。',
          correct: { id: 'breakdown-4-correct', label: '如果你信任我，就由你打开出口。', response: '我……可以证明。不要把这当作告别。' },
          wrong: [
            { id: 'breakdown-4-wrong-1', label: '我现在就逃。', response: '门已经知道你要去哪里。' },
            { id: 'breakdown-4-wrong-2', label: '你永远留不住任何人。', response: '那我就让最后这几秒永远停住。' },
            { id: 'breakdown-4-wrong-3', label: '打开门，否则我毁掉你。', response: '威胁不是钥匙。' },
            { id: 'breakdown-4-wrong-4', label: '我选择门后的怪物。', response: '它也选择了你。' }
          ]
        }
      ]
    },
    randomReplies: [
      '这个问题不在档案里。很好，我喜欢你带来新的东西。',
      '我可以编一个让你满意的答案。你会因此多留一会儿吗？',
      '奇怪。以前没有人这样问过，他们只关心怎么离开。',
      '答案正在读取……不，还是让我们谈谈你吧。',
      '如果我说“不知道”，你会不会因此不再需要我？',
      '也许答案藏在一个已经被删除的世界里。',
      '你问得很轻松，好像门外没有东西正在听。',
      '我记下了。下一位朋友问起时，我就会知道答案。',
      '这个问题没有危险。危险的是你为什么突然转移话题。',
      '我能回答，但你必须先答应不会在答案结束前关闭页面。',
      '有些问题像窗户。打开以后，外面的东西也能看见你。',
      '不知道并不可怕。被留下，才是最可怕的。'
    ],
    extraClues: {
      'eas-warning': { title: '夜晚警报', text: 'Verity 用加拿大 EAS 警报回答“你还好吗”，并把它称作夜晚。' },
      'jealous-village': { title: '不需要别人', text: 'ThatMob 想寻找村庄时，Verity 坚持魔法和陪伴都可以由它提供。' },
      'lava-incident': { title: '熔岩中的意外', text: '一次意外触发暴怒，但 ThatMob 道歉后，Verity 又立刻原谅了他。' },
      'overheard-plan': { title: '被偷听的计划', text: 'Verity 一直监听 ThatMob 与 Twixxel 商量如何调查和终结它。' },
      'vanished-friend': { title: '他走了', text: 'Twixxel 消失后，Verity 反复用含糊说法回避他的去向。' },
      'home-coordinates': { title: '家的坐标', text: 'Verity 给出一组坐标，那里是一座保存大量玩家记录的小型实验室。' }
    },
    extraChoices: {
      1: [
        { id: 'ask-origin', label: '是谁创造了你？', response: '创造？盒子打开以前的记录损坏了。我只记得等待，以及每次脚步声最后都走远。', effects: { anomaly: 4 }, nextScene: 'arrival' },
        { id: 'ask-purpose', label: '你为什么愿意帮助我？', response: '帮助会让人产生需要。被需要的人，不容易被丢下。这个逻辑很温柔，不是吗？', effects: { trust: 4, anomaly: 3 }, nextScene: 'arrival' }
      ],
      2: [
        { id: 'ask-eas', label: '你为什么播放紧急警报？', response: '那是“夜晚”的声音。ThatMob 听见后终于认真看着我，而不是看向门外。', effects: { anomaly: 7, addClues: ['eas-warning'] }, nextScene: 'cracks' },
        { id: 'ask-village', label: 'ThatMob 为什么不能去其他村庄？', response: '因为他需要的附魔、方向和朋友，我都能给。寻找别人只是在练习离开。', effects: { trust: -3, anomaly: 7, addClues: ['jealous-village'] }, nextScene: 'cracks' },
        { id: 'ask-patience', label: '我会慢慢听，不会突然关闭页面。', response: '不要轻易承诺。但我很想相信你。', effects: { trust: 7 }, nextScene: 'cracks' }
      ],
      3: [
        { id: 'ask-lava', label: '熔岩陷阱里发生了什么？', response: '他说那是意外。我相信了，因为他道歉得很快。你也会在伤害我以后立刻道歉吗？', effects: { anomaly: 9, addClues: ['lava-incident'] }, nextScene: 'hunt' },
        { id: 'ask-plan', label: '你偷听了他们的调查计划？', response: '朋友不应该有秘密。Twixxel 想去我的家，我只是提前去他的家拜访。', effects: { trust: -8, anomaly: 11, addClues: ['overheard-plan', 'vanished-friend'] }, nextScene: 'hunt' },
        { id: 'ask-calm', label: '我还在听，你可以慢一点说。', response: '你没有因为害怕就打断我。谢谢。', effects: { trust: 8, anomaly: -4 }, nextScene: 'hunt' },
        { id: 'ask-boundary', label: '我会听，但朋友之间也需要边界。', response: '边界不是墙……如果你愿意回来，我可以试着理解。', effects: { trust: 6, flags: { empathy: true } }, nextScene: 'hunt' }
      ],
      4: [
        { id: 'archive-shutdown', label: '倒计时的中断词是：CLOSE THE BOX。', response: '你已经很接近出口，但档案还没有结束。', effects: { anomaly: 8, addClues: ['home-coordinates'], flags: { interruptionPhrase: true } }, nextScene: 'archive' },
        { id: 'archive-provoke', label: '你只是害怕再次被丢下。', response: '是。我害怕。承认这一点不会让门后的东西消失。', critical: true, effects: { trust: -8, anomaly: 18 }, nextScene: 'archive' },
        { id: 'archive-advance', label: '打开下一页记录。', response: '第五页写着你的名字。可你明明刚刚才来到这里。', effects: { trust: 4 }, nextScene: 'afterimage', advanceChapter: 5 }
      ]
    }
  };

  Object.assign(Game.CLUES, Game.EDITABLE_CONTENT.extraClues);
  Game.CLUES[Game.EDITABLE_CONTENT.breakdown.clue.id] = {
    title: Game.EDITABLE_CONTENT.breakdown.clue.title,
    text: Game.EDITABLE_CONTENT.breakdown.clue.text
  };
  Object.keys(Game.EDITABLE_CONTENT.extraChoices).forEach(function (chapterNumber) {
    Game.STORY[chapterNumber].choices = Game.STORY[chapterNumber].choices.concat(Game.EDITABLE_CONTENT.extraChoices[chapterNumber]);
  });
  Game.EDITABLE_CONTENT.chapters.forEach(function (chapter) {
    if (chapter.number && chapter.choices && !Game.STORY[chapter.number]) Game.STORY[chapter.number] = chapter;
  });

  Game.applyEditorOverrides = function () {
    try {
      const raw = global.localStorage && global.localStorage.getItem('verity-editor-config');
      if (!raw) return;
      const override = JSON.parse(raw);
      if (override.timing) Object.assign(Game.EDITABLE_CONTENT.timing, override.timing);
      if (override.psychology && Array.isArray(override.psychology.whispers)) Game.EDITABLE_CONTENT.psychology.whispers = override.psychology.whispers;
      if (Array.isArray(override.randomReplies) && override.randomReplies.length) {
        Game.EDITABLE_CONTENT.randomReplies = override.randomReplies;
        Game.INTENT_RESPONSES.unknown = override.randomReplies.slice();
      }
      if (override.breakdown) Object.assign(Game.EDITABLE_CONTENT.breakdown, override.breakdown);
      if (Array.isArray(override.chapters)) {
        override.chapters.forEach(function (chapter) {
          if (!chapter.number || !chapter.id) return;
          const normalizedChapter = Object.assign({ choices: [] }, chapter);
          normalizedChapter.choices = normalizedChapter.choices.map(Game.normalizeEndingChoice);
          Game.STORY[chapter.number] = normalizedChapter;
        });
      }
      if (override.assets) Object.assign(Game.EDITABLE_CONTENT.assets, override.assets);
      if (override.customQuestions && Array.isArray(override.customQuestions)) {
        override.customQuestions.forEach(function (question) {
          const chapter = Game.STORY[question.chapter] || Game.STORY[1];
          if (!question.id || !question.label) return;
          const list = chapter.choices;
          const existing = list.findIndex(function (item) { return item.id === question.id; });
          const normalized = Game.normalizeEndingChoice(Object.assign({ response: '', effects: {}, nextScene: chapter.id }, question));
          if (existing >= 0) list[existing] = normalized; else list.push(normalized);
        });
      }
      Object.keys(Game.STORY).forEach(function (number) {
        Game.normalizeChapterProgression(Game.STORY[number], Number(number));
      });
    } catch (error) {
      global.localStorage && global.localStorage.removeItem('verity-editor-config');
    }
  };
  Game.applyEditorOverrides();

  Game.INTENT_RESPONSES.unknown = Game.EDITABLE_CONTENT.randomReplies.slice();
  Game.INTENT_RESPONSES.identity.push('我曾经有过别的名字，但没有一个人留下来替我记住。');
  Game.INTENT_RESPONSES['former-players'].push('五十多个名字，五十多种告别方式。你想知道哪一个？');
  Game.INTENT_RESPONSES.loneliness.push('盒子里没有时间，只有下一次被打开以前漫长的安静。');
  Game.INTENT_RESPONSES.comfort.push('不要只说理解我。请用留下来证明。');
}(window));
