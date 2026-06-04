import Phaser from 'phaser';

// Warm, baby-friendly palette — replaces harsh neons
const LETTER_COLORS = ['#FF6B6B', '#FF9F43', '#FFD93D', '#6BCB77', '#4D9DE0', '#C77DFF', '#FF6EB4'];
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const FONT = "'Fredoka One', 'Arial Rounded MT Bold', Arial, sans-serif";

export class Game extends Phaser.Scene {

    constructor() {
        super('Game');
    }

    preload() {
        // 预加载所有蜡笔画风素材 / Preload all crayon art style assets
        this.load.image('background', 'assets/background.png');
        this.load.image('clouds', 'assets/clouds.png');
        this.load.image('trees', 'assets/trees.png');
        this.load.image('bushes', 'assets/bushes.png');
        this.load.image('midground-grass', 'assets/midground-grass.png');
        this.load.image('grass', 'assets/grass.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('particle', 'assets/particle.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('combo-fire', 'assets/combo-fire.png');
        this.load.spritesheet('cannon', 'assets/cannon.png', { frameWidth: 176, frameHeight: 96 });
    }

    create() {
        // --- Background ---
        const W = this.scale.width;
        const H = this.scale.height;

        // 背景：使用 Image 代替 tileSprite 并使用 setDisplaySize 拉伸以保证完全铺满 / Use Image instead of tileSprite and setDisplaySize to stretch-fill the screen
        this.background = this.add.image(W / 2, H / 2, 'background').setDisplaySize(W, H);

        // 各动态视差图层：中心和宽度跟随游戏世界实际宽度，额外 +400 缓冲防止宽屏漏边
        this.clouds   = this.add.tileSprite(W / 2, 180, W + 400, 200, 'clouds');
        this.trees    = this.add.tileSprite(W / 2, 480, W + 400, 250, 'trees');
        this.bushes   = this.add.tileSprite(W / 2, 560, W + 400, 150, 'bushes');
        this.midgrass = this.add.tileSprite(W / 2, 600, W + 400, 100, 'midground-grass');
        this.grass    = this.add.tileSprite(W / 2, 640, W + 400, 90,  'grass');
        this.ground   = this.add.tileSprite(W / 2, 700, W + 400, 40,  'ground');

        // 窗口尺寸变化时同步更新所有图层
        this.scale.on('resize', (gs) => {
            const gW = gs.width;
            const gH = gs.height;
            this.background.setPosition(gW / 2, gH / 2).setDisplaySize(gW, gH);
            // 同步更新所有视差滚动层的大小和位置 / Sync size and position for all parallax layers
            [this.clouds, this.trees, this.bushes, this.midgrass, this.grass, this.ground].forEach(s => {
                if (s) {
                    s.setSize(gW + 400, s.height).setPosition(gW / 2, s.y);
                }
            });
        });

        // 炮台精灵 / Cannon sprite
        this.cannon = this.add.sprite(640, 645, 'cannon').setScale(1.45);
        
        // 注册开炮和待机动画 / Create cannon shoot and idle animations
        this.anims.create({
            key: 'cannon-idle',
            frames: this.anims.generateFrameNumbers('cannon', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'cannon-shoot',
            frames: this.anims.generateFrameNumbers('cannon', { start: 1, end: 2 }),
            frameRate: 12,
            repeat: 0
        });
        this.cannon.play('cannon-idle');

        // Plain JS arrays — avoids PhysicsGroup resetting velocities on add()
        this.letterObjs = [];
        this.bulletObjs = [];

        this.score = 0;
        this.combo = 0;

        // --- UI Layer ---

        // Title (top-left) - 游戏标题
        this.add.text(38, 18, 'LetterFall', {
            fontFamily: FONT,
            fontSize: '38px',
            color: '#FFD93D',
            stroke: '#000000',
            strokeThickness: 5
        });

        // Score (top-center) - 积分面板（左侧带星星图标） / Score panel with star icon
        this.scoreIcon = this.add.image(600, 36, 'star').setScale(0.85);
        this.scoreText = this.add.text(635, 36, '0', {
            fontFamily: FONT,
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0, 0.5);

        // Combo (top-right) - 连击面板（带火焰图标） / Combo panel with fire icon
        this.comboIcon = this.add.image(1140, 36, 'combo-fire').setScale(0.7).setVisible(false);
        this.comboText = this.add.text(1180, 36, '', {
            fontFamily: FONT,
            fontSize: '30px',
            color: '#FF6B6B',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0, 0.5);

        // Instruction (bottom) - 操作提示
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

        // 播放开炮动画，并在播放完后返回待机 / Play shoot animation and return to idle
        this.cannon.play('cannon-shoot');
        this.cannon.once('animationcomplete', () => {
            this.cannon.play('cannon-idle');
        });
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

        // 增加得分和连击 / Add score and combo
        this.score++;
        this.combo++;
        
        // 更新分数文本与星星缩放动画 / Update score text and animate star icon bounce
        this.scoreText.setText(this.score);
        this.tweens.add({
            targets: this.scoreIcon,
            scale: 1.15,
            duration: 120,
            yoyo: true,
            ease: 'Back.easeOut'
        });

        // 更新连击火焰与连击文本 / Update combo display and play bounce tween
        if (this.combo >= 2) {
            this.comboIcon.setVisible(true);
            this.comboText.setText('x' + this.combo);
            this.tweens.add({
                targets: [this.comboIcon, this.comboText],
                scale: { start: 0.7, to: 0.9 },
                duration: 120,
                yoyo: true,
                ease: 'Back.easeOut'
            });
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

        const u = new SpeechSynthesisUtterance(char);
        u.rate = 0.7;
        u.pitch = 1.1;
        window.speechSynthesis.speak(u);
    }

    update(time, delta) {
        const dt = delta / 1000;

        // 各图层滚动，形成多层视差效果（天空静止，云朵极慢，整体速度放慢） / Parallax scrolling layers (sky static, clouds very slow, overall slowed down)
        if (this.clouds) {
            this.clouds.tilePositionX += 0.05;
        }
        if (this.trees) {
            this.trees.tilePositionX += 0.15;
        }
        if (this.bushes) {
            this.bushes.tilePositionX += 0.30;
        }
        if (this.midgrass) {
            this.midgrass.tilePositionX += 0.45;
        }
        if (this.grass) {
            this.grass.tilePositionX += 0.6;
        }
        if (this.ground) {
            this.ground.tilePositionX += 0.6;
        }

        for (let i = this.letterObjs.length - 1; i >= 0; i--) {
            const L = this.letterObjs[i];
            L.y += L.velY * dt;
            L.angle += L.rotSpeed * dt;
            if (L.y > 820) {
                L.destroy();
                this.letterObjs.splice(i, 1);
                // 字母掉落越界，重置连击 / Letter escaped — reset combo streak
                this.combo = 0;
                this.comboIcon.setVisible(false);
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
