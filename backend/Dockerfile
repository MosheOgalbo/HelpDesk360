# שלב build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# העתק את csproj לפני ה-Restore
COPY ./HelpDesk360.API/HelpDesk360.API.csproj ./
RUN dotnet restore

# העתק את שאר הקבצים
COPY ./HelpDesk360.API/ ./
RUN dotnet publish -c Release -o /app

# שלב runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "HelpDesk360.API.dll"]
