import { describe, expect, it } from 'vitest';
import { ConflictError, ForbiddenError } from '../errors/app-error.js';
import {
  assertSameIdSet,
  resolveStatusChange,
} from './content-workflow.util.js';

describe('resolveStatusChange', () => {
  it('DRAFT → IN_REVIEW অনুমোদিত', () => {
    expect(
      resolveStatusChange({
        from: 'DRAFT',
        to: 'IN_REVIEW',
        role: 'CONTENT_MANAGER',
      }),
    ).toEqual({ status: 'IN_REVIEW', rejectionReason: null });
  });
  it('Admin যেকোনো status-এ রূপান্তর করতে পারে (যেমন DRAFT → PUBLISHED)', () => {
    expect(
      resolveStatusChange({
        from: 'DRAFT',
        to: 'PUBLISHED',
        role: 'ADMIN',
      }),
    ).toEqual({ status: 'PUBLISHED', rejectionReason: null });
  });
  it('Content Manager অনুমোদনহীন target-এ নিতে পারে না → 403', () => {
    expect(() =>
      resolveStatusChange({
        from: 'IN_REVIEW',
        to: 'APPROVED',
        role: 'CONTENT_MANAGER',
      }),
    ).toThrow(ForbiddenError);
  });
  it('Content Manager অবৈধ transition করতে পারে না → 409', () => {
    expect(() =>
      resolveStatusChange({
        from: 'DRAFT',
        to: 'PUBLISHED',
        role: 'CONTENT_MANAGER',
      }),
    ).toThrow(ConflictError);
  });
});

describe('assertSameIdSet', () => {
  it('ক্রম আলাদা হলেও একই সেট ঠিক আছে', () => {
    expect(() => assertSameIdSet(['a', 'b'], ['b', 'a'])).not.toThrow();
  });
  it('ID বাদ পড়লে error', () => {
    expect(() => assertSameIdSet(['a', 'b'], ['a'])).toThrow();
  });
});
