import { TAPS_CONFIG } from "./config.js";
import { TileFactory } from "./TileFactory.js";

export class GameBoard {
	constructor(scene, selectedSprite) {
		this.scene = scene;
		this.tileFactory = new TileFactory(scene, selectedSprite);
		this.tiles = [];
		this.ground = null;
	}

	createBoard() {
		// Clear any existing tiles
		this.tiles.forEach((row) => row.forEach((tile) => tile.destroy()));
		this.tiles = [];

		// Create initial board with 5 visible rows
		for (let row = 0; row < 5; row++) {
			this.tiles[row] = [];
			const y = TAPS_CONFIG.START_Y + row * TAPS_CONFIG.TILE_HEIGHT;
			const spriteCol = Phaser.Math.Between(0, TAPS_CONFIG.GRID_COLS - 1);
			const isActiveRow = row === 4;

			for (let col = 0; col < TAPS_CONFIG.GRID_COLS; col++) {
				const x =
					200 -
					((TAPS_CONFIG.GRID_COLS - 1) * TAPS_CONFIG.TILE_WIDTH) / 2 +
					col * TAPS_CONFIG.TILE_WIDTH;
				const tile = this.tileFactory.createTile(
					x,
					y,
					row,
					col,
					spriteCol,
					isActiveRow
				);
				this.tiles[row][col] = tile;
			}
		}

		// Create yellow ground rectangle at the bottom
		this.createGround();
	}

	createGround() {
		// Position ground at the bottom of the screen (600 tall, ground center at bottom - height/2)
		const groundY = 600 - TAPS_CONFIG.TILE_HEIGHT / 2; // Center of ground at bottom edge
		this.ground = this.scene.add.rectangle(
			200,
			groundY,
			TAPS_CONFIG.GROUND_WIDTH,
			40, // Make it shorter
			TAPS_CONFIG.GROUND_COLOR
		);
		this.ground.setStrokeStyle(4, 0x000000);
		this.ground.setDepth(TAPS_CONFIG.GROUND_DEPTH);
	}

	storeTargetPositions() {
		// Store where each tile will be after scrolling
		this.tiles.forEach((row) => {
			row.forEach((tile) => {
				if (tile && !tile.willDestroy) {
					tile.targetY = tile.y + TAPS_CONFIG.TILE_HEIGHT;
				}
			});
		});
	}

	scrollBoard() {
		// Shift patterns down by copying data from row above
		for (let rowIndex = 4; rowIndex >= 1; rowIndex--) {
			const aboveRow = this.tiles[rowIndex - 1];
			const currentRow = this.tiles[rowIndex];

			if (aboveRow && currentRow) {
				currentRow.forEach((tile, colIndex) => {
					if (tile && aboveRow[colIndex]) {
						const sourceTile = aboveRow[colIndex];
						// Copy the state
						tile.isCorrect = sourceTile.isCorrect;
						tile.isActive = rowIndex === 4;

						// Update visual appearance
						if (sourceTile.type === "image" && tile.type === "image") {
							// Both images, just change texture
							tile.setTexture(sourceTile.texture.key);
						} else if (
							sourceTile.type === "rectangle" &&
							tile.type === "rectangle"
						) {
							// Both rectangles, just change color
							tile.setFillStyle(0xff0000);
						} else {
							// Different types, need to convert
							const newTile = this.convertTileType(
								tile,
								sourceTile,
								rowIndex === 4
							);
							if (newTile) {
								newTile.isCorrect = sourceTile.isCorrect;
								newTile.isActive = rowIndex === 4;
								newTile.setInteractive({ useHandCursor: true });
								this.tiles[rowIndex][colIndex] = newTile;
							}
						}
					}
				});
			}
		}

		// Generate new pattern for top row
		const topRow = this.tiles[0];
		const spriteCol = Phaser.Math.Between(0, TAPS_CONFIG.GRID_COLS - 1);

		topRow.forEach((tile, colIndex) => {
			if (tile) {
				const isSprite = colIndex === spriteCol;
				if (tile.type === "image") {
					if (isSprite) {
						tile.setTexture(this.tileFactory.selectedSprite);
						tile.isCorrect = true;
					} else {
						// Convert to rectangle for preview
						const newTile = this.convertImageToRect(tile, 0xff0000);
						if (newTile) {
							newTile.isCorrect = false;
							newTile.isActive = false;
							this.tiles[0][colIndex] = newTile;
						}
					}
				} else {
					// Already a rectangle
					if (isSprite) {
						// Convert to sprite
						const newTile = this.convertRectToImage(
							tile,
							this.tileFactory.selectedSprite
						);
						if (newTile) {
							newTile.isCorrect = true;
							newTile.isActive = false;
							this.tiles[0][colIndex] = newTile;
						}
					} else {
						tile.setFillStyle(0xff0000);
						tile.isCorrect = false;
					}
				}
				tile.isActive = false;
			}
		});

		// Keep ground at bottom
		if (this.ground) {
			this.ground.y = 600 - TAPS_CONFIG.TILE_HEIGHT / 2;
		}
	}

