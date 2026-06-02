import Phaser from 'phaser';
import { Game } from './scenes/Game.js';

const config = {
    type: Phaser.AUTO,
    title: 'LetterFall',
    description: 'Baby alphabet cannon game',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#040218',
    pixelArt: false,
    scene: [
        Game
    ],
    scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
