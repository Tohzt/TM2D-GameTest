import Phaser from "phaser";
import { TAPS_CONFIG } from "./config.js";
import { GameBoard } from "./GameBoard.js";
import { SpriteSelector } from "../components/SpriteSelector.js";
import { UIManager } from "./UIManager.js";

export class TapsScene extends Phaser.Scene {
	constructor() {
		super({ key: "TapsScene" });
	}

	preload() {
		TAPS_CONFIG.SPRITES.forEach((sprite) => {
			this.load.image(sprite, `/assets/stickers/${sprite}.png`);
		});
	}

	create() {
		this.spriteSelector = new SpriteSelector(this, {
			sprites: TAPS_CONFIG.SPRITES,
			spriteSpacing: TAPS_CONFIG.SPRITE_SPACING,
			spriteBoxSize: 140,
			titleY: 120,
			spriteY: 300,
			gameName: "Don't Tap Red!",
		});
		this.uiManager = new UIManager(this);

		this.spriteSelector.showSelectionScreen(
			(spriteKey) => {
				this.selectedSprite = spriteKey;
				this.initializeGame();
			},
			() => {
				this.scene.start("MenuScene");
			}
		);
		this.score = 0;
		this.gameOver = false;
		this.gameStarted = false;
		this.timer = TAPS_CONFIG.TIMER_DURATION;
		this.gameBoard = null;
		this.selectedSprite = null;
		this.isScrolling = false;
	}

	initializeGame() {
		this.uiManager.createGameUI();

		this.input.on("pointerdown", this.startOrPlay, this);
	}

	update(time, delta) {
		if (this.gameOver || !this.gameStarted) {
			return;
		}

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

		this.uiManager.hideStartText();

		this.gameBoard = new GameBoard(this, this.selectedSprite);
		this.gameBoard.createBoard();
		this.setupTileInteractions();
	}

	setupTileInteractions() {
		let activeRowIndex = -1;
		for (let i = this.gameBoard.tiles.length - 1; i >= 0; i--) {
			const row = this.gameBoard.tiles[i];
			if (row && row.length > 0 && row.some((t) => t && t.alpha >= 0.8)) {
				activeRowIndex = i;
				break;
			}
		}
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

		let clickedRowIndex = -1;
		for (let i = 0; i < this.gameBoard.tiles.length; i++) {
			if (this.gameBoard.tiles[i].includes(tile)) {
				clickedRowIndex = i;
				break;
			}
		}

		this.score += 1;
		this.uiManager.updateScore(this.score);
		tile.setTint(TAPS_CONFIG.CORRECT_COLOR);
		this.time.delayedCall(100, () => {
			if (tile && tile.active) {
				tile.clearTint();
			}
		});

		this.uiManager.showScoreIncrease(tile.x, tile.y);

		this.gameBoard.scrollBoard();
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
					if (!tile.input) {
						tile.setInteractive();
					}

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
		this.uiManager.clearEndGameUI();

		if (this.gameBoard) {
			this.gameBoard.destroy();
			this.gameBoard = null;
		}

		this.gameOver = false;
		this.gameStarted = false;
		this.score = 0;
		this.timer = TAPS_CONFIG.TIMER_DURATION;
		this.uiManager.resetScore();
		this.uiManager.hideStartText();

		this.gameBoard = new GameBoard(this, this.selectedSprite);
		this.gameBoard.createBoard();
		this.gameStarted = true;

		this.setupTileInteractions();
	}
}

export default TapsScene;
