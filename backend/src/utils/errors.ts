export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  public constructor(message: string, code = "BAD_REQUEST", statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function assertCondition(condition: unknown, message: string, code = "BAD_REQUEST", statusCode = 400): asserts condition {
  if (!condition) {
    throw new AppError(message, code, statusCode);
  }
}

