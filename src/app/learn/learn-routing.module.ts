import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LearnBoardComponent } from 'src/app/learn/learn-board/learn-board.component';
import { LearnDetailComponent } from 'src/app/learn/learn-detail/learn-detail.component';
import { LearnGroupComponent } from 'src/app/learn/learn-group/learn-group.component';

const routes: Routes = [
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  { path: 'board', component: LearnBoardComponent },
  { path: 'group/:id', component: LearnGroupComponent },
  { path: 'group/:id/:idx', component: LearnDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearnRoutingModule { }
