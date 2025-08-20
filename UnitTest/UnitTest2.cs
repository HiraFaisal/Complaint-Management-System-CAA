using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using TicketManagementSystem_CAA.Controllers;
using TicketManagementSystem_CAA.Models;
using Xunit;
using System;
using HtmlAgilityPack;

namespace UnitTesting1
{
    public class UnitTest2
    {
        private readonly DbContextOptions<tmsContext> _options;
        private readonly tmsContext _context;
        private readonly UserDashboardController _controller;

        public UnitTest2()
        {
            // Setup in-memory database for testing
            var options = new DbContextOptionsBuilder<tmsContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            var context = new tmsContext(options);
            _controller = new UserDashboardController(context);
        }

        [Fact]
        public void AddTicket_ReturnsOkResult_WhenValidTicket()
        {
            // Arrange: Create a valid ticket request
            var ticketRequest = new TicketModel
            {
                UserId = 1024, // Valid UserId
                Subject = "Test Subject",
                Description = "Test Description"
            };

            // Act: Call the AddTicket method
            var result = _controller.AddTicket(ticketRequest);

            // Assert: Check that the result is an OkObjectResult
            var okResult = result as OkObjectResult;
            Assert.NotNull(okResult);

            // Print the response to the console for debugging
            Console.WriteLine("Response Value: " + okResult.Value);

            // Check if the returned value is what you expect
            var responseValue = okResult.Value as TicketResponse;
            Assert.NotNull(responseValue);
            Assert.Equal("Ticket added successfully.", responseValue.Message);
            Assert.True(responseValue.TicketId > 0); // Check if the TicketId is returned
        }

        [Fact]
        public void AddTicket_ReturnsBadRequest_WhenInvalidTicketData()
        {
            // Arrange: Create an invalid ticket request (e.g., missing UserId or Description)
            var ticketRequest = new TicketModel
            {
                UserId = 0, // Invalid UserId
                Subject = "Test Subject",
                Description = "Test Description"
            };

            // Act: Call the AddTicket method
            var result = _controller.AddTicket(ticketRequest);

            // Assert: Check that the result is a BadRequestObjectResult
            var badRequestResult = result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);

            // Print the response to the console for debugging
            Console.WriteLine("Response Value: " + badRequestResult.Value);

            // Check if the returned value is what you expect
            var responseValue = badRequestResult.Value as TicketResponse;
            Assert.NotNull(responseValue);
            Assert.Equal("Invalid ticket data.", responseValue.Message); // Assuming the response is an error message
        }


    }
    public class TicketModel
    {
        public int UserId { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
    }

    public class TicketResponse
    {
        public string Message { get; set; }
        public int TicketId { get; set; }
    }

    // Assuming your UserDashboardController is like:
    [ApiController]
    [Route("api/[controller]")]
    public class UserDashboardController : ControllerBase
    {
        private readonly tmsContext _context;

        public UserDashboardController(tmsContext context)
        {
            _context = context;
        }

        [HttpPost("AddTicket")]
        public IActionResult AddTicket([FromBody] TicketModel ticketRequest)
        {
            // Check for invalid request body
            if (ticketRequest == null)
            {
                return BadRequest(new TicketResponse { Message = "Invalid ticket data." });
            }

            // Validate the ticket request fields
            if (ticketRequest.UserId <= 0 || string.IsNullOrEmpty(ticketRequest.Subject) || string.IsNullOrEmpty(ticketRequest.Description))
            {
                return BadRequest(new TicketResponse { Message = "Invalid ticket data." });
            }

            try
            {
                // Get the next t_id
                int nextId = _context.Tickets.Max(t => (int?)t.TId) ?? 1520;
                nextId++;

                var htmlDoc = new HtmlDocument();
                htmlDoc.LoadHtml(ticketRequest.Description);
                var plainText = htmlDoc.DocumentNode.InnerText;

                // Create a new ticket
                var ticket = new Ticket
                {
                    TId = nextId,
                    TTitle = ticketRequest.Subject,
                    UId = ticketRequest.UserId,
                    Lvlid = 3, // Default value, adjust as needed
                    SId = 6,   // Default status (e.g., Open), adjust as needed
                    DateTime = DateTime.Now,
                    LDescription = plainText
                };

                _context.Tickets.Add(ticket);
                _context.SaveChanges();

                // Return success message with TicketId
                return Ok(new TicketResponse { Message = "Ticket added successfully.", TicketId = nextId });
            }
            catch (Exception ex)
            {
                // Handle any exceptions
                return StatusCode(500, new TicketResponse { Message = $"Internal server error: {ex.Message}" });
            }
        }
    }

}
