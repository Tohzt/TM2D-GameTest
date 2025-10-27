export class SpriteSelector {
	static DEPTHS = {
		SPRITE_BOX: 14,
		SPRITE_IMAGE: 15,
		BUTTON_BG: 19,
		UI: 20,
	};

	constructor(scene, options = {}) {
		this.scene = scene;
		this.selectedSprite = null;
		this.spriteSelected = false;

		this.config = {
			sprites: options.sprites || ["Cherry_1", "Cherry_2"],
			spriteSpacing: options.spriteSpacing || 180,
			spriteBoxSize: options.spriteBoxSize || 140,
			titleY: options.titleY || 100,
			title: options.title || "Choose Your Character!",
			spriteY: options.spriteY || 300,
			titleSize: options.titleSize || "28px",
			...options,
		};
	}

	showSelectionScreen(callback) {
		if (this.config.gameName) {
			this.scene.add
				.text(200, 50, this.config.gameName, {
					fontSize: "36px",
					fill: "#fff",
					fontFamily: "Arial",
					fontStyle: "bold",
					align: "center",
				})
				.setOrigin(0.5)
				.setDepth(SpriteSelector.DEPTHS.UI);
		}

		// Title text
		this.scene.add
			.text(200, this.config.titleY, this.config.title, {
				fontSize: this.config.titleSize,
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5)
			.setDepth(SpriteSelector.DEPTHS.UI);

		const sprites = this.config.sprites;
		const spriteSpacing = this.config.spriteSpacing;
		const startX = 200 - ((sprites.length - 1) * spriteSpacing) / 2;

		sprites.forEach((spriteKey, index) => {
			const x = startX + index * spriteSpacing;
			const y = this.config.spriteY;

			const box = this.scene.add.rectangle(
				x,
				y,
				this.config.spriteBoxSize,
				this.config.spriteBoxSize,
				0x000000,
				0.3
			);
			box.setStrokeStyle(4, 0xffffff);
			box.setDepth(SpriteSelector.DEPTHS.SPRITE_BOX);
			box.setInteractive();

			const sprite = this.scene.add.image(x, y, spriteKey);
			sprite.setScale(1.0);
			sprite.setDepth(SpriteSelector.DEPTHS.SPRITE_IMAGE);

			const clickHandler = () => {
				this.selectSprite(spriteKey);
				if (callback) {
					callback(spriteKey);
				}
			};

			box.on("pointerdown", clickHandler);
			sprite.on("pointerdown", clickHandler);

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

		this.clearSelectionScreen();
	}

	clearSelectionScreen() {
		const depthsToClear = [
			SpriteSelector.DEPTHS.SPRITE_BOX,
			SpriteSelector.DEPTHS.SPRITE_IMAGE,
			SpriteSelector.DEPTHS.BUTTON_BG,
			SpriteSelector.DEPTHS.UI,
		];

		this.scene.children.list.slice().forEach((child) => {
			if (depthsToClear.includes(child.depth)) {
				child.destroy();
			}
		});
	}

	getSelectedSprite() {
		return this.selectedSprite;
	}
}
