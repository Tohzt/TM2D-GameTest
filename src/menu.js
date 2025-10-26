import Phaser from "phaser";

class MenuScene extends Phaser.Scene {
	constructor() {
		super({ key: "MenuScene" });
	}

	create() {
		this.add.rectangle(200, 300, 400, 600, 0x1a237e);

		this.add
			.text(200, 120, "TM2D Games", {
				fontSize: "48px",
				fill: "#fff",
				fontFamily: "Arial",
				fontStyle: "bold",
			})
			.setOrigin(0.5);

		this.add
			.text(200, 180, "Choose a Game", {
				fontSize: "24px",
				fill: "#bbb",
				fontFamily: "Arial",
			})
			.setOrigin(0.5);

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

		const containerHeight = 400;
		const containerY = 220;
		const mask = this.add.rectangle(
			200,
			containerY,
			380,
			containerHeight,
			0x000000,
			0
		);
		mask.setOrigin(0.5);

		const gameSpacing = 140;
		const startY = 250;
		const cardWidth = 360;
		const cardHeight = 100;

		games.forEach((game, index) => {
			const y = startY + index * gameSpacing;

			const card = this.add.rectangle(
				200,
				y,
				cardWidth,
				cardHeight,
				game.color
			);
			card.setStrokeStyle(4, 0xffffff);
			card.setInteractive({ useHandCursor: true });

			this.add
				.text(200, y - 15, game.name, {
					fontSize: "28px",
					fill: "#fff",
					fontFamily: "Arial",
					fontStyle: "bold",
					wordWrap: { width: cardWidth - 40 },
				})
				.setOrigin(0.5);

			this.add
				.text(200, y + 15, game.description, {
					fontSize: "14px",
					fill: "#fff",
					fontFamily: "Arial",
				})
				.setOrigin(0.5);

			card.on("pointerover", () => {
				card.setFillStyle(game.color, 0.7);
				card.setStrokeStyle(4, 0xffff00);
			});

			card.on("pointerout", () => {
				card.setFillStyle(game.color, 1);
				card.setStrokeStyle(4, 0xffffff);
			});

			card.on("pointerdown", () => {
				this.startGame(game.key);
			});
		});
	}

	startGame(gameKey) {
		if (gameKey === "flappy") {
			this.scene.start("FlappyScene");
		} else if (gameKey === "taps") {
			this.scene.start("TapsScene");
		}
	}
}

export default MenuScene;
