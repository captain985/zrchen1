// 音效管理类
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.isMuted = localStorage.getItem('sound2048') !== 'false';
        this.setupAudioContext();
        this.createToggleButton();
    }
    
    setupAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    createToggleButton() {
        const btn = document.createElement('button');
        btn.className = 'sound-toggle-btn';
        btn.innerHTML = this.isMuted ? '🔊' : '🔇';
        btn.addEventListener('click', () => this.toggleSound());
        document.querySelector('.info').appendChild(btn);
    }
    
    toggleSound() {
        this.isMuted = !this.isMuted;
        const btn = document.querySelector('.sound-toggle-btn');
        btn.innerHTML = this.isMuted ? '🔊' : '🔇';
        localStorage.setItem('sound2048', this.isMuted);
    }
    
    // 移动音效
    playMoveSound() {
        if (!this.isMuted) {
            this.playTone(400, 0.1, 0.05);
        }
    }
    
    // 合并音效
    playMergeSound() {
        if (!this.isMuted) {
            this.playTone(600, 0.15, 0.08);
        }
    }
    
    // 游戏结束音效
    playGameOverSound() {
        if (!this.isMuted) {
            this.playTone(200, 0.2, 0.3);
        }
    }
    
    // 胜利音效
    playWinSound() {
        if (!this.isMuted) {
            const notes = [523, 587, 659, 784]; // C5, D5, E5, G5
            notes.forEach((freq, index) => {
                setTimeout(() => this.playTone(freq, 0.1, 0.15), index * 100);
            });
        }
    }
    
    // 通用音调播放
    playTone(frequency, duration, volume = 0.3) {
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.value = frequency;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    }
}
