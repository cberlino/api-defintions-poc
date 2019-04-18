import { ApiSchemaBuilder } from './apiSchemaBuilder';

(async () => {
  console.log(await new ApiSchemaBuilder('idls/**/*.yml').execute());
})();
