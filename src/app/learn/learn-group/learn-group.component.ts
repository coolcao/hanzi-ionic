import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '../../store/store';
import { Hanzi } from '../../hanzi.types';

@Component({
  selector: 'app-learn-group',
  standalone: false,
  templateUrl: './learn-group.component.html',
  styleUrl: './learn-group.component.css'
})
export class LearnGroupComponent implements OnInit {
  @ViewChild('writerContainer')
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);

  groups = this.store.groups;
  darkMode = this.store.darkMode;
  group = computed(() => {
    return this.groups().find(g => g.id === this.groupId());
  });
  color = computed(() => {
    return this.group()?.color || 'primary';
  });

  groupId = signal('');

  constructor() {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId.set(params['id']);
    });
    this.store.setBack({
      path: '/learn/board',
      name: 'Back'
    });

  }

  async showDetail(hanzi: Hanzi) {
    const idx = this.group()?.hanzi.findIndex(h => h.character === hanzi.character);
    if (idx !== undefined && idx !== -1) {
      this.router.navigate(['/', 'learn', 'group', this.groupId(), idx]);
    }
  }
}
