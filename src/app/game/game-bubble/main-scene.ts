import { Scene } from 'phaser';

export class MainScene extends Scene {
  private state!: {
    score: number;
    timeLeft: number;
    targetHanzi: string;
  };

  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private bubbles!: Phaser.GameObjects.Container[];
  private target: string;
  private options: string[];
  private darkMode: boolean = true;
  // 添加一个标志位，用于防止多次点击
  private isProcessing: boolean = false;

  constructor(target: string, options: string[], darkMode: boolean = true) {
    super({ key: 'MainScene' });
    this.target = target;
    this.options = options;
    this.darkMode = darkMode;
  }

  preload() {
    this.load.image('bubble', 'assets/images/bubble.png');
    this.load.image('bubble-pop', 'assets/images/bubble-pop.png');
    this.load.audio('错误', 'assets/audios/错误.mp3');
    this.load.audio('泡泡破裂', 'assets/audios/泡泡破裂.mp3');
  }

  create() {

    this.state = {
      score: 0,
      timeLeft: 30,
      targetHanzi: ''
    };

    this.bubbles = [];

    this.scoreText = this.add.text(20, 20, '得分: 0', {
      fontSize: '24px',
      color: this.darkMode ? '#ffffff' : '#000000',
    });

    this.timeText = this.add.text(20, 40, '时间: 30', {
      fontSize: '24px',
      color: this.darkMode ? '#ffffff' : '#000000',
    });

    this.createBubbles();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.state.timeLeft--;
        this.timeText.setText(`时间: ${this.state.timeLeft}`);
        if (this.state.timeLeft <= 0) this.gameOver();
      }
    });
  }

  private createBubbles() {
    this.state.targetHanzi = this.target;

    let options = this.options.filter(hanzi => hanzi !== this.target);

    // 随机生成四个汉字
    options = Phaser.Utils.Array.Shuffle(options).splice(0, 4);
    options.push(this.target);
    // 打乱汉字顺序
    options = Phaser.Utils.Array.Shuffle(options);


    options.forEach((hanzi, index) => {
      const gameWidth = this.sys.game.canvas.width;
      const gameHeight = this.sys.game.canvas.height;
      const spacing = gameWidth / (options.length + 1);
      const x = spacing * (index + 1);
      const y = Phaser.Math.Between(gameHeight * 0.4, gameHeight * 0.8);


      const bubbleImage = this.add.image(0, 0, 'bubble').setScale(0.35);
      const text = this.add.text(0, 0, hanzi, {
        fontSize: '36px',
        color: Phaser.Utils.Array.GetRandom(['#020617', '#450a0a', '#431407', '#b91c1c', '#c2410c', '#3f6212', '#047857', '#155e75', '#6d28d9', '#c026d3', '#db2777', '#831843', '#be123c', '#6b21a8', '#312e81', '#0c4a6e', '#059669', '#3f6212', '#facc15']),
        // color: Phaser.Utils.Array.GetRandom([
        //   '#000000', // 纯黑
        //   '#8B0000', // 深红
        //   '#4B0082', // 靛蓝
        //   '#000080', // 海军蓝
        //   '#002A3A', // 深蓝灰
        //   '#330066', // 暗紫
        //   '#660033'  // 深酒红
        // ]),
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      const container = this.add.container(x, y, [bubbleImage, text]);

      const radius = (bubbleImage.displayWidth + bubbleImage.displayHeight) / 4;
      container.setInteractive(
        new Phaser.Geom.Circle(0, 0, radius),
        Phaser.Geom.Circle.Contains
      );
      container.on('pointerdown', () => this.handleClick(hanzi));

      const randomDuration = Phaser.Math.Between(1800, 2500);
      const randomDistance = Phaser.Math.Between(120, 180);

      this.tweens.add({
        targets: container,
        y: y - randomDistance,
        duration: randomDuration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.bubbles.push(container);
    });
  }

  private handleClick(selectedHanzi: string) {
    // 点击处理中时直接返回
    if (this.isProcessing) {
      return;
    }
    // 设置处理标志位
    this.isProcessing = true;
    // 延迟重置标志位，给动画和音效留出时间
    this.time.delayedCall(500, () => {
      this.isProcessing = false;
    });
    if (selectedHanzi === this.state.targetHanzi) {
      this.state.score += 10;
      this.scoreText.setText(`得分: ${this.state.score}`);

      const container = this.bubbles.find(c => {
        const textObj = c.list.find(child => child instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text;
        return textObj && textObj.text === selectedHanzi;
      });

      if (container) {
        this.createExplosion(container.x, container.y);
        // 停止泡泡的上下浮动动画
        const tween = this.tweens.getTweensOf(container)[0];
        if (tween) {
          tween.stop();
        }
      }
      this.sound.play('泡泡破裂', { volume: 1.2 });

      this.time.delayedCall(300, () => {
        this.clearBubbles();
        this.time.delayedCall(300, () => {
          this.createBubbles();
        });
      });

    } else {
      this.state.score -= 5;
      this.scoreText.setText(`得分: ${this.state.score}`);
      this.cameras.main.shake(100, 0.02);
      this.sound.play('错误', { volume: 0.8 });
      this.input.enabled = false;
      this.time.delayedCall(200, () => {
        this.input.enabled = true;
      });
    }
  }

  private createExplosion(x: number, y: number) {
    const emitter = this.add.particles(x, y, 'bubble-pop', {
      speed: { min: 50, max: 200 }, // 调整速度范围使粒子运动更加集中
      angle: { min: 0, max: 360 },
      lifespan: { min: 100, max: 500 }, // 添加随机存活时间
      scale: { start: 0.35, end: 0.05 }, // 减小粒子大小
      alpha: { start: 1, end: 0 },
      quantity: 85, // 增加粒子数量
      frequency: 150, // 控制发射频率
      gravityY: 100, // 添加重力效果
      rotate: { min: -180, max: 180 }, // 添加旋转效果
      tint: [0xFFA07A, 0x98FB98, 0x87CEEB, 0xDDA0DD, 0xF0E68C, 0xFF69B4, 0x40E0D0],
      blendMode: 'ADD' // 使用 SCREEN 混合模式使效果更加清晰
    });

    this.time.delayedCall(500, () => {
      emitter.destroy();
    });
  }

  private clearBubbles() {
    this.bubbles.forEach(container => container.destroy());
    this.bubbles = [];
  }

  private gameOver() {
    this.clearBubbles();
    this.scene.stop();
    this.game.events.emit('gameEnd', this.state.score);
  }
}
