"use client";

/**
 * High-quality Synthesized Chime & Push Notification Engine for Viraso Admin
 * Works 100% reliably in browsers and Android WebView without external audio files.
 */

class AdminNotificationManager {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hasPromptedPermission: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("viraso_admin_sound_enabled");
      this.soundEnabled = stored !== null ? stored === "true" : true;
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("viraso_admin_sound_enabled", String(enabled));
    }
  }

  public toggleSound(): boolean {
    const next = !this.soundEnabled;
    this.setSoundEnabled(next);
    if (next) {
      this.playChime("order"); // preview sound when unmuting
    }
    return next;
  }

  /**
   * Request native browser notification permission
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    if (Notification.permission === "granted") {
      return true;
    }
    if (Notification.permission !== "denied") {
      try {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Plays a synthesized alert chime using Web Audio API
   */
  public playChime(type: "order" | "complaint" | "b2b" | "test" = "order"): void {
    if (!this.soundEnabled || typeof window === "undefined") return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === "closed") {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === "complaint") {
        // Double alert tone for complaint (Urgent / Warning)
        this.playTone(440, now, 0.15, "triangle", 0.3);
        this.playTone(330, now + 0.18, 0.25, "sine", 0.35);
      } else if (type === "b2b") {
        // Upward triad for B2B Wholesale inquiry
        this.playTone(523.25, now, 0.1, "sine", 0.25); // C5
        this.playTone(659.25, now + 0.1, 0.1, "sine", 0.25); // E5
        this.playTone(783.99, now + 0.2, 0.25, "triangle", 0.3); // G5
      } else {
        // High pleasant "Ding-Dong!" for New Orders
        // Tone 1: E5 (659.25 Hz)
        this.playTone(659.25, now, 0.2, "sine", 0.35);
        // Tone 2: A5 (880 Hz)
        this.playTone(880.0, now + 0.15, 0.45, "sine", 0.4);
      }
    } catch (err) {
      console.warn("Web Audio alert could not play:", err);
    }
  }

  private playTone(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Fires a native system/phone notification banner
   */
  public firePushNotification(
    title: string,
    body: string,
    tag: string = "viraso-alert"
  ): void {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/logo/viraso-v-mark.png",
          badge: "/logo/viraso-v-mark.png",
          tag,
        });
      } catch (err) {
        console.warn("Notification display failed:", err);
      }
    }
  }
}

export const adminNotifier = new AdminNotificationManager();
