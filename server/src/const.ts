export class ServerConst {
  static initialized = false;
  static data: any = {};
  static setData(data) { ServerConst.data = data; ServerConst.initialized = true; }
}
