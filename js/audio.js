// Gerenciador de Áudio (Web Audio API)
class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = localStorage.getItem("gameMusicMuted") === "true";
        this.isPlaying = false;
        this.currentLevel = 1;
        this.musicInterval = null;
        this.noteIndex = 0;
        this.stepToggle = false;

        // Notas musicais da melodia (fases 1 a 4)
        this.scales = {
            1: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 392.00],
            2: [293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66, 440.00],
            3: [329.63, 392.00, 493.88, 659.25, 493.88, 392.00, 329.63, 493.88],
            4: [349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 349.23, 523.25]
        };

        // Notas do contrabaixo (fases 1 a 4)
        this.basslines = {
            1: [130.81, 130.81, 164.81, 196.00],
            2: [146.83, 146.83, 174.61, 220.00],
            3: [164.81, 164.81, 196.00, 246.94],
            4: [174.61, 174.61, 220.00, 261.63]
        };

        // Tempos das notas (ms)
        this.tempos = {
            1: 180, 2: 170, 3: 160, 4: 150
        };

        this.setupMuteUI();
        this.setupUserInteraction();
    }

    initAudioContext() {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !this.ctx) {
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.isMuted ? 0 : 0.8;
            this.masterGain.connect(this.ctx.destination);
        }
    }

    ensureContextRunning() {
        if (!this.ctx) this.initAudioContext();
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    setupUserInteraction() {
        const unlock = () => {
            this.ensureContextRunning();
        };
        ["click", "keydown", "touchstart"].forEach(evt => {
            window.addEventListener(evt, unlock, { once: false });
        });
    }

    // Gerador de Som por Oscilador
    playTone(freq, duration, type = "square", volume = 0.15) {
        if (this.isMuted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.masterGain || this.ctx.destination);

            osc.onended = () => {
                try {
                    gain.disconnect();
                    osc.disconnect();
                } catch (e) {}
            };

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    // Efeitos Sonoros
    playStepSound() {
        if (this.isMuted || !this.ctx) return;
        this.ensureContextRunning();
        try {
            const now = this.ctx.currentTime;
            this.stepToggle = !this.stepToggle;
            const freq = this.stepToggle ? 130 : 110;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.05);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.masterGain || this.ctx.destination);

            osc.onended = () => {
                try { gain.disconnect(); osc.disconnect(); } catch (e) {}
            };

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {}
    }

    playJumpSound() {
        if (this.isMuted) return;
        this.ensureContextRunning();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "square";
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

            osc.connect(gain);
            gain.connect(this.masterGain || this.ctx.destination);

            osc.onended = () => {
                try { gain.disconnect(); osc.disconnect(); } catch (e) {}
            };

            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {}
    }

    playCollisionSound() {
        if (this.isMuted) return;
        this.ensureContextRunning();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(250, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

            gain.gain.setValueAtTime(0.35, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain || this.ctx.destination);

            osc.onended = () => {
                try { gain.disconnect(); osc.disconnect(); } catch (e) {}
            };

            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) {}
    }

    playPortalSound() {
        if (this.isMuted) return;
        this.ensureContextRunning();
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, "triangle", 0.25);
            }, idx * 70);
        });
    }

    playClickSound() {
        if (this.isMuted) return;
        this.ensureContextRunning();
        this.playTone(523.25, 0.08, "sine", 0.2);
    }

    playVictorySound() {
        if (this.isMuted) return;
        this.ensureContextRunning();
        const fanfarra = [
            { f: 523.25, d: 0.15 },
            { f: 659.25, d: 0.15 },
            { f: 783.99, d: 0.15 },
            { f: 1046.50, d: 0.4 }
        ];
        let delay = 0;
        fanfarra.forEach(n => {
            setTimeout(() => {
                this.playTone(n.f, n.d, "triangle", 0.3);
            }, delay);
            delay += n.d * 1000 + 50;
        });
    }

    // Música de Fundo Sintetizada
    startLevelMusic(level) {
        this.currentLevel = Math.max(1, Math.min(4, level));
        this.stopMusic();
        this.startSynthMusic();
    }

    startSynthMusic() {
        this.ensureContextRunning();
        this.isPlaying = true;
        const melody = this.scales[this.currentLevel] || this.scales[1];
        const bass = this.basslines[this.currentLevel] || this.basslines[1];
        const tempo = this.tempos[this.currentLevel] || 150;

        this.noteIndex = 0;
        this.musicInterval = setInterval(() => {
            if (this.isMuted || !this.isPlaying || !this.ctx) return;
            
            const mNote = melody[this.noteIndex % melody.length];
            this.playTone(mNote, 0.1, "square", 0.12);

            if (this.noteIndex % 2 === 0) {
                const bNote = bass[Math.floor(this.noteIndex / 2) % bass.length];
                this.playTone(bNote, 0.16, "triangle", 0.18);
            }

            this.noteIndex++;
        }, tempo);
    }

    stopMusic() {
        this.isPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    // Controle de Som (Mute)
    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem("gameMusicMuted", this.isMuted);
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
        }
        this.updateMuteBtnUI();
    }

    setupMuteUI() {
        const createBtn = () => {
            if (document.getElementById("muteBtn")) return;

            const btn = document.createElement("button");
            btn.id = "muteBtn";
            btn.className = "mute-button";
            btn.setAttribute("aria-label", "Alternar Som");
            btn.onclick = (e) => {
                e.stopPropagation();
                this.ensureContextRunning();
                this.toggleMute();
            };
            document.body.appendChild(btn);
            this.updateMuteBtnUI();
        };

        if (document.readyState === "loading") {
            window.addEventListener("DOMContentLoaded", createBtn);
        } else {
            createBtn();
        }
    }

    updateMuteBtnUI() {
        const btn = document.getElementById("muteBtn");
        if (btn) {
            btn.innerText = this.isMuted ? "Som: Off" : "Som: On";
            btn.title = this.isMuted ? "Ativar Som" : "Desativar Som";
        }
    }
}

const audioManager = new AudioManager();
