FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["HelpDesk360.API/HelpDesk360.API.csproj", "HelpDesk360.API/"]
RUN dotnet restore "./HelpDesk360.API/HelpDesk360.API.csproj"
COPY . .
WORKDIR "/src/HelpDesk360.API"
RUN dotnet build "./HelpDesk360.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./HelpDesk360.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HelpDesk360.API.dll"]
