import { Component, inject, OnInit } from '@angular/core';
import { Store } from '../../store/store';

@Component({
  selector: 'app-draw-board',
  standalone: false,
  templateUrl: './draw-board.component.html',
  styleUrl: './draw-board.component.css'
})
export class DrawBoardComponent implements OnInit {
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
