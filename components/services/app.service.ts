import { Injectable } from '@angular/core';
import { GanymedeAppData } from '../ganymede.app.interface';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class AppService extends GanymedeAppData {

  constructor() {
    super();
    Object.assign(this, window.ganymedeAppData);
  }
}
