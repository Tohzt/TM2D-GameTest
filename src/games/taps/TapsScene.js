import Phaser from "phaser";
import { TAPS_CONFIG } from "./config.js";
import { GameBoard } from "./GameBoard.js";
import { SpriteSelector } from "./SpriteSelector.js";
import { UIManager } from "./UIManager.js";

export class TapsScene extends Phaser.Scene {
	constructor() {
		super({ key: "TapsScene" });
	}

	preload() {
		// Load all sprite images from the stickers directory
		TAPS_CONFIG.SPRITES.forEach((sprite) => {
			this.load.image(sprite, `/assets/stickers/${sprite}.png`);
		});
	}

	create() {
		// Initialize managers
		this.spriteSelector = new SpriteSelector(this);
		this.uiManager = new UIManager(this);

		// Show sprite selection screen
		this.spriteSelector.showSelectionScreen((spriteKey) => {
			this.selectedSprite = spriteKey;
			this.initializeGame();
		});

		// Game state
		this.score = 0;
		this.gameOver = false;
		this.gameStarted = false;
		this.timer = TAPS_CONFIG.TIMER_DURATION;
		this.gameBoard = null;
		this.selectedSprite = null;
		this.isScrolling = false;
	}

	initializeGame() {
		// Create UI
		this.uiManager.createGameUI();

		// Set up input handling
		this.input.on("pointerdown", this.startOrPlay, this);
	}

	update(time, delta) {
		if (this.gameOver || !this.gameStarted) {
			return;
		}

		// Update timer
		if (!this.gameOver) {
			this.timer -= delta / 1000;
			if (this.timer <= 0) {
				this.endRound();
				return;
			}
			this.uiManager.updateTimer(this.timer);
		}
	}

	startOrPlay() {
		if (this.gameStarted) {
			return;
		}

		if (!this.gameStarted && !this.gameOver) {
			this.startGame();
		}
	}

	startGame() {
		this.gameStarted = true;
		this.timer = TAPS_CONFIG.TIMER_DURATION;

		// Hide the start text
		this.uiManager.hideStartText();

		// Create game board
		this.gameBoard = new GameBoard(this, this.selectedSprite);
		this.gameBoard.createBoard();
		this.setupTileInteractions();
	}

	setupTileInteractions() {
		// Find the bottommost row with unclicked tiles
		let activeRowIndex = -1;
		for (let i = this.gameBoard.tiles.length - 1; i >= 0; i--) {
			const row = this.gameBoard.tiles[i];
			if (row && row.length > 0 && row.some((t) => t && t.alpha >= 0.8)) {
				activeRowIndex = i;
				break;
			}
		}

		// Set up click handlers for the active row
		if (activeRowIndex >= 0 && this.gameBoard.tiles[activeRowIndex]) {
			this.gameBoard.tiles[activeRowIndex].forEach((tile) => {
				if (tile && tile.alpha >= 0.8) {
					tile.isActive = true;
					tile.removeAllListeners();
					if (tile.isCorrect) {
						tile.on("pointerdown", () => this.tapTile(tile));
					} else {
						tile.on("pointerdown", () => this.hitLosingTile());
					}
					tile.setInteractive({ useHandCursor: true });
				}
			});
		}
	}

	tapTile(tile) {
		if (this.gameOver || !this.gameStarted || !tile.isActive) {
			return;
		}

		// Find which row this tile is in
		let clickedRowIndex = -1;
		for (let i = 0; i < this.gameBoard.tiles.length; i++) {
			if (this.gameBoard.tiles[i].includes(tile)) {
				clickedRowIndex = i;
				break;
			}
		}

		// Update score
		this.score += 1;
		this.uiManager.updateScore(this.score);

		// Flash the tile
		tile.setTint(TAPS_CONFIG.CORRECT_COLOR);
		this.time.delayedCall(100, () => {
			if (tile && tile.active) {
				tile.clearTint();
			}
		});

		// Show score increase
		this.uiManager.showScoreIncrease(tile.x, tile.y);

		// Disable the clicked row
		if (clickedRowIndex >= 0 && this.gameBoard.tiles[clickedRowIndex]) {
			this.gameBoard.tiles[clickedRowIndex].forEach((t) => {
				if (t && t.setInteractive) {
					t.disableInteractive();
					t.isActive = false;
					t.setAlpha(0.5);
				}
			});
		}

		// Disable all other tiles temporarily
		this.gameBoard.tiles.forEach((row, idx) => {
			if (idx !== clickedRowIndex) {
				row.forEach((t) => {
					if (t && t.setInteractive) {
						t.disableInteractive();
					}
				});
			}
		});

		// Store target positions before scrolling
		this.gameBoard.storeTargetPositions();

		// Scroll the board
		this.gameBoard.scrollBoard();

		// Immediately set up interactions for the NEW active row (one row up from clicked)
		// This is the row that will become the bottom active row after scrolling
		const newActiveRowIndex = clickedRowIndex - 1;
		if (newActiveRowIndex >= 0 && this.gameBoard.tiles[newActiveRowIndex]) {
			this.setupRowInteractions(newActiveRowIndex);
		}

		// Also set up after scroll completes for safety
		this.time.delayedCall(200, () => {
			this.setupTileInteractions();
		});
	}

	setupRowInteractions(rowIndex) {
		if (rowIndex < 0 || rowIndex >= this.gameBoard.tiles.length) return;

		const row = this.gameBoard.tiles[rowIndex];
		if (row && row.length > 0) {
			row.forEach((tile) => {
				if (tile && tile.alpha >= 0.8) {
					tile.isActive = true;
					tile.removeAllListeners();
					if (tile.isCorrect) {
						tile.on("pointerdown", () => this.tapTile(tile));
					} else {
						tile.on("pointerdown", () => this.hitLosingTile());
					}
					tile.setInteractive({ useHandCursor: true });
				}
			});
		}
	}

	hitLosingTile() {
		if (this.gameOver || !this.gameStarted) return;

		this.gameOver = true;
		this.time.removeAllEvents();

		const { restartText, menuText } = this.uiManager.showGameOver(this.score);

		restartText.on("pointerdown", () => {
			this.restartGame();
		});

		menuText.on("pointerdown", () => {
			this.scene.start("MenuScene");
		});
	}

	endRound() {
		if (this.gameOver) return;

		this.gameOver = true;
		this.time.removeAllEvents();

		const { restartText, menuText } = this.uiManager.showTimeUp();

		restartText.on("pointerdown", () => {
			this.restartGame();
		});

		menuText.on("pointerdown", () => {
			this.scene.start("MenuScene");
		});
	}

	restartGame() {
		this.gameOver = false;
		this.gameStarted = false;
		this.score = 0;
		this.timer = TAPS_CONFIG.TIMER_DURATION;
		this.uiManager.resetScore();

		// Destroy board
		if (this.gameBoard) {
			this.gameBoard.destroy();
		}

		this.scene.restart();
	}
}

export default TapsScene;
