import * as Sendgrid from '@sendgrid/mail';

export enum EmailServiceProvider {
  SendGrid = 'SendGrid',
}

export interface EmailData {
  to: string;
  from: string;
  subject?: string;
  text?: string;
  html?: string;
  cb?: any;
}

export interface EmailHandler {
  getType: () => EmailServiceProvider;
  setApiKey: (key:any) => void; 
  send: (data:EmailData) => Promise<boolean>;
  handleInbox: () => void;
}

export class EmailHandler_SendGrid implements EmailHandler {
  private apiKeySet = false;
  setApiKey(key) {
    Sendgrid.setApiKey(key);
    this.apiKeySet = true;
  } 
  getType() { return EmailServiceProvider.SendGrid; }
  send(data: EmailData) {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.apiKeySet) {
        return reject(new Error('SenfGrid API key has not been set'));
      }
      data.cb = (e, result) => {
        if(e) { return reject(e); }
        return resolve(true);
      };
      Sendgrid.send(data);
    });
  }
  handleInbox(){}
}