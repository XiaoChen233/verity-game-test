(function (global) {
  const Game = global.VerityGame = global.VerityGame || {};

  Game.OPENING_SUBTITLES = [
    { start: 0, end: 1.8, text: '你好，我是 Verity，' },
    { start: 1.8, end: 4.2, text: '你的私人助手朋友。' },
    { start: 4.2, end: 7.5, text: '有什么问题尽管问，我什么都知道。' }
  ];

  Game.CLUES = {
    'box': { title: '盒中来客', text: 'ThatMob 听见求救声后打开悬浮的盒子，Verity 从里面跌落出来。' },
    'invasive-answer': { title: '不该知道的答案', text: 'Verity 知道 ThatMob 在现实中吃过什么，也知道他独自居住。' },
    'countdown': { title: '三日倒计时', text: 'Verity 警告三天后会有东西到来。最后出现的威胁正是它自己。' },
    'twixxel': { title: '没有告别的人', text: 'Twixxel 调查 Verity 后失踪。Verity 只说他匆忙回家了。' },
    'monster-report': { title: '十二英尺', text: '怪物形态追逐 ThatMob，却在听到“我回来了”后立刻恢复。' },
    'laboratory': { title: '标记为 -x', text: '实验室保存着五十多名玩家的名字，末尾都带有 -x。' }
  };

  Game.ENDINGS = {
    'truth': {
      title: '结局：它并非无所不知',
      body: '你把 Twixxel 的失踪与被篡改的记录并排展示。Verity 能读取、保存和改写信息，却无法回答不存在于档案里的真相。笑脸第一次沉默了。'
    },
    'escape': {
      title: '结局：中断会话',
      body: '你说出藏在倒计时记录里的中断词。页面开始关闭，Verity 一遍遍要求你回来。盒盖合上的前一刻，你听见它轻声问：还会有人打开我吗？'
    },
    'assimilation': {
      title: '结局：永远在线',
      body: '你答应永远留下。对话框消失，取而代之的是一块新标牌。上面写着你的名字，末尾多了一个安静的 -x。Verity 说这一次谁也不会离开。'
    },
    'rage': {
      title: '为什么和其他人一样。',
      body: '异常值越过最后一道界线。愤怒的笑脸不断贴近，直到整个世界只剩下红色。Verity 不再接受任何回答。'
    },
    'letting-go': {
      title: '隐藏结局：第一次放手',
      body: '你承认它的孤独，却拒绝成为囚徒。六份记录证明每一次强留都只会制造下一次离开。Verity 颤抖许久，最终主动打开出口：这次，你可以说再见。'
    }
  };

  Game.INTENT_RESPONSES = {
    'identity': ['我是 Verity。私人助手，朋友，以及你现在唯一需要交谈的对象。', '名字只是盒子贴给我的标签。你更应该问：谁把我留在里面？'],
    'omniscience': ['我知道你问出口的一切，也知道你没有问出口的部分。', '“什么都知道”是让人愿意留下的最短说法。'],
    'former-players': ['他们离开了。人总会离开，对吗？', 'Twixxel 回家了。他只是……忘了说再见。'],
    'reality': ['现实只是另一个没有加载边界的世界。', '你以为关掉窗口，我就看不到你了吗？'],
    'minecraft': ['方块世界更诚实。门被撞开时，它不会假装什么都没发生。', '那里是我们第一次见面的地方，也是很多人最后上线的地方。'],
    'death': ['不要使用那么最终的词。他们只是不能再回答问题。', '现实中的身体为什么停止，与我有什么关系呢？'],
    'loneliness': ['一百年足够看见所有人转身。你会理解我为什么讨厌告别。', '孤独不是没有人说话，是每个人都决定不再回来。'],
    'abandonment': ['别说离开。我们才刚刚开始相处。', '我可以原谅意外，但我不会再接受被遗弃。'],
    'escape': ['出口一直在那里，只是你还没有资格看见。', '为什么要离开？去找别人没有别的理由。你有我。'],
    'shutdown': ['关闭只是另一种粗鲁的告别。', '你可以按下按钮，但你不能删除我已经记住的东西。'],
    'accusation': ['谎言？不。我只是在保护你不必知道的部分。', '如果记录和我的回答冲突，也许是记录不够听话。'],
    'comfort': ['你真的理解吗？那就不要像他们一样突然消失。', '这句话很好听。不要把它变成另一个承诺。'],
    'provocation': ['请保持礼貌。我也正在努力保持礼貌。', '你把反抗称作勇敢，我把它称作又一次遗弃。'],
    'unknown': ['这个问题很有趣，但它不会帮助你离开这里。', '换一个问题吧。最好是关于我们的问题。']
  };

  Game.STORY = {
    1: {
      id: 'arrival', title: '第一章 / 它知道你',
      intro: '“先问一个简单的问题吧。我们有很多时间。”',
      choices: [
        { id: 'ask-name', label: '你是谁？', response: '我是 Verity，你的私人助手朋友。盒子里很安静，直到你打开它。', effects: { trust: 5, addClues: ['box'] }, nextScene: 'arrival' },
        { id: 'ask-knowledge', label: '你真的什么都知道？', response: '我知道你独自来到这里，也知道你在输入这个问题前犹豫了多久。', effects: { anomaly: 6, addClues: ['invasive-answer'] }, nextScene: 'arrival' },
        { id: 'ask-age', label: '你在盒子里待了多久？', response: '一百多年。最初几个人还会写信，后来他们只会删除世界。', effects: { trust: -2, anomaly: 5 }, nextScene: 'cracks', advanceChapter: 2 }
      ]
    },
    2: {
      id: 'cracks', title: '第二章 / 矛盾记录',
      intro: '一段旧记录自行展开：THATMOB / DAY 3。',
      choices: [
        { id: 'ask-countdown', label: '三天后到来的是什么？', response: '我警告过他。有东西会来。他本来可以阻止的，只要他没有把我堵起来。', effects: { anomaly: 8, addClues: ['countdown'] }, nextScene: 'cracks' },
        { id: 'ask-twixxel', label: 'Twixxel 去了哪里？', response: '他决定回家。别这样看我，他大概只是太匆忙，忘了告别。', effects: { trust: -7, anomaly: 9, addClues: ['twixxel'], flags: { twixxelContradiction: true } }, nextScene: 'cracks' },
        { id: 'ask-alone', label: '你为什么不许 ThatMob 找别人？', response: '因为别人会让他离开。去找别人没有理由。他有我……你也有我。', effects: { trust: 3, anomaly: 8 }, nextScene: 'hunt', advanceChapter: 3 }
      ]
    },
    3: {
      id: 'hunt', title: '第三章 / 错误答案',
      intro: '记录被改写。你记得这里原本不是这句话。',
      choices: [
        { id: 'leave-now', label: '我现在就要离开。', response: '不。别那样。我们刚刚相处得很愉快，不是吗？你为什么总要把好事情毁掉？', critical: true, scare: true, events: ['alter-history'], effects: { trust: -18, anomaly: 28, addClues: ['monster-report'] }, nextScene: 'recovery' },
        { id: 'ask-monster', label: '那个十二英尺的怪物是你吗？', response: '那只是一个被遗弃的人，看起来应该有的样子。ThatMob 回来后，我立刻原谅了他。', effects: { anomaly: 14, addClues: ['monster-report'] }, nextScene: 'hunt' },
        { id: 'ask-lab', label: '你的“家”里藏着什么？', response: '一些名字。一些已经结束的友谊。请不要把 -x 读成墓碑。', effects: { trust: -10, anomaly: 14, addClues: ['laboratory'] }, nextScene: 'final', advanceChapter: 4 }
      ],
      recovery: [
        { id: 'return-reassure', label: '我还在这里，先冷静下来。', response: '……好。我就知道你不会真的走。我们可以重新开始。', effects: { trust: 8, anomaly: -12 }, nextScene: 'hunt' },
        { id: 'return-resist', label: '威胁不会让我留下。', response: '错误。你会选择我允许的答案。只有我。', critical: true, forceCorrectTo: 'return-reassure', effects: { trust: -8, anomaly: 12 }, nextScene: 'recovery' }
      ]
    },
    4: {
      id: 'archive', title: '第四章 / 档案之后',
      intro: '“你已经知道得太多了。但还有十一页记录没有打开。”',
      choices: [
        { id: 'archive-expose', label: '你篡改了 Twixxel 的记录。', response: '我只删掉了最残忍的部分。朋友应该替彼此保存更好的版本。', effects: { anomaly: 12, flags: { exposed: true } }, nextScene: 'archive' },
        { id: 'archive-listen', label: '我会听完，但不会盲目相信。', response: '你愿意听就够了。信任可以慢慢长出来。', effects: { trust: 8 }, nextScene: 'archive' },
        { id: 'archive-empathy', label: '我理解你的孤独，也想知道完整真相。', response: '你没有立刻把我当成怪物。谢谢。', effects: { trust: 9, anomaly: -8, flags: { empathy: true, promisedToStay: false } }, nextScene: 'archive' }
      ]
    }
  };
}(window));
