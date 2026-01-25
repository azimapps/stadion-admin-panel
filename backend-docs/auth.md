# Admin Authentication API

Base URL: `/api/v1/auth`

---

## Login

**POST** `/login`

### Request

```json
{
  "email": "admin@gmail.com",
  "password": "admin"
}
```

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

### Response (200)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Errors

- **401** - Invalid email or password
- **422** - Validation error

### Using the Token

Include in Authorization header for protected endpoints:

```
Authorization: Bearer {access_token}
```

Token expires in 24 hours.
