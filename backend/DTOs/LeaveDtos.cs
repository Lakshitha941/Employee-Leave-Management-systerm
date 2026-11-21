using System.ComponentModel.DataAnnotations;

namespace LeaveManagement.Api.DTOs
{
    public class ApplyLeaveDto
    {
        [Required]
        public int LeaveTypeId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public string Reason { get; set; } = string.Empty;
    }

    public class LeaveRequestResponseDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public string EmployeeEmail { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;

        public int LeaveTypeId { get; set; }
        public string LeaveTypeName { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int NumberOfDays { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime AppliedOn { get; set; }

        public string? ManagerComment { get; set; }
        public DateTime? ProcessedOn { get; set; }
        public string? ProcessedBy { get; set; }
    }

    public class UpdateLeaveStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty; // "Approved" or "Rejected"
        public string? ManagerComment { get; set; }
    }

    public class LeaveBalanceDto
    {
        public int Annual { get; set; }
        public int Casual { get; set; }
        public int Medical { get; set; }
        public int TotalAvailable => Annual + Casual + Medical;
    }

    public class DashboardStatsDto
    {
        public int TotalEmployees { get; set; }
        public int TotalPendingRequests { get; set; }
        public int TotalApprovedThisMonth { get; set; }
        public int TotalRejectedThisMonth { get; set; }
        public List<LeaveRequestResponseDto> RecentRequests { get; set; } = new();
    }
}
