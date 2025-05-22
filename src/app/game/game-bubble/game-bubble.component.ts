import { AfterViewInit, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from 'src/app/store/store';
import { Game, Scale } from 'phaser';

import { MainScene } from 'src/app/game/game-bubble/main-scene';
import { timer } from 'rxjs';
import { AudioService } from 'src/app/service/audio.service';

@Component({
  selector: 'app-game-bubble',
  standalone: false,
  templateUrl: './game-bubble.component.html',
  styleUrls: ['./game-bubble.component.css'],
})
export class GameBubbleComponent implements OnInit, AfterViewInit, OnDestroy {
  private baseAudioPath = 'assets/audios';
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly audioService = inject(AudioService);

  private game!: Game;

  currentScore = 0;
  gameStatus: 'init' | 'playing' | 'end' | 'error' = 'init';
  errorMsg = '';

  groupId = signal('');
  group = computed(() => {
    return this.store.groups().find(g => g.id === this.groupId());
  });
  targetIdx = signal(0);
  target = computed(() => {
    return this.group()?.hanzi[this.targetIdx()]?.character;
  });

  darkMode = this.store.darkMode;

  constructor() { }

  private initTarget() {
    const group = this.group();
    if (!group) return;
    this.targetIdx.set(Math.floor(Math.random() * group.hanzi.length));
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupId.set(params['groupId']);
      this.initTarget();
    });
    this.store.setBack({
      path: '/learn/group/' + this.groupId(),
      name: 'Back'
    });
  }
  ngAfterViewInit(): void {
    this.startGame();
  }
  ngOnDestroy(): void {
    if (this.game) {
      this.game.destroy(true);
    }
    this.audioService.stopAll();
  }

  startGame() {
    this.currentScore = 0;
    this.gameStatus = 'init';
    const config: Phaser.Types.Core.GameConfig = {
      mode: Scale.FIT,
      type: Phaser.AUTO,
      width: window.innerWidth * 0.9,
      height: window.innerHeight * 0.7,
      parent: 'gameContainer',
      // backgroundColor: '#2a363b',
      transparent: true,
      antialias: true,
      physics: { default: 'arcade' },
      scene: [new MainScene(this.target()!, this.group()!.hanzi.map(h => h.character)!, this.darkMode())],
      autoCenter: Phaser.Scale.CENTER_BOTH,
      roundPixels: true,         // 像素对齐
    };
    this.playAudio().then(() => {
      this.gameStatus = 'playing';
      this.game = new Phaser.Game(config);
      this.game.events.on('gameEnd', (score: number) => {
        this.currentScore = score;
        this.gameStatus = 'end';
      });
    }).catch(err => {
      this.gameStatus = 'error';
      this.errorMsg = '播放音频失败：' + err;
    });
  }
  restartGame() {
    this.game.destroy(true);
    this.initTarget();
    this.startGame();
  }

  private playAudio() {
    const preloadTip = this.audioService.preload('tip', `${this.baseAudioPath}/hanzi-game-tip.mp3`);
    const preloadCharacter = this.audioService.preload('character', `${this.baseAudioPath}/character/${this.target()}.mp3`);
    return Promise.all([preloadTip, preloadCharacter]).then(() => {
      return this.audioService.playSequence(['tip', 'character']);
    });
  }

}
