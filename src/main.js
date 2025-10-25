import Phaser from 'phaser';
import gameConfig from './game.js';
import WebApp from '@twa-dev/sdk';

// Initialize Telegram WebApp
WebApp.ready();

// Create Phaser game
const game = new Phaser.Game(gameConfig);

// Optional: Log if running in Telegram
console.log('Running in Telegram:', WebApp.platform !== 'unknown');
