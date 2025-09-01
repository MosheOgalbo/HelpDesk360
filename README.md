# Incident Management System

[![.NET Core](https://img.shields.io/badge/.NET_Core-8.0-purple.svg)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-18-red.svg)](https://angular.io/)
[![Nginx](https://img.shields.io/badge/Nginx-1.25-green.svg)](https://nginx.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)

## Overview

A modern, containerized incident management system enabling organizations to efficiently handle customer inquiries and generate comprehensive monthly reports with period-over-period analysis.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐
│     Nginx       │────│  .NET Core API   │────│    MySQL     │
│  (Angular SPA)  │    │    (Backend)     │    │  (Database)  │
│   Port: 4200    │    │   Port: 5000     │    │  Port: 3306  │
└─────────────────┘    └──────────────────┘    └──────────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                          ┌──────────────┐
                          │    Docker    │
                          │   Network    │
                          └──────────────┘
```

## Technology Stack

- **Frontend**: Angular 18, Angular Material, TypeScript, RxJS
- **Web Server**: Nginx (serving Angular build, reverse proxy)
- **Backend**: .NET Core 8, Entity Framework Core, MySQL Connector
- **Database**: MySQL 8.0 with optimized stored procedures
- **Infrastructure**: Docker, Docker Compose, Multi-stage builds
- **Development**: Hot reload, Live debugging, Swagger documentation

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd incident-management-system

# Start all services
docker-compose up -d

# View application logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Access Points:**
- **Application**: http://localhost:4200
- **API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/swagger
- **Database**: localhost:3306

## Project Structure

```
incident-management-system/
├── docker-compose.yml              # Container orchestration
├── docker-compose.prod.yml         # Production configuration
├── .env.example                    # Environment variables template
├── frontend/                       # Angular 18 application
│   ├── Dockerfile                  # Multi-stage: build + nginx
│   ├── nginx.conf                  # Nginx configuration
│   ├── README.md                   # Angular-specific documentation
│   ├── src/
│   └── package.json
├── backend/                        # .NET Core 8 API
│   ├── Dockerfile
│   ├── README.md                   # API-specific documentation
│   ├── src/
│   |    ├── IncidentManagement.API/
│   |    |-- HelpDesk360.Tests/
│   └── IncidentManagement.sln
├── database/                       # MySQL configuration
│   ├── init.sql                    # Database initialization
│   ├── README.md                   # Database schema documentation
│   └── stored-procedures/
└── README.md                       # This file
```

## Key Features

### Core Functionality
- **Incident CRUD Operations**: Complete lifecycle management
- **Department Classification**: Organized incident categorization
- **Monthly Reports**: Automated analytics with comparative data
- **Real-time Validation**: Client and server-side validation
- **RESTful Architecture**: Clean API design with comprehensive documentation

### Technical Features
- **Responsive Design**: Mobile-first approach with Material Design
- **Containerized Deployment**: Docker-based infrastructure with Nginx
- **Optimized Serving**: Nginx serving static Angular build with gzip compression
- **Hot Reload Development**: Seamless development experience
- **Database Optimization**: Indexed queries and stored procedures
- **Error Handling**: Comprehensive error management and logging

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Database Configuration
DB_HOST=database
DB_PORT=3306
DB_NAME=incident_management
DB_USER=root
DB_PASSWORD=your_secure_password

# API Configuration
JWT_SECRET=your_jwt_secret_key
API_PORT=5000
CORS_ORIGIN=http://localhost:4200

# Development Settings
ASPNETCORE_ENVIRONMENT=Development
ANGULAR_ENV=development
```

## Docker Services

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| frontend (nginx) | 4200 | Nginx serving Angular build | http://localhost:4200 |
| backend | 5000 | .NET Core API | http://localhost:5000/health |
| database | 3306 | MySQL 8.0 | Internal connection test |

## Development Workflow

### Individual Component Development
Each component contains detailed development documentation:

- **[`frontend/README.md`](./frontend/README.md)** - Angular development, components, services
- **[`backend/README.md`](./backend/README.md)** - API endpoints, authentication, testing
- **[`database/README.md`](./database/README.md)** - Schema, stored procedures, migrations

### Local Development
```bash
# Development with live reload
docker-compose -f docker-compose.yml up --build

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs database

# Execute commands in running containers
docker-compose exec backend dotnet ef migrations add NewMigration
docker-compose exec database mysql -u root -p incident_management
```

## Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with optimized settings
docker-compose -f docker-compose.prod.yml up -d

# Monitor production logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

## API Overview

### Core Endpoints
- `GET/POST /api/incidents` - Incident management
- `GET /api/departments` - Department data
- `GET /api/reports/monthly/{year}/{month}` - Monthly reports
- `GET /health` - Health check endpoint

### Database Schema
- **Incidents Table**: Core incident data with relationships
- **Departments Table**: Department master data
- **Monthly Report SP**: Optimized stored procedure for analytics

## Performance & Optimization

- **Nginx Optimization**: Static file serving with gzip compression and caching
- **Database Indexing**: Optimized queries for large datasets
- **Caching Strategy**: Response caching for frequent queries
- **Container Optimization**: Multi-stage Docker builds (build + serve)
- **Bundle Optimization**: Angular build optimization for production

## Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/new-feature`)
3. **Commit** changes (`git commit -m 'Add new feature'`)
4. **Push** to branch (`git push origin feature/new-feature`)
5. **Open** Pull Request with detailed description

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with modern technologies and best practices**
