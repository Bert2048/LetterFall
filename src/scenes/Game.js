import Phaser from 'phaser';

const LETTER_WORDS = {
    A: 'Apple',  B: 'Ball',   C: 'Cat',    D: 'Dog',    E: 'Egg',
    F: 'Fish',   G: 'Goat',   H: 'Hat',    I: 'Ice',    J: 'Jam',
    K: 'Kite',   L: 'Lion',   M: 'Moon',   N: 'Nest',   O: 'Orange',
    P: 'Pig',    Q: 'Queen',  R: 'Rabbit', S: 'Sun',    T: 'Tree',
    U: 'Umbrella', V: 'Van',  W: 'Whale',  X: 'Xylophone', Y: 'Yarn', Z: 'Zebra'
};

// Warm, baby-friendly palette — replaces harsh neons
const LETTER_COLORS = ['#FF6B6B', '#FF9F43', '#FFD93D', '#6BCB77', '#4D9DE0', '#C77DFF', '#FF6EB4'];
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const FONT = "'Fredoka One', 'Arial Rounded MT Bold', Arial, sans-serif";

export class Game extends Phaser.Scene {

    constructor() {
        super('Game');
    }

    preload() {
        this.load.image('background', 'assets/space.png');
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });
    }

    create() {
        // --- Background ---
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        // Moon (top-right) — full circle with soft craters, no overlay trick
        const moonGfx = this.add.graphics();
        moonGfx.fillStyle(0xFFF8DC, 0.88);
        moonGfx.fillCircle(1145, 80, 46);
        moonGfx.fillStyle(0xD4C89A, 0.5);
        moonGfx.fillCircle(1130, 68, 11);
        moonGfx.fillStyle(0xD4C89A, 0.4);
        moonGfx.fillCircle(1158, 92, 7);
        moonGfx.fillStyle(0xD4C89A, 0.35);
        moonGfx.fillCircle(1148, 58, 5);

        // Particle texture — white circle
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

        // Ground line overlay — blue-purple replaces the cold cyan in space.png
        const groundGfx = this.add.graphics();
        groundGfx.fillStyle(0x4D9DE0, 0.92);
        groundGfx.fillRect(0, 598, 1280, 5);
        groundGfx.fillStyle(0xC77DFF, 0.75);
        groundGfx.fillRect(0, 603, 1280, 3);
        groundGfx.fillStyle(0x4D9DE0, 0.12);
        groundGfx.fillRect(0, 606, 1280, 55);

        // Cannon sprite — scaled up for visibility
        this.cannon = this.add.sprite(640, 645, 'ship').setScale(1.45);
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

        this.score = 0;
        this.combo = 0;

        // --- UI Layer ---

        // Title (top-left)
        this.add.text(38, 18, 'LetterFall', {
            fontFamily: FONT,
            fontSize: '38px',
            color: '#FFD93D',
            stroke: '#000000',
            strokeThickness: 5
        });

        // Score (top-center)
        this.scoreText = this.add.text(640, 18, '⭐ 0 ⭐', {
            fontFamily: FONT,
            fontSize: '30px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0);

        // Combo (top-right)
        this.comboText = this.add.text(1242, 18, '', {
            fontFamily: FONT,
            fontSize: '26px',
            color: '#6BCB77',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0);

        // Instruction (bottom)
        this.add.text(640, 708, '点击发射子弹 · 击中字母学英语', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#666666'
        }).setOrigin(0.5, 1);

        // --- Input ---
        this.input.on('pointermove', p => {
            this.cannon.x = Phaser.Math.Clamp(p.worldX, 100, 1180);
        });

        this.speechUnlocked = false;
        this.input.on('pointerdown', () => {
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
        const b = this.add.image(this.cannon.x, this.cannon.y - 70, 'bullet');
        b.velY = -750;
        this.bulletObjs.push(b);
    }

    spawnLetter() {
        if (this.letterObjs.length >= 2) return;

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const color = LETTER_COLORS[Math.floor(Math.random() * LETTER_COLORS.length)];

        // Retry until 220px clear of existing letters
        let x, attempts = 0;
        do {
            x = Phaser.Math.Between(150, 1130);
            attempts++;
        } while (attempts < 10 && this.letterObjs.some(L => Math.abs(L.x - x) < 220));
        if (attempts >= 10) return;

        const letter = this.add.text(x, -120, char, {
            fontFamily: FONT,
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

        // Particle burst
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

        // Score & combo
        this.score++;
        this.combo++;
        this.scoreText.setText('⭐ ' + this.score + ' ⭐');
        if (this.combo >= 2) {
            this.comboText.setText('🔥 x' + this.combo);
        }

        // +1⭐ popup tween
        const popup = this.add.text(x, y - 30, '+1 ⭐', {
            fontFamily: FONT,
            fontSize: '44px',
            color: '#FFD93D',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);
        this.tweens.add({
            targets: popup,
            y: y - 130,
            alpha: 0,
            duration: 900,
            ease: 'Power2',
            onComplete: () => popup.destroy()
        });

        this.speak(char);
    }

    speak(char) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

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

        for (let i = this.letterObjs.length - 1; i >= 0; i--) {
            const L = this.letterObjs[i];
            L.y += L.velY * dt;
            L.angle += L.rotSpeed * dt;
            if (L.y > 820) {
                L.destroy();
                this.letterObjs.splice(i, 1);
                // Letter escaped — reset combo streak
                this.combo = 0;
                this.comboText.setText('');
            }
        }

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
