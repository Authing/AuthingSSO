import { AuthingSSOError } from './AuthingSSOError';

export class AuthenticationError extends AuthingSSOError {
  constructor(message: string) {
    super(message);
  }
}