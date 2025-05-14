import { Component, inject, OnInit } from '@angular/core';
import { Store } from '../store/store';

@Component({
  selector: 'app-start',
  standalone: false,
  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent implements OnInit {

  store = inject(Store);

  ngOnInit(): void {
    this.store.setBack(null);
  }
}
