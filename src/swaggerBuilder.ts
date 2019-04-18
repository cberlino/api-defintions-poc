import { readFileSync } from 'fs';
import * as FastGlob from 'fast-glob';

const yaml = require('js-yaml');
const swaggerParser = require('swagger-parser');

export class SwaggerBuilder {
  private swaggerSchema: object = {
    swagger: '2.0',
    info: {
      title: 'Oportun Auto API',
      description: 'The API used for interacting with Oportun Auto.',
      version: '4.0.0',
    },
    host: 'api-sandbox.platform.springboardauto.com',
    consumes: ['application/json'],
    produces: ['application/json'],
    basePath: '/api/v1',
    schemes: ['https'],
    paths: {},
  };

  private readonly definitionFilePath: string;

  public constructor(definitionFilePath: string) {
    this.definitionFilePath = definitionFilePath;
  }

  public async execute(): Promise<string> {
    const definitionFiles = await FastGlob.async(this.definitionFilePath);

    if (!definitionFiles.length) {
      throw new Error(`There were no api definition files found.`);
    }

    this.swaggerSchema = definitionFiles.sort().reduce((schema: any, definitionFile: any) => {
      const tags = definitionFile.split('/');
      const definition = yaml.safeLoad(readFileSync(definitionFile, 'utf-8'));
      const paths = definition.path;
      const method = definition.method;

      delete definition.path;
      delete definition.method;

      tags.shift();
      tags.pop();

      schema.paths[paths] = {
        [method]: Object.assign({ summary: definition.description, tags: [tags.join('/')] }, definition),
      };

      return schema;
    }, this.swaggerSchema);

    return yaml.safeDump(await swaggerParser.validate(this.swaggerSchema));
  }
}
