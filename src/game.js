import Phaser from 'phaser';

export default {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() {
  // Load assets here later
}

function create() {
  // Simple test text
  this.add.text(400, 300, 'Phaser 3 + Telegram!', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update() {
  // Game loop
}
