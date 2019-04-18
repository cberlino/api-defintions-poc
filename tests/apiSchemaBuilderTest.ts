import { ApiSchemaBuilder } from '../src/apiSchemaBuilder';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('ApiSchemaBuilder', () => {
  it('should throw an error because no .yml file was found. ', async () => {
    const filePath = 'Files/DoesntExist.yml';
    expect(new ApiSchemaBuilder(filePath).execute()).to.be.rejectedWith('There were no api definition files found.');
  });

  it('should match the test schema', async () => {
    const generatedSchema = await new ApiSchemaBuilder('tests/testData/idls/**/*.yml').execute();
    const testGeneratedSchema = `import { HandlerResponse, validateSchema } from './apiHandlerHelpers';
import { Response as ExpressResponse, NextFunction } from 'express';

export namespace Schema {
  export namespace TestData {
    export namespace Idls {
      export namespace AgentTool {
        export namespace Quotes {
          export namespace QuoteId {
            export namespace Compensate {
              export namespace Simulate {
                export class Request {
                  static schema = {
                    type: 'object',
                    properties: {
                      credit_offer_id: { type: 'string' },
                      credit_offer_ids: { type: 'string' },
                      quoteId: { type: 'string' },
                    },
                    required: ['credit_offer_id', 'credit_offer_ids', 'quoteId'],
                    path: '/api/v1/agent-tool/quotes/:quoteId/compensate/simulate',
                    method: 'post',
                  };
                  /** credit_offer_id */
                  credit_offer_id: string = '';
                  /** credit_offer_ids */
                  credit_offer_ids: string = '';
                  /** quoteId */
                  quoteId: string = '';
                }

                export class Response {
                  static schema = {
                    type: 'object',
                    properties: {
                      transactionIds: {
                        description: 'Credit card checkout transaction Id numbers for each order',
                        type: 'array',
                        items: { type: 'number' },
                      },
                    },
                    required: ['transactionIds'],
                  };
                  /** Credit card checkout transaction Id numbers for each order */
                  transactionIds: number[] = [];
                }

                export function implement<T>(
                  handler: (
                    req: T & { data: Request },
                    res: ExpressResponse & HandlerResponse<Response>,
                    next: NextFunction
                  ) => void
                ): any[] {
                  return [
                    validateSchema(Request.schema),
                    async (req: T & { data: Request }, res: ExpressResponse & HandlerResponse<Response>, next: NextFunction) => {
                      try {
                        await handler(req, res, next);
                      } catch (e) {
                        next(e);
                      }
                    },
                  ];
                }
              }
            }
          }
        }
      }
      export namespace Banks {
        export namespace Routing {
          export namespace GetByRoutingNumber {
            export class Request {
              static schema = {
                type: 'object',
                properties: { routingNumber: { type: 'string' } },
                required: ['routingNumber'],
                path: '/api/v1/banks/routing/:routingNumber',
                method: 'get',
              };
              /** routingNumber */
              routingNumber: string = '';
            }

            export class Response {
              static schema = {
                type: 'object',
                properties: { id: { type: 'number' }, name: { type: 'string' }, routingNumber: { type: 'string' } },
                required: ['id', 'name', 'routingNumber'],
              };
              /** id */
              id: number = 0;
              /** name */
              name: string = '';
              /** routingNumber */
              routingNumber: string = '';
            }

            export function implement<T>(
              handler: (req: T & { data: Request }, res: ExpressResponse & HandlerResponse<Response>, next: NextFunction) => void
            ): any[] {
              return [
                validateSchema(Request.schema),
                async (req: T & { data: Request }, res: ExpressResponse & HandlerResponse<Response>, next: NextFunction) => {
                  try {
                    await handler(req, res, next);
                  } catch (e) {
                    next(e);
                  }
                },
              ];
            }
          }
        }
      }
      export namespace Stips {
        export namespace StipId {
          export namespace Notary {
            export class Request {
              static schema = {
                type: 'object',
                properties: {
                  stipId: { type: 'string' },
                  address: {
                    description: 'Notary address',
                    type: 'object',
                    properties: {
                      city: { description: 'city', type: 'string' },
                      country: { description: 'country', type: 'string', pattern: '^[A-Z]{2}$' },
                      county: { description: 'county', type: 'string' },
                      stateId: { description: 'stateId', type: 'number' },
                      street1: { description: 'street1', type: 'string' },
                      zip: { description: 'zip', type: 'string', pattern: '^\\\\d{5}$' },
                    },
                    required: ['city', 'country', 'county', 'stateId', 'street1', 'zip'],
                  },
                  appointmentAt: { description: 'appointment date', type: 'string' },
                  borrowerNotes: { description: 'borrowerNotes', type: 'string' },
                  notes: { description: 'notes', type: 'string' },
                },
                required: ['stipId', 'address', 'appointmentAt'],
                path: '/api/v1/stips/:stipId/notary',
                method: 'post',
              };
              /** stipId */
              stipId: string = '';
              /** Notary address */
              address: { city: string; country: string; county: string; stateId: number; street1: string; zip: string } = {
                city: '',
                country: '',
                county: '',
                stateId: 0,
                street1: '',
                zip: '',
              };
              /** appointment date */
              appointmentAt: string = '';
              /** borrowerNotes */
              borrowerNotes?: string;
              /** notes */
              notes?: string;
            }

            export class Response {
              static schema = {
                type: 'object',
                properties: {
                  appointmentAt: { description: 'appointment date', type: 'string' },
                  borrowerNotes: { description: 'borrowerNotes', type: 'string' },
                  notes: { description: 'notes', type: 'string' },
                },
                required: ['appointmentAt'],
              };
              /** appointment date */
              appointmentAt: string = '';
              /** borrowerNotes */
              borrowerNotes?: string;
              /** notes */
              notes?: string;
            }

            export function implement<T>(
              handler: (req: T & { data: Request }, res: ExpressResponse & HandlerResponse<Response>, next: NextFunction) => void
            ): any[] {
              return [
                validateSchema(Request.schema),
                async (req: T & { data: Request }, res: ExpressResponse & HandlerResponse<Response>, next: NextFunction) => {
                  try {
                    await handler(req, res, next);
                  } catch (e) {
                    next(e);
                  }
                },
              ];
            }
          }
        }
      }
    }
  }
}
`;

    expect(generatedSchema).to.equal(testGeneratedSchema);
  });
});
