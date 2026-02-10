# IT Portal Backend

Deno-based REST API for the IT Portal application.

## Technology Stack

- **Runtime**: Deno 2.1.9
- **Framework**: Oak (Deno web framework)
- **Database**: PostgreSQL via deno-postgres
- **Language**: TypeScript

## Development

### Prerequisites

- Deno 2.x installed locally (for development without Docker)
- PostgreSQL database running (or use Docker Compose)

### Running Locally

```bash
# Development mode with auto-reload
deno task dev

# Production mode
deno task start
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itportal
DB_USER=postgres
DB_PASSWORD=postgres
```

## API Documentation

### Health Check

**GET** `/health`

Returns the health status of the backend service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-10T20:00:00.000Z",
  "database": "connected"
}
```

### Portal Items

#### Get All Items

**GET** `/api/items`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Item Title",
      "description": "Item description",
      "category": "Category",
      "created_at": "2026-02-10T20:00:00.000Z",
      "updated_at": "2026-02-10T20:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### Get Single Item

**GET** `/api/items/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Item Title",
    "description": "Item description",
    "category": "Category",
    "created_at": "2026-02-10T20:00:00.000Z",
    "updated_at": "2026-02-10T20:00:00.000Z"
  }
}
```

#### Create Item

**POST** `/api/items`

**Request Body:**
```json
{
  "title": "New Item",
  "description": "Item description",
  "category": "Category"
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "New Item",
    "description": "Item description",
    "category": "Category",
    "created_at": "2026-02-10T20:00:00.000Z",
    "updated_at": "2026-02-10T20:00:00.000Z"
  }
}
```

#### Update Item

**PUT** `/api/items/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "Updated Category"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "description": "Updated description",
    "category": "Updated Category",
    "created_at": "2026-02-10T20:00:00.000Z",
    "updated_at": "2026-02-10T20:00:00.000Z"
  }
}
```

#### Delete Item

**DELETE** `/api/items/:id`

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

## Database Schema

### portal_items Table

| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| id          | SERIAL       | Primary key                    |
| title       | VARCHAR(255) | Item title (required)          |
| description | TEXT         | Item description               |
| category    | VARCHAR(100) | Item category                  |
| created_at  | TIMESTAMP    | Creation timestamp             |
| updated_at  | TIMESTAMP    | Last update timestamp          |

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (database not connected)

## CORS Configuration

CORS is enabled for all origins in development. For production, update the CORS configuration in `main.ts` to specify allowed origins.

## Dependencies

All dependencies are imported from deno.land and cached automatically:

- `oak` - Web framework
- `cors` - CORS middleware
- `postgres` - PostgreSQL client

No `package.json` or `node_modules` required!
