/**
 * A standardized error class for business logic exceptions in the Service Layer.
 * Differentiates expected domain errors (e.g., "Out of stock") from unexpected runtime crashes.
 */
export class ServiceError extends Error {
  public readonly code: string;

  constructor(message: string, code = "BAD_REQUEST") {
    super(message);
    this.name = "ServiceError";
    this.code = code;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }
  }
}
