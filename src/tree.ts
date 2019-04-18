import * as fs from 'fs';
const yaml = require('js-yaml');

export class Tree {
  public children: { [key: string]: Tree } = {};
  public filepath: string = '';
  private readonly name: string;
  private currentEvalPropName: string = '';

  constructor(name: string) {
    this.name = this.upperCaseFirstLetters(name);
  }

  public render(prefix: string = ''): string {
    let newPrefix = '';

    if (this.name !== 'Schema') {
      newPrefix = `${prefix}${prefix ? '/' : ''}${this.lowercaseFirst(this.name.split('.')[0])}`;
    }

    if (this.name.endsWith('.yml')) {
      const name = this.name.split('.')[0];
      const endPointDefinition = yaml.safeLoad(fs.readFileSync(this.filepath, 'utf-8'));

      if (!endPointDefinition) {
        throw `${this.filepath} failed to load`;
      }

      let parameters: object = {
        type: 'object',
        properties: {},
        required: [],
        path: `/api/v1` + endPointDefinition.path.replace(/{/g, ':').replace(/}/g, ''),
        method: endPointDefinition.method,
      };

      parameters = endPointDefinition.parameters.reduce((result: any, item: any) => {
        if (item.in === 'body') {
          if (item.schema.properties) {
            result.properties = {
              ...result.properties,
              ...item.schema.properties,
            };
          }
          if (item.schema.required) {
            result.required = [...result.required, ...item.schema.required];
          }
        }

        if (item.in === 'query' || item.in === 'path') {
          const parameterName = item.name;

          if (item.hasOwnProperty('required') && item.required) {
            result.required = [...result.required, parameterName];
          }

          delete item.in;
          delete item.name;
          delete item.required;

          result.properties = {
            ...result.properties,
            ...{ [`${parameterName}`]: item },
          };
        }

        return result;
      }, parameters);

      try {
        return `export namespace ${name} {
          ${this.makeProperties('Request', parameters)}
          ${this.makeProperties('Response', endPointDefinition.responses['200'].schema)}
                    
          export function implement<T>(handler: (req: T & { data: Request }, res: ExpressResponse & HandlerResponse<Response>, next: NextFunction) => void ):any[] {
            return [validateSchema(Request.schema), 
            async (req: T & { data: Request }, res: ExpressResponse & HandlerResponse<Response>, next: NextFunction) => {
              try {
                await handler(req, res, next)
              } catch(e) {
                next(e)
              }
            }];
          }
          }`;
      } catch (e) {
        throw new Error(`${this.filepath} - ${e}`);
      }
    }

    const output = Object.keys(this.children).reduce((previousValue: string, child: string): string => {
      return (previousValue += this.children[child].render(newPrefix));
    }, '');

    return `export namespace ${this.name} {${output}}`;
  }

  public upperCaseFirstLetters(string: string) {
    return string
      .replace(/-/g, ' ')
      .replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substr(1))
      .replace(/\s/g, '');
  }

  public lowercaseFirst(str: string) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toLowerCase() + txt.substr(1);
    });
  }

  public makeProperties(name: string, schema: any = {}) {
    let properties = '';
    const requiredFields = schema.required
      ? schema.required.reduce((result: any, field: string) => {
          result[field] = true;
          return result;
        }, {})
      : {};

    if (schema.type) {
      if (schema.type !== 'object') {
        throw `${name}: Schema bodies are always objects, currently is ${schema.type}`;
      }

      if (schema.properties) {
        properties = Object.keys(schema.properties)
          .map((property: string) => {
            const thisProperty = schema.properties[property];
            const description = thisProperty.description || property;
            const isRequired = thisProperty.required === true || requiredFields[property];
            const optional = isRequired ? '' : '?';

            this.currentEvalPropName = property;
            return `/** ${description} */
            ${property}${optional}: ${this.mapPropertyTypes(thisProperty.type, thisProperty)} ${
              !optional ? `= ${this.defaultPropertyValue(thisProperty.type, thisProperty)}` : ''
            }`;
          })
          .join('\n');
      }
    }

    return `
      export class ${name} {
        static schema = ${JSON.stringify(schema)}
        ${properties}
      }
    `;
  }

  public mapPropertyTypes(propertyType: string | null, property: any): string {
    if ('oneOf' in property) {
      return property.oneOf.reduce((result: string, elem: any) => {
        if (result) {
          return result + '|' + elem.type;
        } else {
          return elem.type;
        }
      }, '');
    }

    switch (propertyType) {
      case 'string':
        return 'string';
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return `${this.mapPropertyTypes(property.items.type, property.items)}[]`;
      case 'object':
        if (property.additionalProperties) {
          return `{ [key: string]: ${this.mapPropertyTypes(
            property.additionalProperties.type,
            property.additionalProperties
          )} }`;
        }

        const requiredFields = property.required
          ? property.required.reduce((result: any, field: string) => {
              result[field] = true;
              return result;
            }, {})
          : {};

        if (!property.properties) {
          return '{}';
        }

        return `{${Object.keys(property.properties)
          .map((propertyKey) => {
            this.currentEvalPropName = propertyKey;
            return `${propertyKey}${requiredFields[propertyKey] ? '' : '?'}: ${this.mapPropertyTypes(
              property.properties[propertyKey].type,
              property.properties[propertyKey]
            )},`;
          })
          .join('')}}`;
      default:
        throw propertyType
          ? `${propertyType} UNIMPLEMENTED in ${this.currentEvalPropName}`
          : `Type missing in ${this.currentEvalPropName}`;
    }
  }

  public defaultPropertyValue(propertyType: string, property: any): any {
    if ('oneOf' in property) {
      return this.defaultPropertyValue(property.oneOf[0].type, {});
    }

    switch (propertyType) {
      case 'string':
        return `""`;
      case 'number':
        return `0`;
      case 'integer':
        return `0`;
      case 'boolean':
        return `false`;
      case 'array':
        return `[]`;
      case 'object':
        property.required
          ? property.required.reduce((result: any, field: string) => {
              result[field] = true;
              return result;
            }, {})
          : {};

        if (!property.properties) {
          return `{}`;
        }
        return `{${Object.keys(property.properties)
          .map(
            (propertyKey) =>
              `${propertyKey}: ${this.defaultPropertyValue(
                property.properties[propertyKey].type,
                property.properties[propertyKey]
              )},`
          )
          .join('')}}`;
    }
  }
}
