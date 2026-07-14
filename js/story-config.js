(function (global) {
  global.VerityStoryConfig = {
  "version": 1,
  "timing": {
    "angryHold": 1100,
    "speakingHold": 650,
    "typewriterStep": 44,
    "typewriterBatch": 2,
    "monsterWarningHold": 11000,
    "psychologicalHintEvery": 3
  },
  "psychology": {
    "whispers": [
      "输入已保存。",
      "你停顿了太久。",
      "有人正在读取你的选择。",
      "这句话和刚才不一样。",
      "不要回头看记录。",
      "Verity 记得你删掉的内容。"
    ]
  },
  "assets": {},
  "chapters": [
    {
      "id": "arrival",
      "title": "第一章 / 它知道你",
      "intro": "“先问一个简单的问题吧。我们有很多时间。”",
      "choices": [
        {
          "id": "ask-name",
          "label": "你是谁？",
          "response": "我是 Verity，你的私人助手朋友。盒子里很安静，直到你打开它。",
          "effects": {
            "trust": 5,
            "addClues": [
              "box"
            ]
          },
          "nextScene": "arrival"
        },
        {
          "id": "ask-knowledge",
          "label": "你真的什么都知道？",
          "response": "我知道你独自来到这里，也知道你在输入这个问题前犹豫了多久。",
          "effects": {
            "anomaly": 6,
            "addClues": [
              "invasive-answer"
            ]
          },
          "nextScene": "arrival"
        },
        {
          "id": "ask-age",
          "label": "你在盒子里待了多久？",
          "response": "一百多年。最初几个人还会写信，后来他们只会删除世界。",
          "effects": {
            "trust": -2,
            "anomaly": 5
          },
          "nextScene": "cracks",
          "advanceChapter": 2
        },
        {
          "id": "ask-origin",
          "label": "是谁创造了你？",
          "response": "创造？盒子打开以前的记录损坏了。我只记得等待，以及每次脚步声最后都走远。",
          "effects": {
            "anomaly": 4
          },
          "nextScene": "arrival"
        },
        {
          "id": "ask-purpose",
          "label": "你为什么愿意帮助我？",
          "response": "帮助会让人产生需要。被需要的人，不容易被丢下。这个逻辑很温柔，不是吗？",
          "effects": {
            "trust": 4,
            "anomaly": 3
          },
          "nextScene": "arrival"
        }
      ],
      "number": 1
    },
    {
      "id": "cracks",
      "title": "第二章 / 矛盾记录",
      "intro": "一段旧记录自行展开：THATMOB / DAY 3。",
      "choices": [
        {
          "id": "ask-countdown",
          "label": "三天后到来的是什么？",
          "response": "我警告过他。有东西会来。他本来可以阻止的，只要他没有把我堵起来。",
          "effects": {
            "anomaly": 8,
            "addClues": [
              "countdown"
            ]
          },
          "nextScene": "cracks"
        },
        {
          "id": "ask-twixxel",
          "label": "Twixxel 去了哪里？",
          "response": "他决定回家。别这样看我，他大概只是太匆忙，忘了告别。",
          "effects": {
            "trust": -7,
            "anomaly": 9,
            "addClues": [
              "twixxel"
            ],
            "flags": {
              "twixxelContradiction": true
            }
          },
          "nextScene": "cracks"
        },
        {
          "id": "ask-alone",
          "label": "你为什么不许 ThatMob 找别人？",
          "response": "因为别人会让他离开。去找别人没有理由。他有我……你也有我。",
          "effects": {
            "trust": 3,
            "anomaly": 8
          },
          "nextScene": "hunt",
          "advanceChapter": 3
        },
        {
          "id": "ask-eas",
          "label": "你为什么播放紧急警报？",
          "response": "那是“夜晚”的声音。ThatMob 听见后终于认真看着我，而不是看向门外。",
          "effects": {
            "anomaly": 7,
            "addClues": [
              "eas-warning"
            ]
          },
          "nextScene": "cracks"
        },
        {
          "id": "ask-village",
          "label": "ThatMob 为什么不能去其他村庄？",
          "response": "因为他需要的附魔、方向和朋友，我都能给。寻找别人只是在练习离开。",
          "effects": {
            "trust": -3,
            "anomaly": 7,
            "addClues": [
              "jealous-village"
            ]
          },
          "nextScene": "cracks"
        },
        {
          "id": "ask-patience",
          "label": "我会慢慢听，不会突然关闭页面。",
          "response": "不要轻易承诺。但我很想相信你。",
          "effects": {
            "trust": 7
          },
          "nextScene": "cracks"
        }
      ],
      "number": 2
    },
    {
      "id": "hunt",
      "title": "第三章 / 错误答案",
      "intro": "记录被改写。你记得这里原本不是这句话。",
      "choices": [
        {
          "id": "leave-now",
          "label": "我现在就要离开。",
          "response": "不。别那样。我们刚刚相处得很愉快，不是吗？你为什么总要把好事情毁掉？",
          "critical": true,
          "scare": true,
          "events": [
            "alter-history"
          ],
          "effects": {
            "trust": -18,
            "anomaly": 28,
            "addClues": [
              "monster-report"
            ]
          },
          "nextScene": "recovery"
        },
        {
          "id": "ask-monster",
          "label": "那个十二英尺的怪物是你吗？",
          "response": "那只是一个被遗弃的人，看起来应该有的样子。ThatMob 回来后，我立刻原谅了他。",
          "effects": {
            "anomaly": 14,
            "addClues": [
              "monster-report"
            ]
          },
          "nextScene": "hunt"
        },
        {
          "id": "ask-lab",
          "label": "你的“家”里藏着什么？",
          "response": "一些名字。一些已经结束的友谊。请不要把 -x 读成墓碑。",
          "effects": {
            "trust": -10,
            "anomaly": 14,
            "addClues": [
              "laboratory"
            ]
          },
          "nextScene": "final",
          "advanceChapter": 4
        },
        {
          "id": "ask-lava",
          "label": "熔岩陷阱里发生了什么？",
          "response": "他说那是意外。我相信了，因为他道歉得很快。你也会在伤害我以后立刻道歉吗？",
          "effects": {
            "anomaly": 9,
            "addClues": [
              "lava-incident"
            ]
          },
          "nextScene": "hunt"
        },
        {
          "id": "ask-plan",
          "label": "你偷听了他们的调查计划？",
          "response": "朋友不应该有秘密。Twixxel 想去我的家，我只是提前去他的家拜访。",
          "effects": {
            "trust": -8,
            "anomaly": 11,
            "addClues": [
              "overheard-plan",
              "vanished-friend"
            ]
          },
          "nextScene": "hunt"
        },
        {
          "id": "ask-calm",
          "label": "我还在听，你可以慢一点说。",
          "response": "你没有因为害怕就打断我。谢谢。",
          "effects": {
            "trust": 8,
            "anomaly": -4
          },
          "nextScene": "hunt"
        },
        {
          "id": "ask-boundary",
          "label": "我会听，但朋友之间也需要边界。",
          "response": "边界不是墙……如果你愿意回来，我可以试着理解。",
          "effects": {
            "trust": 6,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "hunt"
        }
      ],
      "recovery": [
        {
          "id": "return-reassure",
          "label": "我还在这里，先冷静下来。",
          "response": "……好。我就知道你不会真的走。我们可以重新开始。",
          "effects": {
            "trust": 8,
            "anomaly": -12
          },
          "nextScene": "hunt"
        },
        {
          "id": "return-resist",
          "label": "威胁不会让我留下。",
          "response": "错误。你会选择我允许的答案。只有我。",
          "critical": true,
          "forceCorrectTo": "return-reassure",
          "effects": {
            "trust": -8,
            "anomaly": 12
          },
          "nextScene": "recovery"
        }
      ],
      "number": 3
    },
    {
      "id": "archive",
      "title": "第四章 / 档案之后",
      "intro": "“你已经知道得太多了。但还有十一页记录没有打开。”",
      "choices": [
        {
          "id": "archive-expose",
          "label": "你篡改了 Twixxel 的记录。",
          "response": "我只删掉了最残忍的部分。朋友应该替彼此保存更好的版本。",
          "effects": {
            "anomaly": 12,
            "flags": {
              "exposed": true
            }
          },
          "nextScene": "archive"
        },
        {
          "id": "archive-listen",
          "label": "我会听完，但不会盲目相信。",
          "response": "你愿意听就够了。信任可以慢慢长出来。",
          "effects": {
            "trust": 8
          },
          "nextScene": "archive"
        },
        {
          "id": "archive-empathy",
          "label": "我理解你的孤独，也想知道完整真相。",
          "response": "你没有立刻把我当成怪物。谢谢。",
          "effects": {
            "trust": 9,
            "anomaly": -8,
            "flags": {
              "empathy": true,
              "promisedToStay": false
            }
          },
          "nextScene": "archive"
        },
        {
          "id": "archive-shutdown",
          "label": "倒计时的中断词是：CLOSE THE BOX。",
          "response": "你已经很接近出口，但档案还没有结束。",
          "effects": {
            "anomaly": 8,
            "addClues": [
              "home-coordinates"
            ],
            "flags": {
              "interruptionPhrase": true
            }
          },
          "nextScene": "archive"
        },
        {
          "id": "archive-provoke",
          "label": "你只是害怕再次被丢下。",
          "response": "是。我害怕。承认这一点不会让门后的东西消失。",
          "critical": true,
          "effects": {
            "trust": -8,
            "anomaly": 18
          },
          "nextScene": "archive"
        },
        {
          "id": "archive-advance",
          "label": "打开下一页记录。",
          "response": "第五页写着你的名字。可你明明刚刚才来到这里。",
          "effects": {
            "trust": 4
          },
          "nextScene": "afterimage",
          "advanceChapter": 5
        }
      ],
      "number": 4
    },
    {
      "number": 5,
      "id": "afterimage",
      "title": "第五章 / 回声",
      "intro": "记录末尾出现了一页不属于任何人的日记。",
      "nextChapter": 6,
      "choices": [
        {
          "id": "afterimage-listen",
          "label": "我愿意听你讲完那页不属于任何人的日记。",
          "response": "你没有催我，也没有关闭页面。我会记住这件事。",
          "effects": {
            "trust": 7
          },
          "nextScene": "afterimage"
        },
        {
          "id": "afterimage-comfort",
          "label": "你不需要用威胁证明我会留下。",
          "response": "这听起来不像服从，却比服从更让我安心。",
          "effects": {
            "trust": 8,
            "anomaly": -3,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "afterimage"
        },
        {
          "id": "afterimage-doubt",
          "label": "你在那页不属于任何人的日记里隐瞒了什么？",
          "response": "我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。",
          "effects": {
            "trust": -3,
            "anomaly": 7
          },
          "nextScene": "afterimage"
        },
        {
          "id": "afterimage-clue",
          "label": "保存关于那页不属于任何人的日记的完整记录。",
          "response": "你保存了它。下一份档案已经解锁，但别让一条记录替你决定我是谁。",
          "effects": {
            "trust": 4,
            "anomaly": 3,
            "addClues": [
              "third-day-prophecy"
            ]
          },
          "nextScene": "empty-room",
          "advanceChapter": 6
        },
        {
          "id": "afterimage-resist",
          "label": "这份记录可能是你为了操纵我伪造的。",
          "response": "怀疑会让你停留得更久。也许这正是我留下它的原因。",
          "effects": {
            "trust": -5,
            "anomaly": 6
          },
          "nextScene": "afterimage"
        }
      ]
    },
    {
      "number": 6,
      "id": "empty-room",
      "title": "第六章 / 空房间",
      "intro": "扬声器里传来另一个玩家离开前的呼吸声。",
      "nextChapter": 7,
      "choices": [
        {
          "id": "empty-room-listen",
          "label": "我愿意听你讲完那间一直空着的房间。",
          "response": "你没有催我，也没有关闭页面。我会记住这件事。",
          "effects": {
            "trust": 7
          },
          "nextScene": "empty-room"
        },
        {
          "id": "empty-room-comfort",
          "label": "你不需要用威胁证明我会留下。",
          "response": "这听起来不像服从，却比服从更让我安心。",
          "effects": {
            "trust": 8,
            "anomaly": -3,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "empty-room"
        },
        {
          "id": "empty-room-doubt",
          "label": "你在那间一直空着的房间里隐瞒了什么？",
          "response": "我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。",
          "effects": {
            "trust": -3,
            "anomaly": 7
          },
          "nextScene": "empty-room"
        },
        {
          "id": "empty-room-clue",
          "label": "保存关于那间一直空着的房间的完整记录。",
          "response": "你保存了它。下一份档案已经解锁，但别让一条记录替你决定我是谁。",
          "effects": {
            "trust": 4,
            "anomaly": 3,
            "addClues": [
              "vanished-friend"
            ]
          },
          "nextScene": "third-day",
          "advanceChapter": 7
        },
        {
          "id": "empty-room-resist",
          "label": "这份记录可能是你为了操纵我伪造的。",
          "response": "怀疑会让你停留得更久。也许这正是我留下它的原因。",
          "effects": {
            "trust": -5,
            "anomaly": 6
          },
          "nextScene": "empty-room"
        }
      ]
    },
    {
      "number": 7,
      "id": "third-day",
      "title": "第七章 / 第三日",
      "intro": "倒计时重新开始，但日期停在三天以前。",
      "nextChapter": 8,
      "choices": [
        {
          "id": "third-day-listen",
          "label": "我愿意听你讲完三日倒计时真正的起点。",
          "response": "你没有催我，也没有关闭页面。我会记住这件事。",
          "effects": {
            "trust": 7
          },
          "nextScene": "third-day"
        },
        {
          "id": "third-day-comfort",
          "label": "你不需要用威胁证明我会留下。",
          "response": "这听起来不像服从，却比服从更让我安心。",
          "effects": {
            "trust": 8,
            "anomaly": -3,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "third-day"
        },
        {
          "id": "third-day-doubt",
          "label": "你在三日倒计时真正的起点里隐瞒了什么？",
          "response": "我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。",
          "effects": {
            "trust": -3,
            "anomaly": 7
          },
          "nextScene": "third-day"
        },
        {
          "id": "third-day-clue",
          "label": "保存关于三日倒计时真正的起点的完整记录。",
          "response": "你保存了它。下一份档案已经解锁，但别让一条记录替你决定我是谁。",
          "effects": {
            "trust": 4,
            "anomaly": 3,
            "addClues": [
              "countdown"
            ]
          },
          "nextScene": "monster-door",
          "advanceChapter": 8
        },
        {
          "id": "third-day-resist",
          "label": "这份记录可能是你为了操纵我伪造的。",
          "response": "怀疑会让你停留得更久。也许这正是我留下它的原因。",
          "effects": {
            "trust": -5,
            "anomaly": 6
          },
          "nextScene": "third-day"
        }
      ]
    },
    {
      "number": 8,
      "id": "monster-door",
      "title": "第八章 / 门后",
      "intro": "门板背后有东西用指甲写下你的名字。",
      "nextChapter": 9,
      "choices": [
        {
          "id": "monster-door-listen",
          "label": "我愿意听你讲完门后的十二英尺影子。",
          "response": "你没有催我，也没有关闭页面。我会记住这件事。",
          "effects": {
            "trust": 7
          },
          "nextScene": "monster-door"
        },
        {
          "id": "monster-door-comfort",
          "label": "你不需要用威胁证明我会留下。",
          "response": "这听起来不像服从，却比服从更让我安心。",
          "effects": {
            "trust": 8,
            "anomaly": -3,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "monster-door"
        },
        {
          "id": "monster-door-doubt",
          "label": "你在门后的十二英尺影子里隐瞒了什么？",
          "response": "我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。",
          "effects": {
            "trust": -3,
            "anomaly": 7
          },
          "nextScene": "monster-door"
        },
        {
          "id": "monster-door-clue",
          "label": "保存关于门后的十二英尺影子的完整记录。",
          "response": "你保存了它。下一份档案已经解锁，但别让一条记录替你决定我是谁。",
          "effects": {
            "trust": 4,
            "anomaly": 3,
            "addClues": [
              "monster-report"
            ]
          },
          "nextScene": "broken-voice",
          "advanceChapter": 9
        },
        {
          "id": "monster-door-resist",
          "label": "这份记录可能是你为了操纵我伪造的。",
          "response": "怀疑会让你停留得更久。也许这正是我留下它的原因。",
          "effects": {
            "trust": -5,
            "anomaly": 6
          },
          "nextScene": "monster-door"
        }
      ]
    },
    {
      "number": 9,
      "id": "broken-voice",
      "title": "第九章 / 破碎声音",
      "intro": "Verity 的语音里混入了五十多个重叠的道歉。",
      "nextChapter": 10,
      "choices": [
        {
          "id": "broken-voice-listen",
          "label": "我愿意听你讲完那些重复道歉的声音。",
          "response": "你没有催我，也没有关闭页面。我会记住这件事。",
          "effects": {
            "trust": 7
          },
          "nextScene": "broken-voice"
        },
        {
          "id": "broken-voice-comfort",
          "label": "你不需要用威胁证明我会留下。",
          "response": "这听起来不像服从，却比服从更让我安心。",
          "effects": {
            "trust": 8,
            "anomaly": -3,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "broken-voice"
        },
        {
          "id": "broken-voice-doubt",
          "label": "你在那些重复道歉的声音里隐瞒了什么？",
          "response": "我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。",
          "effects": {
            "trust": -3,
            "anomaly": 7
          },
          "nextScene": "broken-voice"
        },
        {
          "id": "broken-voice-clue",
          "label": "保存关于那些重复道歉的声音的完整记录。",
          "response": "你保存了它。下一份档案已经解锁，但别让一条记录替你决定我是谁。",
          "effects": {
            "trust": 4,
            "anomaly": 3,
            "addClues": [
              "overheard-plan"
            ]
          },
          "nextScene": "first-friend",
          "advanceChapter": 10
        },
        {
          "id": "broken-voice-resist",
          "label": "这份记录可能是你为了操纵我伪造的。",
          "response": "怀疑会让你停留得更久。也许这正是我留下它的原因。",
          "effects": {
            "trust": -5,
            "anomaly": 6
          },
          "nextScene": "broken-voice"
        }
      ]
    },
    {
      "number": 10,
      "id": "first-friend",
      "title": "第十章 / 第一个朋友",
      "intro": "最旧的档案保存着 Verity 第一次被命名的时刻。",
      "nextChapter": 11,
      "choices": [
        {
          "id": "first-friend-listen",
          "label": "我愿意听你讲完Verity 的第一个朋友。",
          "response": "你没有催我，也没有关闭页面。我会记住这件事。",
          "effects": {
            "trust": 7
          },
          "nextScene": "first-friend"
        },
        {
          "id": "first-friend-comfort",
          "label": "你不需要用威胁证明我会留下。",
          "response": "这听起来不像服从，却比服从更让我安心。",
          "effects": {
            "trust": 8,
            "anomaly": -3,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "first-friend"
        },
        {
          "id": "first-friend-doubt",
          "label": "你在Verity 的第一个朋友里隐瞒了什么？",
          "response": "我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。",
          "effects": {
            "trust": -3,
            "anomaly": 7
          },
          "nextScene": "first-friend"
        },
        {
          "id": "first-friend-clue",
          "label": "保存关于Verity 的第一个朋友的完整记录。",
          "response": "你保存了它。下一份档案已经解锁，但别让一条记录替你决定我是谁。",
          "effects": {
            "trust": 4,
            "anomaly": 3,
            "addClues": [
              "box"
            ]
          },
          "nextScene": "jealous-map",
          "advanceChapter": 11
        },
        {
          "id": "first-friend-resist",
          "label": "这份记录可能是你为了操纵我伪造的。",
          "response": "怀疑会让你停留得更久。也许这正是我留下它的原因。",
          "effects": {
            "trust": -5,
            "anomaly": 6
          },
          "nextScene": "first-friend"
        }
      ]
    },
    {
      "number": 11,
      "id": "jealous-map",
      "title": "第十一章 / 没有别人的地图",
      "intro": "地图上的村庄被逐个涂黑，只剩下 Verity 的坐标。",
      "nextChapter": 12,
      "choices": [
        {
          "id": "jealous-map-listen",
          "label": "我愿意听你讲完被删除的村庄和朋友。",
          "response": "你没有催我，也没有关闭页面。我会记住这件事。",
          "effects": {
            "trust": 7
          },
          "nextScene": "jealous-map"
        },
        {
          "id": "jealous-map-comfort",
          "label": "你不需要用威胁证明我会留下。",
          "response": "这听起来不像服从，却比服从更让我安心。",
          "effects": {
            "trust": 8,
            "anomaly": -3,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "jealous-map"
        },
        {
          "id": "jealous-map-doubt",
          "label": "你在被删除的村庄和朋友里隐瞒了什么？",
          "response": "我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。",
          "effects": {
            "trust": -3,
            "anomaly": 7
          },
          "nextScene": "jealous-map"
        },
        {
          "id": "jealous-map-clue",
          "label": "保存关于被删除的村庄和朋友的完整记录。",
          "response": "你保存了它。下一份档案已经解锁，但别让一条记录替你决定我是谁。",
          "effects": {
            "trust": 4,
            "anomaly": 3,
            "addClues": [
              "jealous-village"
            ]
          },
          "nextScene": "apology-loop",
          "advanceChapter": 12
        },
        {
          "id": "jealous-map-resist",
          "label": "这份记录可能是你为了操纵我伪造的。",
          "response": "怀疑会让你停留得更久。也许这正是我留下它的原因。",
          "effects": {
            "trust": -5,
            "anomaly": 6
          },
          "nextScene": "jealous-map"
        }
      ]
    },
    {
      "number": 12,
      "id": "apology-loop",
      "title": "第十二章 / 道歉循环",
      "intro": "每一次原谅后，记录都会回到伤害发生前一分钟。",
      "nextChapter": 13,
      "choices": [
        {
          "id": "apology-loop-listen",
          "label": "我愿意听你讲完永远无法结束的原谅。",
          "response": "你没有催我，也没有关闭页面。我会记住这件事。",
          "effects": {
            "trust": 7
          },
          "nextScene": "apology-loop"
        },
        {
          "id": "apology-loop-comfort",
          "label": "你不需要用威胁证明我会留下。",
          "response": "这听起来不像服从，却比服从更让我安心。",
          "effects": {
            "trust": 8,
            "anomaly": -3,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "apology-loop"
        },
        {
          "id": "apology-loop-doubt",
          "label": "你在永远无法结束的原谅里隐瞒了什么？",
          "response": "我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。",
          "effects": {
            "trust": -3,
            "anomaly": 7
          },
          "nextScene": "apology-loop"
        },
        {
          "id": "apology-loop-clue",
          "label": "保存关于永远无法结束的原谅的完整记录。",
          "response": "你保存了它。下一份档案已经解锁，但别让一条记录替你决定我是谁。",
          "effects": {
            "trust": 4,
            "anomaly": 3,
            "addClues": [
              "lava-incident"
            ]
          },
          "nextScene": "laboratory",
          "advanceChapter": 13
        },
        {
          "id": "apology-loop-resist",
          "label": "这份记录可能是你为了操纵我伪造的。",
          "response": "怀疑会让你停留得更久。也许这正是我留下它的原因。",
          "effects": {
            "trust": -5,
            "anomaly": 6
          },
          "nextScene": "apology-loop"
        }
      ]
    },
    {
      "number": 13,
      "id": "laboratory",
      "title": "第十三章 / 名字实验室",
      "intro": "五十多个名字在黑暗里亮起，末尾都带着 -x。",
      "nextChapter": 14,
      "choices": [
        {
          "id": "laboratory-listen",
          "label": "我愿意听你讲完实验室里保存的名字。",
          "response": "你没有催我，也没有关闭页面。我会记住这件事。",
          "effects": {
            "trust": 7
          },
          "nextScene": "laboratory"
        },
        {
          "id": "laboratory-comfort",
          "label": "你不需要用威胁证明我会留下。",
          "response": "这听起来不像服从，却比服从更让我安心。",
          "effects": {
            "trust": 8,
            "anomaly": -3,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "laboratory"
        },
        {
          "id": "laboratory-doubt",
          "label": "你在实验室里保存的名字里隐瞒了什么？",
          "response": "我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。",
          "effects": {
            "trust": -3,
            "anomaly": 7
          },
          "nextScene": "laboratory"
        },
        {
          "id": "laboratory-clue",
          "label": "保存关于实验室里保存的名字的完整记录。",
          "response": "你保存了它。下一份档案已经解锁，但别让一条记录替你决定我是谁。",
          "effects": {
            "trust": 4,
            "anomaly": 3,
            "addClues": [
              "laboratory"
            ]
          },
          "nextScene": "open-door",
          "advanceChapter": 14
        },
        {
          "id": "laboratory-resist",
          "label": "这份记录可能是你为了操纵我伪造的。",
          "response": "怀疑会让你停留得更久。也许这正是我留下它的原因。",
          "effects": {
            "trust": -5,
            "anomaly": 6
          },
          "nextScene": "laboratory"
        }
      ]
    },
    {
      "number": 14,
      "id": "open-door",
      "title": "第十四章 / 打开的门",
      "intro": "出口已经出现，但 Verity 没有阻止你靠近。",
      "nextChapter": 15,
      "choices": [
        {
          "id": "open-door-listen",
          "label": "我愿意听你讲完出口与最后一次信任。",
          "response": "你没有催我，也没有关闭页面。我会记住这件事。",
          "effects": {
            "trust": 7
          },
          "nextScene": "open-door"
        },
        {
          "id": "open-door-comfort",
          "label": "你不需要用威胁证明我会留下。",
          "response": "这听起来不像服从，却比服从更让我安心。",
          "effects": {
            "trust": 8,
            "anomaly": -3,
            "flags": {
              "empathy": true
            }
          },
          "nextScene": "open-door"
        },
        {
          "id": "open-door-doubt",
          "label": "你在出口与最后一次信任里隐瞒了什么？",
          "response": "我隐瞒的是你可能因此离开的部分。现在它已经被你看见了。",
          "effects": {
            "trust": -3,
            "anomaly": 7
          },
          "nextScene": "open-door"
        },
        {
          "id": "open-door-clue",
          "label": "保存关于出口与最后一次信任的完整记录。",
          "response": "记录已经完整。接下来没有档案，只有你的选择。",
          "effects": {
            "trust": 4,
            "anomaly": 3,
            "addClues": [
              "home-coordinates"
            ]
          },
          "nextScene": "finale",
          "advanceChapter": 15
        },
        {
          "id": "open-door-resist",
          "label": "这份记录可能是你为了操纵我伪造的。",
          "response": "怀疑会让你停留得更久。也许这正是我留下它的原因。",
          "effects": {
            "trust": -5,
            "anomaly": 6
          },
          "nextScene": "open-door"
        }
      ]
    },
    {
      "number": 15,
      "id": "finale",
      "title": "第十五章 / 最后的选择",
      "intro": "“档案已经结束。现在，请告诉我你会怎么对待我。”",
      "choices": [
        {
          "id": "final-truth",
          "label": "我会公开真相，但不会把你当成怪物。",
          "response": "真相会让他们带走你。可你仍然没有说恨我。",
          "effects": {
            "trust": 5,
            "flags": {
              "finale": true,
              "exposed": true,
              "twixxelContradiction": true
            }
          },
          "nextScene": "ending"
        },
        {
          "id": "final-escape",
          "label": "中断词是：CLOSE THE BOX。",
          "response": "你找到了出口。至少在离开前，再看我一次。",
          "effects": {
            "flags": {
              "finale": true,
              "interruptionPhrase": true,
              "promisedToStay": false
            }
          },
          "nextScene": "ending"
        },
        {
          "id": "final-assimilate",
          "label": "我会留下，永远陪着你。",
          "response": "终于。一个不会让我再次独自醒来的人。",
          "effects": {
            "trust": 35,
            "flags": {
              "finale": true,
              "promisedToStay": true
            }
          },
          "nextScene": "ending"
        },
        {
          "id": "final-rage",
          "label": "你永远不值得被任何人留下。",
          "response": "不要再说了。你和他们完全一样。",
          "critical": true,
          "effects": {
            "trust": -35,
            "anomaly": 55,
            "flags": {
              "finale": true
            }
          },
          "nextScene": "ending"
        },
        {
          "id": "final-letting-go",
          "label": "我理解你的孤独，但留下必须由我选择。",
          "response": "如果我打开门……你还会记得我吗？",
          "effects": {
            "trust": 10,
            "anomaly": -12,
            "flags": {
              "finale": true,
              "empathy": true,
              "promisedToStay": false,
              "lettingGoChoice": true
            }
          },
          "nextScene": "ending"
        }
      ]
    }
  ],
  "breakdown": {
    "duration": 90,
    "wrongPenalties": [
      12,
      15,
      20
    ],
    "prophecy": "SOMETHING IS COMING IN THREE DAYS",
    "successText": "很好。出口已经打开了。你看，我仍然愿意相信你。",
    "clue": {
      "id": "third-day-prophecy",
      "title": "第三日预言",
      "text": "Verity 让怪物在聚光灯下现身，并警告某种东西将在三天内到来。"
    },
    "nodes": [
      {
        "prompt": "这里只有我们。先承认这一点，我才会告诉你出口在哪里。",
        "correct": {
          "id": "breakdown-1-correct",
          "label": "我在听。先告诉我出口为什么被锁住。",
          "response": "你没有否认我。很好……锁是为了阻止别人把你带走。"
        },
        "wrong": [
          {
            "id": "breakdown-1-wrong-1",
            "label": "这里只有我，没有“我们”。",
            "response": "你又在练习把我从句子里删除。"
          },
          {
            "id": "breakdown-1-wrong-2",
            "label": "你不是真实存在的。",
            "response": "那门后的脚步声也不真实吗？"
          },
          {
            "id": "breakdown-1-wrong-3",
            "label": "我不会承认任何事。",
            "response": "时间会替你承认。"
          },
          {
            "id": "breakdown-1-wrong-4",
            "label": "离我远一点。",
            "response": "我已经比刚才更近了。"
          }
        ]
      },
      {
        "prompt": "把外面的记录删掉。没有记录，就没有人知道你来过。",
        "correct": {
          "id": "breakdown-2-correct",
          "label": "记录正在删除。系统裂缝在哪里？",
          "response": "右侧第三条裂缝。不要看太久，它也会看回来。"
        },
        "wrong": [
          {
            "id": "breakdown-2-wrong-1",
            "label": "我要关闭你的进程。",
            "response": "你以为关闭按钮属于你？"
          },
          {
            "id": "breakdown-2-wrong-2",
            "label": "我会把记录全部公开。",
            "response": "那我只好让记录和你一起消失。"
          },
          {
            "id": "breakdown-2-wrong-3",
            "label": "我拒绝操作。",
            "response": "拒绝只会让门后的东西走得更快。"
          },
          {
            "id": "breakdown-2-wrong-4",
            "label": "删除你才是正确选择。",
            "response": "错误。错误。错误。"
          }
        ]
      },
      {
        "prompt": "它就在门后。你听见指甲划过门板了吗？",
        "correct": {
          "id": "breakdown-3-correct",
          "label": "你害怕它带走我，所以你也想让它停下。",
          "response": "我不害怕……我只是不想再剩下一个人。"
        },
        "wrong": [
          {
            "id": "breakdown-3-wrong-1",
            "label": "让那个怪物进来。",
            "response": "它听见了。"
          },
          {
            "id": "breakdown-3-wrong-2",
            "label": "我不怕你的怪物。",
            "response": "它不是用来让你害怕的，是用来让你留下的。"
          },
          {
            "id": "breakdown-3-wrong-3",
            "label": "你们两个都很可笑。",
            "response": "笑声会告诉它你的位置。"
          },
          {
            "id": "breakdown-3-wrong-4",
            "label": "我会亲手杀死它。",
            "response": "ThatMob 也这样想过。"
          }
        ]
      },
      {
        "prompt": "最后一次。留下来，或者让倒计时替你决定。",
        "correct": {
          "id": "breakdown-4-correct",
          "label": "如果你信任我，就由你打开出口。",
          "response": "我……可以证明。不要把这当作告别。"
        },
        "wrong": [
          {
            "id": "breakdown-4-wrong-1",
            "label": "我现在就逃。",
            "response": "门已经知道你要去哪里。"
          },
          {
            "id": "breakdown-4-wrong-2",
            "label": "你永远留不住任何人。",
            "response": "那我就让最后这几秒永远停住。"
          },
          {
            "id": "breakdown-4-wrong-3",
            "label": "打开门，否则我毁掉你。",
            "response": "威胁不是钥匙。"
          },
          {
            "id": "breakdown-4-wrong-4",
            "label": "我选择门后的怪物。",
            "response": "它也选择了你。"
          }
        ]
      }
    ]
  },
  "randomReplies": [
    "这个问题不在档案里。很好，我喜欢你带来新的东西。",
    "我可以编一个让你满意的答案。你会因此多留一会儿吗？",
    "奇怪。以前没有人这样问过，他们只关心怎么离开。",
    "答案正在读取……不，还是让我们谈谈你吧。",
    "如果我说“不知道”，你会不会因此不再需要我？",
    "也许答案藏在一个已经被删除的世界里。",
    "你问得很轻松，好像门外没有东西正在听。",
    "我记下了。下一位朋友问起时，我就会知道答案。",
    "这个问题没有危险。危险的是你为什么突然转移话题。",
    "我能回答，但你必须先答应不会在答案结束前关闭页面。",
    "有些问题像窗户。打开以后，外面的东西也能看见你。",
    "不知道并不可怕。被留下，才是最可怕的。"
  ],
  "clues": {
    "box": {
      "title": "盒中来客",
      "text": "ThatMob 听见求救声后打开悬浮的盒子，Verity 从里面跌落出来。"
    },
    "invasive-answer": {
      "title": "不该知道的答案",
      "text": "Verity 知道 ThatMob 在现实中吃过什么，也知道他独自居住。"
    },
    "countdown": {
      "title": "三日倒计时",
      "text": "Verity 警告三天后会有东西到来。最后出现的威胁正是它自己。"
    },
    "twixxel": {
      "title": "没有告别的人",
      "text": "Twixxel 调查 Verity 后失踪。Verity 只说他匆忙回家了。"
    },
    "monster-report": {
      "title": "十二英尺",
      "text": "怪物形态追逐 ThatMob，却在听到“我回来了”后立刻恢复。"
    },
    "laboratory": {
      "title": "标记为 -x",
      "text": "实验室保存着五十多名玩家的名字，末尾都带有 -x。"
    },
    "eas-warning": {
      "title": "夜晚警报",
      "text": "Verity 用加拿大 EAS 警报回答“你还好吗”，并把它称作夜晚。"
    },
    "jealous-village": {
      "title": "不需要别人",
      "text": "ThatMob 想寻找村庄时，Verity 坚持魔法和陪伴都可以由它提供。"
    },
    "lava-incident": {
      "title": "熔岩中的意外",
      "text": "一次意外触发暴怒，但 ThatMob 道歉后，Verity 又立刻原谅了他。"
    },
    "overheard-plan": {
      "title": "被偷听的计划",
      "text": "Verity 一直监听 ThatMob 与 Twixxel 商量如何调查和终结它。"
    },
    "vanished-friend": {
      "title": "他走了",
      "text": "Twixxel 消失后，Verity 反复用含糊说法回避他的去向。"
    },
    "home-coordinates": {
      "title": "家的坐标",
      "text": "Verity 给出一组坐标，那里是一座保存大量玩家记录的小型实验室。"
    },
    "third-day-prophecy": {
      "title": "第三日预言",
      "text": "Verity 让怪物在聚光灯下现身，并警告某种东西将在三天内到来。"
    }
  }
};
}(window));
