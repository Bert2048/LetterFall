import Phaser from 'phaser';

const FONT = "'Fredoka One', 'Arial Rounded MT Bold', Arial, sans-serif";

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        // 加载蜡笔风素材 / Load crayon-style assets
        this.load.image('background', 'assets/background.png');
        this.load.image('clouds', 'assets/clouds.png');
        this.load.image('trees', 'assets/trees.png');
        this.load.image('bushes', 'assets/bushes.png');
        this.load.image('midground-grass', 'assets/midground-grass.png');
        this.load.image('grass', 'assets/grass.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.image('logo', 'assets/logo.png');
        this.load.spritesheet('cannon', 'assets/cannon.png', { frameWidth: 176, frameHeight: 96 });
    }

    create() {
        // 渲染视差背景图层 / Render parallax background layers
        // 用 Image 代替 tileSprite 渲染背景以实现完整拉伸填充 / Use Image instead of tileSprite to stretch-fill the background
        this.background = this.add.image(640, 360, 'background').setDisplaySize(1280, 720);
        
        // 独立的云朵浮动层 / Independent clouds layer
        this.clouds = this.add.tileSprite(640, 180, 1280, 200, 'clouds');
        
        this.trees = this.add.tileSprite(640, 480, 1280, 250, 'trees');
        this.bushes = this.add.tileSprite(640, 560, 1280, 150, 'bushes');
        // 中景纯草地层 / Midground pure grass layer
        this.midgrass = this.add.tileSprite(640, 600, 1280, 100, 'midground-grass');
        // 渲染独立的草地和地面层 / Render separate grass and ground layers
        this.grass = this.add.tileSprite(640, 640, 1280, 90, 'grass');
        this.ground = this.add.tileSprite(640, 700, 1280, 40, 'ground');

        // 渲染 Logo / Render Logo
        const logo = this.add.image(640, 220, 'logo');

        // 渲染地面的炮台 / Render Cannon on the ground
        const cannon = this.add.sprite(640, 645, 'cannon').setScale(1.45);

        // 创建动画，默认显示第 0 帧（待机） / Create animations, default to frame 0 (idle)
        cannon.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('cannon', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });
        cannon.play('idle');

        // Logo 浮动动画 / Logo bobbing tween
        this.tweens.add({
            targets: logo,
            y: 250,
            duration: 1800,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });

        // “点击开始”提示文本 / "Click to Start" instruction text
        const startText = this.add.text(640, 420, '点击屏幕开始游戏\nClick to Start Game', {
            fontFamily: FONT,
            fontSize: '32px',
            color: '#FFD93D',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // 文本呼吸闪烁效果 / Text breathing fade tween
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 1000,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });

        // 点击屏幕跳转到游戏场景 / Click screen to transit to Game scene
        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }

    update() {
        // 多层背景横向移动实现视差滚动（整体速度减慢，天空背景静止） / Move background layers horizontally for parallax (slowed down, sky remains static)
        this.clouds.tilePositionX += 0.05;
        this.trees.tilePositionX += 0.15;
        this.bushes.tilePositionX += 0.30;
        this.midgrass.tilePositionX += 0.45;
        this.grass.tilePositionX += 0.6;
        this.ground.tilePositionX += 0.6;
    }
    
}
