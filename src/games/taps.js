import Phaser from "phaser";

class TapsScene extends Phaser.Scene {
	constructor() {
		super({ key: "TapsScene" });
	}

	preload() {
		// Load all sprite images from the stickers directory
		this.load.image("Cherry_1", "/assets/stickers/Cherry_1.png");
		this.load.image("Cherry_2", "/assets/stickers/Cherry_2.png");
	}

	create() {
		// Show sprite selection screen
		this.showSpriteSelection();

		// Game state
		this.score = 0;
		this.gameOver = false;
		this.gameStarted = false;
		this.spriteSelected = false;
		this.selectedSprite = null;
		this.highScore = parseInt(localStorage.getItem("tapsHighScore") || "0");
		this.timer = 30; // 30 seconds timer
		this.tiles = []; // Array of all tiles
		this.tileHeight = 100; // Height of each row
		this.activeRow = 3; // 4th row from top (2nd from bottom)
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
			this.updateTimerDisplay();
		}
	}

	startOrPlay() {
		if (this.gameOver) {
			// Don't handle restart here anymore, let the buttons handle it
			return;
		}

		if (!this.gameStarted) {
			this.startGame();
			return;
		}
	}

	startGame() {
		this.gameStarted = true;
		this.timer = 30;

		// Hide the start text
		if (this.startText) {
			this.startText.destroy();
		}

		this.createGameBoard();
		this.updateTimerDisplay();
	}

	createGameBoard() {
		// Clear any existing tiles
		this.tiles.forEach((row) => row.forEach((tile) => tile.destroy()));
		this.tiles = [];

		const GRID_COLS = 4;
		const TILE_WIDTH = 90;

		// Create initial board with 4 visible rows (rows 0-3, with row 2 being the active row)
		// Bottom is replaced with a yellow ground rectangle
		for (let row = 0; row < 4; row++) {
			this.tiles[row] = [];
			const y = 100 + row * this.tileHeight;
			// Each row has exactly one sprite tile at a random position
			const spriteCol = Phaser.Math.Between(0, GRID_COLS - 1);
			const isActiveRow = row === 3; // Bottom tile row (index 3 of 4 rows, above the yellow ground)

			for (let col = 0; col < GRID_COLS; col++) {
				const x = 200 - ((GRID_COLS - 1) * TILE_WIDTH) / 2 + col * TILE_WIDTH;
				const tile = this.createTile(x, y, row, col, spriteCol, isActiveRow);
				this.tiles[row][col] = tile;
			}
		}

		// Create yellow ground rectangle at the bottom
		const groundY = 100 + 4 * this.tileHeight;
		this.ground = this.add.rectangle(
			200,
			groundY,
			360,
			this.tileHeight,
			0xffff00
		);
		this.ground.setStrokeStyle(4, 0x000000);
		this.ground.setDepth(5);
	}

	createTile(x, y, row, col, spriteCol, isActiveRow = false) {
		// Determine if this tile should be a sprite
		const isSpriteTile = col === spriteCol;
		const isTappableRow = isActiveRow;

		if (isSpriteTile && isTappableRow) {
			// Create tappable sprite tile
			const tile = this.add.image(x, y, this.selectedSprite);
			tile.setScale(0.6);
			tile.setInteractive({ useHandCursor: true });
			tile.tappable = true;
			tile.row = row;
			tile.col = col;
			tile.isCorrect = true;
			tile.isActive = true;

			// Add click handler
			tile.on("pointerdown", () => {
				this.tapTile(tile);
			});

			return tile;
		} else if (isTappableRow && !isSpriteTile) {
			// Create losing tile (red square) for active row
			const tile = this.add.rectangle(x, y, 80, 80, 0xff0000);
			tile.setStrokeStyle(2, 0x000000);
			tile.setInteractive({ useHandCursor: true });
			tile.tappable = false;
			tile.row = row;
			tile.col = col;
			tile.isCorrect = false;
			tile.isActive = true;

			// Add click handler
			tile.on("pointerdown", () => {
				this.hitLosingTile();
			});

			return tile;
		} else if (isSpriteTile && !isTappableRow) {
			// Create sprite tile for non-active rows (visible but not tappable)
			const tile = this.add.image(x, y, this.selectedSprite);
			tile.setScale(0.6);
			tile.tappable = false;
			tile.row = row;
			tile.col = col;
			tile.isCorrect = true;
			tile.isActive = false;

			return tile;
		} else {
			// Create non-tappable red tile
			const tile = this.add.rectangle(x, y, 80, 80, 0xff0000);
			tile.setStrokeStyle(2, 0x000000);
			tile.tappable = false;
			tile.row = row;
			tile.col = col;
			tile.isCorrect = false;
			tile.isActive = false;

			return tile;
		}
	}

	scrollBoard() {
		// Move all tiles DOWN by one row (to give the illusion of climbing up)
		this.tiles.forEach((row, rowIndex) => {
			row.forEach((tile) => {
				if (tile && !tile.willDestroy) {
					this.tweens.add({
						targets: tile,
						y: tile.y + this.tileHeight,
						duration: 100,
						ease: "Linear",
					});
				}
			});
		});

		// Also scroll the yellow ground down
		if (this.ground) {
			this.tweens.add({
				targets: this.ground,
				y: this.ground.y + this.tileHeight,
				duration: 100,
				ease: "Linear",
			});
		}

		// Remove tiles that have gone off screen and update array
		this.time.delayedCall(100, () => {
			// Remove all rows that have scrolled below the ground
			// The ground's bottom edge is at ground.y + tileHeight/2 + some buffer
			const groundBottomY = this.ground.y + this.tileHeight;

			this.tiles = this.tiles.filter((row) => {
				if (row.length > 0 && row[0] && row[0].y < groundBottomY + 50) {
					// Keep this row (with some buffer to avoid removing too early)
					return true;
				} else {
					// This row has gone off screen, destroy and remove it
					row.forEach((tile) => tile.destroy());
					return false;
				}
			});

			// Add new row at the TOP
			const GRID_COLS = 4;
			const TILE_WIDTH = 90;
			const newRow = [];
			// Place new row at the top (y = 100)
			const y = 100;
			const spriteCol = Phaser.Math.Between(0, GRID_COLS - 1);

			for (let col = 0; col < GRID_COLS; col++) {
				const x = 200 - ((GRID_COLS - 1) * TILE_WIDTH) / 2 + col * TILE_WIDTH;
				// New row is at index 0, not active row yet
				const tile = this.createTile(x, y, 0, col, spriteCol, false);
				// Position it off-screen above initially
				tile.y = 100 - this.tileHeight;
				// Animate it into view
				this.tweens.add({
					targets: tile,
					y: y,
					duration: 100,
					ease: "Linear",
				});
				newRow.push(tile);
			}

			this.tiles.unshift(newRow);

			// Update row indices for all tiles
			this.tiles.forEach((row, rowIndex) => {
				row.forEach((tile) => {
					if (tile) {
						tile.row = rowIndex;
					}
				});
			});

			// Re-enable interactions for the NEW active row (bottom row after scroll)
			this.time.delayedCall(50, () => {
				// Set all rows above the bottom to full opacity (they're just previews)
				for (let i = 0; i < this.tiles.length - 1; i++) {
					this.tiles[i].forEach((tile) => {
						if (tile && tile.active && tile.alpha === 1.0) {
							// Keep preview rows at full opacity but not interactive
							tile.setAlpha(1.0);
						}
					});
				}

				// Find the bottommost row that has unclicked tiles (not 0.5 opacity)
				let activeRowIndex = -1;
				for (let i = this.tiles.length - 1; i >= 0; i--) {
					const row = this.tiles[i];
					if (
						row &&
						row.length > 0 &&
						row.some((t) => t && t.active && t.alpha >= 0.8)
					) {
						activeRowIndex = i;
						break;
					}
				}

				console.log(`Re-enabling row ${activeRowIndex}`);
				if (activeRowIndex >= 0 && this.tiles[activeRowIndex]) {
					this.tiles[activeRowIndex].forEach((tile) => {
						if (tile && tile.active && tile.alpha >= 0.8) {
							console.log(`Activating tile, alpha: ${tile.alpha}`);
							tile.isActive = true;
							tile.setAlpha(1.0);
							tile.removeAllListeners();

							// Re-add click handlers
							if (tile.isCorrect) {
								tile.on("pointerdown", () => {
									this.tapTile(tile);
								});
							} else {
								tile.on("pointerdown", () => {
									this.hitLosingTile();
								});
							}
							tile.setInteractive({ useHandCursor: true });
						}
					});
				}
			});
		});
	}

	tapTile(tile) {
		console.log(
			`tapTile called, isActive: ${tile.isActive}, isCorrect: ${tile.isCorrect}`
		);
		if (this.gameOver || !this.gameStarted || !tile.isActive) {
			console.log("tapTile blocked:", {
				gameOver: this.gameOver,
				gameStarted: this.gameStarted,
				tileIsActive: tile.isActive,
			});
			return;
		}

		// Find which row this tile is in
		let clickedRowIndex = -1;
		for (let i = 0; i < this.tiles.length; i++) {
			if (this.tiles[i].includes(tile)) {
				clickedRowIndex = i;
				break;
			}
		}
		console.log(`Clicked row index: ${clickedRowIndex}`);

		// Update score
		this.score += 1;
		this.scoreText.setText(`Score: ${this.score}`);

		// Check for new high score
		if (this.score > this.highScore) {
			this.highScore = this.score;
			this.highScoreText.setText(`High: ${this.highScore}`);
			localStorage.setItem("tapsHighScore", this.highScore.toString());
		}

		// Flash the tile
		tile.setTint(0x00ff00);
		this.time.delayedCall(100, () => {
			if (tile && tile.active) {
				tile.clearTint();
			}
		});

		// Show score increase
		this.showScoreIncrease(tile.x, tile.y);

		// Disable the clicked row and set its opacity to 0.5
		if (clickedRowIndex >= 0 && this.tiles[clickedRowIndex]) {
			console.log(`Setting row ${clickedRowIndex} to 0.5 opacity`);
			this.tiles[clickedRowIndex].forEach((t) => {
				if (t && t.setInteractive) {
					t.disableInteractive();
					t.isActive = false;
					t.setAlpha(0.5); // Make it semi-transparent
				}
			});
		}

		// Disable all other tiles temporarily to prevent double-taps
		this.tiles.forEach((row, idx) => {
			if (idx !== clickedRowIndex) {
				row.forEach((t) => {
					if (t && t.setInteractive) {
						t.disableInteractive();
					}
				});
			}
		});

		// Scroll the board
		this.scrollBoard();
	}

	hitLosingTile() {
		if (this.gameOver || !this.gameStarted) return;

		this.gameOver = true;
		this.time.removeAllEvents();

		// Dark transparent background container
		const background = this.add.rectangle(200, 300, 350, 250, 0x000000, 0.8);
		background.setStrokeStyle(4, 0xffffff);
		background.setDepth(18);
		background.setInteractive();

		// Game over text
		const gameOverText = this.add
			.text(200, 300, "Game Over!", {
				fontSize: "32px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		gameOverText.setDepth(20);

		// Restart button
		const restartText = this.add
			.text(200, 370, "Tap to Restart", {
				fontSize: "24px",
				fill: "#ffff00",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		restartText.setDepth(20);

		restartText.on("pointerdown", () => {
			this.restartGame();
		});

		// Menu button
		const menuText = this.add
			.text(200, 450, "Menu", {
				fontSize: "24px",
				fill: "#4ec0ca",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		menuText.setDepth(20);

		menuText.on("pointerdown", () => {
			this.scene.start("MenuScene");
		});
	}

	endRound() {
		if (this.gameOver) return;

		this.gameOver = true;
		this.time.removeAllEvents();

		// Dark transparent background container
		const background = this.add.rectangle(200, 300, 350, 250, 0x000000, 0.8);
		background.setStrokeStyle(4, 0xffffff);
		background.setDepth(18);
		background.setInteractive();

		// Success text
		const successText = this.add
			.text(200, 300, "Time Up!", {
				fontSize: "32px",
				fill: "#00ff00",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		successText.setDepth(20);

		// Restart button
		const restartText = this.add
			.text(200, 370, "Tap to Continue", {
				fontSize: "24px",
				fill: "#ffff00",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		restartText.setDepth(20);

		restartText.on("pointerdown", () => {
			this.restartGame();
		});

		// Menu button
		const menuText = this.add
			.text(200, 450, "Menu", {
				fontSize: "24px",
				fill: "#4ec0ca",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		menuText.setDepth(20);

		menuText.on("pointerdown", () => {
			this.scene.start("MenuScene");
		});
	}

	restartGame() {
		this.gameOver = false;
		this.gameStarted = false;
		this.score = 0;
		this.timer = 30;
		this.scoreText.setText("Score: 0");
		// Destroy ground before restart
		if (this.ground) {
			this.ground.destroy();
		}
		this.scene.restart();
	}

	updateTimerDisplay() {
		if (this.timerText) {
			this.timerText.setText(`${this.timer.toFixed(1)}s`);
		}
	}

	showScoreIncrease(x, y) {
		const increaseText = this.add
			.text(x, y, "+1", {
				fontSize: "32px",
				fill: "#00ff00",
				fontFamily: "Arial",
				fontStyle: "bold",
			})
			.setOrigin(0.5);
		increaseText.setDepth(25);

		// Animate the score increase
		this.tweens.add({
			targets: increaseText,
			y: y - 50,
			alpha: 0,
			duration: 500,
			onComplete: () => {
				increaseText.destroy();
			},
		});
	}

	showSpriteSelection() {
		// Title text
		this.add
			.text(200, 120, "Choose Your Character!", {
				fontSize: "28px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5)
			.setDepth(20);

		// Available sprites
		const sprites = ["Cherry_1", "Cherry_2"];
		const spriteSpacing = 180;
		const startX = 200 - ((sprites.length - 1) * spriteSpacing) / 2;

		sprites.forEach((spriteKey, index) => {
			const x = startX + index * spriteSpacing;
			const y = 300;

			// Create bordered box for sprite
			const box = this.add.rectangle(x, y, 140, 140, 0x000000, 0.3);
			box.setStrokeStyle(4, 0xffffff);
			box.setDepth(14);
			box.setInteractive();

			// Create sprite preview
			const sprite = this.add.image(x, y, spriteKey);
			sprite.setScale(1.0);
			sprite.setDepth(15);

			// Add click handler to both box and sprite
			const clickHandler = () => {
				this.selectSprite(spriteKey);
			};

			box.on("pointerdown", clickHandler);
			sprite.on("pointerdown", clickHandler);

			// Add hover effect
			const hoverIn = () => {
				sprite.setTint(0xcccccc);
				box.setStrokeStyle(4, 0xffff00);
			};
			const hoverOut = () => {
				sprite.clearTint();
				box.setStrokeStyle(4, 0xffffff);
			};

			box.on("pointerover", hoverIn);
			box.on("pointerout", hoverOut);
			sprite.on("pointerover", hoverIn);
			sprite.on("pointerout", hoverOut);
		});
	}

	selectSprite(spriteKey) {
		this.selectedSprite = spriteKey;
		this.spriteSelected = true;

		// Clear all selection screen elements
		this.children.list.slice().forEach((child) => {
			if (child.depth === 14 || child.depth === 15 || child.depth === 20) {
				child.destroy();
			}
		});

		// Create UI elements
		this.scoreText = this.add.text(16, 16, "Score: 0", {
			fontSize: "32px",
			fill: "#fff",
			fontFamily: "Arial",
		});
		this.scoreText.setDepth(20);

		this.highScoreText = this.add.text(384, 16, `High: ${this.highScore}`, {
			fontSize: "24px",
			fill: "#fff",
			fontFamily: "Arial",
		});
		this.highScoreText.setOrigin(1, 0);
		this.highScoreText.setDepth(20);

		this.timerText = this.add.text(200, 16, "30.0s", {
			fontSize: "24px",
			fill: "#ff0000",
			fontFamily: "Arial",
		});
		this.timerText.setOrigin(0.5, 0);
		this.timerText.setDepth(20);

		// Start screen text
		this.startText = this.add
			.text(200, 250, "Tap to Start!\nClimb as high as you can!", {
				fontSize: "20px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		this.startText.setDepth(20);

		// Input handling
		this.input.on("pointerdown", this.startOrPlay, this);
	}
}

export default TapsScene;
