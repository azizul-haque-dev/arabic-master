import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { HashOptions } from 'argon2';

@Injectable()
export class PasswordService {
  private readonly hashOptions: HashOptions = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  };

  async hash(password: string): Promise<string> {
    return argon2.hash(password, this.hashOptions);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  /**
   * Perform a dummy verification to prevent timing-based user enumeration.
   * Called when no account exists for the given email so that the response
   * time is indistinguishable from a real password check.
   */
  async verifyDummy(password: string): Promise<false> {
    // A static pre-computed argon2id hash of "dummy-password".
    const DUMMY_HASH =
      '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$RdescudvJCsgt3ub+b+dWRWJTmaasfNiu9ux0+2CSBM';
    await argon2.verify(DUMMY_HASH, password).catch(() => false);
    return false;
  }
}
