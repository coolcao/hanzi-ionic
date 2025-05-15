import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { DrawRoutingModule } from './draw-routing.module';
import { DrawBoardComponent } from './draw-board/draw-board.component';
import { DrawGroupComponent } from './draw-group/draw-group.component';


@NgModule({
  providers: [provideHttpClient(withInterceptorsFromDi())],
  declarations: [
    DrawBoardComponent,
    DrawGroupComponent
  ],
  imports: [
    CommonModule,
    DrawRoutingModule
  ]
})
export class DrawModule { }
