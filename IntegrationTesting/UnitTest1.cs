using Newtonsoft.Json;
using TicketManagementSystem_CAA.Models;

namespace IntegrationTesting
{
    public class UnitTest1
    {


        private readonly HttpClient _client;

        public UnitTest1()
        {
            // Setup HttpClient to point to your running application's API
            _client = new HttpClient
            {
                BaseAddress = new System.Uri("https://localhost:5004") // Replace with your actual API URL
            };
        }

        [Fact]
        public async Task GetTickets_ReturnsOkResult_WithListOfTickets()
        {
            // Act: Call the GET endpoint
            var response = await _client.GetAsync("/api/tickets"); // Replace with your actual API endpoint
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var tickets = JsonConvert.DeserializeObject<List<Ticket>>(responseContent);

            // Assert: Validate the response
            Assert.NotNull(tickets);
            Assert.NotEmpty(tickets);
        }
    }
}