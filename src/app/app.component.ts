import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App, BackButtonListenerEvent } from '@capacitor/app';

import { AudioService } from 'src/app/service/audio.service';
import { data } from 'src/app/hanzi.data'; './hanzi.data'
import { Store } from './store/store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private audioService = inject(AudioService);

  back = this.store.back;

  title = '宝宝识汉字';
  showAbout = false;
  darkMode = this.store.darkMode;

  showExit = signal(false);

  constructor() {
    effect(() => {
      if (this.darkMode()) {
        document.body.classList.add('dark');
        if (this.getPlatform() === 'android' || this.getPlatform() === 'ios') {
          this.updateStatusBarColor(this.darkMode());
        }
      } else {
        document.body.classList.remove('dark');
        if (this.getPlatform() === 'android' || this.getPlatform() === 'ios') {
          this.updateStatusBarColor(this.darkMode());
        }
      }

      if (this.store.bodyOverflowHidden()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });
  }

  ngOnInit(): void {
    for (const g of data) {
      if (g.id === 'animal') {
        for (const c of g.hanzi) {
          console.log(c.character + '\n' + c.words.join(',') + '\n' + c.sentence);
          console.log('------------');


        }
      }
    }
    if (this.getPlatform() === 'android' || this.getPlatform() === 'ios') {
      this.initializeApp();
      this.setupBackEvent();
    }


  }

  toggleDarkMode() {
    this.store.setDarkMode(!this.darkMode());
    document.body.classList.toggle('dark');
  }

  goBack() {
    if (!this.back()) {
      return;
    }
    this.audioService.stopAll();
    this.router.navigateByUrl(this.back()!.path);
  }

  // 判断当前平台
  getPlatform() {
    // 使用 Capacitor 的 Platforms 来判断当前运行平台
    if (Capacitor.isNativePlatform()) {
      if (Capacitor.getPlatform() === 'android') {
        return 'android';
      } else if (Capacitor.getPlatform() === 'ios') {
        return 'ios';
      }
    }
    return 'web';

  }

  updateStatusBarColor(darkMode: boolean) {
    StatusBar.setBackgroundColor({
      color: darkMode ? '#2a363b' : '#ffffff'
    });
    StatusBar.setStyle({
      style: darkMode ? Style.Dark : Style.Light
    });
  }

  initializeApp() {
    StatusBar.setOverlaysWebView({ overlay: false }); // 关键设置
    // 初始化状态栏颜色
    this.updateStatusBarColor(this.darkMode());
  }

  exitGame() {
    if (Capacitor.getPlatform() === 'android') {
      (App as any).exitApp(); // 强制退出（Android）
    } else {
      App.minimizeApp(); // iOS 最小化
    }
    this.showExit.set(false);
  }

  private setupBackEvent() {
    App.addListener('backButton', async (event: BackButtonListenerEvent) => {
      this.showExit.set(true);
    });
  }

}
