import { AfterViewInit, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from 'src/app/store/store';
import { Game, Scale } from 'phaser';

import { MainScene } from 'src/app/game/game-bubble/main-scene';
import { timer } from 'rxjs';

@Component({
  selector: 'app-game-bubble',
  standalone: false,
  templateUrl: './game-bubble.component.html',
  styleUrls: ['./game-bubble.component.css'],
})
export class GameBubbleComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  private game!: Game;

  currentScore = 0;
  gameStatus: 'init' | 'playing' | 'end' = 'init';

  groupId = signal('');
  group = computed(() => {
    return this.store.groups().find(g => g.id === this.groupId());
  });
  targetIdx = signal(0);
  target = computed(() => {
    return this.group()?.hanzi[this.targetIdx()]?.character;
  });

  darkMode = this.store.darkMode;
  timerSubscription: any;

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
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  startGame() {
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
    this.timerSubscription = timer(3000).subscribe(() => {
      this.gameStatus = 'playing';
      this.game = new Phaser.Game(config);
      this.game.events.on('gameEnd', (score: number) => {
        this.currentScore = score;
        this.gameStatus = 'end';
      });
    });
  }
  restartGame() {
    this.game.destroy(true);
    this.initTarget();
    this.startGame();
  }

}
