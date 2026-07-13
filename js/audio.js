(function (global) {
  const Game = global.VerityGame = global.VerityGame || {};

  Game.createAudioController = function (options) {
    const audio = options.audio;
    const subtitle = options.subtitle;
    const originalCues = options.cues.map(function (cue) { return Object.assign({}, cue); });
    const onPortrait = options.onPortrait || function () {};
    let cues = originalCues.slice();
    let resolveOpening = null;
    let playbackFailed = false;

    function finish(showTranscript) {
      playbackFailed = Boolean(showTranscript);
      if (showTranscript) subtitle.textContent = cues.map(function (cue) { return cue.text; }).join('');
      else subtitle.textContent = '';
      onPortrait('normal');
      if (resolveOpening) {
        resolveOpening();
        resolveOpening = null;
      }
    }

    function onTimeUpdate() {
      if (playbackFailed) return;
      const cue = cues.find(function (item) { return audio.currentTime >= item.start && audio.currentTime < item.end; });
      subtitle.textContent = cue ? cue.text : '';
    }

    function onMetadata() {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const scale = audio.duration / 7.5;
      cues = originalCues.map(function (cue) {
        return { start: cue.start * scale, end: cue.end * scale, text: cue.text };
      });
    }

    function playOpening() {
      playbackFailed = false;
      onPortrait('speaking');
      audio.currentTime = 0;
      const promise = new Promise(function (resolve) { resolveOpening = resolve; });
      const result = audio.play();
      if (result && typeof result.catch === 'function') result.catch(function () { finish(true); });
      return promise;
    }

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onMetadata);
    audio.addEventListener('ended', function () { finish(false); });
    audio.addEventListener('error', function () { finish(true); });

    return {
      playOpening: playOpening,
      replay: playOpening,
      setMuted: function (value) { audio.muted = Boolean(value); },
      destroy: function () {
        audio.pause();
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('loadedmetadata', onMetadata);
      }
    };
  };

  Game.createEffectAudioController = function (audios) {
    const tracks = Object.assign({}, audios);
    return {
      play: function (name) {
        const audio = tracks[name];
        if (!audio) return Promise.resolve(false);
        audio.currentTime = 0;
        try {
          const result = audio.play();
          if (result && typeof result.catch === 'function') return result.catch(function () { return false; });
          return Promise.resolve(true);
        } catch (error) {
          return Promise.resolve(false);
        }
      },
      setMuted: function (value) {
        Object.keys(tracks).forEach(function (name) { tracks[name].muted = Boolean(value); });
      },
      unlock: function () {
        Object.keys(tracks).forEach(function (name) {
          const audio = tracks[name];
          const wasMuted = audio.muted;
          audio.muted = true;
          try {
            const result = audio.play();
            if (result && typeof result.then === 'function') {
              result.then(function () {
                audio.pause();
                audio.currentTime = 0;
                audio.muted = wasMuted;
              }).catch(function () { audio.muted = wasMuted; });
            }
          } catch (error) {
            audio.muted = wasMuted;
          }
        });
      },
      stopAll: function () {
        Object.keys(tracks).forEach(function (name) {
          tracks[name].pause();
          tracks[name].currentTime = 0;
        });
      }
    };
  };
}(window));
