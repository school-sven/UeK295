import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestLogger } from './logger.tools';
import { AuthService } from '../../src/sample/modules/auth/auth.service/auth.service';
import { loginDtoAdmin, loginDtoUser } from '../security.e2e-spec';
import { ResetService } from '../../src/sample/modules/reset/reset.service/reset.service';

export class TestHttpClient {
  private readonly httpServer;
  private resetService: ResetService;
  private authService: AuthService;

  userToken = '';
  adminToken = '';

  constructor(private readonly app: INestApplication, public readonly tableName: string) {
    // add the HttpServer
    this.httpServer = app.getHttpServer();
    // add a testLogger
    app.useLogger(new TestLogger());
    // get the services
    this.resetService = app.get(ResetService);
    this.authService = app.get(AuthService);
  }

  async createTokenAndResetTable() {
    // get the tokens
    this.userToken = (await this.authService.login(-1, loginDtoUser)).token;
    this.adminToken = (await this.authService.login(-1, loginDtoAdmin)).token;
    // reset table
    await this.resetTable();
  }

  async resetTable() {
    // reset table
    await this.resetService.resetTable(-1, this.tableName);
  }

  get(token: string) {
    return request(this.httpServer)
      .get('/' + this.tableName + '/')
      .set('Authorization', `Bearer ${token}`);
  }
  getOne(token: string, id: number) {
    return request(this.httpServer)
      .get('/' + this.tableName + '/' + id)
      .set('Authorization', `Bearer ${token}`);
  }
  post(token: string, data: object) {
    return request(this.httpServer)
      .post('/' + this.tableName + '/')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }
  put(token: string, id: number, data: object) {
    return request(this.httpServer)
      .put('/' + this.tableName + '/' + id)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }
  patch(token: string, id: number, data: object) {
    return request(this.httpServer)
      .patch('/' + this.tableName + '/' + id)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }
  del(token: string, id: number) {
    return request(this.httpServer)
      .delete('/' + this.tableName + '/' + id)
      .set('Authorization', `Bearer ${token}`);
  }

  async execGetArray(status: number, arrLength: number) {
    await this.get(this.userToken)
      .expect(status)
      .expect((res) => {
        expect(res.body.length).toBe(arrLength);
      });
    await this.get(this.adminToken)
      .expect(status)
      .expect((res) => {
        expect(res.body.length).toBe(arrLength);
      });
  }

  async exeGetOne(status: number, id: number, answer: unknown) {
    await this.getOne(this.userToken, id).expect(status).expect(answer);
    await this.getOne(this.adminToken, id).expect(status).expect(answer);
  }

  exePost(token: string, status: number, body: object) {
    return this.post(token, body).expect(status);
  }

  execPut(token: string, status: number, id: number, body: object) {
    return this.put(token, id, body).expect(status);
  }

  execPatch(token: string, status: number, id: number, body: object) {
    return this.patch(token, id, body).expect(status);
  }

  execDel(token: string, status: number, id: number) {
    return this.del(token, id).expect(status);
  }
}
