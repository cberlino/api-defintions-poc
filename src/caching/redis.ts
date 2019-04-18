import { CachingInterface } from './cachingInterface';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class Redis implements CachingInterface {
  async fetch(key: string): Promise<{ [key: string]: any }> {
    return Promise.resolve({ id: 1, name: 'Bank of America', routingNumber: 12341251234 });
  }
}
