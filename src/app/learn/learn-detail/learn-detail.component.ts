import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import HanziWriter, { CharacterJson } from 'hanzi-writer';
import { lastValueFrom } from 'rxjs';
import { Hanzi } from 'src/app/hanzi.types';
import { AudioService } from 'src/app/service/audio.service';
import { Store } from 'src/app/store/store';

@Component({
  selector: 'app-learn-detail',
  standalone: false,
  templateUrl: './learn-detail.component.html',
  styleUrls: ['./learn-detail.component.css'],
})
export class LearnDetailComponent implements AfterViewInit {

  @ViewChild('writerContainer')
  private writerContainer!: ElementRef;
  @ViewChild('drawWriterContainer')
  private drawWriterContainer!: ElementRef;
  private writer: HanziWriter | null = null;
  private drawWriter: HanziWriter | null = null;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private http = inject(HttpClient);
  private audioService = inject(AudioService);

  private readonly quizCallback = {
    onMistake: () => {
      this.audioService.stopAll();
      this.audioService.preload('错误', `/assets/audios/错误.mp3`).then(() => {
        return this.audioService.play('错误');
      });
    },
    onComplete: () => {
      this.audioService.stopAll();
      this.audioService.preload('success', `/assets/audios/success.mp3`).then(() => {
        return this.audioService.play('success');
      });
    },
  };

  // 屏幕宽度和高度
  innerWidth = signal(window.innerWidth);
  innerHeight = signal(window.innerHeight);

  // 字容器的宽度
  containerWidth = signal(300);
  containerHeight = signal(300);
  // 边长
  containerSize = computed(() => {
    return Math.min(this.containerWidth(), this.containerHeight(), 300);
  });

  groups = this.store.groups;
  darkMode = this.store.darkMode;
  group = computed(() => {
    return this.groups().find(g => g.id === this.groupId());
  });
  color = computed(() => {
    return this.group()?.color || 'primary';
  });

  groupId = signal('');

  // hanzi = signal<Hanzi | null>(null);
  // 标记当前选择的汉字的索引，用于上一个下一个
  idx = signal(-1);
  nextId = computed(() => {
    if (this.idx() === -1) {
      return -1;
    }
    if (!this.group() || !this.group()?.hanzi) {
      return -1;
    }
    if (this.idx() === this.group()!.hanzi.length - 1) {
      return -1;
    }
    return this.idx() + 1;
  });
  prevId = computed(() => {
    if (this.idx() === -1) {
      return -1;
    }
    if (!this.group() || !this.group()?.hanzi) {
      return -1;
    }
    if (this.idx() === 0) {
      return -1;
    }
    return this.idx() - 1;
  })
  hanzi = computed(() => {
    if (this.idx() === -1) {
      return null;
    }
    if (!this.group() || !this.group()?.hanzi) {
      return null;
    }
    return this.group()!.hanzi[this.idx()] || null;
  });
  completed = signal(false)

  drawModalVisible = signal(false);

  constructor() {
    effect(async () => {
      // 汉字发生变化，停止播放之前的音频
      if (this.hanzi()) {
        this.audioService.stopAll();
        this.initWriter(this.hanzi()!.character);
        await this.waitSeconds(0.5);
        this.animateCharacter();
        this.playAudio(this.hanzi());
      }
    });
  }


  ngAfterViewInit(): void {
    this.route.params.subscribe(params => {
      this.groupId.set(params['id']);
      this.idx.set(Number.parseInt(params['idx']));
    });
    this.store.setBack({
      path: '/learn/board',
      name: 'Back'
    });
  }

  private initWriter(character: string) {
    // 清理容器内的内容
    if (this.writer) {
      this.writerContainer.nativeElement.innerHTML = '';
      this.writer = null;
    }
    this.writerContainer.nativeElement.innerHTML = '';
    this.writer = HanziWriter.create(this.writerContainer.nativeElement, character, {
      width: 200,
      height: 200,
      padding: 5,
      showOutline: true,
      outlineColor: this.darkMode() ? '#6a7282' : '#d1d5dc',
      strokeColor: this.darkMode() ? '#fee685' : '#e17100',
      // radicalColor: '#ff0000', // 偏旁部首颜色
      strokeAnimationSpeed: 1, // 动画速度（1=正常）
      delayBetweenStrokes: 800, // 笔画间隔时间
      charDataLoader: (char: string) => {
        return lastValueFrom(this.http.get<CharacterJson>(`/assets/hanzi-writer-data/${char}.json`));
      },

    });
  }

  private initDrawWriter(character: string) {
    // 清理容器内的内容
    if (this.drawWriter) {
      this.drawWriterContainer.nativeElement.innerHTML = '';
      this.drawWriter = null;
    }
    this.drawWriterContainer.nativeElement.innerHTML = '';
    this.drawWriter = HanziWriter.create(this.drawWriterContainer.nativeElement, character, {
      width: this.containerSize(),
      height: this.containerSize(),
      showOutline: true,
      showCharacter: false,
      outlineColor: this.darkMode() ? '#6a7282' : '#d1d5dc',
      strokeColor: this.darkMode() ? '#fee685' : '#e17100',
      drawingWidth: 40,
      drawingColor: this.darkMode() ? '#fee685' : '#e17100',
      highlightColor: '#4caf50', // 高亮颜色
      // radicalColor: '#ff0000', // 偏旁部首颜色
      strokeAnimationSpeed: 1, // 动画速度（1=正常）
      delayBetweenStrokes: 800, // 笔画间隔时间
      showHintAfterMisses: 1, // 错误多少次后显示提示
      charDataLoader: (char: string) => {
        return lastValueFrom(this.http.get<CharacterJson>(`/assets/hanzi-writer-data/${char}.json`));
      },

    });
  }

  showDrawModal() {
    this.audioService.stopAll();
    this.drawModalVisible.set(true);
    this.initDrawWriter(this.hanzi()!.character);
    this.drawWriter?.quiz(this.quizCallback);
    this.store.setBodyOverflowHidden(true);
  }
  closeDrawModal() {
    this.drawModalVisible.set(false);
    this.store.setBodyOverflowHidden(false);
  }

  animateCharacter() {
    this.writer?.animateCharacter();
  }

  nextCharacter() {
    if (this.idx() === this.group()!.hanzi.length - 1) {
      this.completed.set(true);
      this.audioService.stopAll();
      this.playCompletedAudio();
      return;
    }
    if (this.nextId() === -1) {
      return;
    }
    this.router.navigate(['/', 'learn', 'group', this.groupId(), this.nextId()]);
  }
  prevCharacter() {
    if (this.prevId() === -1) {
      return;
    }
    this.router.navigate(['/', 'learn', 'group', this.groupId(), this.prevId()]);
  }

  closeCompletedModal() {
    this.completed.set(false);
    this.audioService.stopAll();
  }

  redo() {
    if (!this.drawWriter) {
      return;
    }
    this.drawWriter.quiz(this.quizCallback);
  }

  async playAudio(hanzi: Hanzi | null) {
    if (!hanzi) {
      return;
    }
    this.audioService.stopAll();
    await this.audioService.preload(hanzi.character, `/assets/audios/characters/${hanzi.character}.mp3`);
    await this.audioService.play(hanzi.character);
  }

  private async waitSeconds(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }
  private async playCompletedAudio() {
    await Promise.all([
      this.audioService.preload('success', '/assets/audios/success.mp3'),
      this.audioService.preload('completed', '/assets/audios/learn-completed.mp3'),
    ]);
    await this.audioService.play('success');
    await this.audioService.play('completed');
  }

}
