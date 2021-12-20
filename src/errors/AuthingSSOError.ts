export abstract class AuthingSSOError extends Error {
  protected data: any;
  protected constructor(message: string, data?: any) {
    super(message);
    this.data = data;
  }
}
