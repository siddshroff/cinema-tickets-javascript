import InvalidPurchaseException from "./InvalidPurchaseException.js";

export default class PaymentGatewayException extends InvalidPurchaseException {
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