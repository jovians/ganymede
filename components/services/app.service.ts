import { Injectable } from '@angular/core';
import { GanymedeAppData } from '../ganymede.app.interface';

@Injectable({
  providedIn: 'root'
})
export class AppService extends GanymedeAppData {

  constructor() {
    super();
    Object.assign(this, (window as any).__ganymedeAppData);
  }
}
