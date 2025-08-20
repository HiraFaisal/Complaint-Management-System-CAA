using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Net.Mail;
using TicketManagementSystem_CAA.Models;
using MimeKit;
using MailKit.Security;
using System.ComponentModel.DataAnnotations;
using HtmlAgilityPack;

namespace TicketManagementSystem_CAA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserDashboardController : ControllerBase
    {
        private readonly tmsContext _context;

        public UserDashboardController(tmsContext context)
        {
            _context = context;
        }

        [HttpGet("complaints/{userId}")]
        public IActionResult GetComplaintCounts(int userId)
        {
            var totalComplaints = _context.Tickets.Count(t => t.UId == userId);
            var openComplaints = _context.Tickets.Count(t => t.UId == userId && t.SId == 6);
            var closedComplaints = _context.Tickets.Count(t => t.UId == userId && t.SId == 2);
            var pendingComplaints = _context.Tickets.Count(t => t.UId == userId && t.SId == 3);
            var droppedComplaints = _context.Tickets.Count(t => t.UId == userId && t.SId == 4);
            var resolvedComplaints = _context.Tickets.Count(t => t.UId == userId && t.SId == 5);

            return Ok(new
            {
                TotalComplaints = totalComplaints,
                OpenComplaints = openComplaints,
                ClosedComplaints = closedComplaints,
                PendingComplaints = pendingComplaints,
                DroppedComplaints = droppedComplaints,
                ResolvedComplaints = resolvedComplaints
            });
        }

        [HttpGet("tickets/{userId}/{statusId}")]
        public IActionResult GetTicketsByStatus(int userId, int statusId)
        {
            var ticketsQuery = _context.Tickets.Where(t => t.UId == userId);

            if (statusId != 0) // 0 means fetch all tickets regardless of status
            {
                ticketsQuery = ticketsQuery.Where(t => t.SId == statusId);
            }

            var tickets = ticketsQuery.ToList();

            return Ok(tickets);
        }

        [HttpGet("ticket/{ticketId}")]
        public IActionResult GetTicketById(int ticketId)
        {
            var ticket = (from t in _context.Tickets
                          join s in _context.Severitylvls on t.Lvlid equals s.Lvlid
                          where t.TId == ticketId
                          select new
                          {
                              t.TId,
                              t.TTitle,
                              t.LDescription,
                              t.SId,
                              SeverityDescription = s.Sdesc, 
                              Reason = t.SId == 4 ? t.Reason : null 
                          }).FirstOrDefault();

            if (ticket == null)
            {
                return NotFound();
            }

            return Ok(ticket);
        }

        private string ConvertImageToBase64(byte[] imageBytes)
        {
            if (imageBytes == null || imageBytes.Length == 0)
                return null;

            return $"data:image/png;base64,{Convert.ToBase64String(imageBytes)}";
        }


        [HttpGet("users/{userId}")]
        public IActionResult GetUserDetails(int userId)
        {
            var user = _context.Users1s
                .Where(u => u.Uid == userId)
                .Select(u => new
                {
                    u.Username,
                    u.Address,
                    u.City,
                    u.Province,
                    u.Email,
                    u.Cnic,
                    u.Mobileno,
                    Picture = u.Picture 
                })
                .FirstOrDefault();

            if (user == null)
            {
                return NotFound();
            }

            // Convert the image to Base64
            var profilePicUrl = ConvertImageToBase64(user.Picture);

            var response = new
            {
                user.Username,
                user.Address,
                user.City,
                user.Province,
                user.Email,
                user.Cnic,
                user.Mobileno,
                ProfilePicUrl = profilePicUrl
            };

            return Ok(response);
        }





        [HttpPut("userupdate/{userId}")]
        public IActionResult UpdateUserDetails(int userId, [FromBody] UserUpdateModel updatedUser)
        {
            var user = _context.Users1s.FirstOrDefault(u => u.Uid == userId);
            if (user == null)
            {
                return NotFound();
            }

            // Update only the provided fields
            if (updatedUser.Username != null)
            {
                user.Username = updatedUser.Username;
            }
            if (updatedUser.Address != null)
            {
                user.Address = updatedUser.Address;
            }
            if (updatedUser.City != null)
            {
                user.City = updatedUser.City;
            }
            if (updatedUser.Province != null)
            {
                user.Province = updatedUser.Province;
            }
            if (updatedUser.Email != null)
            {
                user.Email = updatedUser.Email;
            }
            if (updatedUser.Cnic != null)
            {
                user.Cnic = updatedUser.Cnic;
            }
            if (updatedUser.Mobileno != 0)
            {
                user.Mobileno = updatedUser.Mobileno;
            }

            _context.Users1s.Update(user);
            _context.SaveChanges();

            return Ok(user);
        }

        public class UserUpdateModel
        {
            public string Username { get; set; }
            public string Address { get; set; }
            public string City { get; set; }
            public string Province { get; set; }
            public string Email { get; set; }
            public string Cnic { get; set; }
            public long Mobileno { get; set; }
        }
        [HttpPut("updateProfilePic/{userId}")]
        public async Task<IActionResult> UpdateProfilePicture(int userId, [FromForm] IFormFile profilePic)
        {
            var user = _context.Users1s.FirstOrDefault(u => u.Uid == userId);
            if (user == null)
            {
                return NotFound();
            }

            if (profilePic != null && profilePic.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await profilePic.CopyToAsync(memoryStream);
                    user.Picture = memoryStream.ToArray();
                }
            }

            _context.Users1s.Update(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }


        [HttpPost("contact")]
        public IActionResult ContactUs([FromBody] ContactUsModel model)
        {
            if (model == null)
            {
                return BadRequest("Invalid contact form data.");
            }

            try
            {
               
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Islam", "islam23022005@gmail.com"));
                message.To.Add(new MailboxAddress("PCAA Support", "pcaasuppo@gmail.com"));
                message.Subject = model.Subject;

               
                message.ReplyTo.Add(new MailboxAddress(model.Name, model.Email));

       
                var currentDateTime = DateTime.Now.ToString("ddd, dd MMM yyyy HH:mm:ss zzz");

                // Construct the body of the email to support
                message.Body = new TextPart("plain")
                {
                    Text = $"Name: {model.Name}\n" +
                           $"Email: {model.Email}\n" +
                           $"Subject: {model.Subject}\n" +
                           $"Message:\n{model.Message}\n" +
                           $"Date: {currentDateTime}\n" +
                           $"Sent To: pcaasuppo@gmail.com\n" +
                           $"Reply-To: {model.Email}\n\n"
                };

                using (var client = new MailKit.Net.Smtp.SmtpClient())
                {
                    client.Connect("smtp.gmail.com", 465, SecureSocketOptions.SslOnConnect);
                    client.Authenticate("islam23022005@gmail.com", "kcleidmnzcrirldn"); // Replace with your actual credentials

                    // Send the email to the support team
                    client.Send(message);
                    client.Disconnect(true);
                }

                return Ok("Email sent successfully!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("addTicket")]
        public IActionResult AddTicket([FromBody] TicketModel model)
        {
            if (model == null)
            {
                return BadRequest("Invalid ticket data.");
            }

            try
            {
                // Get the next t_id
                int nextId = _context.Tickets.Max(t => (int?)t.TId) ?? 1520;
                nextId++;
                var htmlDoc = new HtmlDocument();
                htmlDoc.LoadHtml(model.Description);
                var plainText = htmlDoc.DocumentNode.InnerText;
                // Create a new ticket
                var ticket = new Ticket
                {
                    TId = nextId,
                    TTitle = model.Subject,
                    UId = model.UserId,
                    Lvlid = 3, // Default value, adjust as needed
                    SId = 6,   // Default status (e.g., Open), adjust as needed
                    DateTime = DateTime.Now,
                    LDescription = plainText
                };

                _context.Tickets.Add(ticket);
                _context.SaveChanges();

                return Ok(new { Message = "Ticket added successfully.", TicketId = nextId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpPut("tickets/{ticketId}")]
        public IActionResult UpdateTicketStatus(int ticketId, [FromBody] int statusId)
        {
            // Ensure the statusId is properly received as part of the request body
            if (statusId <= 0)
            {
                return BadRequest("Invalid status ID.");
            }

            // Find the ticket by ID
            var ticket = _context.Tickets.FirstOrDefault(t => t.TId == ticketId);
            if (ticket == null)
            {
                return NotFound("Ticket not found.");
            }

            // Update the ticket status
            ticket.SId = statusId;

            // Save changes to the database
            _context.Tickets.Update(ticket);
            _context.SaveChanges();

            return Ok("Ticket status updated successfully.");
        }
        [HttpPut("updateticketsandreason/{ticketId}")]
        public IActionResult UpdateTicketStatusAndReason(int ticketId, [FromBody] TicketUpdateModel updateModel)
        {
            if (updateModel == null)
            {
                return BadRequest("Invalid update data.");
            }

            var ticket = _context.Tickets.FirstOrDefault(t => t.TId == ticketId);
            if (ticket == null)
            {
                return NotFound("Ticket not found.");
            }

            // Update ticket status and reason
            ticket.SId = updateModel.StatusId;
            ticket.Reason = updateModel.Reason;

            _context.Tickets.Update(ticket);
            _context.SaveChanges();

            return Ok("Ticket updated successfully.");
        }

        public class TicketUpdateModel
        {
            public int StatusId { get; set; }
            public string Reason { get; set; }
        }



    }

    public class TicketModel
    {
        public int UserId { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
    }

    public class ContactUsModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Subject { get; set; }
        public string Message { get; set; }
    }
}
