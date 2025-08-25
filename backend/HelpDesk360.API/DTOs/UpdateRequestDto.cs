
using FluentValidation;

namespace HelpDesk360.API.DTOs;

public class UpdateRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Open";
    public string Priority { get; set; } = "Medium";
    public List<int> DepartmentIds { get; set; } = new();
}

public class UpdateRequestDtoValidator : AbstractValidator<UpdateRequestDto>
{
    public UpdateRequestDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required")
            .Matches(@"^[\+]?[1-9][\d]{0,15}$").WithMessage("Invalid phone number format");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MinimumLength(10).WithMessage("Description must be at least 10 characters");

        RuleFor(x => x.Status)
            .Must(status => new[] { "Open", "In Progress", "Resolved", "Closed", "Cancelled" }.Contains(status))
            .WithMessage("Status must be Open, In Progress, Resolved, Closed, or Cancelled");

        RuleFor(x => x.Priority)
            .Must(priority => new[] { "Low", "Medium", "High", "Critical" }.Contains(priority))
            .WithMessage("Priority must be Low, Medium, High, or Critical");

        RuleFor(x => x.DepartmentIds)
            .Must(ids => ids != null && ids.Any())
            .WithMessage("At least one department must be selected");
    }
}
