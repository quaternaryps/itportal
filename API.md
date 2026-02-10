# IT Portal API Reference

Base URL: `http://localhost:8000`

## Authentication

Currently, the API does not require authentication. For production use, implement proper authentication and authorization.

## Endpoints

### Health Check

Check the health status of the API and database connection.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-10T20:00:00.000Z",
  "database": "connected"
}
```

**Status Codes:**
- `200 OK` - Service is healthy

---

### Get All Portal Items

Retrieve all portal items from the database.

**Endpoint:** `GET /api/items`

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

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Database error
- `503 Service Unavailable` - Database not connected

---

### Get Single Portal Item

Retrieve a specific portal item by ID.

**Endpoint:** `GET /api/items/:id`

**Parameters:**
- `id` (path parameter) - The ID of the item to retrieve

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

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Item not found
- `500 Internal Server Error` - Database error
- `503 Service Unavailable` - Database not connected

---

### Create Portal Item

Create a new portal item.

**Endpoint:** `POST /api/items`

**Request Body:**
```json
{
  "title": "New Item",
  "description": "Item description",
  "category": "Category"
}
```

**Required Fields:**
- `title` (string) - The title of the item

**Optional Fields:**
- `description` (string) - The description of the item
- `category` (string) - The category of the item

**Response:**
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

**Status Codes:**
- `201 Created` - Item created successfully
- `400 Bad Request` - Missing required fields
- `500 Internal Server Error` - Database error
- `503 Service Unavailable` - Database not connected

---

### Update Portal Item

Update an existing portal item.

**Endpoint:** `PUT /api/items/:id`

**Parameters:**
- `id` (path parameter) - The ID of the item to update

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "Updated Category"
}
```

**Optional Fields:**
All fields are optional. Only provided fields will be updated.
- `title` (string) - The new title
- `description` (string) - The new description
- `category` (string) - The new category

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
    "updated_at": "2026-02-10T20:01:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Item updated successfully
- `404 Not Found` - Item not found
- `500 Internal Server Error` - Database error
- `503 Service Unavailable` - Database not connected

---

### Delete Portal Item

Delete a portal item by ID.

**Endpoint:** `DELETE /api/items/:id`

**Parameters:**
- `id` (path parameter) - The ID of the item to delete

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Item deleted successfully
- `404 Not Found` - Item not found
- `500 Internal Server Error` - Database error
- `503 Service Unavailable` - Database not connected

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

## CORS

CORS is enabled for all origins in development mode. For production, configure the allowed origins in `backend/src/main.ts`.

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, implement appropriate rate limiting.

## Examples

### cURL Examples

```bash
# Get all items
curl http://localhost:8000/api/items

# Get a specific item
curl http://localhost:8000/api/items/1

# Create a new item
curl -X POST http://localhost:8000/api/items \
  -H "Content-Type: application/json" \
  -d '{"title":"My Item","description":"Description","category":"General"}'

# Update an item
curl -X PUT http://localhost:8000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Delete an item
curl -X DELETE http://localhost:8000/api/items/1
```

### JavaScript/TypeScript Examples

```typescript
// Fetch all items
const response = await fetch('http://localhost:8000/api/items');
const data = await response.json();

// Create a new item
const response = await fetch('http://localhost:8000/api/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'My Item',
    description: 'Description',
    category: 'General',
  }),
});
const data = await response.json();

// Update an item
const response = await fetch('http://localhost:8000/api/items/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Updated Title',
  }),
});
const data = await response.json();

// Delete an item
const response = await fetch('http://localhost:8000/api/items/1', {
  method: 'DELETE',
});
const data = await response.json();
```
