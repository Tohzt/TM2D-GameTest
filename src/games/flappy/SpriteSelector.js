import { FLAPPY_CONFIG } from "./config.js";

export class SpriteSelector {
	constructor(scene) {
		this.scene = scene;
		this.selectedSprite = null;
	}

	showSelectionScreen(onSelect) {
		// Title text
		this.scene.add
			.text(200, 100, "Choose Your Character!", {
				fontSize: "28px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5)
			.setDepth(20);

		// Available sprites
		const sprites = FLAPPY_CONFIG.SPRITES;
		const spriteSpacing = FLAPPY_CONFIG.SPRITE_SPACING;
		const startX = 200 - ((sprites.length - 1) * spriteSpacing) / 2;

		sprites.forEach((spriteKey, index) => {
			const x = startX + index * spriteSpacing;
			const y = 250;

			// Create bordered box for sprite
			const box = this.scene.add.rectangle(
				x,
				y,
				FLAPPY_CONFIG.SPRITE_BOX_SIZE,
				FLAPPY_CONFIG.SPRITE_BOX_SIZE,
				0x000000,
				0.3
			);
			box.setStrokeStyle(4, 0xffffff);
			box.setDepth(14);
			box.setInteractive();

			// Create sprite preview
			const sprite = this.scene.add.image(x, y, spriteKey);
			sprite.setScale(1.0);
			sprite.setDepth(15);

			// Add click handler to both box and sprite
			const clickHandler = () => {
				this.selectedSprite = spriteKey;
				if (onSelect) {
					onSelect(spriteKey);
				}
			};

			box.on("pointerdown", clickHandler);
			sprite.on("pointerdown", clickHandler);

			// Add hover effect
			const hoverIn = () => {
				sprite.setTint(0xcccccc);
				box.setStrokeStyle(4, 0xffff00); // Yellow border on hover
			};
			const hoverOut = () => {
				sprite.clearTint();
				box.setStrokeStyle(4, 0xffffff); // White border normal
			};

			box.on("pointerover", hoverIn);
			box.on("pointerout", hoverOut);
			sprite.on("pointerover", hoverIn);
			sprite.on("pointerout", hoverOut);
		});
	}

	clearSelectionScreen() {
		// Clear selection screen elements
		this.scene.children.list.slice().forEach((child) => {
			if (child.depth === 14 || child.depth === 15 || child.depth === 20) {
				child.destroy();
			}
		});
	}
}
