import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AppService {
  toggleSidenav: Subject<void> = new Subject();
  constructor() {

  }
}
