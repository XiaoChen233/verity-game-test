test('normalizes punctuation, whitespace, and case', function () {
  equal(VerityGame.normalizeQuestion('  Verity，你是谁？！ '), 'verity你是谁');
});

test('recognizes leaving and Twixxel questions', function () {
  equal(VerityGame.matchIntent('我要怎么离开这里？', 2).id, 'escape');
  equal(VerityGame.matchIntent('Twixxel 到底去了哪里', 2).id, 'former-players');
});

test('recognizes comfort and provocation', function () {
  equal(VerityGame.matchIntent('你只是太孤独了，我理解你', 4).id, 'comfort');
  equal(VerityGame.matchIntent('你就是个骗人的怪物', 3).id, 'provocation');
});

test('returns unknown for unrelated input', function () {
  equal(VerityGame.matchIntent('蓝色袜子味道如何', 1).id, 'unknown');
});
