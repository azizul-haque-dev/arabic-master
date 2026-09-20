import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: { check: vi.fn() } },
        { provide: MemoryHealthIndicator, useValue: { checkHeap: vi.fn(), checkRSS: vi.fn() } },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
