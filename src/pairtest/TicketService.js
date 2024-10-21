import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import PaymentGatewayException from "./lib/PaymentGatewayException.js";
import SeatReservationException from "./lib/SeatReservationException.js";
import { logger } from "../utils/logger.js";
import { TicketTypes, ErrorCodes } from "../utils/constants.js";
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
   * Should only have private methods other than the one below.
   */
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
  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    let totalAmountToPay = 0,
      totalSeatsToAllocate = 0;
    logger.debug("Validating requests for Account ID::", accountId);
    this.#validateRequest(accountId, ticketTypeRequests);

    ticketTypeRequests.forEach((ticketRequest) => {
      totalAmountToPay +=
        TicketPrices.valueOf(ticketRequest.getTicketType().name()).getPrice() *
        ticketRequest.getNoOfTickets();

      totalSeatsToAllocate += !ticketRequest
        .getTicketType()
        .equals(TicketTypes.INFANT)
        ? ticketRequest.getNoOfTickets()
        : 0;
    });
    try {
      logger.debug("Proceeding for payment for Account ID:: {}", accountId);
      ticketPaymentService.makePayment(accountId, totalAmountToPay);
      logger.debug("Payment successful for Account ID:: {}", accountId);
    } catch (e) {
      logger.error("Payment gateway failed to process payment", e);
      failedEventsCounter.inc();
      throw new PaymentGatewayException(
        ErrorCodes.ERRORCT01,
        String.format("Payment failed for Account id:: {}", accountId)
      );
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
      failedEventsCounter.inc();
      throw new SeatReservationException(
        ErrorCodes.ERRORCT01,
        String.format("Seat reservation failed for Account id:: {}", accountId)
      );
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
  #validateRequest(accountId, ...ticketTypeRequests) {
    if (accountId == null || accountId <= 0) {
      logger.error("Invalid Account ID:: {}", accountId);
      failedBusinessValidationCounter.inc();
      throw new InvalidPurchaseException(
        ErrorCodes.ERRORCT02,
        String.format("Account id = {} is not a valid data", accountId)
      );
    }
    if (this.#isMaxTicketCountExceeded(ticketTypeRequests)) {
      logger.error(
        "Request for maximum number of tickets exceeded",
        ticketTypeRequests
      );
      failedBusinessValidationCounter.inc();
      throw new InvalidPurchaseException(
        ErrorCodes.ERRORCT03,
        String.format(
          "Max ticket purchase count exceed the limit of = {}",
          Constants.MAX_TICKETS_ALLOWED
        )
      );
    }
    if (!this.#isAdultTicketPresent(ticketTypeRequests)) {
      logger.error("Request having no adults", ticketTypeRequests);
      failedBusinessValidationCounter.inc();
      throw new InvalidPurchaseException(
        ErrorCodes.ERRORCT04,
        String.format(
          "No adult ticket is present for account id = {}",
          accountId
        )
      );
    }
    if (!this.#isInfantTicketEqualAdultTicket(ticketTypeRequests)) {
      logger.error(
        "Request having more infants than adults",
        ticketTypeRequests
      );
      failedBusinessValidationCounter.inc();
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
  #isMaxTicketCountExceeded(...ticketTypeRequests) {
    let totalNoOfTickets = 0;
    for (let i = 0; i < arguments.length; i++) {
      if (arguments[i].getTicketType === TicketTypes.INFANT)
        return ticket.getNoOfTickets;
      else return 0;
    }
    return totalNoOfTickets > Constants.MAX_TICKETS_ALLOWED;
  }

  /**
   * This method validates
   * 1. If atleast one adult is booking the tickets
   *
   * @param ticketTypeRequests
   * @return boolean value of validation
   */
  #isAdultTicketPresent(...ticketTypeRequests) {
    return ticketTypeRequests.anyMatch((e) =>
      e.getTicketType().equals(TicketTypes.ADULT)
    );
  }

  /**
   * This method validates
   * 1. If there are atleast equal number of adult to infants.
   *
   * @param ticketTypeRequests
   * @return boolean value of validation
   */
  #isInfantTicketEqualAdultTicket(...ticketTypeRequests) {
    return ticketTypeRequests
      .filter((e) => e.getTicketType().equals(TicketTypes.ADULT))
      .map((i) => i.getNoOfTickets())
      .mapToInt(Integer.intValue)
      .sum() <
      Arrays.stream(ticketTypeRequests)
        .filter((e) => e.getTicketType().equals(TicketTypes.INFANT))
        .map((i) => i.getNoOfTickets())
        .mapToInt(Integer.intValue)
        .sum()
      ? false
      : true;
  }
}
