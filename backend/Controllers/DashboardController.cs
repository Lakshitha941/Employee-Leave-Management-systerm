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
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public DashboardController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetStats()
        {
            var totalEmployees = await _userManager.Users.CountAsync();
            var totalPending = await _context.LeaveRequests.CountAsync(r => r.Status == "Pending");

            var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var totalApprovedThisMonth = await _context.LeaveRequests.CountAsync(r => r.Status == "Approved" && r.ProcessedOn >= startOfMonth);
            var totalRejectedThisMonth = await _context.LeaveRequests.CountAsync(r => r.Status == "Rejected" && r.ProcessedOn >= startOfMonth);

            var recentRequests = await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .OrderByDescending(r => r.AppliedOn)
                .Take(5)
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

            return Ok(new DashboardStatsDto
            {
                TotalEmployees = totalEmployees,
                TotalPendingRequests = totalPending,
                TotalApprovedThisMonth = totalApprovedThisMonth,
                TotalRejectedThisMonth = totalRejectedThisMonth,
                RecentRequests = recentRequests
            });
        }
    }
}