	convertTileType(targetTile, sourceTile, isActive) {
		// Destroy and recreate tile
		const oldX = targetTile.x;
		const oldY = targetTile.y;
		targetTile.destroy();

		let newTile;
		if (sourceTile.type === "image") {
			newTile = this.scene.add.image(oldX, oldY, sourceTile.texture.key);
			newTile.setScale(0.7);
			newTile.type = "image";
		} else {
			newTile = this.scene.add.rectangle(oldX, oldY, 90, 85, 0xff0000);
			newTile.setStrokeStyle(2, 0x000000);
			newTile.type = "rectangle";
		}
		return newTile;
	}

	convertImageToRect(tile, color) {
		const oldX = tile.x;
		const oldY = tile.y;
		tile.destroy();
		const rect = this.scene.add.rectangle(oldX, oldY, 90, 85, color);
		rect.setStrokeStyle(2, 0x000000);
		rect.setInteractive({ useHandCursor: true });
		rect.type = "rectangle";
		return rect;
	}

	convertRectToImage(tile, spriteKey) {
		const oldX = tile.x;
		const oldY = tile.y;
		tile.destroy();
		const img = this.scene.add.image(oldX, oldY, spriteKey);
		img.setScale(0.7);
		img.setInteractive({ useHandCursor: true });
		img.type = "image";
		return img;
	}

	removeOffScreenTiles() {
		let groundBottomY = 600; // Default to bottom of screen if ground is destroyed
		if (this.ground) {
			groundBottomY = this.ground.y + TAPS_CONFIG.TILE_HEIGHT;
		}

		this.tiles = this.tiles.filter((row) => {
			if (row.length > 0 && row[0] && row[0].y < groundBottomY + 50) {
				return true;
			} else {
				row.forEach((tile) => tile.destroy());
				return false;
			}
		});
	}

	addNewRow() {
		const newRow = [];
		const spriteCol = Phaser.Math.Between(0, TAPS_CONFIG.GRID_COLS - 1);

		// Always add at top position (row 0)
		const targetY = TAPS_CONFIG.START_Y;
		const startY = TAPS_CONFIG.START_Y - TAPS_CONFIG.TILE_HEIGHT;

		for (let col = 0; col < TAPS_CONFIG.GRID_COLS; col++) {
			const x =
				200 -
				((TAPS_CONFIG.GRID_COLS - 1) * TAPS_CONFIG.TILE_WIDTH) / 2 +
				col * TAPS_CONFIG.TILE_WIDTH;
			const tile = this.tileFactory.createTile(
				x,
				targetY,
				0,
				col,
				spriteCol,
				false
			);
			// Position it directly - no animation since we're repositioning instantly
			tile.y = targetY;
			// Make tiles interactive so they can be clicked when they become the active row
			if (!tile.input) {
				tile.setInteractive({ useHandCursor: true });
			}
			newRow.push(tile);
		}

		this.tiles.unshift(newRow);

		// Update row indices
		this.tiles.forEach((row, rowIndex) => {
			row.forEach((tile) => {
				if (tile) {
					tile.row = rowIndex;
				}
			});
		});

		// Re-enable interactions for the NEW active row
		this.scene.time.delayedCall(50, () => {
			this.activateBottomRow();
		});
	}

	activateBottomRow() {
		// Find the bottommost row with unclicked tiles
		let activeRowIndex = -1;
		for (let i = this.tiles.length - 1; i >= 0; i--) {
			const row = this.tiles[i];
			if (row && row.length > 0 && row.some((t) => t && t.alpha >= 0.8)) {
				activeRowIndex = i;
				break;
			}
		}

		if (activeRowIndex >= 0 && this.tiles[activeRowIndex]) {
			this.tiles[activeRowIndex].forEach((tile) => {
				if (tile && tile.alpha >= 0.8) {
					tile.isActive = true;
					tile.setAlpha(1.0);
					tile.removeAllListeners();
					tile.setInteractive({ useHandCursor: true });
				}
			});
		}
	}

	destroy() {
		this.tiles.forEach((row) => row.forEach((tile) => tile.destroy()));
		this.tiles = [];
		if (this.ground) {
			this.ground.destroy();
			this.ground = null;
		}
	}
}
