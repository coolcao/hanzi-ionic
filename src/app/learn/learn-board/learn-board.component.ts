import { Component, effect, inject, OnInit } from '@angular/core';
import { Store } from '../../store/store';

@Component({
  selector: 'app-learn-board',
  standalone: false,
  templateUrl: './learn-board.component.html',
  styleUrl: './learn-board.component.css'
})
export class LearnBoardComponent implements OnInit {
  store = inject(Store);

  groups = this.store.groups;

  constructor() { }

  ngOnInit(): void {
    this.store.setBack({
      path: '',
      name: '返回'
    });
  }

}
