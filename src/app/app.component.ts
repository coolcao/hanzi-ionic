import { Component, effect, inject, signal } from '@angular/core';
import { Store } from './store/store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  store = inject(Store);
  router = inject(Router);

  back = this.store.back;

  title = '宝宝识汉字';
  showAbout = false;
  darkMode = this.store.darkMode;

  constructor() {
    effect(() => {
      if (this.darkMode()) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }

      if (this.store.bodyOverflowHidden()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });
  }

  toggleDarkMode() {
    this.store.setDarkMode(!this.darkMode());
    document.body.classList.toggle('dark');
  }

  goBack() {
    if (!this.back()) {
      return;
    }
    this.router.navigateByUrl(this.back()!.path);
  }


}
