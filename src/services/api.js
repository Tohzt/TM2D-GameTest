import WebApp from "@twa-dev/sdk";

const API_BASE_URL = "https://api.tm2d-games.online";

class APIService {
	constructor() {
		this.initData = null;
		this.authenticated = false;
		this.userId = null;
	}

	// Initialize with Telegram WebApp initData
	async init() {
		try {
			// Get initData from Telegram WebApp
			if (WebApp.initData) {
				this.initData = WebApp.initData;
				// Authenticate with backend
				await this.auth();
			} else {
				console.log("Running outside Telegram - API disabled");
			}
		} catch (error) {
			console.error("Failed to initialize API:", error);
		}
	}

	// Authenticate user with backend
	async auth() {
		try {
			const response = await fetch(`${API_BASE_URL}/api/auth`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ initData: this.initData }),
			});

			if (response.ok) {
				const data = await response.json();
				this.authenticated = true;
				this.userId = data.user.telegramId; // Store the user ID
				console.log("Authenticated successfully:", data.user);
				return data;
			} else {
				console.error("Authentication failed:", response.status);
			}
		} catch (error) {
			console.error("Auth error:", error);
		}
	}

	// Save game score
	async saveScore(game, score, metadata = null) {
		try {
			if (!this.authenticated || !this.initData) {
				console.log("Not authenticated - score not saved to server");
				return null;
			}

			const response = await fetch(`${API_BASE_URL}/api/scores`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					initData: this.initData,
					game,
					score,
					metadata: metadata ? JSON.stringify(metadata) : null,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				console.log("Score saved successfully:", data);
				return data;
			} else {
				console.error("Failed to save score:", response.status);
				return null;
			}
		} catch (error) {
			console.error("Error saving score:", error);
			return null;
		}
	}

	// Get user's personal high score
	async getPersonalHighScore(game, telegramId) {
		try {
			if (!telegramId) return null;

			const response = await fetch(
				`${API_BASE_URL}/api/scores/${game}/personal?telegramId=${telegramId}`
			);

			if (response.ok) {
				const data = await response.json();
				return data.highScore;
			}
		} catch (error) {
			console.error("Error fetching personal high score:", error);
		}
		return null;
	}

	// Get current user's ID
	getUserId() {
		return this.userId;
	}

	// Get leaderboard
	async getLeaderboard(game, limit = 10) {
		try {
			const response = await fetch(
				`${API_BASE_URL}/api/leaderboard/${game}?limit=${limit}`
			);

			if (response.ok) {
				const data = await response.json();
				return data.leaderboard;
			}
		} catch (error) {
			console.error("Error fetching leaderboard:", error);
		}
		return [];
	}
}

// Export singleton instance
export default new APIService();
