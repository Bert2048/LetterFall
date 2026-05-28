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

        // Particle texture — white circle, tinted per letter at explode time
        const pg = this.make.graphics({ add: false });
        pg.fillStyle(0xffffff, 1);
        pg.fillCircle(8, 8, 8);
        pg.generateTexture('particle', 16, 16);
        pg.destroy();

        // Bullet texture — glowing yellow circle
        const bg = this.make.graphics({ add: false });
        bg.fillStyle(0xffeb3b, 1);
        bg.fillCircle(10, 10, 10);
        bg.lineStyle(2, 0xffffff, 0.8);
        bg.strokeCircle(10, 10, 10);
        bg.generateTexture('bullet', 20, 20);
        bg.destroy();

        // Cannon sprite (no physics needed — we position it directly)
        this.cannon = this.add.sprite(640, 650, 'ship');
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        });
        this.cannon.play('fly');

        // Plain JS arrays — avoids PhysicsGroup resetting velocities on add()
        this.letterObjs = [];
        this.bulletObjs = [];

        this.input.on('pointermove', p => {
            this.cannon.x = Phaser.Math.Clamp(p.worldX, 100, 1180);
        });

        this.speechUnlocked = false;
        this.input.on('pointerdown', () => {
            // First click unlocks speechSynthesis in Chrome (requires user gesture)
            if (!this.speechUnlocked && window.speechSynthesis) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
                this.speechUnlocked = true;
            }
            this.fireBullet();
        });

        this.time.addEvent({
            delay: 1800,
            callback: this.spawnLetter,
            callbackScope: this,
            loop: true
        });

        this.spawnLetter();
    }

    fireBullet() {
        const b = this.add.image(this.cannon.x, this.cannon.y - 55, 'bullet');
        b.velY = -750;
        this.bulletObjs.push(b);
    }

    spawnLetter() {
        if (this.letterObjs.length >= 2) return;

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const color = LETTER_COLORS[Math.floor(Math.random() * LETTER_COLORS.length)];
        const x = Phaser.Math.Between(150, 1130);

        const letter = this.add.text(x, -120, char, {
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: '180px',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 10
        }).setOrigin(0.5);

        letter.velY = 40;
        letter.rotSpeed = Phaser.Math.FloatBetween(-12, 12);
        letter.letterChar = char;
        letter.letterColor = color;
        this.letterObjs.push(letter);
    }

    hitLetter(bullet, letter) {
        const x = letter.x;
        const y = letter.y;
        const char = letter.letterChar;
        const tint = Phaser.Display.Color.HexStringToColor(letter.letterColor).color;

        bullet.destroy();
        letter.destroy();

        // Coloured particle burst
        const emitter = this.add.particles(x, y, 'particle', {
            speed: { min: 120, max: 460 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.3, end: 0 },
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

        // Two separate utterances → browser inserts a natural pause between them
        const u1 = new SpeechSynthesisUtterance(char);
        u1.rate = 0.7;
        u1.pitch = 1.1;

        const u2 = new SpeechSynthesisUtterance(LETTER_WORDS[char]);
        u2.rate = 0.7;
        u2.pitch = 1.1;

        window.speechSynthesis.speak(u1);
        window.speechSynthesis.speak(u2);
    }

    update(time, delta) {
        const dt = delta / 1000;

        this.background.tilePositionX += 0.4;

        // Move letters down and rotate
        for (let i = this.letterObjs.length - 1; i >= 0; i--) {
            const L = this.letterObjs[i];
            L.y += L.velY * dt;
            L.angle += L.rotSpeed * dt;
            if (L.y > 820) {
                L.destroy();
                this.letterObjs.splice(i, 1);
            }
        }

        // Move bullets up; check collision with each letter
        for (let bi = this.bulletObjs.length - 1; bi >= 0; bi--) {
            const b = this.bulletObjs[bi];
            b.y += b.velY * dt;

            if (b.y < -30) {
                b.destroy();
                this.bulletObjs.splice(bi, 1);
                continue;
            }

            for (let li = this.letterObjs.length - 1; li >= 0; li--) {
                const L = this.letterObjs[li];
                if (Math.abs(b.x - L.x) < 75 && Math.abs(b.y - L.y) < 90) {
                    this.hitLetter(b, L);
                    this.bulletObjs.splice(bi, 1);
                    this.letterObjs.splice(li, 1);
                    break;
                }
            }
        }
    }
}
