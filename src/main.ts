import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as os from 'os';
import * as pk from 'pkginfo';

// read package.json and add it to the module.exports
pk(module);

const serverProtocol = process.env.SERVER_PROTOCOL || 'http';
const httpInterface = process.env.SERVER_LISTEN_ON || '0.0.0.0';
const accessServer = process.env.URI_SERVER || os.hostname();
const port = process.env.SERVER_PORT || 3000;
const apiName = process.env.API_NAME || 'api';

// read from package.json
const name = module.exports.name;
const version = module.exports.version;
const description = module.exports.description;
const authorInfo = module.exports.author.split('|');
const licenseInfo = module.exports.license.split('|');

async function bootstrap() {
  // enable CORS
  const app = await NestFactory.create(AppModule, { cors: true });

  // hint: add openApi
  const config = new DocumentBuilder()
    .setTitle(`REST ${name} app!`)
    .setDescription(description)
    .setVersion(version)
    .setContact(authorInfo[0], authorInfo[1], authorInfo[2])
    .setLicense(`Licence ${licenseInfo[0]}`, licenseInfo[1])
    .setExternalDoc('Documentation', `/${apiName}-json`)
    // add a bearer Authorize button
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // wir starten den Server
  await app.listen(port, httpInterface);

  // wir verwenden aus dem nestjs Umfeld den zur Verfügung stehenden Logger
  Logger.debug(`Der Server ist jetzt erreichbar unter: ${serverProtocol}://${accessServer}:${port}`);
  Logger.debug(
    `Die Api Dokumentation in der Version ${version} ist erreichbar unter: ${serverProtocol}://${accessServer}:${port}/api`,
  );
}
bootstrap().then(() => Logger.log(`Server ist online!`));
