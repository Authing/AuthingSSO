import { AuthingSSOError } from './AuthingSSOError';

export class InvalidParamsError extends AuthingSSOError {
  constructor(message: string) {
    super(message);
  }
}
