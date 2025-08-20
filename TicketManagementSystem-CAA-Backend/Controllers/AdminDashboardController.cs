using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketManagementSystem_CAA.Models;
using System;
namespace TicketManagementSystem_CAA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminDashboardController : Controller
    {
        private readonly tmsContext _context;
        private readonly Random _random = new Random();
        public AdminDashboardController(tmsContext context)
        {
            _context = context;
        }

        [HttpPost("addAdminResponse")]
        public async Task<IActionResult> AddAdminResponse([FromBody] AdminResponseModel model)
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

            if (!await _context.Users1s.AnyAsync(u => u.Uid == model.UserId))
            {
                return BadRequest("Invalid user ID.");
            }

            try
            {
                var ticketResponse = new TicketResponse
                {
                    TId = model.TicketId,
                    RBody = model.ResponseBody,
                    DId = model.DepartmentId,
                    DateTime = DateTime.Now,
                    SId = model.StatusId,
                    Role = "admin",
                    AId = model.AdminId,
                    UId = model.UserId  // Include UserId in the response
                };

                _context.TicketResponses.Add(ticketResponse);
                await _context.SaveChangesAsync();

                // Create a notification for the user
                var notification = new Notification
                {
                    UserId = model.UserId,
                    Title = "New Admin Response",
                    Message = $"Your ticket #{model.TicketId} has received a new response.",
                    Timestamp = DateTime.Now,
                    IsRead = false,
                    TicketId = model.TicketId
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Admin response and notification added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message} Inner Exception: {ex.InnerException?.Message}");
            }
        }

        public class AdminResponseModel
        {
            public int TicketId { get; set; }
            public int AdminId { get; set; }
            public int UserId { get; set; }  // Added UserId property
            public string ResponseBody { get; set; }
            public int DepartmentId { get; set; }
            public int StatusId { get; set; }
        }


        //admin dashboard
        [HttpGet("complaintsSummary")]
        public async Task<IActionResult> GetComplaintsSummary()
        {
            var totalComplaints = await _context.Tickets.CountAsync();
            var droppedComplaintsCount = await _context.Tickets.CountAsync(t => t.SId == 4);

            var complaintsSummary = await _context.Tstatuses
                .Select(status => new
                {
                    StatusTitle = status.Sdesc,
                    ComplaintCount = _context.Tickets.Count(t => t.SId == status.SId),
                    Percentage = status.SId == 4
                        ? (double)_context.Tickets.Count(t => t.SId == status.SId) / totalComplaints * 100
                        : (double)_context.Tickets.Count(t => t.SId == status.SId) / (totalComplaints - droppedComplaintsCount) * 100
                })
                .ToListAsync();

            return Ok(complaintsSummary);
        }

        [HttpGet("complaints/{statusId}")]
        public async Task<IActionResult> GetComplaints(int statusId)
        {
            var complaints = await _context.Tickets
                .Select(t => new
                {
                    t.TId,
                    t.TTitle,
                    t.SId,
                    t.DateTime,
                    t.Lvlid,
                    t.UId,
                    AssignedToDepartment = _context.Departments
                        .Where(d => d.DId == t.AssignedToDepartment)
                        .Select(d => d.Sdesc)
                        .FirstOrDefault(),
                    AssignedToAdmin = _context.Admins
                        .Where(a => a.AId == t.AssignedToAdmin)
                        .Select(a => a.Adminname)
                        .FirstOrDefault()
                })
                .Where(t => t.SId == statusId)
                .ToListAsync();

            Console.WriteLine($"Complaints fetched: {complaints.Count}"); // Debugging log
            return Ok(complaints);
        }



        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var departments = await _context.Departments
                .Select(d => new { id = d.DId, name = d.Sdesc })
                .ToListAsync();

            return Ok(departments);
        }

        [HttpGet("admins")]
        public async Task<IActionResult> GetAdmins([FromQuery] int departmentId)
        {
            var admins = await _context.Admins
                .Where(a => a.DId == departmentId && a.Role != "Administrator")
                .Select(a => new { id = a.AId, name = a.Adminname , role = a.Role })
                .ToListAsync();

            return Ok(admins);
        }


        //ticket updation code 
        [HttpPut("tickets/{ticketId}")]
        public async Task<IActionResult> UpdateTicketAssignment(int ticketId, [FromBody] TicketAssignmentDto assignmentDto)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
            {
                return NotFound();
            }

            ticket.AssignedToDepartment = assignmentDto.AssignedToDepartment;
            ticket.AssignedToAdmin = assignmentDto.AssignedToAdmin;

            _context.Tickets.Update(ticket);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public class TicketAssignmentDto
        {
            public int AssignedToDepartment { get; set; }
            public int AssignedToAdmin { get; set; }
        }

        [HttpGet("ticket/{ticketId}")]
        public async Task<IActionResult> GetTicketById(int ticketId)
        {
            try
            {
                var ticket = await _context.Tickets
                    .Where(t => t.TId == ticketId)
                    .Select(t => new
                    {
                        t.TId,
                        t.TTitle,
                        t.SId,
                        t.DateTime,
                        t.Lvlid,
                        t.UId,
                        AssignedToDepartmentId = t.AssignedToDepartment, // Department ID
                        AssignedToDepartmentName = _context.Departments
                            .Where(d => d.DId == t.AssignedToDepartment)
                            .Select(d => d.Sdesc)
                            .FirstOrDefault(),
                        AssignedToAdminId = t.AssignedToAdmin, // Admin ID
                        AssignedToAdminName = _context.Admins
                            .Where(a => a.AId == t.AssignedToAdmin)
                            .Select(a => a.Adminname)
                            .FirstOrDefault(),
                        User = _context.Users1s
                            .Where(u => u.Uid == t.UId)
                            .Select(u => new
                            {
                                u.Username,
                                u.Email
                            })
                            .FirstOrDefault()
                    })
                    .FirstOrDefaultAsync();

                if (ticket == null)
                {
                    return NotFound($"Ticket with ID {ticketId} not found.");
                }

                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("severityLevels")]
        public async Task<IActionResult> GetSeverityLevels()
        {
            try
            {
                var severityLevels = await _context.Severitylvls.ToListAsync();
                return Ok(severityLevels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        public class UpdateSeverityRequest
        {
            public int SeverityLevelId { get; set; }
        }

        [HttpPut("updateTicketSeverity/{ticketId}")]
        public async Task<IActionResult> UpdateTicketSeverity(int ticketId, [FromBody] UpdateSeverityRequest request)
        {
            try
            {
                var ticket = await _context.Tickets.FindAsync(ticketId);
                var severityLevelExists = await _context.Severitylvls.AnyAsync(s => s.Lvlid == request.SeverityLevelId);

                if (ticket == null)
                {
                    return NotFound(new { Message = "Ticket not found" });
                }

                if (!severityLevelExists)
                {
                    return NotFound(new { Message = "Severity level not found" });
                }

                // Update ticket severity level and save changes
                ticket.Lvlid = request.SeverityLevelId;
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Ticket severity updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred: " + ex.Message });
            }
        }

        //[HttpGet("adminProgressData")]
        //public async Task<IActionResult> GetAdminProgressData()
        //{
        //    var adminData = await _context.Admins.Where(a => a.Role != "Administrator")
        //        .Select(a => new
        //        {
        //            a.AId,
        //            a.Adminname,
        //            a.Email,
        //            DepartmentName = _context.Departments
        //                .Where(d => d.DId == a.DId)
        //                .Select(d => d.Sdesc)
        //                .FirstOrDefault(),
        //            a.Role,

        //            Progress = _random.Next(0, 101)
        //        })
        //        .ToListAsync();

        //    return Ok(adminData);
        //}

        [HttpGet("adminProgressData")]
        public async Task<IActionResult> GetAdminProgressData()
        {
            // Fetch all admins excluding the "Administrator" role
            var admins = await _context.Admins
                .Where(a => a.Role != "Administrator")
                .ToListAsync();

            // Prepare a list to hold the admin progress data
            var adminProgressData = new List<object>();

            foreach (var admin in admins)
            {
                // Fetch tickets assigned to the admin
                var tickets = await _context.Tickets
                    .Where(t => t.AssignedToAdmin == admin.AId)
                    .ToListAsync();

                // Calculate the total number of tickets
                var totalTickets = tickets.Count;
                if (totalTickets == 0)
                {
                    // If no tickets, set progress to 0
                    adminProgressData.Add(new
                    {
                        admin.AId,
                        admin.Adminname,
                        admin.Email,
                        DepartmentName = (await _context.Departments
                            .Where(d => d.DId == admin.DId)
                            .Select(d => d.Sdesc)
                            .FirstOrDefaultAsync()) ?? "Unknown",
                        admin.Role,
                        Progress = 0
                    });
                    continue;
                }

                // Calculate closed tickets
                var closedTickets = tickets
                    .Where(t => t.SId == 2) // Assuming 2 is the status ID for closed
                    .ToList();
                var closedTicketCount = closedTickets.Count;

                // Calculate the initial progress based on closed tickets
                var progressPercentage = (double)closedTicketCount / totalTickets * 100;

                // Add additional points based on feedback
                var feedbackScores = await _context.Feedbacks
                    .Where(f => closedTickets.Select(t => t.TId).Contains(f.TicketId))
                    .ToListAsync();

                foreach (var feedback in feedbackScores)
                {
                    switch (feedback.Feedback1)
                    {
                        case "Excellent":
                            progressPercentage += 0.5; // Add 0.5% for Excellent feedback
                            break;
                        case "Good":
                            progressPercentage += 0.3; // Add 0.3% for Good feedback
                            break;
                        case "Medium":
                            // No change for Medium feedback
                            break;
                        case "Poor":
                            progressPercentage -= 0.5; // Subtract 0.5% for Poor feedback
                            break;
                        case "Very Bad":
                            progressPercentage -= 1; // Subtract 1% for Very Bad feedback
                            break;
                    }
                    // Ensure progress percentage does not exceed 100% or drop below 0%
                    progressPercentage = Math.Max(0, Math.Min(progressPercentage, 100));

                }


                // Add the calculated progress to the result list
                adminProgressData.Add(new
                {
                    admin.AId,
                    admin.Adminname,
                    admin.Email,
                    DepartmentName = (await _context.Departments
                        .Where(d => d.DId == admin.DId)
                        .Select(d => d.Sdesc)
                        .FirstOrDefaultAsync()) ?? "Unknown",
                    admin.Role,
                    Progress = progressPercentage
                });
            }

            return Ok(adminProgressData);
        }
        public class ProgressNotificationModel
        {
            public int AdminId { get; set; }
            public string Title { get; set; }  // Custom title
            public string Message { get; set; }  // Custom message
        }

        [HttpPost("sendProgressNotification")]
        public async Task<IActionResult> SendProgressNotification([FromBody] ProgressNotificationModel model)
        {
            var admin = await _context.Admins.FindAsync(model.AdminId);
            if (admin == null)
            {
                return NotFound("Admin not found.");
            }

            var notification = new ProgressNotification
            {
                AdminId = model.AdminId,
                Title = model.Title,
                Message = model.Message,
                Timestamp = DateTime.Now,
                IsRead = false
            };

            _context.ProgressNotifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Notification sent successfully." });
        }

        [HttpGet("notifications/{adminId}")]
        public async Task<IActionResult> GetNotificationsForAdmin(int adminId)
        {
            var notifications = await _context.ProgressNotifications
                .Where(n => n.AdminId == adminId) 
                .OrderByDescending(n => n.Timestamp) // Sort by most recent
                .ToListAsync();

            return Ok(notifications);
        }




    }


}

