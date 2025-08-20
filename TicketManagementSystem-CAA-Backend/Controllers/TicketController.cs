using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using TicketManagementSystem_CAA.Models;

namespace TicketManagementSystem_CAA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly tmsContext _context;

        public TicketController(tmsContext context)
        {
            _context = context;
        }

        [HttpPost("addResponse")]
        public async Task<IActionResult> AddResponse([FromBody] TicketResponseModel model)
        {
            if (model == null)
            {
                return BadRequest("Invalid response data.");
            }

            // Validate foreign key existence
            if (!await _context.Tickets.AnyAsync(t => t.TId == model.TicketId))
            {
                return BadRequest("Invalid ticket ID.");
            }

            if (!await _context.Users1s.AnyAsync(u => u.Uid == model.UserId))
            {
                return BadRequest("Invalid user ID.");
            }

            if (!await _context.Admins.AnyAsync(a => a.AId == model.AdminId))
            {
                return BadRequest("Invalid admin ID.");
            }

            if (!await _context.Departments.AnyAsync(d => d.DId == model.DepartmentId))
            {
                return BadRequest("Invalid department ID.");
            }

            if (!await _context.Tstatuses.AnyAsync(s => s.SId == model.StatusId))
            {
                return BadRequest("Invalid status ID.");
            }

            try
            {
                var ticketResponse = new TicketResponse
                {
                    TId = model.TicketId,
                    RBody = model.ResponseBody,
                    UId = model.UserId,
                    DId = model.DepartmentId,
                    AId = model.AdminId,
                    DateTime = DateTime.Now,
                    SId = model.StatusId,
                    Role = "user"
                };

                _context.TicketResponses.Add(ticketResponse);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Response added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message} Inner Exception: {ex.InnerException?.Message}");
            }
        }
        [HttpGet("responses/{ticketId}")]
        public async Task<IActionResult> GetResponses(int ticketId)
        {
            var responses = await _context.TicketResponses
                .Where(r => r.TId == ticketId)
                .Join(
                    _context.Users1s,
                    response => response.UId,
                    user => user.Uid,
                    (response, user) => new
                    {
                        response.TId,
                        response.RBody,
                        response.UId,
                        response.DId,
                        response.AId,
                        response.DateTime,
                        response.SId,
                        response.Role,
                        UserName = response.Role == "admin" ? null : user.Username,
                        UserEmail = response.Role == "admin" ? null : user.Email,
                        AdminName = response.Role == "admin" ? _context.Admins.FirstOrDefault(a => a.AId == response.AId).Adminname : null,
                        AdminEmail = response.Role == "admin" ? _context.Admins.FirstOrDefault(a => a.AId == response.AId).Email : null
                    })
                .ToListAsync();

            if (!responses.Any())
            {
                return NotFound("No responses found for this ticket.");
            }

            return Ok(responses);
        }





        public class TicketResponseModel
        {
            public int TicketId { get; set; }
            public int UserId { get; set; }
            public string ResponseBody { get; set; }
            public int DepartmentId { get; set; }
            public int AdminId { get; set; }
            public int StatusId { get; set; }
        }
        [HttpPost("addFeedback")]
        public async Task<IActionResult> AddFeedback([FromBody] FeedbackModel model)
        {
            if (model == null)
            {
                return BadRequest("Invalid feedback data.");
            }

            // Validate foreign key existence
            if (!await _context.Tickets.AnyAsync(t => t.TId == model.TicketId))
            {
                return BadRequest("Invalid ticket ID.");
            }

            try
            {
                var feedback = new Feedback
                {
                    TicketId = model.TicketId,
                    Feedback1 = model.Feedback,
                    Comments = model.Comments,
                    DateTime = DateTime.Now
                };

                _context.Feedbacks.Add(feedback);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Feedback added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message} Inner Exception: {ex.InnerException?.Message}");
            }
        }
        public class FeedbackModel
        {
            public int TicketId { get; set; }
            public string Feedback { get; set; }
            public string Comments { get; set; }
        }


    }
}
