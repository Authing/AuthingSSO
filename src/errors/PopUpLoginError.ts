import { AuthingSSOError } from './AuthingSSOError';

export class PopUpLoginError extends AuthingSSOError {
  constructor(message: string) {
    super(message);
  }
}