import Sinon from "sinon";
import { assert, expect } from "chai";
import TicketService from "../../src/pairtest/TicketService.js";
import TicketTypeRequest from "../../src/pairtest/lib/TicketTypeRequest.js";
import TicketPaymentService from "../../src/thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService
    from "../../src/thirdparty/seatbooking/SeatReservationService.js";
describe("Ticket Service Testing", async () => {
    beforeEach(() => {
        Sinon.restore();
    })
    it("Invalid payload of tickets exceeding maximum number of tickets", () => {
        Sinon.stub(TicketPaymentService.prototype, "makePayment").returns(true);
        Sinon.stub(SeatReservationService.prototype, "reserveSeat").returns(true);
        const objTicket = new TicketService;
        const tickets = [new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('CHILD', 8), new TicketTypeRequest('CHILD', 8)]
        expect(objTicket.purchaseTickets(1, tickets)).to.throw;
    });
    it("Invalid payload of tickets for null account ID", () => {
        Sinon.stub(TicketPaymentService.prototype, "makePayment").returns(true);
        Sinon.stub(SeatReservationService.prototype, "reserveSeat").returns(true);
        const objTicket = new TicketService;
        const tickets = [new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('CHILD', 8), new TicketTypeRequest('CHILD', 8)]
        expect(objTicket.purchaseTickets(null, tickets)).to.throw;
    });
    it("Invalid payload of tickets for no adult ticket present", () => {
        Sinon.stub(TicketPaymentService.prototype, "makePayment").returns(true);
        Sinon.stub(SeatReservationService.prototype, "reserveSeat").returns(true);
        const objTicket = new TicketService;
        const tickets = [new TicketTypeRequest('INFANT', 8), new TicketTypeRequest('CHILD', 8), new TicketTypeRequest('CHILD', 8)]
        expect(objTicket.purchaseTickets(1, tickets)).to.throw;
    });
    it("Invalid payload of tickets for less adult ticket than infant present", () => {
        Sinon.stub(TicketPaymentService.prototype, "makePayment").returns(true);
        Sinon.stub(SeatReservationService.prototype, "reserveSeat").returns(true);
        const objTicket = new TicketService;
        const tickets = [new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('INFANT', 10), new TicketTypeRequest('CHILD', 8)]
        expect(objTicket.purchaseTickets(1, tickets)).to.throw;
    });
    it("Valid payload of tickets fails for making payment", () => {
        Sinon.stub(TicketPaymentService.prototype, "makePayment").rejects(new Error);
        Sinon.stub(SeatReservationService.prototype, "reserveSeat").returns(true);
        const objTicket = new TicketService;
        const tickets = [new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('INFANT', 8), new TicketTypeRequest('CHILD', 8)]
        expect(objTicket.purchaseTickets(1, tickets)).to.throw;
    });
    it("Valid payload of tickets fails for reserving seat", () => {
        Sinon.stub(TicketPaymentService.prototype, "makePayment").returns(true);
        Sinon.stub(SeatReservationService.prototype, "reserveSeat").rejects(new Error);
        const objTicket = new TicketService;
        const tickets = [new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('INFANT', 8), new TicketTypeRequest('CHILD', 8)]
        expect(objTicket.purchaseTickets(1, tickets)).to.throw;
    });
    it("Valid payload of tickets with success payment and seat reservation", () => {
        Sinon.stub(TicketPaymentService.prototype, "makePayment").returns(true);
        Sinon.stub(SeatReservationService.prototype, "reserveSeat").returns(true);
        const objTicket = new TicketService;
        const tickets = [new TicketTypeRequest('ADULT', 8), new TicketTypeRequest('CHILD', 8)]
        objTicket.purchaseTickets(1, tickets);
    });

});