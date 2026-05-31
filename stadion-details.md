# Stadium Finance Details

Base URL: `/api/v1/admin/finance`

**Authentication:** All operations require `Authorization: Bearer {token}` (Admin only).

All amounts are in **UZS** (Uzbek so'm).

---

## 1. Get Stadium Finance

**GET** `/stadiums/{stadium_id}?month=3&year=2026`

Returns a complete monthly financial overview for a specific stadium: daily income breakdown (bookings + tournaments), daily expenses, daily profit, and monthly totals.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| month | int | Yes | Month (1–12) |
| year | int | Yes | Year (2024–2030) |

### Response (200)

```json
{
  "stadium_id": 11,
  "stadium_name": "39-maktab stadioni",
  "month": 3,
  "year": 2026,
  "daily": [
    {
      "date": "2026-03-01",
      "income": 500000,
      "booking_income": 400000,
      "tournament_income": 100000,
      "expenses": 50000,
      "profit": 450000
    },
    {
      "date": "2026-03-02",
      "income": 300000,
      "booking_income": 300000,
      "tournament_income": 0,
      "expenses": 0,
      "profit": 300000
    },
    {
      "date": "2026-03-05",
      "income": 0,
      "booking_income": 0,
      "tournament_income": 0,
      "expenses": 120000,
      "profit": -120000
    }
  ],
  "expenses_list": [
    {"id": 1, "date": "2026-03-01", "amount": 30000, "description": "Elektr energiya"},
    {"id": 2, "date": "2026-03-01", "amount": 20000, "description": "Suv"},
    {"id": 3, "date": "2026-03-05", "amount": 120000, "description": "Chim ta'mirlash"}
  ],
  "summary": {
    "total_income": 800000,
    "total_booking_income": 700000,
    "total_tournament_income": 100000,
    "total_expenses": 170000,
    "total_profit": 630000
  }
}
```

### How It Works

- **`booking_income`** — payments from stadium bookings (online + cash)
- **`tournament_income`** — payments from tournament registrations at this stadium
- **`income`** = `booking_income` + `tournament_income`
- **`profit`** = `income` - `expenses` (can be negative)
- `daily` array only contains days that had activity (income or expenses)
- `expenses_list` returns all individual expense entries for the month

### Errors

- **401** — Unauthorized
- **404** — Stadium not found
- **422** — Invalid month/year

---

## 2. Create Expense

**POST** `/expenses`

### Request

```json
{
  "stadium_id": 11,
  "amount": 50000,
  "description": "Elektr energiya",
  "date": "2026-03-01"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| stadium_id | int | Yes | Stadium ID |
| amount | int | Yes | Amount in UZS (must be > 0) |
| description | string | Yes | What the expense is for (max 500 chars) |
| date | date | Yes | Expense date (YYYY-MM-DD) |

### Response (201)

```json
{
  "id": 1,
  "stadium_id": 11,
  "amount": 50000,
  "description": "Elektr energiya",
  "date": "2026-03-01",
  "created_at": "2026-03-01T10:00:00"
}
```

### Errors

- **401** — Unauthorized
- **404** — Stadium not found
- **422** — Validation error

---

## 3. List Expenses

**GET** `/expenses?stadium_id=11&month=3&year=2026`

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| stadium_id | int | Yes | Stadium ID |
| month | int | No | Filter by month (1–12) |
| year | int | No | Filter by year (2024–2030) |

### Response (200)

```json
[
  {
    "id": 1,
    "stadium_id": 11,
    "amount": 50000,
    "description": "Elektr energiya",
    "date": "2026-03-01",
    "created_at": "2026-03-01T10:00:00"
  },
  {
    "id": 2,
    "stadium_id": 11,
    "amount": 20000,
    "description": "Suv",
    "date": "2026-03-01",
    "created_at": "2026-03-01T10:05:00"
  }
]
```

### Errors

- **401** — Unauthorized
- **422** — Validation error

---

## 4. Update Expense

**PUT** `/expenses/{expense_id}`

All fields optional — only send what you want to change.

### Request

```json
{
  "amount": 60000,
  "description": "Elektr energiya (yangilangan)"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | int | No | New amount in UZS |
| description | string | No | New description |
| date | date | No | New date |

### Response (200)

```json
{
  "id": 1,
  "stadium_id": 11,
  "amount": 60000,
  "description": "Elektr energiya (yangilangan)",
  "date": "2026-03-01",
  "created_at": "2026-03-01T10:00:00"
}
```

### Errors

- **401** — Unauthorized
- **404** — Expense not found

---

## 5. Delete Expense

**DELETE** `/expenses/{expense_id}`

Soft delete — expense is not permanently removed.

### Response (200)

```json
{
  "detail": "Expense deleted"
}
```

### Errors

- **401** — Unauthorized
- **404** — Expense not found

---

## 6. Stadium Schedule

**GET** `/stadiums/{stadium_id}/schedule?date=2026-03-01`

Returns all time slots for a stadium on a specific date. Shows who booked each slot, payment status, and available slots.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| date | date | Yes | Date to view (YYYY-MM-DD) |

### Response (200)

```json
{
  "stadium_id": 11,
  "stadium_name": "39-maktab stadioni",
  "date": "2026-03-01",
  "slots": [
    {
      "hour": 6,
      "status": "available"
    },
    {
      "hour": 7,
      "status": "booked",
      "booking": {
        "id": 45,
        "user_name": "Abdulazim",
        "user_phone": "+998901234567",
        "status": "paid",
        "price": 200000,
        "paid_amount": 200000,
        "is_recurring": false
      }
    },
    {
      "hour": 8,
      "status": "booked",
      "booking": {
        "id": 46,
        "user_name": "Jasur",
        "user_phone": "+998907654321",
        "status": "partially_paid",
        "price": 200000,
        "paid_amount": 100000,
        "is_recurring": true
      }
    }
  ]
}
```

### Slot status

| Status | Description |
|--------|-------------|
| `available` | No booking, slot is open |
| `booked` | Someone booked this slot (see `booking` object) |

### Booking status

| Status | Description |
|--------|-------------|
| `in_progress` | Booked, no payment yet |
| `partially_paid` | Some payment received |
| `paid` | Fully paid |

### Errors

- **401** — Unauthorized
- **404** — Stadium not found

---

## 7. Mark Booking as Paid

**PUT** `/bookings/{booking_id}/mark-paid`

Marks a partially paid booking as fully paid. Records the remaining amount as a cash payment. Sends push notification to the user.

### Request

No request body needed.

### Rules

| Current Status | Allowed? | Notes |
|----------------|----------|-------|
| `partially_paid` | Yes | Remaining amount recorded as cash |
| `in_progress` (paid > 0) | Yes | Remaining recorded as cash |
| `in_progress` (paid = 0) | No | Must pay online first |
| `paid` | No | Already fully paid |
| `cancelled` | No | Cannot mark cancelled booking |

### Response (200)

```json
{
  "id": 46,
  "status": "paid",
  "price": 200000,
  "paid_amount": 200000,
  "detail": "Marked as paid. Remaining 100000 UZS recorded as cash."
}
```

### Errors

- **400** — Cannot mark as paid (wrong status or no payment received)
- **401** — Unauthorized
- **404** — Booking not found

---

## 8. Tournament Registrations

**GET** `/tournaments/{tournament_id}/registrations`

Returns all registrations for a tournament, grouped by clubs and solo players.

### Request

No request body needed.

### Response (200)

```json
{
  "tournament_id": 2,
  "tournament_name": "Bahorgi turnir",
  "entrance_fee": 50000,
  "total_registrations": 12,
  "paid_count": 8,
  "pending_count": 3,
  "cancelled_count": 1,
  "clubs": [
    {
      "club_id": 1,
      "club_name": "FC Wolves",
      "members": [
        {"user_id": 10, "fullname": "Abdulazim", "phone": "+998901234567", "status": "paid", "is_creator": true},
        {"user_id": 11, "fullname": "Jasur", "phone": "+998907654321", "status": "paid", "is_creator": false},
        {"user_id": 12, "fullname": null, "phone": "+998901111111", "status": "in_progress", "is_creator": false}
      ]
    }
  ],
  "solo": [
    {"user_id": 30, "fullname": "Karim", "phone": "+998904444444", "status": "paid"},
    {"user_id": 31, "fullname": null, "phone": "+998905555555", "status": "in_progress"}
  ]
}
```

### Response Fields

| Field | Description |
|-------|-------------|
| total_registrations | Total number of registrations |
| paid_count | Registrations with status `paid` |
| pending_count | Registrations with status `in_progress` |
| cancelled_count | Registrations with status `cancelled` |
| clubs | Grouped by club with member list |
| solo | Players registered without a club |

### Member Fields

| Field | Description |
|-------|-------------|
| user_id | User ID |
| fullname | User's name (can be null) |
| phone | Phone number |
| status | `in_progress`, `paid`, or `cancelled` |
| is_creator | Whether this user created the club |

### Errors

- **401** — Unauthorized
- **404** — Tournament not found
