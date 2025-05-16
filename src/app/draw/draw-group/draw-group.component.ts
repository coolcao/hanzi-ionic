import { AfterViewInit, Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import HanziWriter, { CharacterJson } from 'hanzi-writer';

import { Store } from '../../store/store';
import { Hanzi } from '../../hanzi.types';
import { AudioService } from '../../service/audio.service';


@Component({
  selector: 'app-draw-group',
  standalone: false,
  templateUrl: './draw-group.component.html',
  styleUrl: './draw-group.component.css'
})
export class DrawGroupComponent implements OnInit, AfterViewInit {
  @ViewChild('writerContainer')
  private writerContainer!: ElementRef;

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

  private writer: HanziWriter | null = null;
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private http = inject(HttpClient);
  private audioService = inject(AudioService);

  groups = this.store.groups;
  darkMode = this.store.darkMode;
  group = computed(() => {
    return this.groups().find(g => g.id === this.groupId());
  });
  color = computed(() => {
    return this.group()?.color || 'primary';
  });

  groupId = signal('');

  hanzi = signal<Hanzi | null>(null);
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

  constructor() {
    effect(() => {
      // 汉字发生变化，停止播放之前的音频
      if (this.hanzi()) {
        this.audioService.stopAll();
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId.set(params['id']);
    });
    this.store.setBack({
      path: '/learn/board',
      name: 'Back'
    });
    // 开始监听屏幕尺寸变化
    this.resizeObserver.observe(document.body);
  }

  ngOnDestroy(): void {
    // 停止监听屏幕尺寸变化
    this.resizeObserver.disconnect();
  }
  ngAfterViewInit(): void {
  }

  // 监听屏幕尺寸变化
  private resizeObserver = new ResizeObserver(() => {
    this.innerWidth.set(window.innerWidth);
    this.innerHeight.set(window.innerHeight);
    // 如果当前有显示汉字，则需要重新计算容器尺寸
    if (this.hanzi()) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.containerWidth.set(width * 0.7);
      this.containerHeight.set(height * 0.7);
    }
  });

  private initWriter(character: string) {
    // 清理容器内的内容
    if (this.writer) {
      this.writerContainer.nativeElement.innerHTML = '';
      this.writer = null;
    }
    this.writerContainer.nativeElement.innerHTML = '';
    this.writer = HanziWriter.create(this.writerContainer.nativeElement, character, {
      // width: this.containerWidth(),
      // height: this.containerWidth(),
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
      charDataLoader: (char: string) => {
        return lastValueFrom(this.http.get<CharacterJson>(`/assets/hanzi-writer-data/${char}.json`));
      },

    });

    this.writer.quiz();
  }

  showDetail(hanzi: Hanzi) {
    this.hanzi.set(hanzi);
    // 获取屏幕宽度，设置容器宽度
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.containerWidth.set(width * 0.7);
    this.containerHeight.set(height * 0.7);

    this.initWriter(hanzi.character);
    const idx = this.group()?.hanzi.findIndex(h => h.character === hanzi.character);
    if (idx !== undefined && idx !== -1) {
      this.idx.set(idx);
    }
  }

  animateCharacter() {
    this.writer?.animateCharacter();
  }

  nextCharacter() {
    if (this.nextId() === -1) {
      return;
    }
    this.showDetail(this.group()!.hanzi[this.nextId()]!);
  }
  prevCharacter() {
    if (this.prevId() === -1) {
      return;
    }
    this.showDetail(this.group()!.hanzi[this.prevId()]!);
  }
  redo() {
    if (!this.writer) {
      return;
    }
    this.writer.quiz();
  }

  async playAudio(hanzi: Hanzi | null) {
    if (!hanzi) {
      return;
    }
    this.audioService.stopAll();
    await this.audioService.preload(hanzi.character, `/assets/audios/characters/${hanzi.character}.mp3`);
    await this.audioService.play(hanzi.character);
  }


}
