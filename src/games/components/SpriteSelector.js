export class SpriteSelector {
	constructor(scene, options = {}) {
		this.scene = scene;
		this.selectedSprite = null;
		this.spriteSelected = false;

		// Default configuration
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

	showSelectionScreen(callback, backCallback) {
		// Game name text (if provided)
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
				.setDepth(20);
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
			.setDepth(20);

		// Back button (at the bottom)
		if (backCallback) {
			const backBg = this.scene.add.rectangle(200, 550, 120, 50, 0xff0000);
			backBg.setStrokeStyle(2, 0xffffff);
			backBg.setDepth(19);
			backBg.setInteractive({ useHandCursor: true });

			const backText = this.scene.add
				.text(200, 550, "Back", {
					fontSize: "24px",
					fill: "#fff",
					fontFamily: "Arial",
				})
				.setOrigin(0.5)
				.setInteractive({ useHandCursor: true });
			backText.setDepth(20);

			const clickHandler = () => {
				this.clearSelectionScreen();
				backCallback();
			};

			backBg.on("pointerdown", clickHandler);
			backText.on("pointerdown", clickHandler);
		}

		// Available sprites
		const sprites = this.config.sprites;
		const spriteSpacing = this.config.spriteSpacing;
		const startX = 200 - ((sprites.length - 1) * spriteSpacing) / 2;

		sprites.forEach((spriteKey, index) => {
			const x = startX + index * spriteSpacing;
			const y = this.config.spriteY;

			// Create bordered box for sprite
			const box = this.scene.add.rectangle(
				x,
				y,
				this.config.spriteBoxSize,
				this.config.spriteBoxSize,
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

			// Add click handler
			const clickHandler = () => {
				this.selectSprite(spriteKey);
				if (callback) {
					callback(spriteKey);
				}
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
		this.clearSelectionScreen();
	}

	clearSelectionScreen() {
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
