using Microsoft.AspNetCore.Mvc;
using HelpDesk360.API.DTOs;
using HelpDesk360.API.Services;

namespace HelpDesk360.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RequestsController : ControllerBase
    {
        private readonly IRequestService _requestService;
        private readonly ILogger<RequestsController> _logger;

        public RequestsController(IRequestService requestService, ILogger<RequestsController> logger)
        {
            _requestService = requestService;
            _logger = logger;
        }

        /// <summary>
        /// Get all requests
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RequestDto>>> GetAllRequests()
        {
            try
            {
                var requests = await _requestService.GetAllRequestsAsync();
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all requests");
                return StatusCode(500, "An error occurred while retrieving requests");
            }
        }

        /// <summary>
        /// Get request by ID
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<RequestDto>> GetRequest(int id)
        {
            try
            {
                var request = await _requestService.GetRequestByIdAsync(id);
                if (request == null)
                {
                    return NotFound($"Request with ID {id} not found");
                }
                return Ok(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving request with ID {RequestId}", id);
                return StatusCode(500, "An error occurred while retrieving the request");
            }
        }

        /// <summary>
        /// Create a new request
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<RequestDto>> CreateRequest([FromBody] CreateRequestDto createRequestDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var request = await _requestService.CreateRequestAsync(createRequestDto);
                return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating new request");
                return StatusCode(500, "An error occurred while creating the request");
            }
        }

        /// <summary>
        /// Update an existing request
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<ActionResult<RequestDto>> UpdateRequest(int id, [FromBody] UpdateRequestDto updateRequestDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedRequest = await _requestService.UpdateRequestAsync(id, updateRequestDto);
                if (updatedRequest == null)
                {
                    return NotFound($"Request with ID {id} not found");
                }

                return Ok(updatedRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating request with ID {RequestId}", id);
                return StatusCode(500, "An error occurred while updating the request");
            }
        }

        /// <summary>
        /// Delete a request
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            try
            {
                var result = await _requestService.DeleteRequestAsync(id);
                if (!result)
                {
                    return NotFound($"Request with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting request with ID {RequestId}", id);
                return StatusCode(500, "An error occurred while deleting the request");
            }
        }

        /// <summary>
        /// Get requests by status
        /// </summary>
        [HttpGet("status/{status:int}")]
        public async Task<ActionResult<IEnumerable<RequestDto>>> GetRequestsByStatus(int status)
        {
            try
            {
                if (status < 1 || status > 4)
                {
                    return BadRequest("Status must be between 1 and 4");
                }

                var requests = await _requestService.GetRequestsByStatusAsync(status);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving requests with status {Status}", status);
                return StatusCode(500, "An error occurred while retrieving requests");
            }
        }

        /// <summary>
        /// Get requests by department
        /// </summary>
        [HttpGet("department/{departmentId:int}")]
        public async Task<ActionResult<IEnumerable<RequestDto>>> GetRequestsByDepartment(int departmentId)
        {
            try
            {
                var requests = await _requestService.GetRequestsByDepartmentAsync(departmentId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving requests for department {DepartmentId}", departmentId);
                return StatusCode(500, "An error occurred while retrieving requests");
            }
        }
    }
}
