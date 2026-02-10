# IT Portal

IT Architectural Portal for Agentic Management

A modern, containerized web portal built with Next.js, Deno, PostgreSQL, and Docker Compose.

## 🏗️ Architecture

This project consists of three main components running in Docker containers:

- **Frontend**: Next.js 16 with TypeScript and Tailwind CSS
- **Backend**: Deno-based REST API with TypeScript
- **Database**: PostgreSQL 17 for data persistence

## 🚀 Quick Start

### Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

### Running the Application

1. Clone the repository:
```bash
git clone https://github.com/quaternaryps/itportal.git
cd itportal
```

2. Start all services using Docker Compose:
```bash
docker-compose up --build
```

3. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **Database**: localhost:5432

### Stopping the Application

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

## 📁 Project Structure

```
itportal/
├── frontend/               # Next.js frontend application
│   ├── app/               # Next.js app directory
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── backend/               # Deno backend API
│   ├── src/
│   │   └── main.ts       # Main API server
│   ├── config/
│   │   └── init.sql      # Database initialization
│   └── deno.json         # Deno configuration
├── docker-compose.yml     # Docker Compose orchestration
├── Dockerfile.frontend    # Frontend container definition
├── Dockerfile.backend     # Backend container definition
└── README.md             # This file
```

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend Development

```bash
cd backend
deno task dev
```

The backend API will be available at http://localhost:8000

### Environment Variables

Copy the example environment files and customize as needed:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Check backend service health

### Portal Items
- `GET /api/items` - Get all portal items
- `GET /api/items/:id` - Get a specific item
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item

### Example API Request

```bash
# Get all items
curl http://localhost:8000/api/items

# Create a new item
curl -X POST http://localhost:8000/api/items \
  -H "Content-Type: application/json" \
  -d '{"title":"New Item","description":"Description","category":"General"}'
```

## 🗄️ Database

The PostgreSQL database is automatically initialized with:
- `portal_items` table with indexes
- Sample data for testing

Connect to the database:
```bash
docker-compose exec postgres psql -U postgres -d itportal
```

## 🐳 Docker Commands

### Build and start all services
```bash
docker-compose up --build
```

### Start services in detached mode
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Restart a specific service
```bash
docker-compose restart frontend
docker-compose restart backend
docker-compose restart postgres
```

### Execute commands in containers
```bash
docker-compose exec backend deno task dev
docker-compose exec postgres psql -U postgres -d itportal
```

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 16 with React
- **Styling**: Tailwind CSS
- **Backend Runtime**: Deno 2.1.9
- **Backend Framework**: Oak (Deno web framework)
- **Database**: PostgreSQL 17
- **Containerization**: Docker & Docker Compose
- **Language**: TypeScript

## 📝 Features

- ✅ Fully containerized with Docker Compose
- ✅ Modern Next.js frontend with server-side rendering
- ✅ RESTful API built with Deno and Oak
- ✅ PostgreSQL database with automatic initialization
- ✅ TypeScript throughout the stack
- ✅ Tailwind CSS for responsive design
- ✅ Health check endpoints
- ✅ CORS enabled for development
- ✅ Hot reload for development
- ✅ Production-ready Docker configurations

## 🔒 Security Notes

For production deployment:
- Change default database credentials
- Configure CORS to allow only specific origins
- Use environment variables for sensitive data
- Enable HTTPS/SSL
- Implement authentication and authorization
- Regular security updates for dependencies

## 📄 License

This project is part of the Quaternary PS IT Portal system.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

