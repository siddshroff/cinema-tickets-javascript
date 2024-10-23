import Sinon from "sinon";
import { assert, expect } from "chai";
import TicketService from "../../src/pairtest/TicketService.js";
import TicketTypeRequest from "../../src/pairtest/lib/TicketTypeRequest.js";
import TicketPaymentService from "../../src/thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService
  from "../../src/thirdparty/seatbooking/SeatReservationService.js";
import { failedBusinessEventsCounter, failedEventsCounter } from "../../src/pairtest/lib/promClient.js";
import InvalidPurchaseException from "../../src/exception/InvalidPurchaseException.js";
import PaymentGatewayException from "../../src/exception/PaymentGatewayException.js";
import SeatReservationException from "../../src/exception/SeatReservationException.js";

describe("Ticket Service Testing", async () => {
  Sinon.stub(failedBusinessEventsCounter, "inc").returns(true);
  Sinon.stub(failedEventsCounter, "inc").returns(true);
  beforeEach(() => {
    Sinon.restore();
  });
  it("Invalid payload of tickets with wrong type", () => {
    assert.throws(() => {
      [new TicketTypeRequest('TEEN', 8), new TicketTypeRequest('CHILD', 8), new TicketTypeRequest('CHILD', 8)];
    }, TypeError);
  });
  it("Invalid payload of tickets with NaN tickets", () => {
    assert.throws(() => {
      [new TicketTypeRequest('ADULT', '8'), new TicketTypeRequest('CHILD', 8), new TicketTypeRequest('CHILD', 8)];
    }, TypeError);
  });
  it("Invalid payload of tickets exceeding maximum number of tickets", () => {
    const objTicket = new TicketService;
    assert.throws(() => {
      objTicket.purchaseTickets(1, new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('CHILD', 8), new TicketTypeRequest('CHILD', 8));
    }, InvalidPurchaseException);
  });
  it("Invalid payload of tickets for undefined account ID", () => {
    const objTicket = new TicketService;
    assert.throws(() => {
      objTicket.purchaseTickets(undefined, new TicketTypeRequest('ADULT', 8));
    }, InvalidPurchaseException);
  });
  it("Invalid payload of tickets for no adult ticket present", () => {
    const objTicket = new TicketService;
    assert.throws(() => {
      objTicket.purchaseTickets(1, new TicketTypeRequest('INFANT', 8), new TicketTypeRequest('CHILD', 8));
    }, InvalidPurchaseException);
  });
  it("Invalid payload of tickets for less adult ticket than infant present", () => {
    const objTicket = new TicketService;
    assert.throws(() => {
      objTicket.purchaseTickets(1, new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('INFANT', 10));
    }, InvalidPurchaseException);
  });
  it("Valid payload of tickets fails for making payment", () => {
    Sinon.stub(TicketPaymentService.prototype, "makePayment").throwsException(new PaymentGatewayException);
    Sinon.stub(SeatReservationService.prototype, "reserveSeat").returns(true);
    const objTicket = new TicketService;
    assert.throws(() => {
      objTicket.purchaseTickets(1, new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('INFANT', 8), new TicketTypeRequest('CHILD', 8));
    }, PaymentGatewayException);
  });
  it("Valid payload of tickets fails for reserving seat", () => {
    Sinon.stub(TicketPaymentService.prototype, "makePayment").returns(true);
    Sinon.stub(SeatReservationService.prototype, "reserveSeat").throwsException(new SeatReservationException);
    const objTicket = new TicketService;
    assert.throws(() => {
      objTicket.purchaseTickets(1, new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('INFANT', 8), new TicketTypeRequest('CHILD', 8));
    }, SeatReservationException);
  });
  it("Valid payload of tickets with success payment and seat reservation", () => {
    Sinon.spy(TicketPaymentService.prototype, "makePayment");
    Sinon.spy(SeatReservationService.prototype, "reserveSeat");
    const objTicket = new TicketService;
    expect(objTicket.purchaseTickets(1, new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('CHILD', 8))).to.not.throw;
    assert.equal(320, TicketPaymentService.prototype.makePayment.args[0][1]);
    assert.equal(16, SeatReservationService.prototype.reserveSeat.args[0][1]);
  });
  it("Valid payload of tickets with success payment and seat reservation with infants", () => {
    Sinon.spy(TicketPaymentService.prototype, "makePayment");
    Sinon.spy(SeatReservationService.prototype, "reserveSeat");
    const objTicket = new TicketService;
    expect(objTicket.purchaseTickets(1, new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('INFANT', 8))).to.not.throw;
    assert.equal(200, TicketPaymentService.prototype.makePayment.args[0][1]);
    assert.equal(8, SeatReservationService.prototype.reserveSeat.args[0][1]);
  });

});