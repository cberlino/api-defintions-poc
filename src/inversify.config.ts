import { Container } from 'inversify';
import { Redis } from './caching/redis';
import { CachingInterface } from './caching/cachingInterface';

const TYPES = {
  Caching: Symbol.for('Caching'),
};

const iocContainer = new Container();

iocContainer.bind<CachingInterface>(TYPES.Caching).to(Redis);

export { TYPES, iocContainer };
