# API Documentation

## Overview

This document describes the REST API endpoints for A Life Worth Celebrating application.

**Base URL:** `https://a-life-worth-celebrating-cdbfc4980cb4.herokuapp.com/api`
**Local Development:** `http://localhost:3000/api`

## Authentication

Most endpoints require authentication via JWT token. The token can be provided in two ways:

1. **Cookie** (recommended): `token` cookie set by the `/api/auth/login` endpoint
2. **Authorization Header**: `Authorization: Bearer <token>`

### User Roles

- `user` - Standard user (default)
- `admin` - Administrator with elevated privileges
- `superuser` - Super administrator with full access

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "isAdmin": true,
    "isMainAdmin": false
  }
}
```

**Errors:**
- `400 Bad Request` - Invalid email format or missing fields
- `401 Unauthorized` - Invalid credentials
- `429 Too Many Requests` - Rate limit exceeded

---

### POST /api/auth/logout

Log out the current user by clearing the authentication cookie.

**Response:** `204 No Content`

---

### GET /api/auth/me

Get the currently authenticated user's information.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "isAdmin": true,
    "isMainAdmin": false
  }
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated

---

### POST /api/auth/forgot-password

Request a password reset email.

**Rate Limit:** 3 requests per hour per IP

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account exists with that email, a password reset link has been sent."
}
```

**Note:** Always returns success for security (prevents email enumeration)

---

### POST /api/auth/reset-password

Reset password using a token from the forgot-password email.

**Request Body:**
```json
{
  "token": "abc123...",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password has been reset successfully"
}
```

**Errors:**
- `400 Bad Request` - Invalid token, expired token, or weak password
- `400 Bad Request` - Token already used

---

### POST /api/auth/contact

Submit a contact form message.

**Rate Limit:** 5 requests per hour per IP

**Request Body:**


---

### PUT /api/content/:slug

Update content for a specific page section.

**Authentication:** Required (Admin)

**Parameters:**
- `slug` - Content identifier

**Request Body:**
```json
{
  "data": {
    "heroTitle": "New Title",
    "heroSubtitle": "New subtitle..."
  }
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "slug": "home",
  "data": { ... },
  "updated_at": "2024-01-15T11:00:00Z"
}
```

---

## Events Endpoints

### GET /api/events

Get all published events (public endpoint).

**Response (200 OK):**
```json
{
  "events": [
    {
      "id": 1,
      "title": "Community Gathering",
      "date": "2024-02-20",
      "time": "6:00 PM",
      "location": "Community Center",
      "description": "Join us for...",
      "link": "https://example.com/register",
      "image_url": "https://...",
      "is_published": true,
      "display_order": 0,
      "images": [
        {
          "id": 1,
          "image_url": "https://...",
          "display_order": 0
        }
      ]
    }
  ]
}
```

---

### GET /api/admin/events

Get all events including unpublished (admin only).

**Authentication:** Required (Admin)

**Response:** Same as GET /api/events but includes unpublished events

---

### POST /api/events

Create a new event.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "New Event",
  "date": "2024-03-15",
  "time": "7:00 PM",
  "location": "Main Hall",
  "description": "Event description...",
  "link": "https://example.com",
  "imageUrl": "https://...",
  "isPublished": true,
  "displayOrder": 0
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "title": "New Event",
  ...
}
```

---

### PUT /api/events/:id

Update an existing event.

**Authentication:** Required (Admin)

**Parameters:**
- `id` - Event ID

**Request Body:** Same as POST /api/events

**Response (200 OK):** Updated event object

---

### DELETE /api/events/:id

Delete an event and all associated images.

**Authentication:** Required (Admin)

**Parameters:**
- `id` - Event ID

**Response:** `204 No Content`

---

### PUT /api/events/reorder

Batch update event display order.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "updates": [
    { "id": 1, "displayOrder": 0 },
    { "id": 2, "displayOrder": 1 }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Events reordered successfully"
}
```

---

## Image Upload Endpoints

### POST /api/event-image

Upload an image for an event.

**Authentication:** Required (Admin)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` - Image file (max 10MB)
- `eventId` - Event ID

**Response (201 Created):**
```json
{
  "imageUrl": "https://s3.amazonaws.com/..."
}
```

---

### POST /api/board-member-image

Upload an image for a board member.

**Authentication:** Required (Admin)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` - Image file (max 10MB)

**Response (201 Created):**
```json
{
  "imageUrl": "https://s3.amazonaws.com/..."
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API endpoints:** 100 requests per 15 minutes per IP
- **Authentication (login):** 5 requests per 15 minutes per IP
- **Password reset:** 3 requests per hour per IP
- **Contact form:** 5 requests per hour per IP

Rate limit headers are included in responses:
- `RateLimit-Limit` - Maximum requests allowed
- `RateLimit-Remaining` - Requests remaining
- `RateLimit-Reset` - Time when limit resets

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content to return
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Security

### Best Practices

1. **HTTPS Only:** All production requests must use HTTPS
2. **Secure Cookies:** Authentication cookies are httpOnly and secure in production
3. **CORS:** Cross-origin requests are restricted
4. **Rate Limiting:** Prevents brute force and abuse
5. **Input Validation:** All inputs are validated and sanitized
6. **SQL Injection Protection:** Parameterized queries used throughout

### Security Headers

The API includes security headers via Helmet.js:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)

---

## Development

### Running Locally

1. Install dependencies: `npm install`
2. Set up environment variables (see `.env.example`)
3. Start backend: `npm start`
4. Start frontend: `npm run dev`

### Testing

Use tools like Postman, Insomnia, or curl to test endpoints:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get events
curl http://localhost:3000/api/events
```

