import { Test, TestingModule } from '@nestjs/testing';
import { ResetService } from './reset.service';
import { MockType } from '../../../mocktypes/mocktype';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export const dataSourceMockFactory: () => MockType<DataSource> = jest.fn(() => ({
  query: jest.fn((entity) => entity),
}));

describe('root.service', () => {
  let service: ResetService;
  let dataSourceMock: MockType<DataSource>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetService,
        {
          provide: getDataSourceToken(),
          useFactory: dataSourceMockFactory,
        },
      ],
    }).compile();
    service = module.get<ResetService>(ResetService);
    dataSourceMock = module.get(getDataSourceToken());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Reset Table not found', async () => {
    try {
      dataSourceMock.query.mockImplementation(() => {
        throw new NotFoundException();
      });
      await service.resetTable(0, 'test');
    } catch (err: any) {
      expect(err instanceof BadRequestException).toEqual(true);
      expect(err.message).toEqual('Table test not found!');
    }
  });
  it('Reset Table found', async () => {
    dataSourceMock.query.mockReturnValue(null);
    expect(await service.resetTable(0, 'test')).toEqual('Reset table test done!');
  });
});
