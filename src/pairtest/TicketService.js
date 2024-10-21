import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import PaymentGatewayException from "./lib/PaymentGatewayException.js";
import SeatReservationException from "./lib/SeatReservationException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import { logger } from "../utils/logger.js";
import { Defaults, TicketTypes, ErrorCodes, TicketPrices } from "../utils/constants.js";
/**
 * This service class for cinema ticket booking application.
 * This exposes the prometheus metrics for the failure events in the methods
 * It also have the service interfaces to Payment and Seat reservation services
 * for methods to consume.
 *
 * @author Siddharth Shroff
 * @version 1.0
 * @since 06-10-2024
 */

export default class TicketService {
  /**
   * This is the implementation method which purchase ticket for an account.
   * It takes in two arguments. i.e account ID and object/s of TicketTypeRequest.
   * It makes payment and then reserves the seat according to the request.
   * It checks for basic business validations as mentioned in Readme.md.
   * If any validation fails then throw exception.
   *
   * @param accountId
   * @param ticketTypeRequests
   * @throws InvalidPurchaseException
   */
  purchaseTickets(accountId, ticketTypeRequests) {
    let totalAmountToPay = 0,
      totalSeatsToAllocate = 0;
    const ticketPaymentService = new TicketPaymentService;
    const seatReservationService = new SeatReservationService;

    logger.debug("Validating requests for Account ID::", accountId);
    this.#validateRequest(accountId, ticketTypeRequests);

    ticketTypeRequests.forEach((ticketRequest) => {
      totalAmountToPay +=
        TicketPrices[ticketRequest.getTicketType()] *
        ticketRequest.getNoOfTickets();

      totalSeatsToAllocate += !ticketRequest
        .getTicketType() === TicketTypes.INFANT
        ? ticketRequest.getNoOfTickets()
        : 0;
    });
    try {
      logger.debug("Proceeding for payment for Account ID:: {}", accountId);
      ticketPaymentService.makePayment(accountId, totalAmountToPay);
      logger.debug("Payment successful for Account ID:: {}", accountId);
    } catch (e) {
      logger.error("Payment gateway failed to process payment", e);
      throw new PaymentGatewayException(
        ErrorCodes.ERRORCT01, `Payment failed for Account id:: ${accountId}`);
    }
    try {
      logger.debug(
        "Proceeding for seat reservation for Account ID:: {}",
        accountId
      );
      seatReservationService.reserveSeat(accountId, totalSeatsToAllocate);
      logger.debug(
        "Seat reservation successful for Account ID:: {}",
        accountId
      );
    } catch (e) {
      logger.error("Seat reservation failed to reserve seat", e);
      throw new SeatReservationException(
        ErrorCodes.ERRORCT01, `Seat reservation failed for Account id:: ${accountId}`);
    }
  }

  /**
   * This method validates
   * 1. Valid check account id
   * 2. If maximum number of tickets are exceeded.
   * 3. If atleast one adult is booking the tickets
   *
   * @param accountId
   * @param ticketTypeRequests
   */
  #validateRequest(accountId, ticketTypeRequests) {
    if (accountId == null || accountId <= 0) {
      logger.error(`Invalid Account ID:: ${accountId}`);
      throw new InvalidPurchaseException(
        ErrorCodes.ERRORCT02, `Account id = ${accountId} is not a valid data`);
    }
    if (this.#isMaxTicketCountExceeded(ticketTypeRequests)) {
      logger.error(`Request for maximum number of tickets exceeded:: ${JSON.stringify(ticketTypeRequests)}`);
      throw new InvalidPurchaseException(
        ErrorCodes.ERRORCT03, `Max ticket purchase count exceed the limit of = ${Defaults.MAX_TICKETS_ALLOWED}`
      );
    }
    if (!this.#isAdultTicketPresent(ticketTypeRequests)) {
      logger.error("Request having no adults", ticketTypeRequests);
      throw new InvalidPurchaseException(
        ErrorCodes.ERRORCT04,
        `No adult ticket is present for account id = ${accountId}`);
    }
    if (!this.#isInfantTicketEqualAdultTicket(ticketTypeRequests)) {
      logger.error(
        "Request having more infants than adults",
        ticketTypeRequests
      );
      throw new InvalidPurchaseException(
        ErrorCodes.ERRORCT04,
        "Adult tickets less than infant tickets for Account ID" + accountId
      );
    }
  }

  /**
   * This method validates
   * 1. If maximum number of tickets are exceeded.
   *
   * @param ticketTypeRequests
   * @return boolean value of validation
   */
  #isMaxTicketCountExceeded(ticketTypeRequests) {
    let totalNoOfTickets = 0;
    for (let i = 0; i < ticketTypeRequests.length; i++) {
      if (ticketTypeRequests[i].getTicketType() !== TicketTypes.INFANT)
        totalNoOfTickets += ticketTypeRequests[i].getNoOfTickets();
    }
    return totalNoOfTickets > Defaults.MAX_TICKETS_ALLOWED;
  }

  /**
   * This method validates
   * 1. If atleast one adult is booking the tickets
   *
   * @param ticketTypeRequests
   * @return boolean value of validation
   */
  #isAdultTicketPresent(ticketTypeRequests) {
    return ticketTypeRequests.find((e) =>
      e.getTicketType() === TicketTypes.ADULT
    );
  }

  /**
   * This method validates
   * 1. If there are atleast equal number of adult to infants.
   *
   * @param ticketTypeRequests
   * @return boolean value of validation
   */
  #isInfantTicketEqualAdultTicket(ticketTypeRequests) {
    let tickets = ticketTypeRequests;
    return tickets
      .filter((e) => e.getTicketType() === TicketTypes.ADULT)
      .reduce((sum, i) => {
        sum + i.getNoOfTickets(), 0
      })
      <
      tickets
        .filter((e) => e.getTicketType() === TicketTypes.INFANT)
        .reduce((sum, i) => sum + i.getNoOfTickets(), 0)
      ? false
      : true;
  }
}
