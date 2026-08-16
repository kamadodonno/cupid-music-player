import { useState, useCallback, useMemo } from 'react';

// ── Pink theme assets ────────────────────────────────────
import pinkFrame from './assets/pink/frame.webp';
import pinkFrameNoBg from './assets/pink/frame_no_background.webp';
import pinkLibraryFrame from './assets/pink/library_frame.webp';
import pinkPlant from './assets/pink/plant.webp';
import pinkRecordPlayer from './assets/pink/record_player.webp';
import pinkAlbumFrame from './assets/pink/album_frame.webp';
import pinkBackwardsButton from './assets/pink/backwards_button.webp';
import pinkPauseButton from './assets/pink/pause_button.webp';
import pinkPlayButton from './assets/pink/play_button.webp';
import pinkForwardsButton from './assets/pink/forwards_button.webp';
import pinkFavicon from './assets/pink/favicon.webp';
import pinkProgressBar from './assets/pink/progress_bar.webp';
import pinkSettings from './assets/pink/settings.webp';
import pinkLibraryButton from './assets/pink/library_button.webp';
import pinkVolumeButton from './assets/pink/volume_button.webp';
import pinkMuteButton from './assets/pink/mute_button.webp';
import pinkShuffleButton from './assets/pink/shuffle_button.webp';
import pinkRepeatButton from './assets/pink/repeat_button.webp';
import pinkVolumeBarHigh from './assets/pink/volume_bar_high.webp';
import pinkVolumeBarLow from './assets/pink/volume_bar_low.webp';

// ── Blue theme assets ────────────────────────────────────
import blueFrame from './assets/blue/frame.webp';
import blueFrameNoBg from './assets/blue/frame_no_background.webp';
import blueLibraryFrame from './assets/blue/library_frame.webp';
import bluePlant from './assets/blue/plant.webp';
import blueRecordPlayer from './assets/blue/record_player.webp';
import blueAlbumFrame from './assets/blue/album_frame.webp';
import blueBackwardsButton from './assets/blue/backwards_button.webp';
import bluePauseButton from './assets/blue/pause_button.webp';
import bluePlayButton from './assets/blue/play_button.webp';
import blueForwardsButton from './assets/blue/forwards_button.webp';
import blueFavicon from './assets/blue/favicon.webp';
import blueProgressBar from './assets/blue/progress_bar.webp';
import blueSettings from './assets/blue/settings.webp';
import blueLibraryButton from './assets/blue/library_button.webp';
import blueVolumeButton from './assets/blue/volume_button.webp';
import blueMuteButton from './assets/blue/mute_button.webp';
import blueShuffleButton from './assets/blue/shuffle_button.webp';
import blueRepeatButton from './assets/blue/repeat_button.webp';
import blueVolumeBarHigh from './assets/blue/volume_bar_high.webp';
import blueVolumeBarLow from './assets/blue/volume_bar_low.webp';

// ── Shared record animations ────────────────────────────
import recordA1 from './assets/animations/record-pink/frame-1.webp';
import recordA2 from './assets/animations/record-pink/frame-2.webp';
import recordA3 from './assets/animations/record-pink/frame-3.webp';
import recordA4 from './assets/animations/record-pink/frame-4.webp';

import recordB1 from './assets/animations/record-blue/frame-1.webp';
import recordB2 from './assets/animations/record-blue/frame-2.webp';
import recordB3 from './assets/animations/record-blue/frame-3.webp';
import recordB4 from './assets/animations/record-blue/frame-4.webp';

// ── Pink needle animations ──────────────────────────────
import pinkNeedlePlay1 from './assets/animations/pink/needle-playing/frame-1.webp';
import pinkNeedlePlay2 from './assets/animations/pink/needle-playing/frame-2.webp';
import pinkNeedlePlay3 from './assets/animations/pink/needle-playing/frame-3.webp';

