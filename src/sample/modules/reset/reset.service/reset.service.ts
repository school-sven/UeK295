import { BaseService } from '../../../base/base.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ResetService extends BaseService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super('reset.service');
  }
  async resetTable(corrId: number, tableName: string): Promise<string> {
    const method = `resetTable()!`;
    this.wl(corrId, method);

    const tables = (await this.dataSource.query(`select *
                                                 from sqlite_master
                                                 where name = '${tableName}' `)) as [];
    if (!tables || tables.length === 0) {
      const msg = `Table ${tableName} not found!`;
      throw new NotFoundException(msg);
    }

    // this.wl(corrId, method, `truncate table ${tableName} done!`);
    const sqlDelete = 'delete from article where id is not null;';
    await this.dataSource.query(sqlDelete);
    const sqlVaccum = 'vacuum';
    await this.dataSource.query(sqlVaccum);

    this.wl(corrId, method, `alter Autoincrement on table ${tableName} done!`);
    const sqlResetSequence = "delete from sqlite_sequence where name='article'";
    await this.dataSource.query(sqlResetSequence);
    // // hint: Das ist wirklich ganz schlecht. Wir machen hier die Türe auf für SQL injection.....
    // const queryDrop = `delete from ${tableName};`;
    // await this.dataSource.query(queryDrop);
    // // hint: Das ist wirklich ganz schlecht. Wir machen hier die Türe auf für SQL injection.....
    // this.wl(corrId, method, `truncate table ${tableName} done!`);
    // const queryResetAutoincrement = `ALTER TABLE ${tableName} AUTO_INCREMENT = 0;`;
    // await this.dataSource.query(queryResetAutoincrement);
    return `Reset table ${tableName} done!`;
  }
}
