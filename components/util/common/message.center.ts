/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export class MessageCenter {
  static messages: string[] = [];
  static warnings: string[] = [];
  static errors: Error[] = [];
  static messagesChecker = null;
  static add(msg: string) { MessageCenter.messages.push(msg); }
  static addWarning(msg: string) { MessageCenter.warnings.push(msg); }
  static addError(e: Error) { MessageCenter.errors.push(e); }
}

MessageCenter.messagesChecker = setInterval(() => {
  while (MessageCenter.messages.length > 0) {
    const msg = MessageCenter.messages.shift();
    // tslint:disable-next-line: no-console
    console.log(msg);
  }
  while (MessageCenter.warnings.length > 0) {
    const msg = MessageCenter.warnings.shift();
    // tslint:disable-next-line: no-console
    console.warn(msg);
  }
  while (MessageCenter.errors.length > 0) {
    const e = MessageCenter.errors.shift();
    // tslint:disable-next-line: no-console
    console.error(e);
  }
}, 1000);
