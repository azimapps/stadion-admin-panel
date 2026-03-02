# Finance API

Base URL: `/api/v1/admin/finance`

Stadium-level financial data: income (from bookings + tournaments), expenses, daily schedule, and payment management. Admin auth required.

---

## Stadium Finance

**GET** `/stadiums/{stadium_id}?month=3&year=2026`

Returns daily income, expenses, profit, and expense list for a stadium in the given month.

**Auth:** Admin Bearer token required

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| month | int | Yes | Month number (1-12) |
| year | int | Yes | Year (2024-2030) |

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
    }
  ],
  "expenses_list": [
    {"id": 1, "date": "2026-03-01", "amount": 30000, "description": "Elektr energiya"},
    {"id": 2, "date": "2026-03-01", "amount": 20000, "description": "Suv"}
  ],
  "summary": {
    "total_income": 800000,
    "total_booking_income": 700000,
    "total_tournament_income": 100000,
    "total_expenses": 50000,
    "total_profit": 750000
  }
}
```

### Response Fields

**daily** — one entry per day that had income or expenses:

| Field | Description |
|-------|-------------|
| date | Date string (YYYY-MM-DD) |
| income | Total income that day (UZS) |
| booking_income | Income from stadium bookings (UZS) |
| tournament_income | Income from tournaments at this stadium (UZS) |
| expenses | Total expenses that day (UZS) |
| profit | income - expenses (UZS) |

**expenses_list** — all individual expense entries for the month

**summary** — totals for the entire month

### Errors

- **401** — Invalid or missing token
- **403** — Not an admin
- **404** — Stadium not found
- **422** — Invalid month/year

---

## Create Expense

**POST** `/expenses`

**Auth:** Admin Bearer token required

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

- **404** — Stadium not found
- **422** — Validation error

---

## List Expenses

**GET** `/expenses?stadium_id=11&month=3&year=2026`

**Auth:** Admin Bearer token required

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| stadium_id | int | Yes | Stadium ID |
| month | int | No | Filter by month (1-12) |
| year | int | No | Filter by year (2024-2030) |

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
  }
]
```

---

## Update Expense

**PUT** `/expenses/{expense_id}`

**Auth:** Admin Bearer token required

### Request

All fields optional — only send what you want to change:

```json
{
  "amount": 60000,
  "description": "Elektr energiya (yangilangan)"
}
```

### Response (200)

Updated expense object.

### Errors

- **404** — Expense not found

---

## Delete Expense

**DELETE** `/expenses/{expense_id}`

Soft delete.

**Auth:** Admin Bearer token required

### Response (200)

```json
{"detail": "Expense deleted"}
```

### Errors

- **404** — Expense not found

---

## Stadium Schedule

**GET** `/stadiums/{stadium_id}/schedule?date=2026-03-01`

Returns all time slots for a stadium on a specific date. Shows who booked each slot, payment status, and available slots.

**Auth:** Admin Bearer token required

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

### Slot status values

| Status | Description |
|--------|-------------|
| `available` | No booking, slot is open |
| `booked` | Someone booked this slot (see `booking` object for details) |

### Booking status values

| Status | Description | Can mark paid? |
|--------|-------------|----------------|
| `in_progress` | Booked, no payment yet | No |
| `partially_paid` | Some payment received | Yes |
| `paid` | Fully paid | No |

### Errors

- **404** — Stadium not found

---

## Mark Booking as Paid

**PUT** `/bookings/{booking_id}/mark-paid`

Marks a partially paid booking as fully paid. Records the remaining amount as a cash payment. Sends push notification to the user.

**Auth:** Admin Bearer token required

### Rules

- `partially_paid` → allowed (remaining amount recorded as cash)
- `in_progress` with 0 paid → **rejected** (must pay online or expire)
- `paid` → **rejected** (already paid)
- `cancelled` → **rejected**

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

- **400** — Cannot mark as paid (wrong status)
- **404** — Booking not found

---

## Tournament Registrations

**GET** `/tournaments/{tournament_id}/registrations`

Returns all registrations for a tournament, grouped by clubs and solo players. Shows payment status and contact info.

**Auth:** Admin Bearer token required

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

**Member fields:**

| Field | Description |
|-------|-------------|
| user_id | User ID |
| fullname | User's name (can be null) |
| phone | Phone number |
| status | `in_progress`, `paid`, or `cancelled` |
| is_creator | Whether this user created the club |

### Errors

- **404** — Tournament not found
