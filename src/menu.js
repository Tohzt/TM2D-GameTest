import Phaser from "phaser";

class MenuScene extends Phaser.Scene {
	constructor() {
		super({ key: "MenuScene" });
	}

	create() {
		// Background
		this.add.rectangle(200, 300, 400, 600, 0x1a237e);

		// Title
		this.add
			.text(200, 120, "TM2D Games", {
				fontSize: "48px",
				fill: "#fff",
				fontFamily: "Arial",
				fontStyle: "bold",
			})
			.setOrigin(0.5);

		// Subtitle
		this.add
			.text(200, 180, "Choose a Game", {
				fontSize: "24px",
				fill: "#bbb",
				fontFamily: "Arial",
			})
			.setOrigin(0.5);

		// Available games
		const games = [
			{
				name: "Flappy Bird",
				key: "flappy",
				description: "Fly through pipes!",
				color: 0x4ec0ca,
			},
			{
				name: "Don't Tap Red!",
				key: "taps",
				description: "Tap the sprites, avoid red!",
				color: 0x00ff00,
			},
		];

		const gameSpacing = 200;
		const startY = 350;

		games.forEach((game, index) => {
			const y = startY + index * gameSpacing;

			// Create game card
			const card = this.add.rectangle(200, y, 300, 120, game.color);
			card.setStrokeStyle(4, 0xffffff);
			card.setInteractive({ useHandCursor: true });

			// Game name
			this.add
				.text(200, y - 20, game.name, {
					fontSize: "32px",
					fill: "#fff",
					fontFamily: "Arial",
					fontStyle: "bold",
				})
				.setOrigin(0.5);

			// Game description
			this.add
				.text(200, y + 20, game.description, {
					fontSize: "16px",
					fill: "#fff",
					fontFamily: "Arial",
				})
				.setOrigin(0.5);

			// Hover effect
			card.on("pointerover", () => {
				card.setFillStyle(game.color, 0.7);
				card.setStrokeStyle(4, 0xffff00);
			});

			card.on("pointerout", () => {
				card.setFillStyle(game.color, 1);
				card.setStrokeStyle(4, 0xffffff);
			});

			// Click handler
			card.on("pointerdown", () => {
				this.startGame(game.key);
			});
		});
	}

	startGame(gameKey) {
		// Start the selected game scene
		if (gameKey === "flappy") {
			this.scene.start("FlappyScene");
		} else if (gameKey === "taps") {
			this.scene.start("TapsScene");
		}
	}
}

export default MenuScene;
