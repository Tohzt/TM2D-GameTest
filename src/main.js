import Phaser from 'phaser';
import gameConfig from './game.js';
import WebApp from '@twa-dev/sdk';

// Initialize Telegram WebApp
WebApp.ready();

// Expand to fullscreen (removes header)
WebApp.expand();

// Optional: Make the header background match your game
WebApp.setHeaderColor('#028af8'); // matches your blue background

// Optional: Enable closing confirmation
WebApp.enableClosingConfirmation();

// Create Phaser game
const game = new Phaser.Game(gameConfig);

// Optional: Log if running in Telegram
console.log('Running in Telegram:', WebApp.platform !== 'unknown');
