/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export interface CommandRegistration {
  namespace: string;
  command: string;
  commandLogic: (params?: any, namespace?: string, command?: string) => (Promise<any> | any);
}
export class CommandsRegistrar {
  static commands: {[commandKey: string]: CommandRegistration} = {};
  static getCommandKey(namespace: string, command: string) {
    return `${namespace ? namespace : ''}::${command}`;
  }
  static add(namespace: string, command: string,
             commandLogic: (cmgArgs?: any, namespace?: string, command?: string) => (Promise<any> | any)) {
    const commandKey = CommandsRegistrar.getCommandKey(namespace, command);
    CommandsRegistrar.commands[commandKey] = { namespace, command, commandLogic };
  }
  static remove(namespace: string, command: string) {
    const commandKey = CommandsRegistrar.getCommandKey(namespace, command);
    if (CommandsRegistrar.commands[commandKey]) {
      delete CommandsRegistrar.commands[commandKey];
    }
  }
  static run(namespace: string, command: string, params?: any) {
    const commandKey = CommandsRegistrar.getCommandKey(namespace, command);
    if (!CommandsRegistrar.commands[commandKey]) {
      throw new Error(`Cannot execute command; '${commandKey}' not found on commands registry.`);
    }
    CommandsRegistrar.commands[commandKey].commandLogic(params, namespace, command);
  }
}
