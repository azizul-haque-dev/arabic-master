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
  it('অবৈধ transition → 409', () => {
    expect(() =>
      resolveStatusChange({ from: 'DRAFT', to: 'PUBLISHED', role: 'ADMIN' }),
    ).toThrow(ConflictError);
  });
  it('Content Manager approve করতে পারে না → 403', () => {
    expect(() =>
      resolveStatusChange({
        from: 'IN_REVIEW',
        to: 'APPROVED',
        role: 'CONTENT_MANAGER',
      }),
    ).toThrow(ForbiddenError);
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
