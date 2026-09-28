'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface AudioContextValue {
  bgmAvailable: boolean;
  bgmPlaying: boolean;
  toggleBgm: () => void;
  /** Fades the background music in — called once the gate opens. */
  fadeInBgm: () => void;
  currentSongId: string | null;
  playSong: (id: string, url: string) => void;
  pauseSong: () => void;
  /** Progress 0 → 1 of the current track, used by the tonearm. */
  songProgress: number;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

const BGM_VOLUME = 0.32;
const FADE_STEP_MS = 90;

export function useSiteAudio(): AudioContextValue {
  const context = useContext(AudioCtx);
  if (!context) throw new Error('useSiteAudio must be used inside <AudioProvider>');
  return context;
}

export default function AudioProvider({
  bgmUrl,
  children,
}: {
  bgmUrl: string | null;
  children: React.ReactNode;
}) {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const songRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [songProgress, setSongProgress] = useState(0);

  const clearFade = useCallback(() => {
    if (fadeTimer.current) {
      clearInterval(fadeTimer.current);
      fadeTimer.current = null;
    }
  }, []);

  /** Ramps the volume in steps, then runs `onDone`. */
  const fadeTo = useCallback(
    (target: number, onDone?: () => void) => {
      const audio = bgmRef.current;
      if (!audio) return;
      clearFade();
      fadeTimer.current = setInterval(() => {
        const delta = target - audio.volume;
        if (Math.abs(delta) < 0.03) {
          audio.volume = target;
          clearFade();
          onDone?.();
          return;
        }
        audio.volume = Math.min(1, Math.max(0, audio.volume + Math.sign(delta) * 0.03));
      }, FADE_STEP_MS);
    },
    [clearFade],
  );

  // (Re)creates the background audio element when the URL changes.
  useEffect(() => {
    if (!bgmUrl) {
      bgmRef.current?.pause();
      bgmRef.current = null;
      setBgmPlaying(false);
      return;
    }

    const audio = new Audio(bgmUrl);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';
    bgmRef.current = audio;

    return () => {
      clearFade();
      audio.pause();
      bgmRef.current = null;
    };
  }, [bgmUrl, clearFade]);

  useEffect(() => clearFade, [clearFade]);

  const fadeInBgm = useCallback(() => {
    const audio = bgmRef.current;
    if (!audio || currentSongId) return;
    audio.volume = 0;
    void audio
      .play()
      .then(() => {
        setBgmPlaying(true);
        fadeTo(BGM_VOLUME);
      })
      // The browser may refuse autoplay: the floating button is still there,
      // so we show no error.
      .catch(() => setBgmPlaying(false));
  }, [currentSongId, fadeTo]);

  const toggleBgm = useCallback(() => {
    const audio = bgmRef.current;
    if (!audio) return;

    if (bgmPlaying) {
      fadeTo(0, () => {
        audio.pause();
        setBgmPlaying(false);
      });
    } else {
      // A track from the list takes priority over the background music.
      songRef.current?.pause();
      setCurrentSongId(null);
      audio.volume = 0;
      void audio
        .play()
        .then(() => {
          setBgmPlaying(true);
          fadeTo(BGM_VOLUME);
        })
        .catch(() => setBgmPlaying(false));
    }
  }, [bgmPlaying, fadeTo]);

  const pauseSong = useCallback(() => {
    songRef.current?.pause();
    setCurrentSongId(null);
  }, []);

  const playSong = useCallback(
    (id: string, url: string) => {
      if (currentSongId === id) {
        pauseSong();
        return;
      }

      // Duck the ambience before starting the track.
      const bgm = bgmRef.current;
      if (bgm && bgmPlaying) {
        fadeTo(0, () => {
          bgm.pause();
          setBgmPlaying(false);
        });
      }

      let audio = songRef.current;
      if (!audio) {
        audio = new Audio();
        audio.preload = 'auto';
        songRef.current = audio;
        audio.addEventListener('ended', () => {
          setCurrentSongId(null);
          setSongProgress(0);
        });
        audio.addEventListener('timeupdate', () => {
          const duration = audio?.duration ?? 0;
          setSongProgress(duration > 0 ? (audio!.currentTime / duration) : 0);
        });
      }

      if (audio.src !== url) {
        audio.src = url;
        setSongProgress(0);
      }
      audio.volume = 0.9;

      void audio
        .play()
        .then(() => setCurrentSongId(id))
        .catch(() => setCurrentSongId(null));
    },
    [bgmPlaying, currentSongId, fadeTo, pauseSong],
  );

  const value = useMemo<AudioContextValue>(
    () => ({
      bgmAvailable: Boolean(bgmUrl),
      bgmPlaying,
      toggleBgm,
      fadeInBgm,
      currentSongId,
      playSong,
      pauseSong,
      songProgress,
    }),
    [bgmUrl, bgmPlaying, toggleBgm, fadeInBgm, currentSongId, playSong, pauseSong, songProgress],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}
