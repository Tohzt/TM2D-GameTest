import { TAPS_CONFIG } from "./config.js";

export class SpriteSelector {
	constructor(scene) {
		this.scene = scene;
		this.selectedSprite = null;
		this.spriteSelected = false;
	}

	showSelectionScreen(callback) {
		// Title text
		this.scene.add
			.text(200, 120, "Choose Your Character!", {
				fontSize: "28px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5)
			.setDepth(20);

		// Available sprites
		const sprites = TAPS_CONFIG.SPRITES;
		const spriteSpacing = TAPS_CONFIG.SPRITE_SPACING;
		const startX = 200 - ((sprites.length - 1) * spriteSpacing) / 2;

		sprites.forEach((spriteKey, index) => {
			const x = startX + index * spriteSpacing;
			const y = 300;

			// Create bordered box for sprite
			const box = this.scene.add.rectangle(x, y, 140, 140, 0x000000, 0.3);
			box.setStrokeStyle(4, 0xffffff);
			box.setDepth(14);
			box.setInteractive();

			// Create sprite preview
			const sprite = this.scene.add.image(x, y, spriteKey);
			sprite.setScale(1.0);
			sprite.setDepth(15);

			// Add click handler
			const clickHandler = () => {
				this.selectSprite(spriteKey);
				callback(spriteKey);
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
		this.scene.children.list.slice().forEach((child) => {
			if (child.depth === 14 || child.depth === 15 || child.depth === 20) {
				child.destroy();
			}
		});
	}

	getSelectedSprite() {
		return this.selectedSprite;
	}
}
