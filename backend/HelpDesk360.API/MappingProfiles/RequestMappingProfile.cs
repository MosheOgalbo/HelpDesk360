
using AutoMapper;
using HelpDesk360.API.Models;
using HelpDesk360.API.DTOs;

namespace HelpDesk360.API.MappingProfiles;

public class RequestMappingProfile : Profile
{
    public RequestMappingProfile()
    {
        CreateMap<CreateRequestDto, Request>()
            .ForMember(dest => dest.Departments, opt => opt.Ignore());

        CreateMap<UpdateRequestDto, Request>()
            .ForMember(dest => dest.Departments, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        CreateMap<Request, RequestResponseDto>();

        CreateMap<Department, DepartmentResponseDto>();
    }
}
