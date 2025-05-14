import { Injectable, signal } from "@angular/core";

import { data } from '../hanzi.data';
import { BackConf, HanziGroup } from "../hanzi.types";

@Injectable({
  providedIn: 'root'
})
export class Store {
  private _groups = signal(data);
  private _back = signal<BackConf | null>(null);
  private _darkMode = signal(true);

  groups = this._groups.asReadonly();
  back = this._back.asReadonly();
  darkMode = this._darkMode.asReadonly();

  setGroup(group: HanziGroup[]) {
    this._groups.set(group);
  }
  setBack(back: BackConf | null) {
    this._back.set(back);
  }
  setDarkMode(darkMode: boolean) {
    this._darkMode.set(darkMode);
  }
}
