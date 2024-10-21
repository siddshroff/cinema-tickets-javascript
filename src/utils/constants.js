const Defaults = Object.freeze({
  MAX_TICKETS_ALLOWED: 20,
  LOG_LEVEL: "info",
});

const TicketTypes = Object.freeze({
  ADULT: "ADULT",
  CHILD: "CHILD",
  INFANT: "INFANT",
});
const ErrorCodes = Object.freeze({
  ERRORCT01: "Unknown application error",
  ERRORCT02: "Account Id Invalid",
  ERRORCT03: "Max ticket count purchase exceeded",
  ERRORCT04: "Adult ticket is not present",
  ERRORCT05: "Purchase data is null",
});
const TicketPrices = Object.freeze({
  ADULT: 20,
  CHILD: 10,
  INFANT: 0
})
export { Defaults, TicketTypes, ErrorCodes, TicketPrices };
