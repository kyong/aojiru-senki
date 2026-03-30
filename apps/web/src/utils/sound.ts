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
  private bgmPausedByApp: boolean = false;

  // Convolver for reverb
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;

  private init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    // BGM node setup
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.connect(this.masterGain);

    // Create reverb convolver
    this.setupReverb();

    this.updateVolumes();
  }

  private setupReverb() {
    if (!this.ctx || !this.masterGain) return;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 1.5; // 1.5 second reverb tail
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        // Exponential decay with slight randomness for natural feel
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = impulse;
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.15;
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);
  }

  private connectWithReverb(node: AudioNode, dryAmount: number = 1.0, wetAmount: number = 0.2) {
    if (!this.masterGain) return;
    // Dry signal
    const dryGain = this.ctx!.createGain();
    dryGain.gain.value = dryAmount;
    node.connect(dryGain);
    dryGain.connect(this.masterGain);
    // Wet signal (reverb)
    if (this.reverbNode) {
      const wetGain = this.ctx!.createGain();
      wetGain.gain.value = wetAmount;
      node.connect(wetGain);
      wetGain.connect(this.reverbNode);
    }
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
    this.bgmPausedByApp = false;

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
      this.connectWithReverb(gain, 1.0, 0.3);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const createSparkle = (startTime: number, duration: number, vol: number) => {
      const bufferSize = this.ctx!.sampleRate * duration;
      const buffer = this.ctx!.createBuffer(2, bufferSize, this.ctx!.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      }
      const source = this.ctx!.createBufferSource();
      source.buffer = buffer;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5000, startTime);
      // Add resonance for more shimmer
      filter.Q.setValueAtTime(3, startTime);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      source.connect(filter);
      filter.connect(gain);
      this.connectWithReverb(gain, 1.0, 0.4);
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

      // Layered sub-bass for depth
      const sub2 = this.createOsc('sine', 45, startTime);
      const sub2Gain = this.ctx!.createGain();
      sub2Gain.gain.setValueAtTime(vol * 0.6, startTime);
      sub2Gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0);
      sub2.connect(sub2Gain);
      if (this.masterGain) sub2Gain.connect(this.masterGain);
      sub2.start(startTime);
      sub2.stop(startTime + 1.0);

      // Noise burst for punch
      const bufferSize = this.ctx!.sampleRate * 0.3;
      const buffer = this.ctx!.createBuffer(2, bufferSize, this.ctx!.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      }
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

      // Distortion-like mid crunch
      const crunch = this.createOsc('sawtooth', 120, startTime);
      const crunchGain = this.ctx!.createGain();
      crunchGain.gain.setValueAtTime(vol * 0.3, startTime);
      crunchGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      crunch.frequency.exponentialRampToValueAtTime(50, startTime + 0.3);
      const crunchFilter = this.ctx!.createBiquadFilter();
      crunchFilter.type = 'lowpass';
      crunchFilter.frequency.setValueAtTime(400, startTime);
      crunch.connect(crunchFilter);
      crunchFilter.connect(crunchGain);
      if (this.masterGain) crunchGain.connect(this.masterGain);
      crunch.start(startTime);
      crunch.stop(startTime + 0.4);
    };

    // Metallic ring "キィーン" with harmonics
    const createMetalRing = (startTime: number, vol: number, duration: number) => {
      [2637, 3520, 4186, 5274, 6272].forEach((f, idx) => {
        const osc = this.createOsc('sine', f, startTime);
        const gain = this.ctx!.createGain();
        const layerVol = vol * (0.3 - idx * 0.04);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(Math.max(layerVol, 0.02), startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        this.connectWithReverb(gain, 1.0, 0.5);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
      // Detuned pair for chorus effect
      [2640, 3525].forEach(f => {
        const osc = this.createOsc('sine', f, startTime);
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol * 0.1, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.8);
        osc.connect(gain);
        this.connectWithReverb(gain, 1.0, 0.5);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    };

    if (rarity === 'SSR') {
      // SSR: "ドゥルルル...ドゴォォン！！キラキラ〜"
      // Drum roll build-up with acceleration
      for (let i = 0; i < 12; i++) {
        const t = now + i * 0.045;
        createTone(60 + i * 12, t, 0.06, 0.12 + i * 0.025, 'sawtooth');
        // Add higher octave hits for fullness
        if (i > 4) {
          createTone(120 + i * 24, t + 0.02, 0.04, 0.06, 'triangle');
        }
      }
      // Timpani-like roll
      for (let i = 0; i < 6; i++) {
        const t = now + 0.3 + i * 0.03;
        createTone(50 + i * 5, t, 0.05, 0.1 + i * 0.03, 'sine');
      }
      // Massive impact at 0.55s
      createImpact(now + 0.55, 0.55);
      // Metallic ring with more harmonics
      createMetalRing(now + 0.55, 0.45, 3.0);
      // Ascending fanfare chords with doubled voices
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        createTone(f, now + 0.6 + i * 0.07, 2.5, 0.22, 'sine');
        createTone(f * 2, now + 0.6 + i * 0.07, 2.0, 0.08, 'triangle');
        // Add fifth harmony
        createTone(f * 1.5, now + 0.65 + i * 0.07, 1.8, 0.06, 'sine');
      });
      // Massive final chord - full orchestral
      [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00].forEach((f, i) => {
        createTone(f, now + 0.9, 3.5, 0.12 - i * 0.01, 'sine');
      });
      // Brass-like layer
      [523.25, 783.99, 1046.50].forEach(f => {
        createTone(f, now + 0.9, 2.0, 0.08, 'sawtooth');
      });
      // Long sparkle shimmer - multiple layers
      createSparkle(now + 0.55, 3.5, 0.12);
      createSparkle(now + 0.8, 3.0, 0.08);
      createSparkle(now + 1.5, 2.5, 0.06);
      // Bell-like high accents
      [4186, 5274, 6645].forEach((f, i) => {
        createTone(f, now + 0.6 + i * 0.3, 2.0, 0.04, 'sine');
      });
    } else if (rarity === 'SR') {
      // SR: "ジャキーン！" metallic slash + ring
      // Quick swoosh up with harmonics
      const swoosh = this.createOsc('sawtooth', 200, now);
      const swooshGain = this.ctx!.createGain();
      swooshGain.gain.setValueAtTime(0.3, now);
      swooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      swoosh.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      swoosh.connect(swooshGain);
      if (this.masterGain) swooshGain.connect(this.masterGain);
      swoosh.start(now);
      swoosh.stop(now + 0.15);
      // Second swoosh layer
      const swoosh2 = this.createOsc('square', 400, now);
      const swoosh2Gain = this.ctx!.createGain();
      swoosh2Gain.gain.setValueAtTime(0.1, now);
      swoosh2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      swoosh2.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
      swoosh2.connect(swoosh2Gain);
      if (this.masterGain) swoosh2Gain.connect(this.masterGain);
      swoosh2.start(now);
      swoosh2.stop(now + 0.12);
      // Impact
      createImpact(now + 0.1, 0.35);
      // Metal ring
      createMetalRing(now + 0.1, 0.35, 2.0);
      // Chord with more voices
      [523.25, 659.25, 783.99, 1046.50].forEach(f => {
        createTone(f, now + 0.15, 1.5, 0.18, 'sine');
      });
      createSparkle(now + 0.1, 1.5, 0.08);
      createSparkle(now + 0.4, 1.0, 0.04);
    } else {
      // R: "ポロン" soft, warm chime with resonance
      createTone(659.25, now, 0.5, 0.2, 'sine');        // E5
      createTone(783.99, now + 0.1, 0.6, 0.18, 'sine'); // G5
      createTone(1046.50, now + 0.2, 0.7, 0.12, 'sine'); // C6
      // Soft triangle tail
      createTone(523.25, now + 0.25, 0.5, 0.06, 'triangle'); // C5 soft tail
      // Gentle sparkle
      createSparkle(now + 0.15, 0.5, 0.02);
    }
  }

  // Suspenseful Drumroll/Wait Sound - Heavy gacha anticipation
  public playGachaWait(duration: number) {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const totalSec = duration / 1000;

    // Layer 1: Accelerating low drum hits (ドドドドド...)
    const hitCount = Math.floor(totalSec / 0.06);
    for (let i = 0; i < hitCount; i++) {
      const progress = i / hitCount; // 0→1
      const time = now + totalSec * (1 - Math.pow(1 - progress, 1.5));
      const freq = 55 + progress * 50;
      const vol = 0.08 + progress * 0.25;

      const osc = this.createOsc('sine', freq, time);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.05);

      // Add noise hit for punch on every beat
      if (i % 2 === 0) {
        const bufSize = this.ctx!.sampleRate * 0.04;
        const buf = this.ctx!.createBuffer(1, bufSize, this.ctx!.sampleRate);
        const d = buf.getChannelData(0);
        for (let j = 0; j < bufSize; j++) d[j] = Math.random() * 2 - 1;
        const src = this.ctx!.createBufferSource();
        src.buffer = buf;
        const lpf = this.ctx!.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(300 + progress * 600, time);
        const nGain = this.ctx!.createGain();
        nGain.gain.setValueAtTime(vol * 0.5, time);
        nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        src.connect(lpf);
        lpf.connect(nGain);
        if (this.masterGain) nGain.connect(this.masterGain);
        src.start(time);
        src.stop(time + 0.04);
      }

      // High accent hits in second half
      if (progress > 0.5 && i % 3 === 0) {
        const hiOsc = this.createOsc('triangle', freq * 4, time);
        const hiGain = this.ctx!.createGain();
        hiGain.gain.setValueAtTime(0, time);
        hiGain.gain.linearRampToValueAtTime(vol * 0.15, time + 0.005);
        hiGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        hiOsc.connect(hiGain);
        if (this.masterGain) hiGain.connect(this.masterGain);
        hiOsc.start(time);
        hiOsc.stop(time + 0.03);
      }
    }

    // Layer 2: Rising tension tone (continuous) with richer harmonics
    const tensionOsc = this.createOsc('sawtooth', 70, now);
    const tensionGain = this.ctx!.createGain();
    tensionGain.gain.setValueAtTime(0, now);
    tensionGain.gain.linearRampToValueAtTime(0.1, now + totalSec * 0.5);
    tensionGain.gain.linearRampToValueAtTime(0.22, now + totalSec);
    tensionOsc.frequency.exponentialRampToValueAtTime(220, now + totalSec);
    const tensionFilter = this.ctx!.createBiquadFilter();
    tensionFilter.type = 'lowpass';
    tensionFilter.frequency.setValueAtTime(150, now);
    tensionFilter.frequency.exponentialRampToValueAtTime(1500, now + totalSec);
    tensionFilter.Q.setValueAtTime(3, now);
    tensionOsc.connect(tensionFilter);
    tensionFilter.connect(tensionGain);
    if (this.masterGain) tensionGain.connect(this.masterGain);
    tensionOsc.start(now);
    tensionOsc.stop(now + totalSec);

    // Layer 3: Sub rumble
    const rumble = this.createOsc('sine', 40, now);
    const rumbleGain = this.ctx!.createGain();
    rumbleGain.gain.setValueAtTime(0, now);
    rumbleGain.gain.linearRampToValueAtTime(0.15, now + totalSec * 0.7);
    rumbleGain.gain.linearRampToValueAtTime(0.25, now + totalSec);
    rumble.frequency.linearRampToValueAtTime(60, now + totalSec);
    rumble.connect(rumbleGain);
    if (this.masterGain) rumbleGain.connect(this.masterGain);
    rumble.start(now);
    rumble.stop(now + totalSec);
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.bgmAudio && this.bgmAudio.paused && !this.bgmPausedByApp) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  public pauseBGM() {
    this.bgmPausedByApp = true;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  public resumeBGM() {
    this.bgmPausedByApp = false;
    this.resume();
  }

  private createOsc(type: OscillatorType, freq: number, startTime: number): OscillatorNode {
    if (!this.ctx) this.init();
    const osc = this.ctx!.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    return osc;
  }

  private createGainNode(startTime: number, duration: number, startVal: number, endVal: number = 0, type: 'linear' | 'exp' = 'exp'): GainNode {
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

  // Keep old name for compatibility
  private createGain(startTime: number, duration: number, startVal: number, endVal: number = 0, type: 'linear' | 'exp' = 'exp'): GainNode {
    return this.createGainNode(startTime, duration, startVal, endVal, type);
  }

  // White noise helper
  private createNoise(duration: number, stereo: boolean = false): AudioBufferSourceNode {
    const channels = stereo ? 2 : 1;
    const bufferSize = this.ctx!.sampleRate * duration;
    const buffer = this.ctx!.createBuffer(channels, bufferSize, this.ctx!.sampleRate);
    for (let ch = 0; ch < channels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  // --- Sound Effects ---

  // Sharp slash sound "Zusha" (ズシャッ！) - Multi-layered with impact
  public playAttack() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Layer 1: Sub-bass body "ズ" - deeper and heavier
    const sub = this.createOsc('sine', 100, now);
    const subGain = this.createGain(now, 0.12, 0.35);
    sub.frequency.exponentialRampToValueAtTime(30, now + 0.1);
    sub.connect(subGain);
    if (this.masterGain) subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.12);

    // Layer 2: Mid slash "シャ" - sawtooth sweep
    const osc = this.createOsc('sawtooth', 350, now);
    const gain = this.createGain(now, 0.18, 0.35);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);

    // Layer 3: High frequency texture with noise
    const noise = this.createNoise(0.2);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    filter.Q.setValueAtTime(2, now);
    const noiseGain = this.createGain(now, 0.2, 0.18);
    noise.connect(filter);
    filter.connect(noiseGain);
    if (this.masterGain) noiseGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.2);

    // Layer 4: Brief metallic ring for "bite"
    const ring = this.createOsc('sine', 2200, now);
    const ringGain = this.ctx.createGain();
    ringGain.gain.setValueAtTime(0, now);
    ringGain.gain.linearRampToValueAtTime(0.06, now + 0.005);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    ring.connect(ringGain);
    this.connectWithReverb(ringGain, 1.0, 0.15);
    ring.start(now);
    ring.stop(now + 0.15);

    // Layer 5: Impact transient click
    const click = this.createOsc('square', 1500, now);
    const clickGain = this.createGain(now, 0.02, 0.15);
    click.connect(clickGain);
    if (this.masterGain) clickGain.connect(this.masterGain);
    click.start(now);
    click.stop(now + 0.02);
  }

  // Blunt hit sound - Heavy double impact with body
  public playHit() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Layer 1: Sub-bass thud
    const thud = this.createOsc('sine', 80, now);
    const thudGain = this.createGain(now, 0.15, 0.45);
    thud.frequency.exponentialRampToValueAtTime(30, now + 0.1);
    thud.connect(thudGain);
    if (this.masterGain) thudGain.connect(this.masterGain);
    thud.start(now);
    thud.stop(now + 0.15);

    // Layer 2: Noise for impact texture
    const noise = this.createNoise(0.12);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    const noiseGain = this.createGain(now, 0.12, 0.5);
    noise.connect(filter);
    filter.connect(noiseGain);
    if (this.masterGain) noiseGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.12);

    // Layer 3: Brief high transient for "crack"
    const crack = this.createNoise(0.03);
    const hpf = this.ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(2500, now);
    const crackGain = this.createGain(now, 0.03, 0.12);
    crack.connect(hpf);
    hpf.connect(crackGain);
    if (this.masterGain) crackGain.connect(this.masterGain);
    crack.start(now);
    crack.stop(now + 0.03);

    // Layer 4: Double-hit with slight delay
    const thud2 = this.createOsc('sine', 60, now + 0.04);
    const thud2Gain = this.createGain(now + 0.04, 0.1, 0.25);
    thud2.frequency.exponentialRampToValueAtTime(25, now + 0.12);
    thud2.connect(thud2Gain);
    if (this.masterGain) thud2Gain.connect(this.masterGain);
    thud2.start(now + 0.04);
    thud2.stop(now + 0.14);
  }

  // Shimmering Skill Heal (Luxurious harp-like with reverb)
  public playSkillHeal() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Harp-like ascending arpeggio with extended notes
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51]; // G4, C5, E5, G5, C6, E6
    notes.forEach((freq, i) => {
      const timeOffset = i * 0.08;
      // Main tone
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + timeOffset + 0.8);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.18, now + timeOffset + 0.03);
      gain.gain.setValueAtTime(0.15, now + timeOffset + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 1.0);

      osc.connect(gain);
      this.connectWithReverb(gain, 0.8, 0.5);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 1.0);

      // Harmonic overtone for richness
      const harm = this.ctx!.createOscillator();
      harm.type = 'sine';
      harm.frequency.setValueAtTime(freq * 2, now + timeOffset);
      const harmGain = this.ctx!.createGain();
      harmGain.gain.setValueAtTime(0, now + timeOffset);
      harmGain.gain.linearRampToValueAtTime(0.04, now + timeOffset + 0.03);
      harmGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.5);
      harm.connect(harmGain);
      this.connectWithReverb(harmGain, 0.8, 0.4);
      harm.start(now + timeOffset);
      harm.stop(now + timeOffset + 0.5);

      // Shimmer pulse
      const pulseOsc = this.ctx!.createOscillator();
      pulseOsc.type = 'triangle';
      pulseOsc.frequency.setValueAtTime(freq * 3, now + timeOffset);
      const pulseGain = this.ctx!.createGain();
      pulseGain.gain.setValueAtTime(0, now + timeOffset);
      pulseGain.gain.linearRampToValueAtTime(0.02, now + timeOffset + 0.02);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.25);
      pulseOsc.connect(pulseGain);
      this.connectWithReverb(pulseGain, 0.7, 0.5);
      pulseOsc.start(now + timeOffset);
      pulseOsc.stop(now + timeOffset + 0.25);
    });

    // Warm pad sustain underneath
    [523.25, 659.25, 783.99].forEach(f => {
      const pad = this.createOsc('sine', f, now + 0.2);
      const padGain = this.ctx!.createGain();
      padGain.gain.setValueAtTime(0, now + 0.2);
      padGain.gain.linearRampToValueAtTime(0.05, now + 0.5);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      pad.connect(padGain);
      this.connectWithReverb(padGain, 0.6, 0.6);
      pad.start(now + 0.2);
      pad.stop(now + 1.5);
    });

    // Shimmering Noise - stereo sparkle
    const noise = this.createNoise(0.8, true);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, now);
    filter.Q.setValueAtTime(2, now);
    const noiseGain = this.ctx!.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.04, now + 0.15);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    noise.connect(filter);
    filter.connect(noiseGain);
    this.connectWithReverb(noiseGain, 0.7, 0.5);
    noise.start(now);
    noise.stop(now + 0.8);
  }

  // Simple Item Heal - Brighter, more sparkly
  public playHeal() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const healNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    healNotes.forEach((freq, i) => {
      const timeOffset = i * 0.08;
      const osc = this.createOsc('sine', freq, now + timeOffset);
      const gain = this.createGain(now + timeOffset, 0.4, 0.18);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + timeOffset + 0.35);
      osc.connect(gain);
      this.connectWithReverb(gain, 0.9, 0.3);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.4);

      // Bright harmonic
      const harm = this.createOsc('triangle', freq * 2, now + timeOffset);
      const harmGain = this.createGain(now + timeOffset, 0.2, 0.04);
      harm.connect(harmGain);
      this.connectWithReverb(harmGain, 0.8, 0.3);
      harm.start(now + timeOffset);
      harm.stop(now + timeOffset + 0.2);
    });

    // Tiny sparkle
    const noise = this.createNoise(0.3);
    const hpf = this.ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(6000, now);
    const nGain = this.createGain(now + 0.1, 0.25, 0.025);
    noise.connect(hpf);
    hpf.connect(nGain);
    this.connectWithReverb(nGain, 0.8, 0.3);
    noise.start(now + 0.1);
    noise.stop(now + 0.35);
  }

  // Aojiru skill sound "トクトクトク...ドバシャーッ！" - More dramatic
  public playSkill() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // "トクトクトク" - Pouring bubbles, denser and more resonant
    for (let i = 0; i < 7; i++) {
      const t = now + i * 0.065;
      const freq = 260 + Math.random() * 100;
      const osc = this.createOsc('sine', freq, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 0.045);
      osc.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.055);

      // Add resonant "glug" undertone
      if (i % 2 === 0) {
        const glug = this.createOsc('sine', freq * 0.5, t);
        const glugGain = this.ctx.createGain();
        glugGain.gain.setValueAtTime(0, t);
        glugGain.gain.linearRampToValueAtTime(0.06, t + 0.01);
        glugGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        glug.connect(glugGain);
        if (this.masterGain) glugGain.connect(this.masterGain);
        glug.start(t);
        glug.stop(t + 0.04);
      }
    }

    // "ドバシャーッ！" - Bigger splash impact at 0.45s
    const splashStart = now + 0.45;

    // Heavy body of splash - doubled
    const splashOsc = this.createOsc('sine', 140, splashStart);
    const splashGain = this.ctx.createGain();
    splashGain.gain.setValueAtTime(0.3, splashStart);
    splashGain.gain.exponentialRampToValueAtTime(0.001, splashStart + 0.35);
    splashOsc.frequency.exponentialRampToValueAtTime(50, splashStart + 0.25);
    splashOsc.connect(splashGain);
    if (this.masterGain) splashGain.connect(this.masterGain);
    splashOsc.start(splashStart);
    splashOsc.stop(splashStart + 0.35);

    // Sub-bass layer
    const subSplash = this.createOsc('sine', 70, splashStart);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.2, splashStart);
    subGain.gain.exponentialRampToValueAtTime(0.001, splashStart + 0.4);
    subSplash.connect(subGain);
    if (this.masterGain) subGain.connect(this.masterGain);
    subSplash.start(splashStart);
    subSplash.stop(splashStart + 0.4);

    // Filtered noise for water/splash texture - wider
    const noise = this.createNoise(0.45, true);
    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(2500, splashStart);
    bpf.frequency.exponentialRampToValueAtTime(500, splashStart + 0.4);
    bpf.Q.setValueAtTime(1.2, splashStart);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.22, splashStart);
    nGain.gain.exponentialRampToValueAtTime(0.001, splashStart + 0.4);
    noise.connect(bpf);
    bpf.connect(nGain);
    if (this.masterGain) nGain.connect(this.masterGain);
    noise.start(splashStart);
    noise.stop(splashStart + 0.45);

    // High splash droplets
    const drops = this.createNoise(0.2);
    const dropsHpf = this.ctx.createBiquadFilter();
    dropsHpf.type = 'highpass';
    dropsHpf.frequency.setValueAtTime(4000, splashStart + 0.05);
    const dropsGain = this.createGain(splashStart + 0.05, 0.2, 0.08);
    drops.connect(dropsHpf);
    dropsHpf.connect(dropsGain);
    if (this.masterGain) dropsGain.connect(this.masterGain);
    drops.start(splashStart + 0.05);
    drops.stop(splashStart + 0.25);

    // Bright "power-up" shimmer - fuller chord with reverb
    [392.00, 523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      const t = splashStart + 0.15 + i * 0.05;
      const osc = this.createOsc('sine', f, t);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      this.connectWithReverb(gain, 0.8, 0.35);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  // UI click "Pikori" (ピコリ) - Richer with harmonic
  public playPikori() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Note 1 (ピ) - brighter
    const osc1 = this.createOsc('sine', 880, now);
    const gain1 = this.createGain(now, 0.06, 0.12);
    osc1.connect(gain1);
    if (this.masterGain) gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.06);

    // Note 2 (コ) - mid accent
    const osc2 = this.createOsc('sine', 1100, now + 0.05);
    const gain2 = this.createGain(now + 0.05, 0.05, 0.1);
    osc2.connect(gain2);
    if (this.masterGain) gain2.connect(this.masterGain);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.1);

    // Note 3 (リ) - high tail with harmonic
    const osc3 = this.createOsc('sine', 1320, now + 0.09);
    const gain3 = this.createGain(now + 0.09, 0.07, 0.07);
    osc3.connect(gain3);
    this.connectWithReverb(gain3, 1.0, 0.1);
    osc3.start(now + 0.09);
    osc3.stop(now + 0.16);

    // Soft harmonic shimmer
    const harm = this.createOsc('triangle', 2200, now + 0.05);
    const harmGain = this.createGain(now + 0.05, 0.06, 0.02);
    harm.connect(harmGain);
    if (this.masterGain) harmGain.connect(this.masterGain);
    harm.start(now + 0.05);
    harm.stop(now + 0.11);
  }

  // Legacy click
  public playClick() {
    this.playPikori();
  }

  // Sortie / Departure sound "ドゥン！→シュイーン！" - Epic orchestral feel
  public playSortie() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Heavy low impact "ドゥン！" - Layered
    const sub = this.createOsc('sine', 80, now);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    sub.frequency.exponentialRampToValueAtTime(35, now + 0.35);
    sub.connect(subGain);
    if (this.masterGain) subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.45);

    // Second sub for depth
    const sub2 = this.createOsc('sine', 55, now);
    const sub2Gain = this.ctx.createGain();
    sub2Gain.gain.setValueAtTime(0.3, now);
    sub2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    sub2.connect(sub2Gain);
    if (this.masterGain) sub2Gain.connect(this.masterGain);
    sub2.start(now);
    sub2.stop(now + 0.5);

    // Noise burst for punch - bigger
    const noise = this.createNoise(0.18);
    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(800, now);
    lpf.frequency.exponentialRampToValueAtTime(60, now + 0.15);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.35, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(lpf);
    lpf.connect(nGain);
    if (this.masterGain) nGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.18);

    // Impact transient
    const transient = this.createNoise(0.02);
    const tGain = this.createGain(now, 0.02, 0.2);
    transient.connect(tGain);
    if (this.masterGain) tGain.connect(this.masterGain);
    transient.start(now);
    transient.stop(now + 0.02);

    // Rising swoosh "シュイーン！" - Richer
    const swoosh = this.createOsc('sawtooth', 150, now + 0.15);
    swoosh.frequency.exponentialRampToValueAtTime(1800, now + 0.5);
    const swooshFilter = this.ctx.createBiquadFilter();
    swooshFilter.type = 'bandpass';
    swooshFilter.frequency.setValueAtTime(400, now + 0.15);
    swooshFilter.frequency.exponentialRampToValueAtTime(4000, now + 0.5);
    swooshFilter.Q.setValueAtTime(2, now + 0.15);
    const swooshGain = this.ctx.createGain();
    swooshGain.gain.setValueAtTime(0, now + 0.15);
    swooshGain.gain.linearRampToValueAtTime(0.22, now + 0.25);
    swooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    swoosh.connect(swooshFilter);
    swooshFilter.connect(swooshGain);
    this.connectWithReverb(swooshGain, 0.9, 0.25);
    swoosh.start(now + 0.15);
    swoosh.stop(now + 0.55);

    // Second swoosh layer - octave up
    const swoosh2 = this.createOsc('sawtooth', 300, now + 0.2);
    swoosh2.frequency.exponentialRampToValueAtTime(3000, now + 0.5);
    const swoosh2Filter = this.ctx.createBiquadFilter();
    swoosh2Filter.type = 'bandpass';
    swoosh2Filter.frequency.setValueAtTime(800, now + 0.2);
    swoosh2Filter.frequency.exponentialRampToValueAtTime(5000, now + 0.5);
    swoosh2Filter.Q.setValueAtTime(1.5, now + 0.2);
    const swoosh2Gain = this.ctx.createGain();
    swoosh2Gain.gain.setValueAtTime(0, now + 0.2);
    swoosh2Gain.gain.linearRampToValueAtTime(0.08, now + 0.28);
    swoosh2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    swoosh2.connect(swoosh2Filter);
    swoosh2Filter.connect(swoosh2Gain);
    this.connectWithReverb(swoosh2Gain, 0.9, 0.2);
    swoosh2.start(now + 0.2);
    swoosh2.stop(now + 0.52);

    // Resolving power chord - fuller with more voices
    [261.63, 329.63, 392.00, 523.25].forEach((f) => {
      const osc = this.createOsc('square', f, now + 0.35);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, now + 0.35);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.38);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.connect(gain);
      this.connectWithReverb(gain, 0.8, 0.3);
      osc.start(now + 0.35);
      osc.stop(now + 0.9);
    });

    // Brass accent
    [523.25, 659.25].forEach(f => {
      const brass = this.createOsc('sawtooth', f, now + 0.38);
      const brassFilter = this.ctx!.createBiquadFilter();
      brassFilter.type = 'lowpass';
      brassFilter.frequency.setValueAtTime(1200, now + 0.38);
      const brassGain = this.ctx!.createGain();
      brassGain.gain.setValueAtTime(0, now + 0.38);
      brassGain.gain.linearRampToValueAtTime(0.04, now + 0.42);
      brassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      brass.connect(brassFilter);
      brassFilter.connect(brassGain);
      this.connectWithReverb(brassGain, 0.8, 0.3);
      brass.start(now + 0.38);
      brass.stop(now + 0.85);
    });
  }

  // Victory Fanfare - Grand and triumphant
  public playWin() {
    this.resume();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Timpani hit to start
    const timpani = this.createOsc('sine', 65, now);
    const timpGain = this.ctx.createGain();
    timpGain.gain.setValueAtTime(0.35, now);
    timpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    timpani.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    timpani.connect(timpGain);
    if (this.masterGain) timpGain.connect(this.masterGain);
    timpani.start(now);
    timpani.stop(now + 0.5);

    // Timpani noise layer
    const timpNoise = this.createNoise(0.15);
    const timpLpf = this.ctx.createBiquadFilter();
    timpLpf.type = 'lowpass';
    timpLpf.frequency.setValueAtTime(400, now);
    const timpNoiseGain = this.createGain(now, 0.15, 0.15);
    timpNoise.connect(timpLpf);
    timpLpf.connect(timpNoiseGain);
    if (this.masterGain) timpNoiseGain.connect(this.masterGain);
    timpNoise.start(now);
    timpNoise.stop(now + 0.15);

    // Ascending fanfare notes - brass-like with square + sawtooth
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const t = now + 0.05 + i * 0.13;
      // Main square tone
      const osc = this.createOsc('square', freq, t);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.03);
      gain.gain.setValueAtTime(0.08, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      this.connectWithReverb(gain, 0.8, 0.35);
      osc.start(t);
      osc.stop(t + 0.45);

      // Sine doubling
      const sine = this.createOsc('sine', freq, t);
      const sineGain = this.ctx!.createGain();
      sineGain.gain.setValueAtTime(0, t);
      sineGain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      sineGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      sine.connect(sineGain);
      this.connectWithReverb(sineGain, 0.8, 0.3);
      sine.start(t);
      sine.stop(t + 0.4);

      // Octave harmonic for brightness
      if (i >= 2) {
        const harm = this.createOsc('sine', freq * 2, t);
        const harmGain = this.ctx!.createGain();
        harmGain.gain.setValueAtTime(0, t);
        harmGain.gain.linearRampToValueAtTime(0.03, t + 0.02);
        harmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        harm.connect(harmGain);
        this.connectWithReverb(harmGain, 0.7, 0.4);
        harm.start(t);
        harm.stop(t + 0.3);
      }
    });

    // Final sustained chord
    const chordTime = now + 0.05 + 4 * 0.13;
    [523.25, 659.25, 783.99, 1046.50].forEach(f => {
      const osc = this.createOsc('sine', f, chordTime);
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, chordTime);
      gain.gain.linearRampToValueAtTime(0.06, chordTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 0.8);
      osc.connect(gain);
      this.connectWithReverb(gain, 0.7, 0.5);
      osc.start(chordTime);
      osc.stop(chordTime + 0.8);
    });

    // Victory sparkle
    const sparkleNoise = this.createNoise(0.6, true);
    const hpf = this.ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(5000, now + 0.3);
    hpf.Q.setValueAtTime(2, now + 0.3);
    const sparkleGain = this.createGain(now + 0.3, 0.5, 0.04);
    sparkleNoise.connect(hpf);
    hpf.connect(sparkleGain);
    this.connectWithReverb(sparkleGain, 0.7, 0.4);
    sparkleNoise.start(now + 0.3);
    sparkleNoise.stop(now + 0.8);
  }
}

export const soundManager = new SoundManager();
