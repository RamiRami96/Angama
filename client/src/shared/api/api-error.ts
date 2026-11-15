export type ApiFieldError = { path: string; message: string };

/** Thrown for any non-2xx response, so callers can branch on `status`. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }

  static is(err: unknown, status?: number): err is ApiError {
    return err instanceof ApiError && (status === undefined || err.status === status);
  }
}
