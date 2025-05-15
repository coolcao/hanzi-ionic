import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrawBoardComponent } from './draw-board/draw-board.component';
import { DrawGroupComponent } from './draw-group/draw-group.component';

const routes: Routes = [
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  { path: 'board', component: DrawBoardComponent },
  { path: 'group/:id', component: DrawGroupComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DrawRoutingModule { }
