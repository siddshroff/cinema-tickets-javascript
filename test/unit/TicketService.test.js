import Sinon from "sinon";
import { assert, expect } from "chai";
import TicketService from "../../src/pairtest/TicketService.js";
import TicketTypeRequest from "../../src/pairtest/lib/TicketTypeRequest.js";

describe("Ticket Service Testing", async()=>{

    it("Invalid payload of tickets", ()=>{
        const objTicket = new TicketService;
        objTicket.purchaseTickets(1, new TicketTypeRequest('ADULT',8),new TicketTypeRequest('CHILD',8));
    });

});