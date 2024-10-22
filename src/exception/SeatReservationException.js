import InvalidPurchaseException from "./InvalidPurchaseException.js";

export default class SeatReservationException extends InvalidPurchaseException {
  constructor(error = "Seat Reservation Error", originaError = null) {
    super("Internal Server Error");
    this.error = error;
    this.message = originaError;
  }

  get name() {
    return this.constructor.name;
  }
}
