import Phaser from 'phaser';

export default class SplashScene extends Phaser.Scene {
  private isLandscape: boolean = true;
  private bg!: Phaser.GameObjects.Image;
  private titleText!: Phaser.GameObjects.Text;
  private subText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'SplashScene' });
  }

  preload() {
    this.load.image('splash_bg', '/images/splash_bg.png');

    // フェイクのローディングプログレス生成用
    for (let i = 0; i < 50; i++) {
      this.load.image(`dummy_${i}`, 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    }
  }

  create() {
    const { width, height } = this.scale;
    this.isLandscape = width > height;

    // 1. 背景の配置 (リサイズ対応のため参照保持)
    this.bg = this.add.image(width / 2, height / 2, 'splash_bg');

    // 2. タイトルテキストの配置
    this.titleText = this.add.text(width / 2, height / 2 + (this.isLandscape ? 120 : 60), '青汁戦記', {
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      fontSize: this.isLandscape ? '48px' : '40px',
      fontStyle: 'bold',
      color: '#4ade80',
      stroke: '#064e3b',
      strokeThickness: 8,
      shadow: { blur: 10, color: '#22c55e', fill: true }
    }).setOrigin(0.5);

    this.subText = this.add.text(width / 2, height / 2 + (this.isLandscape ? 180 : 110), '～苦味の果てに待つ健やかな世界～', {
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      fontSize: this.isLandscape ? '20px' : '16px',
      color: '#ffffff',
      stroke: '#064e3b',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 初期のリサイズ処理適用
    this.resizeBg(width, height);
    this.updateLayout(width, height);

    // リサイズイベントの登録
    this.scale.on('resize', this.handleResize, this);

    // ロード進捗(実際のアセットのロード状況を外部に伝える場合)
    this.load.on('progress', (value: number) => {
      this.game.events.emit('splashProgress', value);
    });

    this.load.on('complete', () => {
      // ロード完了後、数秒待って完了イベントを発火
      setTimeout(() => {
        this.game.events.emit('splashComplete');
      }, 2000);
    });

    // (すでにpreloadでロード完了している場合は手動で発火させるか、React側で制御しますが、
    //  ここではダミー時間合わせとしてReact側でプログレスを回す前提にします。
    //  Phaser側は描画だけして何もしないようにします。)

    // スプラッシュ画面の表示準備完了イベント
    this.game.events.emit('splashReady');
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.isLandscape = width > height;

    this.cameras.main.setViewport(0, 0, width, height);
    this.resizeBg(width, height);
    this.updateLayout(width, height);
  }

  private resizeBg(width: number, height: number) {
    if (!this.bg) return;

    // Cover 相当の挙動: 画面を覆い尽くすように拡縮
    const scaleX = width / this.bg.width;
    const scaleY = height / this.bg.height;
    const scale = Math.max(scaleX, scaleY);

    this.bg.setScale(scale);

    if (this.isLandscape) {
      // PC版（横画面）では、上側（主人公側）を表示するために上端を基準にする
      this.bg.setOrigin(0.5, 0);
      this.bg.setPosition(width / 2, 0);
    } else {
      // スマホ版（縦画面）では、従来通り中央を基準にする
      this.bg.setOrigin(0.5, 0.5);
      this.bg.setPosition(width / 2, height / 2);
    }
  }

  private updateLayout(width: number, height: number) {
    if (!this.titleText) return;

    // テキスト配置
    this.titleText.setPosition(width / 2, height / 2 + (this.isLandscape ? 150 : 90));
    this.titleText.setFontSize(this.isLandscape ? '48px' : '40px');

    this.subText.setPosition(width / 2, height / 2 + (this.isLandscape ? 210 : 140));
    this.subText.setFontSize(this.isLandscape ? '20px' : '16px');
  }
}
