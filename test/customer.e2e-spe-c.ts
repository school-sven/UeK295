import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { CustomerReturnDto } from '../src/customer/dto/customer-return-dto';
import { CustomerCreateDto } from '../src/customer/dto/customer-create.dto';
import { TestHttpClient } from './testing-tools/test-http-client';

describe('Customer (e2e)', () => {
  const tableName = 'customer';
  let app: INestApplication;
  let httpClient: TestHttpClient;
  // temp values
  let status = 0;
  let answer: unknown;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    // create nest app
    app = moduleFixture.createNestApplication();
    // init app
    await app.init();
    // init httpClient
    httpClient = new TestHttpClient(app, tableName);
    // prepare tokens
    await httpClient.createTokens();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  it(`${tableName}/ check all`, async () => {
    //get all empty array
    await httpClient.execGetArray(200, 0);

    // get one with not existing id -1
    status = 404;
    answer = {
      statusCode: status,
      message: `We did not found a ${httpClient.tableName} item with id -1!`,
      error: 'Not Found',
    };
    await httpClient.exeGetOne(status, -1, answer);

    // post new empty object
    status = 400;
    answer = {
      statusCode: status,
      message: 'The required field address is missing in the object!',
      error: 'Bad Request',
    };
    await httpClient.exePost(httpClient.userToken, status, {}).expect(answer);
    await httpClient.exePost(httpClient.adminToken, status, {}).expect(answer);

    // post new missing description
    status = 400;
    answer = {
      statusCode: status,
      message: 'The required field address is missing in the object!',
      error: 'Bad Request',
    };
    await httpClient.exePost(httpClient.userToken, status, { id: 1 }).expect(answer);
    await httpClient.exePost(httpClient.adminToken, status, { id: 1 }).expect(answer);

    // post new missing title
    status = 400;
    answer = {
      statusCode: status,
      message: 'The required field address is missing in the object!',
      error: 'Bad Request',
    };
    await httpClient.exePost(httpClient.userToken, status, { id: 1, description: 'test description' }).expect(answer);
    await httpClient.exePost(httpClient.adminToken, status, { id: 1, description: 'test description' }).expect(answer);

    // post new valid
    const customerReturnDto: CustomerReturnDto = {
      address: 'address 1',
      city: 'city 1',
      name: 'name 1',
      zipCode: 1,
      id: 1,
    };
    const customerCreateDto1: CustomerCreateDto = {
      address: customerReturnDto.address,
      city: customerReturnDto.city,
      name: customerReturnDto.name,
      zipCode: customerReturnDto.zipCode,
    };
    status = 201;
    await httpClient.exePost(httpClient.userToken, status, customerCreateDto1).expect((res) => {
      const body: CustomerReturnDto = res.body;
      expect(body.id).toBe(1);
      expect(body.name).toBe(customerReturnDto.name);
      expect(body.address).toBe(customerReturnDto.address);
      expect(body.city).toBe(customerReturnDto.city);
      expect(body.zipCode).toBe(customerReturnDto.zipCode);
    });

    const name2 = customerReturnDto.name + ' 2';
    const customerCreateDto2: CustomerCreateDto = { ...customerCreateDto1, name: name2 };
    await httpClient.exePost(httpClient.userToken, status, customerCreateDto2).expect((res) => {
      const body: CustomerReturnDto = res.body;
      expect(body.id).toBe(2);
      expect(body.name).toBe(name2);
      expect(body.address).toBe(customerReturnDto.address);
      expect(body.city).toBe(customerReturnDto.city);
      expect(body.zipCode).toBe(customerReturnDto.zipCode);
    });

    //get all array 2
    await httpClient.execGetArray(200, 2);

    // put valid (id 1)
    status = 200;
    httpClient
      .execPut(httpClient.userToken, status, 1, { ...customerReturnDto, name: 'updated name' })
      .expect((res) => {
        const body: CustomerReturnDto = res.body;
        expect(body.id).toBe(1);
        expect(body.name).toBe(customerReturnDto.name);
        expect(body.address).toBe(customerReturnDto.address);
        expect(body.city).toBe(customerReturnDto.city);
        expect(body.zipCode).toBe(customerReturnDto.zipCode);
      });

    // put invalid ids (2)
    status = 400;
    answer = {
      statusCode: status,
      message:
        'You try to replace the id 1 with an object who has the id 2 this is now allowed as otherwise we can have multiple times the same id!',
      error: 'Bad Request',
    };
    httpClient.execPut(httpClient.userToken, status, 1, { ...customerReturnDto, id: 2 }).expect(answer);

    // put wrong id -1
    status = 400;
    answer = {
      statusCode: status,
      message:
        'You try to replace the id -1 with an object who has the id 1 this is now allowed as otherwise we can have multiple times the same id!',
      error: 'Bad Request',
    };
    httpClient.execPut(httpClient.userToken, status, -1, customerReturnDto).expect(answer);

    // put missing description
    status = 400;
    answer = {
      statusCode: status,
      message: 'The required field address is missing in the object!',
      error: 'Bad Request',
    };
    httpClient.execPut(httpClient.userToken, status, -1, { id: 1 }).expect(answer);

    // put missing title
    status = 400;
    answer = {
      statusCode: status,
      message: 'The required field title is missing in the object!',
      error: 'Bad Request',
    };
    httpClient.execPut(httpClient.userToken, status, -1, { id: 1, description: 'dummy' }).expect(answer);

    // Put valid  with name and more fields (id  1)
    status = 200;
    const name3 = 'new sample name';
    httpClient
      .execPut(httpClient.userToken, status, 1, {
        ...customerReturnDto,
        name: name3,
        additionalInformation: { info: 'some information', info2: 4 },
      })
      .expect((res) => {
        const body: CustomerReturnDto = res.body;
        expect(body.id).toBe(1);
        expect(body.name).toBe(name3);
        expect(body.address).toBe(customerReturnDto.address);
        expect(body.city).toBe(customerReturnDto.city);
        expect(body.zipCode).toBe(customerReturnDto.zipCode);
      });

    // Patch valid city (id 1)
    status = 200;
    const city = 'new city';
    await httpClient
      .execPatch(httpClient.userToken, status, 1, {
        city: city,
      })
      .expect((res) => {
        const body: CustomerReturnDto = res.body;
        expect(body.id).toBe(1);
        expect(body.name).toBe(customerReturnDto.name);
        expect(body.city).toBe(city);
        expect(body.address).toBe(customerReturnDto.address);
        expect(body.zipCode).toBe(customerReturnDto.zipCode);
      });

    // Patch valid address (id 1)
    status = 200;
    const address = 'new address';
    await httpClient
      .execPatch(httpClient.userToken, status, 1, {
        address,
      })
      .expect((res) => {
        const body: CustomerReturnDto = res.body;
        expect(body.id).toBe(1);
        expect(body.name).toBe(customerReturnDto.name);
        expect(body.city).toBe(city);
        expect(body.address).toBe(address);
        expect(body.zipCode).toBe(customerReturnDto.zipCode);
      });

    // Patch valid address (id 1)
    status = 200;
    const zipCode = 2;
    await httpClient
      .execPatch(httpClient.userToken, status, 1, {
        zipCode,
      })
      .expect((res) => {
        const body: CustomerReturnDto = res.body;
        expect(body.id).toBe(1);
        expect(body.name).toBe(customerReturnDto.name);
        expect(body.city).toBe(city);
        expect(body.address).toBe(address);
        expect(body.zipCode).toBe(zipCode);
      });

    // delete not allowed
    status = 405;
    answer = {
      statusCode: status,
      message: 'You have to be member of the role admin to call this method!',
      error: 'Method Not Allowed',
    };
    await httpClient.execDel(httpClient.userToken, status, -1).expect(answer);

    // delete not existing (id-1)
    status = 404;
    answer = {
      statusCode: status,
      message: 'We did not found a customer item with id -1!',
      error: 'Not Found',
    };
    await httpClient.execDel(httpClient.adminToken, status, -1).expect(answer);

    // Delete existing (id 1)
    status = 200;
    await httpClient.execDel(httpClient.adminToken, status, 1).expect((res) => {
      const body: CustomerReturnDto = res.body;
      expect(body.id).toBe(1);
      expect(body.name).toBe(customerReturnDto.name);
      expect(body.address).toBe(address);
      expect(body.city).toBe(city);
      expect(body.zipCode).toBe(zipCode);
    });

    // get alle, should have 1 element
    await httpClient.execGetArray(200, 1);

    // Delete existing (id 2)
    status = 200;
    await httpClient.execDel(httpClient.adminToken, status, 2).expect((res) => {
      const body: CustomerReturnDto = res.body;
      expect(body.id).toBe(2);
      expect(body.name).toBe(customerCreateDto2.name);
      expect(body.address).toBe(customerCreateDto2.address);
      expect(body.city).toBe(customerCreateDto2.city);
      expect(body.zipCode).toBe(customerCreateDto2.zipCode);
    });

    // Get all (empty Array)
    await httpClient.execGetArray(200, 0);
  });
});
