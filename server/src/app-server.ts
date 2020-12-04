import * as Express from 'express';
import * as BodyParser from "body-parser";
import { serverConst } from './const';

import { BasicModules } from './basic.modules';

import { DataStoreConnector_MongoDB } from './data.connection';
import { EmailHandler, EmailHandler_SendGrid } from './email.handler';

export class AppServer {
  
  public apiRoot: Express.Application;
  public mailer: EmailHandler;

  async initialize(){
    try {
      this.apiRoot = Express();
      // support application/json type post data
      this.apiRoot.use(BodyParser.json());
      //support application/x-www-form-urlencoded post data
      this.apiRoot.use(BodyParser.urlencoded({ extended: false }));

      // process.on('SIGTERM', this.terminationHandler);
      // process.on('SIGINT', this.terminationHandler);
      // process.on('SIGKILL', this.terminationHandler);

      this.mailer = new EmailHandler_SendGrid();
      this.mailer.setApiKey(serverConst.sendgrid.key);

      const connector = new DataStoreConnector_MongoDB();
      const dataStore = await connector.open();

      const auth = new BasicModules.Authentication();
      auth.initialize(this.apiRoot, dataStore);

      console.log('Initialized...');
      this.apiRoot.listen(3000);

    } catch(e) { console.log(e); }
  }
  
  main(){
    try {
      this.initialize();
    } catch(e) {
      console.log(e);
    }
  }

  terminationHandler(e) {
    console.log(e, 'test');
    if (e && e.preventDefault) { e.preventDefault(); }
  }

}
