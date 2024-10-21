export default class InvalidPurchaseException extends Error {
  constructor(error = "Invalid Purchase Error", originaError = null) {
    super("Internal Server Error");
    this.error = error;
    this.message = originaError;
  }

  toJSON() {
    return {
      message: this.message,
      error: this.error,
    };
  }
  get name() {
    return this.constructor.name;
  }
}