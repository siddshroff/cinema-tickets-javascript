export default class SeatReservationException extends Error {
  constructor(error = "Payment Error", originaError = null) {
    super("Internal Server Error");
    this.error = error;
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
// SeatReservationException.prototype.name = "Payment Gateway Error";
