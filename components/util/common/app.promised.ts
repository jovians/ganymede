import { promise } from 'ts-comply';
import { HttpClient } from '@angular/common/http';
import { GanymedeAppData } from '../../ganymede.app.interface';

export class AppPromised {
  static ready: Promise<GanymedeAppData> = promise(async (resolve) => { AppPromised.readyResolver = resolve; });
  static data: GanymedeAppData;
  static readyResolver: (value: GanymedeAppData) => any;
  static http: HttpClient;
}
