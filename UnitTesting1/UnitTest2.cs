using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketManagementSystem_CAA.Controllers;
using TicketManagementSystem_CAA.Models;

namespace UnitTesting1
{
    public class UnitTest2
    {
        private readonly DbContextOptions<tmsContext> _options;
        private readonly tmsContext _context;
        private readonly UserDashboardController _controller;

        public UnitTest2()
        {
            // Set up the in-memory database
            _options = new DbContextOptionsBuilder<tmsContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new tmsContext(_options);
            _controller = new UserDashboardController(_context);

            // Seed data for testing
            SeedTestData();
        }

        private void SeedTestData()
        {
            // Seed Users1
            _context.Users1s.Add(new Users1
            {
                Username = "testUser",
                Email = "testuser@example.com",
                Password = "password123",
                Address = "Test Address",
                City = "Test City",
                Province = "Test Province",
                Cnic = "1234567890123",
                Mobileno = 1234567890
            });

            _context.SaveChanges();
        }

        [Fact]
        public void AddTicket_ReturnsOkResult_WhenTicketIsAddedSuccessfully()
        {
            // Arrange: Create a valid ticket request (matching the TicketModel structure)
            var ticketRequest = new TicketModel
            {
                UserId = 1,      // Example valid user ID
                Subject = "Test Ticket",  // Ticket subject
                Description = "Test Description"  // Ticket description
            };

            // Simulate the next ticket ID (you can customize this depending on your logic for ID generation)
            var nextId = 1;  // This would typically be retrieved from the database or auto-increment field

            // Create the Ticket object with the provided properties
            var ticket = new Ticket
            {
                TId = nextId,                  // ID of the ticket
                TTitle = ticketRequest.Subject, // Title of the ticket
                UId = ticketRequest.UserId,    // User ID
                Lvlid = 3,                     // Default value for Level ID
                SId = 6,                       // Default status ID (e.g., Open)
                DateTime = DateTime.Now,       // Date and time of ticket creation
                LDescription = ticketRequest.Description // Description of the ticket
            };

            // Act: Call the AddTicket method
            var result = _controller.AddTicket(ticketRequest);

            // Assert: Check that the result is OkObjectResult
            var okResult = result as OkObjectResult;
            Assert.NotNull(okResult);  // Ensure it's OkObjectResult

            // Assert: Check that the value inside OkObjectResult is of type TicketResponse
            var response = okResult.Value as TicketResponse; // Change TicketResponse to match your actual response type
            Assert.NotNull(response); // Ensure the response is not null

            // Assert that the response contains the expected message and ticket ID
            Assert.Equal("Ticket added successfully.", response.Message);
            Assert.True(response.TicketId > 0);  // Ensure a valid ticket ID is returned
        }


        public class TicketResponse
        {
            public string Message { get; set; }
            public int TicketId { get; set; }
        }


    }
}

