import * as argon2 from 'argon2';

const opts = { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 } as const;

export function createPasswordService() {
  let dummyHash: Promise<string> | undefined;

  return {
    hash: (password: string) => argon2.hash(password, opts),
    verify: (hash: string, password: string) => argon2.verify(hash, password),
    /** user না থাকলেও একই সময় লাগানোর জন্য (timing attack ঠেকায়) */
    async verifyDummy(password: string): Promise<false> {
      dummyHash ??= argon2.hash('dummy-password', opts);
      await argon2.verify(await dummyHash, password).catch(() => false);
      return false;
    },
  };
}
export type PasswordService = ReturnType<typeof createPasswordService>;
