import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameBubbleComponent } from 'src/app/game/game-bubble/game-bubble.component';
import { GameRoutingModule } from 'src/app/game/game-routing.module';
import { GameBoardComponent } from 'src/app/game/game-board/game-board.component';
import { GameGroupComponent } from 'src/app/game/game-group/game-group.component';


@NgModule({
  declarations: [
    GameBubbleComponent,
    GameBoardComponent,
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
  ]
})
export class GameModule { }
