import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { StartComponent } from 'src/app/start/start.component';

const routes: Routes = [
  { path: '', redirectTo: 'start', pathMatch: 'full' },
  { path: 'start', component: StartComponent },
  { path: 'learn', loadChildren: () => import('./learn/learn.module').then(m => m.LearnModule) },
  { path: 'draw', loadChildren: () => import('./draw/draw.module').then(m => m.DrawModule) },
  { path: 'game', loadChildren: () => import('./game/game.module').then(m => m.GameModule) },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
