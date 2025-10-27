import Phaser from "phaser";
import { FROGGER_CONFIG } from "./config.js";

export class LogManager {
	constructor(scene) {
		this.scene = scene;
		this.logs = scene.add.group();
		this.spawnTimers = [];
		this.isSpawning = false;

		// Define water lanes (Y positions) - matching water area
		// Water is from y=50 to y=250, 4 lanes
		this.lanes = [
			75, // Lane 1 (top water lane)
			125, // Lane 2
			175, // Lane 3
			225, // Lane 4 (bottom water lane)
		];

		// Define speeds for each lane (positive = right, negative = left)
		this.laneSpeeds = [
			100, // Lane 1 - right
			-120, // Lane 2 - left
			90, // Lane 3 - right
			-110, // Lane 4 - left
		];

		// Define spawn delays for each lane (in ms)
		this.laneDelays = [
			2500, // Lane 1
			2200, // Lane 2
			2800, // Lane 3
			2400, // Lane 4
		];
	}

	startSpawning() {
		this.isSpawning = true;

		// Spawn logs for each lane
		this.lanes.forEach((laneY, index) => {
			this.spawnLogForLane(laneY, index);
		});
	}

	spawnLogForLane(laneY, laneIndex) {
		if (!this.isSpawning) return;

		const speed = this.laneSpeeds[laneIndex];
		const delay = this.laneDelays[laneIndex];

		// Spawn initial log after a random delay
		const initialDelay = Phaser.Math.Between(500, delay);
		this.scene.time.delayedCall(initialDelay, () => {
			this.spawnLog(laneY, speed);
		});

		// Spawn recurring logs
		const timer = this.scene.time.addEvent({
			delay: delay,
			callback: () => {
				if (this.isSpawning) {
					this.spawnLog(laneY, speed);
				}
			},
			loop: true,
		});

		this.spawnTimers.push(timer);
	}

	spawnLog(laneY, speed) {
		if (!this.isSpawning) return;

		// Check if there's already a log too close in this lane
		const minDistance = 100;
		const logInLane = this.logs.children.entries.find((log) => {
			if (!log) return false;
			// Check if log is in the same lane (within 5 pixels vertically)
			return Math.abs(log.y - laneY) < 5;
		});

		if (logInLane) {
			// Check distance based on direction
			if (speed > 0 && logInLane.x < minDistance) {
				// Moving right, check if there's a log near the left edge
				return; // Don't spawn yet
			} else if (
				speed < 0 &&
				logInLane.x > FROGGER_CONFIG.WORLD_WIDTH - minDistance
			) {
				// Moving left, check if there's a log near the right edge
				return; // Don't spawn yet
			}
		}

		// Log dimensions
		const width = Phaser.Math.Between(60, 100);
		const height = 45; // Fits within 50px grid cell

		// Determine spawn position based on direction
		let spawnX;
		if (speed > 0) {
			// Moving right, spawn from left
			spawnX = -width;
		} else {
			// Moving left, spawn from right
			spawnX = FROGGER_CONFIG.WORLD_WIDTH + width;
		}

		const log = this.scene.add.rectangle(
			spawnX,
			laneY,
			width,
			height,
			0x8b4513 // Brown color for log
		);
		log.setDepth(FROGGER_CONFIG.GROUND_DEPTH);
		log.setStrokeStyle(2, 0x654321); // Darker brown border

		// Store speed and lane info on the log
		log.speed = speed;
		log.laneY = laneY;

		// Add physics
		this.scene.physics.add.existing(log);
		log.body.allowGravity = false;
		log.body.setSize(width, height);

		// Set velocity
		this.scene.time.delayedCall(10, () => {
			if (log.body) {
				log.body.setVelocityX(speed);
			}
		});

		this.logs.add(log);
	}

	update(frog, frogCollision, frogBorder) {
		// Update log physics
		this.logs.children.entries.forEach((log) => {
			if (!log || !log.active) return;

			// Check if frog is riding this log
			if (frog.ridingLog && frog.ridingLog === log) {
				// Calculate relative position when first landing on log
				if (!log.frogOffsetX) {
					// First time on this log - store the offset from log center
					log.frogOffsetX = frog.x - log.x;
				}

				// Move frog with the log, maintaining relative position
				const newFrogX = log.x + log.frogOffsetX;

				// Check if log is going off screen
				if (log.speed > 0 && newFrogX + 25 >= FROGGER_CONFIG.WORLD_WIDTH) {
					// Log moving right, frog at right edge - keep frog at edge
					frog.x = FROGGER_CONFIG.WORLD_WIDTH - 25; // Half grid size
					log.frogOffsetX = null; // Reset offset
				} else if (log.speed < 0 && newFrogX - 25 <= 0) {
					// Log moving left, frog at left edge - keep frog at edge
					frog.x = 25; // Half grid size
					log.frogOffsetX = null; // Reset offset
				} else {
					// Normal riding - move frog with log maintaining offset
					frog.x = newFrogX;
				}

				// Update collision box and border
				if (frogCollision) {
					frogCollision.x = frog.x;
				}
				if (frogBorder) {
					frogBorder.x = frog.x;
				}
			} else {
				// Not riding this log anymore, clear its offset
				if (log.frogOffsetX !== undefined) {
					log.frogOffsetX = undefined;
				}
			}
		});

		// Remove logs that are off screen
		this.logs.children.entries.forEach((log) => {
			if (log.x < -150 || log.x > FROGGER_CONFIG.WORLD_WIDTH + 150) {
				log.destroy();
			}
		});
	}

	destroy() {
		this.isSpawning = false;
		if (this.spawnTimers) {
			this.spawnTimers.forEach((timer) => {
				if (timer) timer.destroy();
			});
		}
		this.logs.clear(true, true);
	}
}
