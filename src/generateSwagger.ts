import { SwaggerBuilder } from './swaggerBuilder';

(async () => console.log(await new SwaggerBuilder('idls/**/*.yml').execute()))();
