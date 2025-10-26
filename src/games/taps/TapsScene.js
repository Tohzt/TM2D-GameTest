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

		// Just scroll the pattern down - don't delete the row
		this.gameBoard.scrollBoard();

		// Set up click handlers for the bottom row (always index 4)
		const bottomRowIndex = 4;
		if (this.gameBoard.tiles[bottomRowIndex]) {
			this.gameBoard.tiles[bottomRowIndex].forEach((tile) => {
				if (tile) {
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

	setupRowInteractions(rowIndex) {
		if (rowIndex < 0 || rowIndex >= this.gameBoard.tiles.length) return;

		const row = this.gameBoard.tiles[rowIndex];
		if (row && row.length > 0) {
			row.forEach((tile) => {
				if (tile && tile.active) {
					// Ensure the tile can be made interactive
					if (!tile.input) {
						tile.setInteractive();
					}

					tile.isActive = true;
					tile.removeAllListeners();

					// Change losing tiles to green to show they're in the active row
					if (!tile.isCorrect && tile.setFillStyle) {
						tile.setFillStyle(0x00ff00);
					}

					// Add click handlers
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

		const { retryText, quitText } = this.uiManager.showEndGame(
			"Game Over!",
			"#ffffff",
			this.score
		);

		retryText.on("pointerdown", () => {
			this.restartGame();
		});

		quitText.on("pointerdown", () => {
			this.scene.start("MenuScene");
		});
	}

	endRound() {
		if (this.gameOver) return;

		this.gameOver = true;
		this.time.removeAllEvents();

		const { retryText, quitText } = this.uiManager.showEndGame(
			"Time Up!",
			"#00ff00",
			this.score
		);

		retryText.on("pointerdown", () => {
			this.restartGame();
		});

		quitText.on("pointerdown", () => {
			this.scene.start("MenuScene");
		});
	}

	restartGame() {
		// Clean up end game UI
		this.uiManager.clearEndGameUI();

		// Destroy board first
		if (this.gameBoard) {
			this.gameBoard.destroy();
			this.gameBoard = null;
		}

		// Clean up previous game state
		this.gameOver = false;
		this.gameStarted = false;
		this.score = 0;
		this.timer = TAPS_CONFIG.TIMER_DURATION;
		this.uiManager.resetScore();

		// Reset UI
		this.uiManager.hideStartText();

		// Create a completely fresh board
		this.gameBoard = new GameBoard(this, this.selectedSprite);
		this.gameBoard.createBoard();

		// Re-enable input
		this.gameStarted = true;

		this.setupTileInteractions();
	}
}

export default TapsScene;
