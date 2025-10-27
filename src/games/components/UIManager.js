import apiService from "../../services/api.js";

export class UIManager {
	constructor(scene, config) {
		this.scene = scene;
		this.config = config;
		this.gameId = config.gameId; // 'catch', 'dino', etc.
		this.scoreText = null;
		this.highScoreText = null;
		this.startText = null;
		this.highScore = 0;
		this.endGameElements = [];

		// Load high score from API
		this.loadHighScore();
	}

	async loadHighScore() {
		try {
			// Get user ID from API service (set after authentication)
			const userId = apiService.getUserId();
			if (userId) {
				const highScore = await apiService.getPersonalHighScore(
					this.gameId,
					userId.toString()
				);
				if (highScore && highScore.score) {
					this.highScore = highScore.score;
				}
			}
		} catch (error) {
			console.log("Could not load high score from API:", error);
		}
	}

	createGameUI() {
		// Only create score UI if not disabled
		if (this.config.showScoreUI !== false) {
			this.scoreText = this.scene.add.text(16, 16, "Score: 0", {
				fontSize: this.config.fontSize || "28px",
				fill: "#fff",
				fontFamily: "Arial",
			});
			this.scoreText.setDepth(this.config.uiDepth || 20);

			this.highScoreText = this.scene.add.text(
				this.config.scoreX || 384,
				16,
				`High: ${this.highScore}`,
				{
					fontSize: this.config.fontSize || "28px",
					fill: "#fff",
					fontFamily: "Arial",
				}
			);
			this.highScoreText.setOrigin(1, 0);
			this.highScoreText.setDepth(this.config.uiDepth || 20);
		}

		if (this.config.startMessage) {
			this.startText = this.scene.add.text(
				200,
				this.config.startY || 250,
				this.config.startMessage,
				{
					fontSize: this.config.startFontSize || "24px",
					fill: "#fff",
					fontFamily: "Arial",
					align: "center",
				}
			);
			this.startText.setOrigin(0.5);
			this.startText.setDepth(this.config.uiDepth || 20);
		}
	}

	updateScore(score) {
		if (this.scoreText) {
			this.scoreText.setText("Score: " + score);
		}

		if (score > this.highScore) {
			this.highScore = score;
			this.updateHighScore(score);
			// Note: We don't save here anymore - saves happen only at game end
		}
	}

	async updateScoreAsync(score) {
		if (this.scoreText) {
			this.scoreText.setText("Score: " + score);
		}

		if (score > this.highScore) {
			this.highScore = score;
			this.updateHighScore(score);

			// Save to backend API
			await apiService.saveScore(this.gameId, score);
		}
	}

	updateHighScore(score) {
		if (this.highScoreText) {
			this.highScoreText.setText(`High: ${score}`);
		}
	}

	hideStartText() {
		if (this.startText) {
			this.startText.destroy();
			this.startText = null;
		}
	}

	resetScore() {
		if (this.scoreText) {
			this.scoreText.setText("Score: 0");
		}
	}

	showGameOver(title, score, subtitle = null) {
		// Save to backend API only at game end if it's a new high score
		if (score > this.highScore) {
			apiService.saveScore(this.gameId, score);
		}

		this.clearEndGameUI();

		const background = this.scene.add.rectangle(
			200,
			300,
			350,
			280,
			0x000000,
			0.8
		);
		background.setStrokeStyle(4, 0xffffff);
		background.setDepth(18);
		background.setInteractive();
		this.endGameElements.push(background);

		const titleText = this.scene.add
			.text(200, 230, title, {
				fontSize: "32px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		titleText.setDepth(this.config.uiDepth || 20);
		this.endGameElements.push(titleText);

		const scoreText = this.scene.add
			.text(200, 270, `Score: ${score}`, {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		scoreText.setDepth(this.config.uiDepth || 20);
		this.endGameElements.push(scoreText);

		const retryBg = this.scene.add.rectangle(200, 380, 100, 40, 0xffff00);
		retryBg.setStrokeStyle(2, 0xffffff);
		retryBg.setDepth(19);
		retryBg.setInteractive({ useHandCursor: true });
		this.endGameElements.push(retryBg);

		const retryText = this.scene.add
			.text(200, 380, "Retry", {
				fontSize: "24px",
				fill: "#000000",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		retryText.setDepth(this.config.uiDepth || 20);
		this.endGameElements.push(retryText);

		return { retryText };
	}

	showWin(score, winColor = "#ffff00") {
		// Create win message with custom color
		this.clearEndGameUI();

		const background = this.scene.add.rectangle(
			200,
			300,
			350,
			280,
			0x000000,
			0.8
		);
		background.setStrokeStyle(4, 0xffff00);
		background.setDepth(18);
		background.setInteractive();
		this.endGameElements.push(background);

		const titleText = this.scene.add
			.text(200, 230, "You Win!", {
				fontSize: "32px",
				fill: winColor,
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		titleText.setDepth(this.config.uiDepth || 20);
		this.endGameElements.push(titleText);

		const scoreText = this.scene.add
			.text(200, 270, `Score: ${score}`, {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		scoreText.setDepth(this.config.uiDepth || 20);
		this.endGameElements.push(scoreText);

		const retryBg = this.scene.add.rectangle(200, 380, 100, 40, 0xffff00);
		retryBg.setStrokeStyle(2, 0xffffff);
		retryBg.setDepth(19);
		retryBg.setInteractive({ useHandCursor: true });
		this.endGameElements.push(retryBg);

		const retryText = this.scene.add
			.text(200, 380, "Retry", {
				fontSize: "24px",
				fill: "#000000",
				fontFamily: "Arial",
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		retryText.setDepth(this.config.uiDepth || 20);
		this.endGameElements.push(retryText);

		return { retryText };
	}

	clearEndGameUI() {
		this.endGameElements.forEach((element) => {
			if (element && element.destroy) {
				element.destroy();
			}
		});
		this.endGameElements = [];
	}

	getHighScore() {
		return this.highScore;
	}
}
