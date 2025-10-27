import Phaser from "phaser";
import { FROGGER_CONFIG } from "./config.js";

export class UIManager {
	constructor(scene) {
		this.scene = scene;
		this.scoreText = null;
		this.highScoreText = null;
		this.startText = null;
		this.highScore = parseInt(localStorage.getItem("froggerHighScore") || "0");
		this.endGameElements = [];
	}

	createGameUI() {
		// Score text removed - not used in this game

		this.startText = this.scene.add
			.text(200, 250, "Tap to Start!\nCross the road safely!", {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		this.startText.setDepth(FROGGER_CONFIG.UI_DEPTH);
	}

	updateScore(score) {
		// Score tracking removed - not used in this game
	}

	updateHighScore(score) {
		// High score tracking removed - not used in this game
	}

	hideStartText() {
		if (this.startText) {
			this.startText.destroy();
			this.startText = null;
		}
	}

	resetScore() {
		// Score reset removed - not used in this game
	}

	showGameOver(score) {
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
			.text(200, 230, "Game Over!", {
				fontSize: "32px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		titleText.setDepth(FROGGER_CONFIG.UI_DEPTH);
		this.endGameElements.push(titleText);

		const scoreText = this.scene.add
			.text(200, 270, `Score: ${score}`, {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		scoreText.setDepth(FROGGER_CONFIG.UI_DEPTH);
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
		retryText.setDepth(FROGGER_CONFIG.UI_DEPTH);
		this.endGameElements.push(retryText);

		return { retryText };
	}

	showWin(score) {
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
				fill: "#ffff00",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		titleText.setDepth(FROGGER_CONFIG.UI_DEPTH);
		this.endGameElements.push(titleText);

		const scoreText = this.scene.add
			.text(200, 270, `Score: ${score}`, {
				fontSize: "24px",
				fill: "#fff",
				fontFamily: "Arial",
				align: "center",
			})
			.setOrigin(0.5);
		scoreText.setDepth(FROGGER_CONFIG.UI_DEPTH);
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
		retryText.setDepth(FROGGER_CONFIG.UI_DEPTH);
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
}
