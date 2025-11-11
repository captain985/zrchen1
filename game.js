class Game2048 {
    constructor() {
        this.board = [];
        this.score = 0;
        this.best = localStorage.getItem('best2048') ? parseInt(localStorage.getItem('best2048')) : 0;
        this.gameOver = false;
        this.won = false;
        
        this.container = document.querySelector('.tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.bestDisplay = document.getElementById('best');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.gameOverContainer = document.getElementById('gameOverContainer');
        this.gameOverText = document.getElementById('gameOverText');
        
        this.bestDisplay.textContent = this.best;
        
        this.init();
        this.setupEventListeners();
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
        
        this.addNewTile();
        this.addNewTile();
        this.render();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.newGameBtn.addEventListener('click', () => this.init());
        this.retryBtn.addEventListener('click', () => this.init());
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
        } else {
            this.gameOverText.textContent = '游戏结束！';
        }
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
                    
                    this.container.appendChild(tile);
                }
            }
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
