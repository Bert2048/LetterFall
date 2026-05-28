import Phaser from 'phaser';

const LETTER_WORDS = {
    A: 'Apple',  B: 'Ball',   C: 'Cat',    D: 'Dog',    E: 'Egg',
    F: 'Fish',   G: 'Goat',   H: 'Hat',    I: 'Ice',    J: 'Jam',
    K: 'Kite',   L: 'Lion',   M: 'Moon',   N: 'Nest',   O: 'Orange',
    P: 'Pig',    Q: 'Queen',  R: 'Rabbit', S: 'Sun',    T: 'Tree',
    U: 'Umbrella', V: 'Van',  W: 'Whale',  X: 'Xylophone', Y: 'Yarn', Z: 'Zebra'
};

const LETTER_COLORS = ['#FF5252', '#FF9800', '#FFD600', '#76FF03', '#00E5FF', '#536DFE', '#E040FB'];
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class Game extends Phaser.Scene {

    constructor() {
        super('Game');
    }

    preload() {
        this.load.image('background', 'assets/space.png');
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });
    }

    create() {
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        // Generate a white circle texture for particles (will be tinted per letter)
        const pg = this.make.graphics({ x: 0, y: 0, add: false });
        pg.fillStyle(0xffffff, 1);
        pg.fillCircle(10, 10, 10);
        pg.generateTexture('particle', 20, 20);
        pg.destroy();

        // Generate a glowing yellow bullet texture
        const bg = this.make.graphics({ x: 0, y: 0, add: false });
        bg.fillStyle(0xffeb3b, 1);
        bg.fillCircle(12, 12, 10);
        bg.lineStyle(3, 0xffffff, 1);
        bg.strokeCircle(12, 12, 10);
        bg.generateTexture('bullet', 24, 24);
        bg.destroy();

        // Cannon (spaceship spritesheet has 3 frames of fly animation)
        this.cannon = this.physics.add.sprite(640, 650, 'ship');
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        });
        this.cannon.play('fly');
        this.cannon.body.setAllowGravity(false);

        this.bullets = this.physics.add.group();
        this.letters = this.physics.add.group();

        this.input.on('pointermove', (p) => {
            this.cannon.x = Phaser.Math.Clamp(p.worldX, 100, 1180);
        });

        // First click also unlocks speechSynthesis (Chrome requires user gesture)
        this.speechUnlocked = false;
        this.input.on('pointerdown', () => {
            if (!this.speechUnlocked && window.speechSynthesis) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
                this.speechUnlocked = true;
            }
            this.fireBullet();
        });

        this.physics.add.overlap(this.bullets, this.letters, this.hitLetter, null, this);

        this.time.addEvent({
            delay: 1800,
            callback: this.spawnLetter,
            callbackScope: this,
            loop: true
        });

        this.spawnLetter();
    }

    fireBullet() {
        const bullet = this.bullets.create(this.cannon.x, this.cannon.y - 50, 'bullet');
        bullet.body.setAllowGravity(false);
        bullet.setVelocityY(-750);
    }

    spawnLetter() {
        if (this.letters.countActive(true) >= 2) return;

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const color = LETTER_COLORS[Math.floor(Math.random() * LETTER_COLORS.length)];
        const x = Phaser.Math.Between(140, 1140);

        const letter = this.add.text(x, -100, char, {
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: '180px',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 10
        }).setOrigin(0.5);

        this.physics.add.existing(letter);
        letter.body.setAllowGravity(false);
        letter.body.setVelocityY(75);
        letter.body.setAngularVelocity(Phaser.Math.Between(-25, 25));
        letter.letterChar = char;
        letter.letterColor = color;

        this.letters.add(letter);
    }

    hitLetter(bullet, letter) {
        const x = letter.x;
        const y = letter.y;
        const char = letter.letterChar;
        const tint = Phaser.Display.Color.HexStringToColor(letter.letterColor).color;

        bullet.destroy();
        letter.destroy();

        const emitter = this.add.particles(x, y, 'particle', {
            speed: { min: 120, max: 450 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.4, end: 0 },
            lifespan: 700,
            tint: tint,
            emitting: false
        });
        emitter.explode(30);
        this.time.delayedCall(800, () => emitter.destroy());

        this.speak(char);
    }

    speak(char) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(`${char}. ${LETTER_WORDS[char]}`);
        u.rate = 0.85;
        u.pitch = 1.15;
        u.volume = 1;
        window.speechSynthesis.speak(u);
    }

    update() {
        this.background.tilePositionX += 0.4;

        this.bullets.children.each((b) => {
            if (b.active && b.y < -30) b.destroy();
        });

        this.letters.children.each((l) => {
            if (l.active && l.y > 820) l.destroy();
        });
    }
}
