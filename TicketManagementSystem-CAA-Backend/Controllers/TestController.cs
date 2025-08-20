using Microsoft.AspNetCore.Mvc;
using TicketManagementSystem_CAA.Models;
using System.Linq;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using System.Text;

/*  
     Key Changes:
     - Extract Method: For reusability and clarity, extracted methods such as HashPassword, FindUserById, IsInvalidLoginRequest, etc.
     - Replace Temp with Query: Replaced temporary variables with direct query calls like GetActiveUsers.
     - Introduce Parameter Object: Simplified responses by introducing CreateLoginResponse.
     - Consolidate Duplicate Conditional Fragments: Removed repeated logic in conditional checks.
     - Replace Nested Conditional with Guard Clauses: Simplified nested logic in role determination for admins.
*/
namespace TicketManagementSystem_CAA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly tmsContext _context;

        public TestController(tmsContext context)
        {
            _context = context;
        }

        // Consolidate Duplicate Conditional Fragments and Extract Method
        [HttpGet]
        public IActionResult GetUsers() => Ok(GetActiveUsers());

        [HttpGet("{id}")]
        public IActionResult GetUser(int id)
        {
            var user = FindUserById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpDelete("{id}")]
        public IActionResult SoftDeleteUser(int id)
        {
            var user = FindUserById(id);
            if (user == null) return NotFound();

            user.DateDeleted = DateTime.Now;
            _context.SaveChanges(); // Inline Method: SaveChanges logic kept as is for simplicity.
            return NoContent();
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest data)
        {
            if (IsInvalidLoginRequest(data)) // Extract Method
                return BadRequest(new { message = "Email and password are required." });

            var user = GetActiveUserByEmail(data.Email);
            if (user != null && VerifyPasswordHash(data.Password, user.Password))
                return Ok(CreateLoginResponse("user", user.Uid)); // Introduce Parameter Object

            var admin = GetActiveAdminByEmail(data.Email);
            if (admin != null && data.Password == admin.Password)
                return Ok(CreateLoginResponse(GetAdminRole(admin.Role), admin.AId)); // Extract Method

            return Unauthorized(new { message = "Invalid email or password." });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest data)
        {
            if (IsInvalidRegisterRequest(data)) // Extract Method
                return BadRequest(new { message = "Email and password are required." });

            if (IsEmailInUse(data.Email)) // Extract Method
                return BadRequest(new { message = "Email already in use." });

            var user = CreateNewUser(data); // Extract Method
            _context.Users1s.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "Registration successful." });
        }

        // Extract Method
        private bool IsInvalidLoginRequest(LoginRequest data) =>
            string.IsNullOrEmpty(data?.Email) || string.IsNullOrEmpty(data?.Password);

        // Extract Method
        private bool IsInvalidRegisterRequest(RegisterRequest data) =>
            string.IsNullOrEmpty(data?.Email) || string.IsNullOrEmpty(data?.Password);

        // Extract Method
        private bool IsEmailInUse(string email) => _context.Users1s.Any(u => u.Email == email);

        // Replace Method with Method Object
        private Users1 CreateNewUser(RegisterRequest data)
        {
            var hashedPassword = HashPassword(data.Password); // Extract Method for hashing
            return new Users1
            {
                Username = data.Username,
                Email = data.Email,
                Password = hashedPassword,
                Address = data.Address,
                City = data.City,
                Province = data.Province,
                Cnic = data.Cnic,
                Mobileno = data.Mobileno
            };
        }

        // Extract Method
        private Users1 FindUserById(int id) =>
            _context.Users1s.SingleOrDefault(u => u.Uid == id && u.DateDeleted == null);

        // Replace Temp with Query
        private IQueryable<Users1> GetActiveUsers() => _context.Users1s.Where(u => u.DateDeleted == null);

        // Extract Method
        private Users1 GetActiveUserByEmail(string email) =>
            _context.Users1s.FirstOrDefault(u => u.Email == email && u.DateDeleted == null);

        // Extract Method
        private Admin GetActiveAdminByEmail(string email) =>
            _context.Admins.SingleOrDefault(a => a.Email == email && a.DateDeleted == null);

        // Extract Method and Replace Nested Conditional with Guard Clauses
        private string GetAdminRole(string role) => role == "Administrator" ? "super_admin" : "normal_admin";

        // Replace Temp with Query
        private object CreateLoginResponse(string role, int id) => new { message = "Login successful.", role, id };

        // Extract Method
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        // Inline Temp
        public bool VerifyPasswordHash(string password, string storedHash) => HashPassword(password) == storedHash;
    }

    // Refactored data transfer objects remain unchanged.
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Province { get; set; }
        public string Cnic { get; set; }
        public long Mobileno { get; set; }
    }
}
