class Game2048 {
    constructor() {
        this.board = [];
        this.score = 0;
        this.best = localStorage.getItem('best2048') ? parseInt(localStorage.getItem('best2048')) : 0;
        this.gameOver = false;
        this.won = false;
        this.gameHistory = JSON.parse(localStorage.getItem('gameHistory2048') || '[]');
        
        this.container = document.querySelector('.tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.bestDisplay = document.getElementById('best');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.gameOverContainer = document.getElementById('gameOverContainer');
        this.gameOverText = document.getElementById('gameOverText');
        
        this.soundManager = new SoundManager();
        
        // 触摸事件变量
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        this.bestDisplay.textContent = this.best;
        
        this.init();
        this.setupEventListeners();
            this.setupStatsPanel();
        }
    
        setupStatsPanel() {
            const statsToggleBtn = document.getElementById('statsToggleBtn');
            const statsPanel = document.getElementById('statsPanel');
            const historyList = document.getElementById('historyList');
        
            statsToggleBtn.addEventListener('click', () => {
                statsPanel.classList.toggle('show');
                this.updateHistoryDisplay();
            });
        
            this.updateHistoryDisplay();
        }
    
        updateHistoryDisplay() {
            const historyList = document.getElementById('historyList');
        
            if (this.gameHistory.length === 0) {
                historyList.innerHTML = '<div class="empty-history">暂无游戏记录</div>';
                return;
            }
        
            historyList.innerHTML = this.gameHistory.map((record, index) => `
                <div class="history-item">
                    <div>
                        <strong>#${index + 1}</strong> ${record.time}
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="history-score">${record.score}</span>
                        <span class="history-status ${record.won ? 'win' : 'lose'}">
                            ${record.won ? '胜利' : '失败'}
                        </span>
                    </div>
                </div>
            `).join('');
    }
    
    init() {
        this.board = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.scoreDisplay.textContent = this.score;
        this.gameOverContainer.classList.remove('show');
        this.oldBoard = null;
        
        this.addNewTile();
        this.addNewTile();
        this.render();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.newGameBtn.addEventListener('click', () => this.init());
        this.retryBtn.addEventListener('click', () => this.init());
    }
    
        handleTouchStart(e) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }
    
