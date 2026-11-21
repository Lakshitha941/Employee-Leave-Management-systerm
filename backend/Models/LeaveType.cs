namespace LeaveManagement.Api.Models
{
    public class LeaveType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // e.g. "Annual Leave", "Casual Leave", "Medical Leave"
        public int DefaultDays { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
