FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# נעתיק את ה-sln ואת ה-csproj
COPY backend/HelpDesk360.sln ./
COPY backend/HelpDesk360.API/HelpDesk360.API.csproj HelpDesk360.API/
COPY backend/HelpDesk360.Tests/HelpDesk360.Tests.csproj HelpDesk360.Tests/

# שחזור חבילות NuGet
RUN dotnet restore "HelpDesk360.sln"

# נעתיק את שאר הקוד של backend
COPY backend/ ./

# בניית כל ה-solution
RUN dotnet build "HelpDesk360.sln" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
WORKDIR /src/HelpDesk360.API
RUN dotnet publish "HelpDesk360.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HelpDesk360.API.dll"]
