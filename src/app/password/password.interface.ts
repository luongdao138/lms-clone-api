export interface PasswordHashingStrategy {
  hash(): string | Promise<string>;
  verify(plain: string, hash: string): boolean | Promise<boolean>;
  generateRandomPassword(): string | Promise<string>;
}