        handleTouchEnd(e) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const dx = touchEndX - this.touchStartX;
            const dy = touchEndY - this.touchStartY;
            const minSwipeDistance = 50;
        
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > minSwipeDistance) {
                    this.move(dx > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(dy) > minSwipeDistance) {
                    this.move(dy > 0 ? 'down' : 'up');
                }
            }
        }
    
    handleKeyPress(e) {
        if (this.gameOver) return;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.move('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.move('down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.move('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.move('right');
                break;
        }
    }
    
    move(direction) {
        let moved = false;
        const oldBoard = this.board.map(row => [...row]);
        
        switch(direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }
        
        if (moved) {
            this.soundManager.playMoveSound();
            this.addNewTile();
            this.render();
            this.checkGameOver();
        }
    }
    
    moveLeft() {
        return this.moveLine(this.board);
    }
    
    moveRight() {
        // 反转 -> 移动 -> 反转
        for (let row of this.board) {
            row.reverse();
        }
        const moved = this.moveLine(this.board);
        for (let row of this.board) {
            row.reverse();
        }
        return moved;
    }
    
    moveUp() {
        this.transposeBoard();
        const moved = this.moveLine(this.board);
        this.transposeBoard();
        return moved;
    }
    
    moveDown() {
        this.transposeBoard();
        for (let row of this.board) {
            row.reverse();
        }
        const moved = this.moveLine(this.board);
        for (let row of this.board) {
            row.reverse();
        }
        this.transposeBoard();
        return moved;
    }
    
    moveLine(board) {
        let moved = false;
        
        for (let row of board) {
            const newRow = this.mergeLine(row);
            if (JSON.stringify(row) !== JSON.stringify(newRow)) {
                moved = true;
            }
            for (let i = 0; i < 4; i++) {
                row[i] = newRow[i];
            }
        }
        
        return moved;
    }
    
    mergeLine(line) {
        // 删除0
        let newLine = line.filter(val => val !== 0);
        
        // 合并相同的数字
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                this.score += newLine[i];
                this.soundManager.playMergeSound();
                
                    // 触发粒子效果
                    const colors = ['#f65e3b', '#f67c5f', '#f59563', '#f2b179'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    this.createParticles(window.innerWidth / 2, window.innerHeight / 2, color);
                
                if (newLine[i] === 2048 && !this.won) {
                    this.won = true;
                }
                
                newLine.splice(i + 1, 1);
            }
        }
        
        // 后面补0
        while (newLine.length < 4) {
            newLine.push(0);
        }
        
        return newLine;
    }
    
    transposeBoard() {
        for (let i = 0; i < 4; i++) {
            for (let j = i + 1; j < 4; j++) {
                [this.board[i][j], this.board[j][i]] = [this.board[j][i], this.board[i][j]];
            }
        }
    }
    
    addNewTile() {
        let empty = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    empty.push({x: i, y: j});
                }
            }
        }
        
        if (empty.length > 0) {
            const randomCell = empty[Math.floor(Math.random() * empty.length)];
            this.board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    checkGameOver() {
        this.scoreDisplay.textContent = this.score;
        
        if (this.score > this.best) {
            this.best = this.score;
            this.bestDisplay.textContent = this.best;
            localStorage.setItem('best2048', this.best);
        }
        
        // 检查是否有空位
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    return;
                }
            }
        }
        
        // 检查是否能合并
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.board[i][j];
                
                if (i < 3 && current === this.board[i + 1][j]) {
                    return;
                }
                
                if (j < 3 && current === this.board[i][j + 1]) {
                    return;
                }
            }
        }
        
        // 游戏结束
        this.gameOver = true;
        this.gameOverContainer.classList.add('show');
        if (this.won) {
            this.gameOverText.textContent = '你赢了！';
            this.soundManager.playWinSound();
        } else {
            this.gameOverText.textContent = '游戏结束！';
            this.soundManager.playGameOverSound();
        }
        
            // 记录游戏历史
            this.saveGameHistory();
        }
    
        saveGameHistory() {
            const gameRecord = {
                score: this.score,
                time: new Date().toLocaleString(),
                won: this.won
            };
        
            this.gameHistory.unshift(gameRecord);
            if (this.gameHistory.length > 20) {
                this.gameHistory.pop();
            }
        
            localStorage.setItem('gameHistory2048', JSON.stringify(this.gameHistory));
    }
    
    render() {
        this.container.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = this.board[i][j];
                
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    
                    const size = this.container.clientWidth / 4 - 10;
                    const x = j * (size + 10);
                    const y = i * (size + 10);
                    
                    tile.style.left = x + 'px';
                    tile.style.top = y + 'px';
                    tile.style.width = size + 'px';
                    tile.style.height = size + 'px';
                    
                    // 检查是否是新方块
                    const isNewTile = !this.oldBoard || !this.oldBoard[i] || this.oldBoard[i][j] === 0;
                    if (isNewTile) {
                        tile.classList.add('new-tile');
                    } else if (this.oldBoard[i][j] !== value) {
                        // 检查是否是合并产生的方块
                        tile.classList.add('merged');
                    }
                    
                    this.container.appendChild(tile);
                }
            }
        }
        
        this.oldBoard = this.board.map(row => [...row]);
    }
    
        createParticles(x, y, color = '#f65e3b') {
            const particleContainer = document.getElementById('particles');
            const particleCount = 8;
        
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
            
                const element = document.createElement('div');
                element.className = 'particle-element';
                element.style.backgroundColor = color;
            
                const angle = (i / particleCount) * Math.PI * 2;
                const tx = Math.cos(angle) * 80;
                const ty = Math.sin(angle) * 80;
            
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                element.style.setProperty('--tx', tx + 'px');
            
                particle.appendChild(element);
                particleContainer.appendChild(particle);
            
                setTimeout(() => particle.remove(), 1000);
            }
        }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
