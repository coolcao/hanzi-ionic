import { Component, effect, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

import { AudioService } from 'src/app/service/audio.service';
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

  constructor() {
    effect(() => {
      if (this.darkMode()) {
        document.body.classList.add('dark');
        this.updateStatusBarColor(this.darkMode());
      } else {
        this.updateStatusBarColor(this.darkMode());
        document.body.classList.remove('dark');
      }

      if (this.store.bodyOverflowHidden()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });
  }

  ngOnInit(): void {
    if (this.getPlatform() === 'web') {
      return;
    }
    this.initializeApp();
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

}
