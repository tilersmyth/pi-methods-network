export class WifiError extends Error {
  constructor(name: string, message: string) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WifiError);
    }

    this.name = `[${name} error]`;
  }
}
