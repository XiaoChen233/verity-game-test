test('audio controller updates subtitles, mute, and portrait', function () {
  const audio = document.createElement('audio');
  audio.play = function () { this.dataset.played = 'yes'; return Promise.resolve(); };
  const subtitle = document.createElement('p');
  const portraits = [];
  const controller = VerityGame.createAudioController({
    audio: audio,
    subtitle: subtitle,
    cues: [{ start: 0, end: 2, text: '第一句' }, { start: 2, end: 4, text: '第二句' }],
    onPortrait: function (value) { portraits.push(value); }
  });
  controller.playOpening();
  equal(audio.dataset.played, 'yes');
  equal(portraits[0], 'speaking');
  controller.setMuted(true);
  equal(audio.muted, true);
  audio.dispatchEvent(new Event('ended'));
  equal(portraits[portraits.length - 1], 'normal');
});

test('audio error reveals full transcript and continues', function () {
  const audio = document.createElement('audio');
  audio.play = function () { return Promise.resolve(); };
  const subtitle = document.createElement('p');
  const controller = VerityGame.createAudioController({
    audio: audio,
    subtitle: subtitle,
    cues: [{ start: 0, end: 1, text: '你好' }, { start: 1, end: 2, text: '朋友' }],
    onPortrait: function () {}
  });
  controller.playOpening();
  audio.dispatchEvent(new Event('error'));
  equal(subtitle.textContent, '你好朋友');
  audio.dispatchEvent(new Event('timeupdate'));
  equal(subtitle.textContent, '你好朋友');
});

test('effect audio controller mutes plays and resets prophecy and monster shout', function () {
  const prophecy = document.createElement('audio');
  const shout = document.createElement('audio');
  prophecy.play = function () { this.dataset.played = 'yes'; return Promise.reject(new Error('blocked')); };
  shout.play = function () { this.dataset.played = 'yes'; return Promise.resolve(); };
  const controller = VerityGame.createEffectAudioController({ prophecy: prophecy, shout: shout });
  controller.setMuted(true);
  equal(prophecy.muted, true);
  equal(shout.muted, true);
  controller.play('prophecy');
  equal(prophecy.dataset.played, 'yes');
  prophecy.currentTime = 4;
  shout.currentTime = 3;
  controller.stopAll();
  equal(prophecy.currentTime, 0);
  equal(shout.currentTime, 0);
});
