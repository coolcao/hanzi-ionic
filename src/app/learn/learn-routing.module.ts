import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LearnBoardComponent } from 'src/app/learn/learn-board/learn-board.component';
import { LearnGroupComponent } from 'src/app/learn/learn-group/learn-group.component';

const routes: Routes = [
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  { path: 'board', component: LearnBoardComponent },
  { path: 'group/:id', component: LearnGroupComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearnRoutingModule { }
