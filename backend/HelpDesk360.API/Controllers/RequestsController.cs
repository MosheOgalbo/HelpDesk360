
using Microsoft.AspNetCore.Mvc;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Services.Interfaces;
using FluentValidation;

namespace HelpDesk360.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class RequestsController : ControllerBase
{
    private readonly IRequestService _requestService;
    private readonly IValidator<CreateRequestDto> _createValidator;
    private readonly IValidator<UpdateRequestDto> _updateValidator;
    private readonly ILogger<RequestsController> _logger;

    public RequestsController(
        IRequestService requestService,
        IValidator<CreateRequestDto> createValidator,
        IValidator<UpdateRequestDto> updateValidator,
        ILogger<RequestsController> logger)
    {
        _requestService = requestService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _logger = logger;
    }

    /// <summary>
    /// Get all requests with pagination
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 10, max: 100)</param>
    /// <returns>List of requests</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RequestResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<RequestResponseDto>>> GetAllRequests(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1)
        {
            return BadRequest("Page must be greater than 0");
        }

        if (pageSize < 1 || pageSize > 100)
        {
            return BadRequest("PageSize must be between 1 and 100");
        }

        var requests = await _requestService.GetAllRequestsAsync(page, pageSize);
        var totalCount = await _requestService.GetTotalRequestsCountAsync();

        Response.Headers.Add("X-Total-Count", totalCount.ToString());
        Response.Headers.Add("X-Page", page.ToString());
        Response.Headers.Add("X-PageSize", pageSize.ToString());

        return Ok(requests);
    }

    /// <summary>
    /// Get a specific request by ID
    /// </summary>
    /// <param name="id">Request ID</param>
    /// <returns>Request details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(RequestResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RequestResponseDto>> GetRequest(int id)
    {
        var request = await _requestService.GetRequestByIdAsync(id);

        if (request == null)
        {
            return NotFound($"Request with ID {id} not found");
        }

        return Ok(request);
    }

    /// <summary>
    /// Create a new request
    /// </summary>
    /// <param name="createRequestDto">Request data</param>
    /// <returns>Created request</returns>
    [HttpPost]
    [ProducesResponseType(typeof(RequestResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RequestResponseDto>> CreateRequest(CreateRequestDto createRequestDto)
    {
        var validationResult = await _createValidator.ValidateAsync(createRequestDto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        try
        {
            var request = await _requestService.CreateRequestAsync(createRequestDto);

            _logger.LogInformation("Request created with ID: {RequestId}", request.Id);

            return CreatedAtAction(
                nameof(GetRequest),
                new { id = request.Id },
                request);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Update an existing request
    /// </summary>
    /// <param name="id">Request ID</param>
    /// <param name="updateRequestDto">Updated request data</param>
    /// <returns>Updated request</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(RequestResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RequestResponseDto>> UpdateRequest(int id, UpdateRequestDto updateRequestDto)
    {
        var validationResult = await _updateValidator.ValidateAsync(updateRequestDto);
        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        try
        {
            var request = await _requestService.UpdateRequestAsync(id, updateRequestDto);

            if (request == null)
            {
                return NotFound($"Request with ID {id} not found");
            }

            _logger.LogInformation("Request updated with ID: {RequestId}", request.Id);

            return Ok(request);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Delete a request
    /// </summary>
    /// <param name="id">Request ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteRequest(int id)
    {
        var result = await _requestService.DeleteRequestAsync(id);

        if (!result)
        {
            return NotFound($"Request with ID {id} not found");
        }

        _logger.LogInformation("Request deleted with ID: {RequestId}", id);

        return NoContent();
    }

    /// <summary>
    /// Search requests by term
    /// </summary>
    /// <param name="term">Search term</param>
    /// <returns>Matching requests</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<RequestResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<RequestResponseDto>>> SearchRequests([FromQuery] string term)
    {
        if (string.IsNullOrWhiteSpace(term))
        {
            return BadRequest("Search term cannot be empty");
        }

        var requests = await _requestService.SearchRequestsAsync(term);
        return Ok(requests);
    }
}
