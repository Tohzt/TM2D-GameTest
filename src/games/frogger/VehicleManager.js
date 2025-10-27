import Phaser from "phaser";
import { FROGGER_CONFIG } from "./config.js";

export class VehicleManager {
	constructor(scene) {
		this.scene = scene;
		this.vehicles = scene.add.group();
		this.spawnTimers = [];
		this.isSpawning = false;

		// Define road lanes (Y positions) - aligned to grid
		// Road area starts at y=300, lanes are 50px tall (grid size)
		// Vehicle spawn at the CENTER of each 50px tall lane
		this.lanes = [
			325, // Lane 1 (top, center at 300 + 25)
			375, // Lane 2 (center at 300 + 50 + 25)
			425, // Lane 3 (center at 300 + 100 + 25)
			475, // Lane 4 (bottom, center at 300 + 150 + 25)
		];

		// Define speeds for each lane (positive = right, negative = left)
		this.laneSpeeds = [
			-150, // Lane 1 - left
			120, // Lane 2 - right
			-180, // Lane 3 - left
			130, // Lane 4 - right
		];

		// Define spawn delays for each lane (in ms)
		this.laneDelays = [
			2000, // Lane 1
			1800, // Lane 2
			2200, // Lane 3
			1600, // Lane 4
		];
	}

	startSpawning() {
		this.isSpawning = true;

		// Spawn vehicles for each lane
		this.lanes.forEach((laneY, index) => {
			this.spawnVehicleForLane(laneY, index);
		});
	}

	spawnVehicleForLane(laneY, laneIndex) {
		if (!this.isSpawning) return;

		const speed = this.laneSpeeds[laneIndex];
		const delay = this.laneDelays[laneIndex];

		// Spawn initial vehicle after a random delay
		const initialDelay = Phaser.Math.Between(500, delay);
		this.scene.time.delayedCall(initialDelay, () => {
			this.spawnVehicle(laneY, speed);
		});

		// Spawn recurring vehicles
		const timer = this.scene.time.addEvent({
			delay: delay,
			callback: () => {
				if (this.isSpawning) {
					this.spawnVehicle(laneY, speed);
				}
			},
			loop: true,
		});

		this.spawnTimers.push(timer);
	}

	spawnVehicle(laneY, speed) {
		if (!this.isSpawning) return;

		// Check if there's already a vehicle too close in this lane
		const minDistance = 80; // Minimum distance between vehicles
		const vehicleInLane = this.vehicles.children.entries.find((vehicle) => {
			if (!vehicle) return false;
			// Check if vehicle is in the same lane (within 5 pixels vertically)
			return Math.abs(vehicle.y - laneY) < 5;
		});

		if (vehicleInLane) {
			// Check distance based on direction
			if (speed > 0 && vehicleInLane.x < minDistance) {
				// Moving right, check if there's a vehicle near the left edge
				return; // Don't spawn yet
			} else if (
				speed < 0 &&
				vehicleInLane.x > FROGGER_CONFIG.WORLD_WIDTH - minDistance
			) {
				// Moving left, check if there's a vehicle near the right edge
				return; // Don't spawn yet
			}
		}

		// Vehicle dimensions - make them fit within the lane
		const width = Phaser.Math.Between(35, 50);
		const height = 45; // Fits within 50px grid cell

		// Determine spawn position based on direction
		let spawnX;
		if (speed > 0) {
			// Moving right, spawn from left
			spawnX = -30;
		} else {
			// Moving left, spawn from right
			spawnX = FROGGER_CONFIG.WORLD_WIDTH + 30;
		}

		const vehicle = this.scene.add.rectangle(
			spawnX,
			laneY,
			width,
			height,
			FROGGER_CONFIG.VEHICLE_COLOR
		);
		vehicle.setDepth(FROGGER_CONFIG.VEHICLE_DEPTH);
		vehicle.setStrokeStyle(2, 0x000000);

		// Add physics
		this.scene.physics.add.existing(vehicle);
		vehicle.body.allowGravity = false;
		vehicle.body.setSize(width, height);

		// Set velocity
		this.scene.time.delayedCall(10, () => {
			if (vehicle.body) {
				vehicle.body.setVelocityX(speed);
			}
		});

		this.vehicles.add(vehicle);
	}

	update(frogCollision) {
		// Remove vehicles that are off screen
		this.vehicles.children.entries.forEach((vehicle) => {
			if (vehicle.x < -100 || vehicle.x > FROGGER_CONFIG.WORLD_WIDTH + 100) {
				vehicle.destroy();
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
		this.vehicles.clear(true, true);
	}
}
