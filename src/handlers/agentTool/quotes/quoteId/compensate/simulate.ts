import { Schema } from '../../../../../schema';

export default Schema.AgentTool.Quotes.QuoteId.Compensate.Simulate.implement(async (request, response, next) => {
  const { credit_offer_ids } = request.data;

  return response.success({ transactionIds: [13] });
});
