using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketManagementSystem_CAA.Models;

namespace TicketManagementSystem_CAA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NormalAdminDashboardController : Controller
    {
        private readonly tmsContext _context;
        public NormalAdminDashboardController(tmsContext context)
        {
            _context = context;
        }
        [HttpGet("complaintsSummary/{adminId}")]
        public async Task<IActionResult> GetComplaintsSummary(int adminId)
        {
            var totalComplaints = await _context.Tickets.CountAsync(t => t.AssignedToAdmin == adminId);
            var droppedComplaintsCount = await _context.Tickets.CountAsync(t => t.SId == 4 && t.AssignedToAdmin == adminId);

            var complaintsSummary = await _context.Tstatuses
                .Select(status => new
                {
                    StatusTitle = status.Sdesc,
                    ComplaintCount = _context.Tickets.Count(t => t.SId == status.SId && t.AssignedToAdmin == adminId),
                    Percentage = status.SId == 4
                        ? (double)_context.Tickets.Count(t => t.SId == status.SId && t.AssignedToAdmin == adminId) / totalComplaints * 100
                        : (double)_context.Tickets.Count(t => t.SId == status.SId && t.AssignedToAdmin == adminId) / (totalComplaints - droppedComplaintsCount) * 100
                })
                .ToListAsync();

            return Ok(complaintsSummary);
        }

        [HttpGet("complaints/{statusId}")]
        public async Task<IActionResult> GetComplaintsByStatusAndAdmin(int statusId, [FromQuery] int adminId)
        {
            var tickets = await _context.Tickets
                .Where(t => t.SId == statusId && t.AssignedToAdmin == adminId)
                .ToListAsync();

            return Ok(tickets);
        }

        [HttpGet("statuses")]
        public async Task<IActionResult> GetAllStatuses()
        {
        
            var excludedStatuses = new[] { 2, 4 };

            var statuses = await _context.Tstatuses
                .Where(s => !excludedStatuses.Contains(s.SId))
                .ToListAsync();

            return Ok(statuses);
        }

        // Update the status of a specific ticket
        [HttpPut("updateTicketStatus/{ticketId}")]
        public async Task<IActionResult> UpdateTicketStatus(int ticketId, [FromBody] UpdateStatusRequest request)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
            {
                return NotFound("Ticket not found.");
            }

            ticket.SId = request.StatusId;
            await _context.SaveChangesAsync();

            return Ok("Ticket status updated successfully.");
        }
    }

    public class UpdateStatusRequest
    {
        public int StatusId { get; set; }
    }

}

