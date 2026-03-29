class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private seVolume: number = 0.8;
  private bgmVolume: number = 0.7;
  private isMuted: boolean = false;
  
  // BGM specific
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmSource: MediaElementAudioSourceNode | null = null;
  private bgmGain: GainNode | null = null;
  private currentBgm: string | null = null;

  private init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    // BGM node setup
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.connect(this.masterGain);
    
    this.updateVolumes();
  }

  private updateVolumes() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const finalSeVolume = this.isMuted ? 0 : this.seVolume;
    const finalBgmVolume = this.isMuted ? 0 : this.bgmVolume;

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(finalSeVolume, now, 0.02);
    }
    if (this.bgmGain) {
      this.bgmGain.gain.setTargetAtTime(finalBgmVolume, now, 0.02);
    }
  }

  public setVolume(se: number, bgm: number) {
    this.seVolume = Math.max(0, Math.min(1, se / 100));
    this.bgmVolume = Math.max(0, Math.min(1, bgm / 100));
    if (!this.ctx) this.init();
    this.updateVolumes();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.ctx) this.init();
    this.updateVolumes();
  }

  public playBGM(filename: string) {
    if (this.currentBgm === filename) return;
    this.init();
    this.stopBGM();
    
    this.currentBgm = filename;
    this.bgmAudio = new Audio(`/assets/sounds/bgm/${filename}`);
    this.bgmAudio.loop = true;

    this.bgmSource = this.ctx!.createMediaElementSource(this.bgmAudio);
    this.bgmSource.connect(this.bgmGain!);

    this.bgmAudio.play().catch(e => console.warn("BGM play failed (user interaction required):", e));
  }

  public stopBGM() {
    if (this.bgmSource) {
      this.bgmSource.disconnect();
      this.bgmSource = null;
    }
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.src = '';
      this.bgmAudio = null;
    }
    this.currentBgm = null;
  }

  // Gacha Reveal Sound - Heavy, impactful gacha-style
  public playGachaReveal(rarity: string) {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const createTone = (freq: number, startTime: number, duration: number, vol: number, type: OscillatorType = 'triangle') => {
      const osc = this.createOsc(type, freq, startTime);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const createSparkle = (startTime: number, duration: number, vol: number) => {
      const bufferSize = this.ctx!.sampleRate * duration;
      const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = this.ctx!.createBufferSource();
      source.buffer = buffer;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5000, startTime);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      source.connect(filter);
      filter.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      source.start(startTime);
      source.stop(startTime + duration);
    };

    // Heavy sub-bass impact "ドゴーン"
    const createImpact = (startTime: number, vol: number) => {
      // Sub-bass thud
      const sub = this.createOsc('sine', 60, startTime);
      const subGain = this.ctx!.createGain();
      subGain.gain.setValueAtTime(vol, startTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
      sub.frequency.exponentialRampToValueAtTime(30, startTime + 0.5);
      sub.connect(subGain);
      if (this.masterGain) subGain.connect(this.masterGain);
      sub.start(startTime);
      sub.stop(startTime + 0.8);

      // Noise burst for punch
      const bufferSize = this.ctx!.sampleRate * 0.3;
      const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx!.createBufferSource();
      noise.buffer = buffer;
      const lpf = this.ctx!.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(800, startTime);
      lpf.frequency.exponentialRampToValueAtTime(100, startTime + 0.2);
      const noiseGain = this.ctx!.createGain();
      noiseGain.gain.setValueAtTime(vol * 0.6, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      noise.connect(lpf);
      lpf.connect(noiseGain);
      if (this.masterGain) noiseGain.connect(this.masterGain);
      noise.start(startTime);
      noise.stop(startTime + 0.3);
    };

    // Metallic ring "キィーン"
    const createMetalRing = (startTime: number, vol: number, duration: number) => {
      [2637, 3520, 4186].forEach(f => {
        const osc = this.createOsc('sine', f, startTime);
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol * 0.3, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        if (this.masterGain) gain.connect(this.masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    };

    if (rarity === 'SSR') {
      // SSR: "ドゥルルル...ドゴォォン！！キラキラ〜"
      // Drum roll build-up
      for (let i = 0; i < 8; i++) {
        const t = now + i * 0.06;
        createTone(80 + i * 15, t, 0.08, 0.15 + i * 0.03, 'sawtooth');
      }
      // Massive impact at 0.5s
      createImpact(now + 0.5, 0.5);
      // Metallic ring
      createMetalRing(now + 0.5, 0.4, 2.5);
      // Ascending fanfare chords
      [523.25, 659.25, 783.99].forEach((f, i) => {
        createTone(f, now + 0.55 + i * 0.08, 2.0, 0.25, 'sine');
        createTone(f * 2, now + 0.55 + i * 0.08, 1.5, 0.1, 'triangle');
      });
      // Massive final chord
      [1046.50, 1318.51, 1567.98, 2093.00].forEach(f => {
        createTone(f, now + 0.8, 3.0, 0.15, 'sine');
      });
      // Long sparkle shimmer
      createSparkle(now + 0.5, 3.0, 0.1);
      createSparkle(now + 1.0, 2.5, 0.06);
    } else if (rarity === 'SR') {
      // SR: "ジャキーン！"  metallic slash + ring
      // Quick swoosh up
      const swoosh = this.createOsc('sawtooth', 200, now);
      const swooshGain = this.ctx!.createGain();
      swooshGain.gain.setValueAtTime(0.3, now);
      swooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      swoosh.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      swoosh.connect(swooshGain);
      if (this.masterGain) swooshGain.connect(this.masterGain);
      swoosh.start(now);
      swoosh.stop(now + 0.15);
      // Impact
      createImpact(now + 0.1, 0.3);
      // Metal ring
      createMetalRing(now + 0.1, 0.3, 1.5);
      // Chord
      [523.25, 783.99, 1046.50].forEach(f => {
        createTone(f, now + 0.15, 1.2, 0.2, 'sine');
      });
      createSparkle(now + 0.1, 1.2, 0.06);
    } else {
      // R: "ポロン" soft, short chime
      createTone(659.25, now, 0.3, 0.2, 'sine');        // E5
      createTone(783.99, now + 0.1, 0.4, 0.15, 'sine'); // G5
      createTone(523.25, now + 0.2, 0.5, 0.1, 'triangle'); // C5 soft tail
    }
  }

  // Suspenseful Drumroll/Wait Sound - Heavy gacha anticipation
  public playGachaWait(duration: number) {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const totalSec = duration / 1000;

    // Layer 1: Accelerating low drum hits (ドドドドド...)
    const hitCount = Math.floor(totalSec / 0.08);
    for (let i = 0; i < hitCount; i++) {
      const progress = i / hitCount; // 0→1
      // Accelerate: intervals get shorter toward the end
      const time = now + totalSec * (1 - Math.pow(1 - progress, 1.5));
      const freq = 60 + progress * 40; // Low rumble rising slightly
      const vol = 0.08 + progress * 0.2; // Gets louder

      const osc = this.createOsc('sine', freq, time);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.07);

      // Add noise hit for punch
      if (i % 2 === 0) {
        const bufSize = this.ctx!.sampleRate * 0.05;
        const buf = this.ctx!.createBuffer(1, bufSize, this.ctx!.sampleRate);
        const d = buf.getChannelData(0);
        for (let j = 0; j < bufSize; j++) d[j] = Math.random() * 2 - 1;
        const src = this.ctx!.createBufferSource();
        src.buffer = buf;
        const lpf = this.ctx!.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(300 + progress * 500, time);
        const nGain = this.ctx!.createGain();
        nGain.gain.setValueAtTime(vol * 0.4, time);
        nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        src.connect(lpf);
        lpf.connect(nGain);
        if (this.masterGain) nGain.connect(this.masterGain);
        src.start(time);
        src.stop(time + 0.05);
      }
    }

    // Layer 2: Rising tension tone (continuous)
    const tensionOsc = this.createOsc('sawtooth', 80, now);
    const tensionGain = this.ctx!.createGain();
    tensionGain.gain.setValueAtTime(0, now);
    tensionGain.gain.linearRampToValueAtTime(0.12, now + totalSec * 0.8);
    tensionGain.gain.linearRampToValueAtTime(0.2, now + totalSec);
    tensionOsc.frequency.exponentialRampToValueAtTime(200, now + totalSec);
    const tensionFilter = this.ctx!.createBiquadFilter();
    tensionFilter.type = 'lowpass';
    tensionFilter.frequency.setValueAtTime(200, now);
    tensionFilter.frequency.exponentialRampToValueAtTime(1200, now + totalSec);
    tensionOsc.connect(tensionFilter);
    tensionFilter.connect(tensionGain);
    if (this.masterGain) tensionGain.connect(this.masterGain);
    tensionOsc.start(now);
    tensionOsc.stop(now + totalSec);
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.bgmAudio && this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  private createOsc(type: OscillatorType, freq: number, startTime: number): OscillatorNode {
    if (!this.ctx) this.init();
    const osc = this.ctx!.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    return osc;
  }

  private createGain(startTime: number, duration: number, startVal: number, endVal: number = 0, type: 'linear' | 'exp' = 'exp'): GainNode {
    if (!this.ctx) this.init();
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(startVal, startTime);
    if (type === 'linear') {
      gain.gain.linearRampToValueAtTime(endVal, startTime + duration);
    } else {
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endVal), startTime + duration);
    }
    return gain;
  }

  // --- Sound Effects ---

  // Sharp slash sound "Zusha" (ズシャ)
  public playAttack() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    // --- "Zu" (ズ) Part: Low frequency slash ---
    const osc = this.createOsc('sawtooth', 300, now);
    const gain = this.createGain(now, 0.2, 0.4);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    
    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.2);

    // --- "Sha" (シャ) Part: High frequency texture ---
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.2); // Sweeping down slightly

    const noiseGain = this.createGain(now, 0.25, 0.15, 0);

    noise.connect(filter);
    filter.connect(noiseGain);
    if (this.masterGain) noiseGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.25);
  }

  // Blunt hit sound
  public playHit() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    // Noise for impact
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    const gain = this.createGain(now, 0.1, 0.6);

    noise.connect(filter);
    filter.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.1);
  }

  // Rising sparkle sound
  // Shimmering Skill Heal (Luxurious)
  public playSkillHeal() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (High Major Chord)
    notes.forEach((freq, i) => {
      const timeOffset = i * 0.1;
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + timeOffset + 0.6);
      
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.2, now + timeOffset + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.8);
      
      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.8);

      // Add a shimmering pulse for each note
      const pulseOsc = this.ctx!.createOscillator();
      pulseOsc.type = 'triangle';
      pulseOsc.frequency.setValueAtTime(freq * 2, now + timeOffset);
      const pulseGain = this.ctx!.createGain();
      pulseGain.gain.setValueAtTime(0, now + timeOffset);
      pulseGain.gain.linearRampToValueAtTime(0.05, now + timeOffset + 0.05);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.3);
      
      pulseOsc.connect(pulseGain);
      if (this.masterGain) pulseGain.connect(this.masterGain);
      pulseOsc.start(now + timeOffset);
      pulseOsc.stop(now + timeOffset + 0.3);
    });

    // Shimmering Noise
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) channelData[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, now);
    const noiseGain = this.ctx!.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    noise.connect(filter);
    filter.connect(noiseGain);
    if (this.masterGain) noiseGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.5);
  }

  // Simple Item Heal
  public playHeal() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    for (let i = 0; i < 3; i++) {
        const timeOffset = i * 0.1;
        const osc = this.createOsc('sine', 440 + i * 220, now + timeOffset);
        const gain = this.createGain(now + timeOffset, 0.4, 0.2);
        
        osc.frequency.exponentialRampToValueAtTime(1200 + i * 400, now + timeOffset + 0.4);
        
        osc.connect(gain);
        if (this.masterGain) gain.connect(this.masterGain);
        
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.4);
    }
  }

  // Aojiru skill sound "トクトクトク...ドバシャーッ！"
  public playSkill() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // "トクトクトク" - Pouring bubbles (liquid being poured)
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.08;
      const freq = 280 + Math.random() * 80; // Slightly random bubble pitch
      const osc = this.createOsc('sine', freq, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.05);
      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.06);
    }

    // "ドバシャーッ！" - Splash impact at 0.4s
    const splashStart = now + 0.4;

    // Low body of the splash
    const splashOsc = this.createOsc('sine', 120, splashStart);
    const splashGain = this.ctx.createGain();
    splashGain.gain.setValueAtTime(0.25, splashStart);
    splashGain.gain.exponentialRampToValueAtTime(0.001, splashStart + 0.3);
    splashOsc.frequency.exponentialRampToValueAtTime(60, splashStart + 0.2);
    splashOsc.connect(splashGain);
    if (this.masterGain) splashGain.connect(this.masterGain);
    splashOsc.start(splashStart);
    splashOsc.stop(splashStart + 0.3);

    // Filtered noise for water/splash texture
    const bufSize = this.ctx.sampleRate * 0.4;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(2000, splashStart);
    bpf.frequency.exponentialRampToValueAtTime(600, splashStart + 0.35);
    bpf.Q.setValueAtTime(1.5, splashStart);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.2, splashStart);
    nGain.gain.exponentialRampToValueAtTime(0.001, splashStart + 0.35);
    noise.connect(bpf);
    bpf.connect(nGain);
    if (this.masterGain) nGain.connect(this.masterGain);
    noise.start(splashStart);
    noise.stop(splashStart + 0.4);

    // Bright "power-up" shimmer after splash (the aojiru effect activating)
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const t = splashStart + 0.15 + i * 0.06;
      const osc = this.createOsc('sine', f, t);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  // Simple UI click "Pikori" (ピコリ)
  public playPikori() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    // First tone (Pi)
    const osc1 = this.createOsc('sine', 880, now);
    const gain1 = this.createGain(now, 0.05, 0.1);
    osc1.connect(gain1);
    if (this.masterGain) gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.05);

    // Second tone (Kori)
    const osc2 = this.createOsc('sine', 1100, now + 0.05);
    const gain2 = this.createGain(now + 0.05, 0.05, 0.1);
    osc2.connect(gain2);
    if (this.masterGain) gain2.connect(this.masterGain);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.1);
  }

  // Legacy click (Keeping for variety)
  public playClick() {
    this.playPikori(); // Standardize to Pikori for now
  }

  // Sortie / Departure sound "ドゥン！→シュイーン！"
  public playSortie() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Heavy low impact "ドゥン！"
    const sub = this.createOsc('sine', 80, now);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    sub.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    sub.connect(subGain);
    if (this.masterGain) subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.4);

    // Noise burst for punch
    const bufSize = this.ctx.sampleRate * 0.15;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(600, now);
    lpf.frequency.exponentialRampToValueAtTime(80, now + 0.12);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.3, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    noise.connect(lpf);
    lpf.connect(nGain);
    if (this.masterGain) nGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.15);

    // Rising swoosh "シュイーン！"
    const swoosh = this.createOsc('sawtooth', 150, now + 0.15);
    swoosh.frequency.exponentialRampToValueAtTime(1500, now + 0.5);
    const swooshFilter = this.ctx.createBiquadFilter();
    swooshFilter.type = 'bandpass';
    swooshFilter.frequency.setValueAtTime(400, now + 0.15);
    swooshFilter.frequency.exponentialRampToValueAtTime(3000, now + 0.5);
    swooshFilter.Q.setValueAtTime(2, now + 0.15);
    const swooshGain = this.ctx.createGain();
    swooshGain.gain.setValueAtTime(0, now + 0.15);
    swooshGain.gain.linearRampToValueAtTime(0.25, now + 0.25);
    swooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    swoosh.connect(swooshFilter);
    swooshFilter.connect(swooshGain);
    if (this.masterGain) swooshGain.connect(this.masterGain);
    swoosh.start(now + 0.15);
    swoosh.stop(now + 0.55);

    // Resolving power chord
    [261.63, 329.63, 392.00].forEach(f => {
      const osc = this.createOsc('square', f, now + 0.35);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, now + 0.35);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.38);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      osc.start(now + 0.35);
      osc.stop(now + 0.8);
    });
  }

  // Fanfare
  public playWin() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
        const osc = this.createOsc('square', freq, now + i * 0.15);
        const gain = this.createGain(now + i * 0.15, 0.3, 0.1);
        
        osc.connect(gain);
        if (this.masterGain) gain.connect(this.masterGain);
        
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.3);
    });
  }
}

export const soundManager = new SoundManager();
