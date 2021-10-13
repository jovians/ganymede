/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import * as Express from 'express';
import * as BodyParser from 'body-parser';

export class IndexMetadataServer {

  port: number = 7220;
  apiRoot: Express.Application;

  async initialize() {
    try {
      this.apiRoot = Express();
      // support application/json type post data
      this.apiRoot.use(BodyParser.json());
      // support application/x-www-form-urlencoded post data
      this.apiRoot.use(BodyParser.urlencoded({ extended: false }));

      // process.on('SIGTERM', this.terminationHandler);
      // process.on('SIGINT', this.terminationHandler);
      // process.on('SIGKILL', this.terminationHandler);

      // this.mailer = new EmailHandler_SendGrid();
      // this.mailer.setApiKey(serverConst.sendgrid.key);

      // const connector = new DataStoreConnector_MongoDB();
      // const dataStore = await connector.open();

      // const auth = new BasicModules.Authentication();
      // auth.initialize(this.apiRoot, dataStore);

      console.log('Initialized...');
      this.apiRoot.listen(this.port);

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
