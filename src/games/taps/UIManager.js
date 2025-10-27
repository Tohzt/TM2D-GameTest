import { TAPS_CONFIG } from "./config.js";
import { UIManager as BaseUIManager } from "../components/UIManager.js";

// Wrapper for Taps game that uses the shared UIManager
export class UIManager {
	constructor(scene) {
		this.scene = scene;
		// Use the shared UIManager with Taps-specific config
		this.baseUI = new BaseUIManager(scene, {
			gameId: "taps",
			fontSize: "28px",
			scoreX: 384,
			startMessage: "Tap to Start!\nClimb as high as you can!",
			startY: 250,
			startFontSize: "20px",
			uiDepth: TAPS_CONFIG.UI_DEPTH,
		});

		// Taps-specific additions
		this.timerText = null;
	}

	createGameUI() {
		this.baseUI.createGameUI();

		// Add timer for Taps game
		this.timerText = this.scene.add.text(200, 16, "30.0s", {
			fontSize: "24px",
			fill: "#ff0000",
			fontFamily: "Arial",
		});
		this.timerText.setOrigin(0.5, 0);
		this.timerText.setDepth(TAPS_CONFIG.UI_DEPTH);
	}

	updateScore(score) {
		this.baseUI.updateScore(score);
	}

	updateHighScore(score) {
		this.baseUI.updateHighScore(score);
	}

	updateTimer(timer) {
		if (this.timerText) {
			this.timerText.setText(`${timer.toFixed(1)}s`);
		}
	}

	showEndGame(title, titleColor, score) {
		return this.baseUI.showGameOver(title, score);
	}

	clearEndGameUI() {
		this.baseUI.clearEndGameUI();
	}

	showScoreIncrease(x, y) {
		const increaseText = this.scene.add
			.text(x, y, "+1", {
				fontSize: "32px",
				fill: "#00ff00",
				fontFamily: "Arial",
				fontStyle: "bold",
			})
			.setOrigin(0.5);
		increaseText.setDepth(TAPS_CONFIG.EFFECTS_DEPTH);

		this.scene.tweens.add({
			targets: increaseText,
			y: y - 50,
			alpha: 0,
			duration: 500,
			onComplete: () => {
				increaseText.destroy();
			},
		});
	}

	hideStartText() {
		this.baseUI.hideStartText();
	}

	resetScore() {
		this.baseUI.resetScore();
	}

	getHighScore() {
		return this.baseUI.getHighScore();
	}
}
