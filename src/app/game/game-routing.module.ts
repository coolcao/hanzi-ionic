import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameBoardComponent } from 'src/app/game/game-board/game-board.component';
import { GameBubbleComponent } from 'src/app/game/game-bubble/game-bubble.component';
import { GameGroupComponent } from 'src/app/game/game-group/game-group.component';

const routes: Routes = [
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  { path: 'board', component: GameBoardComponent },
  { path: 'group/:id', component: GameGroupComponent },
  { path: 'bubble/:groupId', component: GameBubbleComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
