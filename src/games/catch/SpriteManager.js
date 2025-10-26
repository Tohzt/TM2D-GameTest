import Phaser from "phaser";
import { CATCH_CONFIG } from "./config.js";

export class SpriteManager {
	constructor(scene, selectedSprite) {
		this.scene = scene;
		this.selectedSprite = selectedSprite;
		this.sprites = scene.add.group();
		this.spawnTimer = null;
		this.isSpawning = false;
		this.sceneWidth = 400;
	}

	startSpawning(scene) {
		this.isSpawning = true;
		this.spawnTimer = scene.time.addEvent({
			delay: CATCH_CONFIG.SPRITE_SPAWN_RATE,
			callback: () => this.trySpawn(),
			loop: true,
		});
	}

	trySpawn() {
		if (!this.isSpawning) return;

		// Random chance to spawn
		if (Math.random() > CATCH_CONFIG.SPAWN_PROBABILITY) {
			return;
		}

		this.spawnSprite();
	}

	spawnSprite() {
		const x = Phaser.Math.Between(30, this.sceneWidth - 30);
		const y = CATCH_CONFIG.SPRITE_SPAWN_Y;

		const sprite = this.scene.add.image(x, y, this.selectedSprite);
		sprite.setScale(CATCH_CONFIG.SPRITE_SCALE);
		sprite.setDepth(CATCH_CONFIG.SPRITE_DEPTH);

		this.scene.physics.add.existing(sprite);
		sprite.body.setAllowGravity(false);
		sprite.body.setVelocityY(CATCH_CONFIG.SPRITE_FALL_SPEED);

		this.sprites.add(sprite);
	}

	update(ground) {
		this.sprites.children.entries.forEach((sprite) => {
			// Destroy sprites that reach the ground or go off screen
			if (sprite.y >= CATCH_CONFIG.GROUND_Y - CATCH_CONFIG.GROUND_HEIGHT / 2) {
				sprite.destroy();
			}
		});
	}

	isSpriteHittingGround() {
		// Check if any active sprite is close to or at the ground
		for (let sprite of this.sprites.children.entries) {
			if (
				sprite.active &&
				sprite.y >= CATCH_CONFIG.GROUND_Y - CATCH_CONFIG.GROUND_HEIGHT / 2 - 30
			) {
				return true;
			}
		}
		return false;
	}

	checkCollision(basketBounds, onCatchCallback) {
		let caughtCount = 0;

		this.sprites.children.entries.forEach((sprite) => {
			if (!sprite.active) return;

			const spriteBounds = sprite.getBounds();

			// Check if sprite overlaps with basket
			if (
				Phaser.Geom.Rectangle.Overlaps(
					basketBounds,
					new Phaser.Geom.Rectangle(
						spriteBounds.x,
						spriteBounds.y,
						spriteBounds.width,
						spriteBounds.height
					)
				)
			) {
				sprite.destroy();
				caughtCount++;
				if (onCatchCallback) {
					onCatchCallback(sprite);
				}
			}
		});

		return caughtCount;
	}

	destroy() {
		if (this.spawnTimer) {
			this.spawnTimer.destroy();
		}
		this.sprites.clear(true, true);
		this.isSpawning = false;
	}
}
