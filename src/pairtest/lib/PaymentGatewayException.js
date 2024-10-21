export default class PaymentGatewayException extends Error {
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
// PaymentGatewayException.prototype.name = 'Payment Gateway Error';