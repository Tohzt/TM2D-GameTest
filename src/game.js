import Phaser from 'phaser';

// Game configuration
const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 400,
    height: 600,
  },
  parent: 'game-container',
  backgroundColor: '#4ec0ca',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let bird;
let pipes;
let score = 0;
let scoreText;
let gameOver = false;
let ground;

function preload() {
  // We'll create simple shapes instead of loading images
}

function create() {
  // Create bird (simple circle)
  bird = this.add.circle(100, 250, 15, 0xffff00);
  this.physics.add.existing(bird);
  bird.body.setCollideWorldBounds(true);
  
  // Create ground
  ground = this.add.rectangle(200, 580, 400, 40, 0x8B4513);
  this.physics.add.existing(ground, true);
  
  // Create pipe group
  pipes = this.physics.add.group();
  
  // Score text
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#fff',
    fontFamily: 'Arial'
  });
  
  // Input handling - tap/click anywhere to flap
  this.input.on('pointerdown', flap);
  
  // Spawn pipes every 2 seconds
  this.time.addEvent({
    delay: 2000,
    callback: spawnPipes,
    callbackScope: this,
    loop: true
  });
  
  // Check collisions
  this.physics.add.collider(bird, ground, hitObstacle, null, this);
  this.physics.add.overlap(bird, pipes, hitObstacle, null, this);
}

function update() {
  if (gameOver) {
    return;
  }
  
  // Check if bird fell below screen
  if (bird.y > 600) {
    hitObstacle.call(this);
  }
  
  // Rotate bird based on velocity
  const angle = Phaser.Math.Clamp(bird.body.velocity.y * 0.1, -30, 90);
  bird.angle = angle;
  
  // Remove pipes that are off screen and increment score
  pipes.children.entries.forEach(pipe => {
    if (pipe.x < -50 && !pipe.scored) {
      pipe.scored = true;
      score += 0.5; // 0.5 because we have 2 pipes (top and bottom)
      scoreText.setText('Score: ' + Math.floor(score));
    }
    if (pipe.x < -100) {
      pipe.destroy();
    }
  });
}

function flap() {
  if (gameOver) {
    restartGame.call(this);
    return;
  }
  
  bird.body.setVelocityY(-350);
}

function spawnPipes() {
  if (gameOver) return;
  
  const gap = 150;
  const gapPosition = Phaser.Math.Between(100, 400);
  
  // Top pipe
  const topPipe = this.add.rectangle(450, gapPosition - gap/2 - 200, 50, 400, 0x00ff00);
  this.physics.add.existing(topPipe);
  topPipe.body.setVelocityX(-150);
  topPipe.body.allowGravity = false;
  pipes.add(topPipe);
  
  // Bottom pipe
  const bottomPipe = this.add.rectangle(450, gapPosition + gap/2 + 200, 50, 400, 0x00ff00);
  this.physics.add.existing(bottomPipe);
  bottomPipe.body.setVelocityX(-150);
  bottomPipe.body.allowGravity = false;
  pipes.add(bottomPipe);
}

function hitObstacle() {
  if (gameOver) return;
  
  gameOver = true;
  this.physics.pause();
  bird.setTint(0xff0000);
  
  // Game over text
  const gameOverText = this.add.text(200, 250, 'Game Over!\nTap to Restart', {
    fontSize: '32px',
    fill: '#fff',
    fontFamily: 'Arial',
    align: 'center'
  }).setOrigin(0.5);
}

function restartGame() {
  gameOver = false;
  score = 0;
  this.scene.restart();
}

export default config;
