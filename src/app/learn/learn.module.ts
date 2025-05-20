import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { LearnRoutingModule } from 'src/app/learn/learn-routing.module';

import { LearnBoardComponent } from 'src/app/learn/learn-board/learn-board.component';
import { LearnGroupComponent } from 'src/app/learn/learn-group/learn-group.component';
import { LearnDetailComponent } from 'src/app/learn/learn-detail/learn-detail.component';

@NgModule({
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
  declarations: [
    LearnBoardComponent,
    LearnGroupComponent,
    LearnDetailComponent,
  ],
  imports: [
    CommonModule,
    LearnRoutingModule
  ]
})
export class LearnModule { }
