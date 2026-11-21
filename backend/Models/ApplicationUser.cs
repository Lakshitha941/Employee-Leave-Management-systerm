using Microsoft.AspNetCore.Identity;

namespace LeaveManagement.Api.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee"; // Admin, Manager, Employee

        // Leave Balances (allocated per year)
        public int AnnualLeaveBalance { get; set; } = 14;
        public int CasualLeaveBalance { get; set; } = 7;
        public int MedicalLeaveBalance { get; set; } = 14;

        public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    }
}