import pinkNeedleChange1 from './assets/animations/pink/needle-change/frame-1.webp';
import pinkNeedleChange2 from './assets/animations/pink/needle-change/frame-2.webp';
import pinkNeedleChange3 from './assets/animations/pink/needle-change/frame-3.webp';

// ── Blue needle animations ──────────────────────────────
import blueNeedlePlay1 from './assets/animations/blue/needle-playing/frame-1.webp';
import blueNeedlePlay2 from './assets/animations/blue/needle-playing/frame-2.webp';
import blueNeedlePlay3 from './assets/animations/blue/needle-playing/frame-3.webp';

import blueNeedleChange1 from './assets/animations/blue/needle-change/frame-1.webp';
import blueNeedleChange2 from './assets/animations/blue/needle-change/frame-2.webp';
import blueNeedleChange3 from './assets/animations/blue/needle-change/frame-3.webp';

const SHARED_RECORD_FRAMES = {
  recordFramesA: [recordA1, recordA2, recordA3, recordA4],
  recordFramesB: [recordB1, recordB2, recordB3, recordB4],
};

const THEME_ASSETS = {
  pink: {
    frame: pinkFrame,
    frameNoBg: pinkFrameNoBg,
    libraryFrame: pinkLibraryFrame,
    plant: pinkPlant,
    recordPlayer: pinkRecordPlayer,
    albumFrame: pinkAlbumFrame,
    backwardsButton: pinkBackwardsButton,
    pauseButton: pinkPauseButton,
    playButton: pinkPlayButton,
    forwardsButton: pinkForwardsButton,
    favicon: pinkFavicon,
    progressBar: pinkProgressBar,
    settings: pinkSettings,
    libraryButton: pinkLibraryButton,
    volumeButton: pinkVolumeButton,
    muteButton: pinkMuteButton,
    shuffleButton: pinkShuffleButton,
    repeatButton: pinkRepeatButton,
    volumeBarHigh: pinkVolumeBarHigh,
    volumeBarLow: pinkVolumeBarLow,
    ...SHARED_RECORD_FRAMES,
    needlePlayFrames: [pinkNeedlePlay1, pinkNeedlePlay2, pinkNeedlePlay3],
    needleChangeFrames: [pinkNeedleChange1, pinkNeedleChange2, pinkNeedleChange3],
  },

  blue: {
    frame: blueFrame,
    frameNoBg: blueFrameNoBg,
    libraryFrame: blueLibraryFrame,
    plant: bluePlant,
    recordPlayer: blueRecordPlayer,
    albumFrame: blueAlbumFrame,
    backwardsButton: blueBackwardsButton,
    pauseButton: bluePauseButton,
    playButton: bluePlayButton,
    forwardsButton: blueForwardsButton,
    favicon: blueFavicon,
    progressBar: blueProgressBar,
    settings: blueSettings,
    libraryButton: blueLibraryButton,
    volumeButton: blueVolumeButton,
    muteButton: blueMuteButton,
    shuffleButton: blueShuffleButton,
    repeatButton: blueRepeatButton,
    volumeBarHigh: blueVolumeBarHigh,
    volumeBarLow: blueVolumeBarLow,
    ...SHARED_RECORD_FRAMES,
    needlePlayFrames: [blueNeedlePlay1, blueNeedlePlay2, blueNeedlePlay3],
    needleChangeFrames: [blueNeedleChange1, blueNeedleChange2, blueNeedleChange3],
  },
};

const STORAGE_KEY = 'cupid-player-theme';

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === 'pink' || stored === 'blue') {
      return stored;
    }

  } catch {
    // ignore
  }

  return 'pink';
}

export default function useTheme() {

  const [theme, setTheme] = useState(getStoredTheme);

  const toggleTheme = useCallback(() => {

    setTheme((prev) => {

      const next =
        prev === 'pink'
          ? 'blue'
          : 'pink';

      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }

      window.cupid?.setTheme(next);

      return next;
    });

  }, []);

  const assets = useMemo(
    () => THEME_ASSETS[theme],
    [theme]
  );

  return {
    theme,
    toggleTheme,
    assets
  };
}