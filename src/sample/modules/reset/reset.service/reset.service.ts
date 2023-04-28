import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from '../../../base/base.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ResetService extends BaseService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super('reset.service');
  }
  async resetTable(corrId: number, tableName: string): Promise<string> {
    const method = `resetTable()!`;
    try {
      this.wl(corrId, method);
      // hint: Das ist wirklich ganz schlecht. Wir machen hier die Türe auf für SQL injection.....
      const queryDrop = `truncate table ${tableName};`;
      await this.dataSource.query(queryDrop);
      // hint: Das ist wirklich ganz schlecht. Wir machen hier die Türe auf für SQL injection.....
      this.wl(corrId, method, `truncate table ${tableName} done!`);
      const queryResetAutoincrement = `ALTER TABLE ${tableName} AUTO_INCREMENT = 0;`;
      await this.dataSource.query(queryResetAutoincrement);
      this.wl(corrId, method, `alter Autoincrement on table ${tableName} done!`);
      return `Reset table ${tableName} done!`;
    } catch (err: any) {
      const msg = `Table ${tableName} not found!`;
      throw new BadRequestException(msg);
    }
  }
}
