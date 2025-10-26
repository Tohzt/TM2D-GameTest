import { TAPS_CONFIG } from "./config.js";

// Factory for creating different types of tiles
export class TileFactory {
	constructor(scene, selectedSprite) {
		this.scene = scene;
		this.selectedSprite = selectedSprite;
	}

	createTile(x, y, row, col, spriteCol, isActiveRow = false) {
		const isSpriteTile = col === spriteCol;
		const isTappableRow = isActiveRow;

		if (isSpriteTile && isTappableRow) {
			return this.createSpriteTile(x, y, row, col);
		} else if (isTappableRow && !isSpriteTile) {
			return this.createLosingTile(x, y, row, col);
		} else if (isSpriteTile && !isTappableRow) {
			return this.createPreviewTile(x, y, row, col);
		} else {
			return this.createBackgroundTile(x, y, row, col);
		}
	}

	createSpriteTile(x, y, row, col) {
		const tile = this.scene.add.image(x, y, this.selectedSprite);
		tile.setScale(0.7);
		tile.setInteractive({ useHandCursor: true });
		tile.tappable = true;
		tile.row = row;
		tile.col = col;
		tile.isCorrect = true;
		tile.isActive = true;
		return tile;
	}

	createLosingTile(x, y, row, col) {
		const tile = this.scene.add.rectangle(x, y, 90, 85, 0xff0000);
		tile.setStrokeStyle(2, 0x000000);
		tile.setInteractive({ useHandCursor: true });
		tile.tappable = false;
		tile.row = row;
		tile.col = col;
		tile.isCorrect = false;
		tile.isActive = true;
		return tile;
	}

	createPreviewTile(x, y, row, col) {
		const tile = this.scene.add.image(x, y, this.selectedSprite);
		tile.setScale(0.7);
		tile.tappable = false;
		tile.row = row;
		tile.col = col;
		tile.isCorrect = true;
		tile.isActive = false;
		return tile;
	}

	createBackgroundTile(x, y, row, col) {
		const tile = this.scene.add.rectangle(x, y, 90, 85, 0xff0000);
		tile.setStrokeStyle(2, 0x000000);
		tile.tappable = false;
		tile.row = row;
		tile.col = col;
		tile.isCorrect = false;
		tile.isActive = false;
		return tile;
	}
}
