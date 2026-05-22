// src/services/audio.ts
import { Howl, Howler } from 'howler';
import { useAudioStore } from '@/store';
import type { AudioTrack } from '@/types';

class AudioEngine {
  private howl: Howl | null = null;
  private sleepTimerTimeout: ReturnType<typeof setTimeout> | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;

  play(track: AudioTrack, startTime = 0): void {
    this.stop();
    const store = useAudioStore.getState();
    store.setTrack(track);

    this.howl = new Howl({
      src: [track.url],
      html5: true,
      volume: store.volume,
      rate: store.playbackRate,
      onload: () => {
        store.setDuration(this.howl?.duration() || 0);
      },
      onplay: () => {
        store.setPlaying(true);
        this.startProgressTracking();
      },
      onpause: () => {
        store.setPlaying(false);
        this.stopProgressTracking();
      },
      onstop: () => {
        store.setPlaying(false);
        this.stopProgressTracking();
      },
      onend: () => {
        store.setPlaying(false);
        this.stopProgressTracking();
        const { isRepeat } = useAudioStore.getState();
        if (isRepeat) {
          this.howl?.play();
        } else {
          useAudioStore.getState().nextTrack();
          const nextTrack = useAudioStore.getState().track;
          if (nextTrack) this.play(nextTrack);
        }
      },
      onloaderror: (_, err) => {
        console.error('Audio load error:', err);
        store.setPlaying(false);
      },
    });

    if (startTime > 0) this.howl.seek(startTime);
    this.howl.play();
  }

  pause(): void {
    this.howl?.pause();
  }

  resume(): void {
    this.howl?.play();
  }

  stop(): void {
    this.howl?.stop();
    this.howl?.unload();
    this.howl = null;
    this.stopProgressTracking();
  }

  seek(time: number): void {
    this.howl?.seek(time);
    useAudioStore.getState().setCurrentTime(time);
  }

  setVolume(volume: number): void {
    Howler.volume(volume);
    useAudioStore.getState().setVolume(volume);
  }

  setPlaybackRate(rate: number): void {
    this.howl?.rate(rate);
    useAudioStore.getState().setPlaybackRate(rate);
  }

  setSleepTimer(minutes: number): void {
    if (this.sleepTimerTimeout) clearTimeout(this.sleepTimerTimeout);
    useAudioStore.getState().setSleepTimer(minutes);
    this.sleepTimerTimeout = setTimeout(() => {
      this.pause();
      useAudioStore.getState().setSleepTimer(null);
    }, minutes * 60 * 1000);
  }

  cancelSleepTimer(): void {
    if (this.sleepTimerTimeout) {
      clearTimeout(this.sleepTimerTimeout);
      this.sleepTimerTimeout = null;
    }
    useAudioStore.getState().setSleepTimer(null);
  }

  getCurrentTime(): number {
    return (this.howl?.seek() as number) || 0;
  }

  isPlaying(): boolean {
    return this.howl?.playing() || false;
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();
    this.progressInterval = setInterval(() => {
      const time = this.getCurrentTime();
      useAudioStore.getState().setCurrentTime(time);
    }, 500);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  playQueue(tracks: AudioTrack[], startIndex = 0): void {
    useAudioStore.getState().setQueue(tracks, startIndex);
    const track = tracks[startIndex];
    if (track) this.play(track);
  }

  next(): void {
    useAudioStore.getState().nextTrack();
    const track = useAudioStore.getState().track;
    if (track) this.play(track);
  }

  prev(): void {
    const currentTime = this.getCurrentTime();
    if (currentTime > 3) { this.seek(0); return; }
    useAudioStore.getState().prevTrack();
    const track = useAudioStore.getState().track;
    if (track) this.play(track);
  }
}

export const audioEngine = new AudioEngine();
