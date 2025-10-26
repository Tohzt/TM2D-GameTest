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

		// Create initial board with 4 visible rows
		for (let row = 0; row < 4; row++) {
			this.tiles[row] = [];
			const y = TAPS_CONFIG.START_Y + row * TAPS_CONFIG.TILE_HEIGHT;
			const spriteCol = Phaser.Math.Between(0, TAPS_CONFIG.GRID_COLS - 1);
			const isActiveRow = row === 3;

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
		const groundY =
			TAPS_CONFIG.START_Y +
			TAPS_CONFIG.GROUND_Y_OFFSET * TAPS_CONFIG.TILE_HEIGHT;
		this.ground = this.scene.add.rectangle(
			200,
			groundY,
			TAPS_CONFIG.GROUND_WIDTH,
			TAPS_CONFIG.TILE_HEIGHT,
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
		// Remove tiles that have gone off screen
		this.removeOffScreenTiles();

		// Add a new row at the top
		this.addNewRow();

		// Reposition all tiles to keep active row at same screen position
		this.tiles.forEach((row, rowIndex) => {
			const targetY = TAPS_CONFIG.START_Y + rowIndex * TAPS_CONFIG.TILE_HEIGHT;
			row.forEach((tile) => {
				if (tile && !tile.willDestroy) {
					tile.y = targetY;
				}
			});
		});

		// Move ground down by one tile height, eventually scrolling it off screen
		if (this.ground) {
			this.ground.y = this.ground.y + TAPS_CONFIG.TILE_HEIGHT;
		}

		// If ground has moved too far down, remove it so it doesn't block the view
		if (this.ground && this.ground.y > 650) {
			this.ground.destroy();
			this.ground = null;
		}
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
