using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeaveManagement.Api.Data;
using LeaveManagement.Api.DTOs;
using LeaveManagement.Api.Models;

namespace LeaveManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LeaveRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public LeaveRequestsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpPost("apply")]
        public async Task<IActionResult> ApplyForLeave([FromBody] ApplyLeaveDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var leaveType = await _context.LeaveTypes.FindAsync(dto.LeaveTypeId);
            if (leaveType == null)
                return BadRequest(new { message = "Invalid leave type selected." });

            if (dto.EndDate.Date < dto.StartDate.Date)
            {
                return BadRequest(new { message = "End date cannot be earlier than Start date." });
            }

            int days = (dto.EndDate.Date - dto.StartDate.Date).Days + 1;
            if (days <= 0)
            {
                return BadRequest(new { message = "Invalid duration. At least 1 day required." });
            }

            // Check Leave Balance
            int currentBalance = leaveType.Name switch
            {
                "Annual Leave" => user.AnnualLeaveBalance,
                "Casual Leave" => user.CasualLeaveBalance,
                "Medical Leave" => user.MedicalLeaveBalance,
                _ => 0
            };

            if (days > currentBalance)
            {
                return BadRequest(new
                {
                    message = $"Insufficient {leaveType.Name} balance. You requested {days} days, but only {currentBalance} days are available."
                });
            }

            var request = new LeaveRequest
            {
                UserId = userId,
                LeaveTypeId = dto.LeaveTypeId,
                StartDate = dto.StartDate.Date,
                EndDate = dto.EndDate.Date,
                NumberOfDays = days,
                Reason = dto.Reason,
                Status = "Pending",
                AppliedOn = DateTime.UtcNow
            };

            _context.LeaveRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Leave application submitted successfully.", requestId = request.Id });
        }

        [HttpGet("my-leaves")]
        public async Task<ActionResult<IEnumerable<LeaveRequestResponseDto>>> GetMyLeaves()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var leaves = await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.AppliedOn)
                .Select(r => new LeaveRequestResponseDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    EmployeeName = r.User != null ? r.User.FullName : "Unknown",
                    EmployeeEmail = r.User != null ? (r.User.Email ?? "") : "",
                    Department = r.User != null ? r.User.Department : "",
                    JobTitle = r.User != null ? r.User.JobTitle : "",
                    LeaveTypeId = r.LeaveTypeId,
                    LeaveTypeName = r.LeaveType != null ? r.LeaveType.Name : "General",
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    NumberOfDays = r.NumberOfDays,
                    Reason = r.Reason,
                    Status = r.Status,
                    AppliedOn = r.AppliedOn,
                    ManagerComment = r.ManagerComment,
                    ProcessedOn = r.ProcessedOn,
                    ProcessedBy = r.ProcessedBy
                })
                .ToListAsync();

            return Ok(leaves);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<ActionResult<IEnumerable<LeaveRequestResponseDto>>> GetAllLeaves()
        {
            var leaves = await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .OrderByDescending(r => r.AppliedOn)
                .Select(r => new LeaveRequestResponseDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    EmployeeName = r.User != null ? r.User.FullName : "Unknown",
                    EmployeeEmail = r.User != null ? (r.User.Email ?? "") : "",
                    Department = r.User != null ? r.User.Department : "",
                    JobTitle = r.User != null ? r.User.JobTitle : "",
                    LeaveTypeId = r.LeaveTypeId,
                    LeaveTypeName = r.LeaveType != null ? r.LeaveType.Name : "General",
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    NumberOfDays = r.NumberOfDays,
                    Reason = r.Reason,
                    Status = r.Status,
                    AppliedOn = r.AppliedOn,
                    ManagerComment = r.ManagerComment,
                    ProcessedOn = r.ProcessedOn,
                    ProcessedBy = r.ProcessedBy
                })
                .ToListAsync();

            return Ok(leaves);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<ActionResult<IEnumerable<LeaveRequestResponseDto>>> GetPendingLeaves()
        {
            var leaves = await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .Where(r => r.Status == "Pending")
                .OrderByDescending(r => r.AppliedOn)
                .Select(r => new LeaveRequestResponseDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    EmployeeName = r.User != null ? r.User.FullName : "Unknown",
                    EmployeeEmail = r.User != null ? (r.User.Email ?? "") : "",
                    Department = r.User != null ? r.User.Department : "",
                    JobTitle = r.User != null ? r.User.JobTitle : "",
                    LeaveTypeId = r.LeaveTypeId,
                    LeaveTypeName = r.LeaveType != null ? r.LeaveType.Name : "General",
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    NumberOfDays = r.NumberOfDays,
                    Reason = r.Reason,
                    Status = r.Status,
                    AppliedOn = r.AppliedOn,
                    ManagerComment = r.ManagerComment,
                    ProcessedOn = r.ProcessedOn,
                    ProcessedBy = r.ProcessedBy
                })
                .ToListAsync();

            return Ok(leaves);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateLeaveStatus(int id, [FromBody] UpdateLeaveStatusDto dto)
        {
            if (dto.Status != "Approved" && dto.Status != "Rejected")
            {
                return BadRequest(new { message = "Status must be either 'Approved' or 'Rejected'." });
            }

            var request = await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (request == null)
                return NotFound(new { message = "Leave request not found." });

            if (request.Status != "Pending")
            {
                return BadRequest(new { message = $"Cannot modify request that has already been {request.Status}." });
            }

            var managerName = User.FindFirstValue(ClaimTypes.Name) ?? "Manager";

            request.Status = dto.Status;
            request.ManagerComment = dto.ManagerComment;
            request.ProcessedOn = DateTime.UtcNow;
            request.ProcessedBy = managerName;

            // If approved, deduct leave balance
            if (dto.Status == "Approved" && request.User != null && request.LeaveType != null)
            {
                switch (request.LeaveType.Name)
                {
                    case "Annual Leave":
                        request.User.AnnualLeaveBalance = Math.Max(0, request.User.AnnualLeaveBalance - request.NumberOfDays);
                        break;
                    case "Casual Leave":
                        request.User.CasualLeaveBalance = Math.Max(0, request.User.CasualLeaveBalance - request.NumberOfDays);
                        break;
                    case "Medical Leave":
                        request.User.MedicalLeaveBalance = Math.Max(0, request.User.MedicalLeaveBalance - request.NumberOfDays);
                        break;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Leave request has been {dto.Status.ToLower()} successfully." });
        }

        [HttpGet("balance")]
        public async Task<ActionResult<LeaveBalanceDto>> GetMyBalance()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound();

            return Ok(new LeaveBalanceDto
            {
                Annual = user.AnnualLeaveBalance,
                Casual = user.CasualLeaveBalance,
                Medical = user.MedicalLeaveBalance
            });
        }

        [HttpDelete("{id}/cancel")]
        public async Task<IActionResult> CancelLeave(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var request = await _context.LeaveRequests.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

            if (request == null)
                return NotFound(new { message = "Leave request not found." });

            if (request.Status != "Pending")
            {
                return BadRequest(new { message = "Only pending leave requests can be cancelled." });
            }

            request.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Leave request cancelled successfully." });
        }
    }
}
