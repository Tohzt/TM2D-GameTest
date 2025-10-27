import Phaser from "phaser";

class MenuScene extends Phaser.Scene {
	constructor() {
		super({ key: "MenuScene" });
	}

	create() {
		this.add.rectangle(200, 300, 400, 600, 0x1a237e);

		this.add
			.text(200, 60, "TM2D Games", {
				fontSize: "48px",
				fill: "#fff",
				fontFamily: "Arial",
				fontStyle: "bold",
			})
			.setOrigin(0.5);

		this.add
			.text(200, 120, "Choose a Game", {
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
			{
				name: "Dino Runner",
				key: "dino",
				description: "Jump over obstacles!",
				color: 0xff6600,
			},
			{
				name: "Catch Game",
				key: "catch",
				description: "Catch falling sprites!",
				color: 0x9b59b6,
			},
			{
				name: "Frogger",
				key: "frogger",
				description: "Cross the road!",
				color: 0x228b22,
			},
		];

		// Create simple game list
		this.createGamesList(games);
	}

	createGamesList(games) {
		const startY = 170;
		const gameSpacing = 75;
		const cardWidth = 360;
		const cardHeight = 75;

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
				.text(200, y - 12, game.name, {
					fontSize: "26px",
					fill: "#fff",
					fontFamily: "Arial",
					fontStyle: "bold",
				})
				.setOrigin(0.5);

			this.add
				.text(200, y + 12, game.description, {
					fontSize: "13px",
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
		} else if (gameKey === "dino") {
			this.scene.start("DinoScene");
		} else if (gameKey === "catch") {
			this.scene.start("CatchScene");
		} else if (gameKey === "frogger") {
			this.scene.start("FroggerScene");
		}
	}
}

export default MenuScene;
