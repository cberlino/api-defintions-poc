import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Schema } from './schema';
import { ResponseHandlerMiddleWare } from './apiHandlerHelpers';
import { iocContainer } from './inversify.config';

import simulateFunding from './handlers/agentTool/quotes/quoteId/compensate/simulate';
import { GetByRoutingNumber } from './handlers/banks/routing/getByRoutingNumber';

const app: any = express();

app.use(bodyParser.json({ type: 'application/json' }));
app.use(ResponseHandlerMiddleWare);

const GetByRoutingNumberHandler: GetByRoutingNumber = iocContainer.resolve(GetByRoutingNumber);

app[Schema.AgentTool.Quotes.QuoteId.Compensate.Simulate.Request.schema.method](
  Schema.AgentTool.Quotes.QuoteId.Compensate.Simulate.Request.schema.path,
  simulateFunding
);

app[Schema.Banks.Routing.GetByRoutingNumber.Request.schema.method](
  Schema.Banks.Routing.GetByRoutingNumber.Request.schema.path,
  GetByRoutingNumberHandler.execute
);

app.listen(1000, () => {
  console.log('Server started on port 1000');
});
