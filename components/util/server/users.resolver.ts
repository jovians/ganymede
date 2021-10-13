/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Destor } from './destor';

export class UsersResolver {

  async resolve(publicKey: string) {
    return await Destor.get({
      path: '/user-resolve', data: { publicKey }
    }) as string;
  }

}

export const users = new UsersResolver();
