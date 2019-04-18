import { Schema } from '../../../schema';
import { TYPES } from '../../../inversify.config';
import { CachingInterface } from '../../../caching/cachingInterface';
import GetByRoutingNumberHandler = Schema.Banks.Routing.GetByRoutingNumber;

import { injectable, inject } from 'inversify';
import 'reflect-metadata';

@injectable()
export class GetByRoutingNumber {
  private cache: CachingInterface;

  constructor(@inject(TYPES.Caching) cache: CachingInterface) {
    this.cache = cache;
  }

  public execute = GetByRoutingNumberHandler.implement(async (request, response, next) => {
    const { routingNumber } = request.data;

    const { id, name, routingNumber: bankRoutingNumber } = await this.cache.fetch(routingNumber);

    return response.success({ id, name, routingNumber: bankRoutingNumber });
  });
}
