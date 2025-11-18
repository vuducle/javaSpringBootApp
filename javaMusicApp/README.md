# JavaMusicApp

This README documents how to run and use the JavaMusicApp API, including authentication, the ToDo create endpoint and Swagger access.

## Run the application

From the `javaMusicApp` folder:

```bash
./gradlew bootRun
```

The server starts on port `8088` by default.

## Swagger / OpenAPI UI

Open the API docs in your browser:

- Swagger UI: `http://localhost:8088/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8088/v3/api-docs`

The Swagger UI supports Bearer JWT authentication via the `Authorize` button (configured in `OpenApiConfig`).

## Authentication flow

1. Register a user

POST `/api/auth/register`

Request body (example):

```json
{
  "username": "julianguyen",
  "email": "julianguyen@example.com",
  "password": "secret123"
}
```

2. Login

POST `/api/auth/login`

Request body (example):

```json
{
  "username": "julianguyen",
  "password": "secret123"
}
```

Response contains `accessToken` (JWT) and `refreshToken`.

Use the `accessToken` as a Bearer token for protected endpoints:

```
Authorization: Bearer <ACCESS_TOKEN>
```

## Create ToDo (POST /api/todos)

This endpoint accepts a safe DTO so clients cannot set `id` or `user` directly.

Request (JSON):

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "NEW"
}
```

Headers:

```
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

Successful response (201 Created):

```json
{
  "id": "8072240b-04dd-46ce-b36a-5ed7a35c60d7",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "NEW",
  "userId": "f8fa54ac-6ed6-422e-a544-e0f8803f908f",
  "username": "julianguyen"
}
```

Notes:

- The controller returns a `ToDoResponse` DTO (no nested `User` object) to avoid circular JSON serialization and to avoid leaking sensitive fields like `password`.
- If you need more fields in responses, create response DTOs that explicitly list allowed fields.

## Rate limiting

A simple rate limiter runs in `RateLimitFilter`.

- Default: 100 requests per minute per client IP (local fixed-window fallback). You can configure this behavior by editing the filter.
- Swagger UI and OpenAPI JSON endpoints are excluded from rate limiting so documentation can load reliably.

## Troubleshooting

- "Can't parse JSON" / infinite payload: this was caused by circular entity references. The API now returns `ToDoResponse` DTOs to prevent that.
- If you see authentication errors, ensure you pass a valid Bearer token.

## Swagger details for ToDo endpoints

The ToDo endpoints are annotated with OpenAPI/Swagger annotations so the generated documentation shows:

- The `CreateToDoRequest` schema (fields, descriptions, examples).
- The `ToDoResponse` schema returned by `POST /api/todos` (no nested `User` object; contains `userId` and `username`).

Use the Swagger UI `Authorize` button to provide a Bearer token, then try the `POST /api/todos` example directly from the UI — request and response schemas will be shown inline.

## List current user's ToDos (GET /api/todos/me)

Returns the list of todos belonging to the authenticated user.

Request:

```
GET /api/todos/me
Authorization: Bearer <ACCESS_TOKEN>
```

Response (200 OK):

```json
[
  {
    "id": "8072240b-04dd-46ce-b36a-5ed7a35c60d7",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "NEW",
    "userId": "f8fa54ac-6ed6-422e-a544-e0f8803f908f",
    "username": "julianguyen"
  }
]
```

Notes:

- This endpoint fetches todos for the current authenticated user and returns them as `ToDoResponse` objects.
- If no Bearer token is supplied, the endpoint responds with `401 Unauthorized`.
