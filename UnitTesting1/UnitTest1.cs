using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using TicketManagementSystem_CAA.Controllers;
using TicketManagementSystem_CAA.Models;
using Xunit;
using System;

namespace UnitTesting1
{
    public class TestControllerTests
    {
        private readonly DbContextOptions<tmsContext> _options;
        private readonly tmsContext _context;
        private readonly TestController _controller;

        public TestControllerTests()
        {
            // Set up the in-memory database
            _options = new DbContextOptionsBuilder<tmsContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new tmsContext(_options);
            _controller = new TestController(_context);

            // Seed data for testing
            SeedTestData();
        }

        private void SeedTestData()
        {
            // Seed Users1
            _context.Users1s.Add(new Users1
            {
                Username = "testUser",
                Email = "hujatestbhaiplease@gmail.com",
                Password = "HIAAAA", // Plain password
                Address = "Test Address",
                City = "Test City",
                Province = "Test Province",
                Cnic = "1234567890123",
                Mobileno = 1234567890
            });

            // Seed Admin
            _context.Admins.Add(new Admin
            {
                Adminname = "adminUser",
                Email = "adminuser@example.com",
                Password = "admin123", // Plain password
                Role = "Administrator",
                Cnic = "9876543210987" // Ensure Cnic is provided
            });

            _context.SaveChanges();
        }

        [Fact]
        public void Login_ReturnsOkResult_WhenValidUser()
        {
            // Arrange: Create valid login request for the user
            var loginRequest = new LoginRequest
            {
                Email = "hujatestbhaiplease@gmail.com",
                Password = "HIAAAA"
            };

            // Act: Call the Login method
            var result = _controller.Login(loginRequest);

            // Assert: Check that the result is OK with expected message
            var okResult = result as OkObjectResult;
            Assert.NotNull(okResult);
            var response = okResult.Value as LoginResponse;
            Assert.Equal("Login successful.", response.Message);
        }

        [Fact]
        public void Login_ReturnsUnauthorized_WhenInvalidCredentials()
        {
            // Arrange: Create login request with invalid credentials
            var loginRequest = new LoginRequest
            {
                Email = "wrongemail@example.com",
                Password = "wrongpassword"
            };

            // Act: Call the Login method
            var result = _controller.Login(loginRequest);

            // Assert: Check that the result is Unauthorized
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.NotNull(unauthorizedResult);
            var response = unauthorizedResult.Value as LoginResponse;
            Assert.Equal("Invalid email or password.", response.Message);
        }

        [Fact]
        public void Login_ReturnsUnauthorized_WhenNonExistingUser()
        {
            // Arrange: Create login request with non-existing user
            var loginRequest = new LoginRequest
            {
                Email = "nonexistinguser@example.com",
                Password = "password123"
            };

            // Act: Call the Login method
            var result = _controller.Login(loginRequest);

            // Assert: Check that the result is Unauthorized
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.NotNull(unauthorizedResult);
            var response = unauthorizedResult.Value as LoginResponse;
            Assert.Equal("Invalid email or password.", response.Message);
        }
    }

    // Assuming LoginRequest and LoginResponse classes are something like:
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginResponse
    {
        public string Message { get; set; }
    }

    // Assuming your TestController is like:
    public class TestController : ControllerBase
    {
        private readonly tmsContext _context;

        public TestController(tmsContext context)
        {
            _context = context;
        }

        public IActionResult Login(LoginRequest loginRequest)
        {
            var user = _context.Users1s.SingleOrDefault(u => u.Email == loginRequest.Email && u.Password == loginRequest.Password);

            if (user != null)
            {
                return Ok(new LoginResponse { Message = "Login successful." });
            }

            return Unauthorized(new LoginResponse { Message = "Invalid email or password." });
        }
    }
}
