using System.ComponentModel.DataAnnotations;

namespace LeaveManagement.Api.Models
{
    public class LeaveRequest
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }

        public int LeaveTypeId { get; set; }
        public LeaveType? LeaveType { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int NumberOfDays { get; set; }

        [Required]
        public string Reason { get; set; } = string.Empty;

        // Pending, Approved, Rejected, Cancelled
        public string Status { get; set; } = "Pending";

        public DateTime AppliedOn { get; set; } = DateTime.UtcNow;

        public string? ManagerComment { get; set; }
        public DateTime? ProcessedOn { get; set; }
        public string? ProcessedBy { get; set; }
    }
}
