using Microsoft.AspNetCore.Identity;
using LeaveManagement.Api.Models;

namespace LeaveManagement.Api.Data
{
    public static class DbInitializer
    {
        public static async Task SeedDataAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // 1. Seed Roles
            string[] roles = { "Admin", "Manager", "Employee" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // 2. Seed Leave Types
            if (!context.LeaveTypes.Any())
            {
                var leaveTypes = new List<LeaveType>
                {
                    new LeaveType { Name = "Annual Leave", DefaultDays = 14, Description = "Standard paid annual vacation leave" },
                    new LeaveType { Name = "Casual Leave", DefaultDays = 7, Description = "Short-notice personal / family emergency leave" },
                    new LeaveType { Name = "Medical Leave", DefaultDays = 14, Description = "Sick leave supported by doctor recommendations" }
                };
                await context.LeaveTypes.AddRangeAsync(leaveTypes);
                await context.SaveChangesAsync();
            }

            // 3. Seed Users
            // Manager User
            var managerEmail = "manager@company.com";
            var manager = await userManager.FindByEmailAsync(managerEmail);
            if (manager == null)
            {
                manager = new ApplicationUser
                {
                    UserName = managerEmail,
                    Email = managerEmail,
                    FullName = "Kamal Perera",
                    Department = "Engineering",
                    JobTitle = "Engineering Lead",
                    Role = "Manager",
                    EmailConfirmed = true,
                    AnnualLeaveBalance = 14,
                    CasualLeaveBalance = 7,
                    MedicalLeaveBalance = 14
                };
                var result = await userManager.CreateAsync(manager, "Manager@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(manager, "Manager");
                }
            }

            // Employee User 1
            var employeeEmail = "employee@company.com";
            var employee = await userManager.FindByEmailAsync(employeeEmail);
            if (employee == null)
            {
                employee = new ApplicationUser
                {
                    UserName = employeeEmail,
                    Email = employeeEmail,
                    FullName = "Nimal Silva",
                    Department = "Engineering",
                    JobTitle = "Software Engineer",
                    Role = "Employee",
                    EmailConfirmed = true,
                    AnnualLeaveBalance = 11, // already used 3
                    CasualLeaveBalance = 7,
                    MedicalLeaveBalance = 14
                };
                var result = await userManager.CreateAsync(employee, "Employee@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(employee, "Employee");
                }
            }

            // Employee User 2
            var sunilEmail = "sunil@company.com";
            var sunil = await userManager.FindByEmailAsync(sunilEmail);
            if (sunil == null)
            {
                sunil = new ApplicationUser
                {
                    UserName = sunilEmail,
                    Email = sunilEmail,
                    FullName = "Sunil Fernando",
                    Department = "Quality Assurance",
                    JobTitle = "QA Automation Engineer",
                    Role = "Employee",
                    EmailConfirmed = true,
                    AnnualLeaveBalance = 14,
                    CasualLeaveBalance = 5, // used 2
                    MedicalLeaveBalance = 14
                };
                var result = await userManager.CreateAsync(sunil, "Sunil@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(sunil, "Employee");
                }
            }

            // 4. Seed Sample Leave Requests
            if (!context.LeaveRequests.Any())
            {
                var annualType = context.LeaveTypes.FirstOrDefault(t => t.Name == "Annual Leave");
                var casualType = context.LeaveTypes.FirstOrDefault(t => t.Name == "Casual Leave");

                if (employee != null && annualType != null && casualType != null)
                {
                    context.LeaveRequests.AddRange(
                        new LeaveRequest
                        {
                            UserId = employee.Id,
                            LeaveTypeId = annualType.Id,
                            StartDate = DateTime.UtcNow.AddDays(7),
                            EndDate = DateTime.UtcNow.AddDays(10),
                            NumberOfDays = 3,
                            Reason = "Family vacation trip to Nuwara Eliya",
                            Status = "Approved",
                            AppliedOn = DateTime.UtcNow.AddDays(-5),
                            ProcessedOn = DateTime.UtcNow.AddDays(-3),
                            ProcessedBy = "Kamal Perera",
                            ManagerComment = "Approved. Have a great vacation!"
                        },
                        new LeaveRequest
                        {
                            UserId = employee.Id,
                            LeaveTypeId = casualType.Id,
                            StartDate = DateTime.UtcNow.AddDays(2),
                            EndDate = DateTime.UtcNow.AddDays(3),
                            NumberOfDays = 1,
                            Reason = "Personal urgent family commitment",
                            Status = "Pending",
                            AppliedOn = DateTime.UtcNow.AddHours(-6)
                        }
                    );

                    if (sunil != null)
                    {
                        context.LeaveRequests.Add(
                            new LeaveRequest
                            {
                                UserId = sunil.Id,
                                LeaveTypeId = casualType.Id,
                                StartDate = DateTime.UtcNow.AddDays(4),
                                EndDate = DateTime.UtcNow.AddDays(6),
                                NumberOfDays = 2,
                                Reason = "Home renovation and electrical repairs",
                                Status = "Pending",
                                AppliedOn = DateTime.UtcNow.AddHours(-2)
                            }
                        );
                    }

                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
