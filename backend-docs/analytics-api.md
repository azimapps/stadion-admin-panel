# Analytics API

Base URL: `/api/v1/admin/analytics`

Fetch app usage analytics from Google Analytics 4. Admin auth required.

---

## Setup

Before using this endpoint, you need:

1. **Firebase Analytics enabled** in the iOS app (Firebase SDK must be sending events)
2. **GA4 property linked** to your Firebase project — check Firebase Console → Project Settings → Integrations → Google Analytics
3. **GA4 Property ID** — find it in Google Analytics → Admin → Property Settings → Property ID (a number like `123456789`)
4. **Service account access** — add `firebase-adminsdk-fbsvc@stadion24-7e751.iam.gserviceaccount.com` as a Viewer in Google Analytics → Admin → Property Access Management
5. **Set env variable** — `GA4_PROPERTY_ID=123456789` in your `.env` or Railway environment

---

## Get Monthly Analytics

**GET** `/?month=3&year=2026`

Returns daily stats and city breakdown for the given month.

**Auth:** Admin Bearer token required

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| month | int | Yes | Month number (1-12) |
| year | int | Yes | Year (2024-2030) |

### Response (200)

```json
{
  "month": 3,
  "year": 2026,
  "daily": [
    {
      "date": "2026-03-01",
      "active_users": 145,
      "new_users": 23,
      "sessions": 310,
      "avg_session_duration_seconds": 272
    },
    {
      "date": "2026-03-02",
      "active_users": 132,
      "new_users": 18,
      "sessions": 287,
      "avg_session_duration_seconds": 245
    }
  ],
  "cities": [
    {"city": "Tashkent", "active_users": 620},
    {"city": "Samarkand", "active_users": 140},
    {"city": "Bukhara", "active_users": 65}
  ]
}
```

### Response Fields

**daily** — one entry per day of the month (up to today if month is current):

| Field | Description |
|-------|-------------|
| date | Date string (YYYY-MM-DD) |
| active_users | Unique users who opened the app that day (DAU) |
| new_users | First-time users that day |
| sessions | Total app opens that day |
| avg_session_duration_seconds | Average time spent in app (seconds) |

**cities** — unique active users per city for the entire month (sorted by most users):

| Field | Description |
|-------|-------------|
| city | City name (from IP geolocation). May include "(not set)" |
| active_users | Unique users from that city during the month |

### Errors

- **401** — Invalid or missing token
- **403** — Not an admin
- **422** — Invalid month/year
- **500** — GA4 fetch failed (check GA4_PROPERTY_ID and service account permissions)

---

## Notes

- If `GA4_PROPERTY_ID` is not set, returns empty `daily` and `cities` arrays
- For the current month, data is returned up to today
- City detection is based on IP address (~85% accurate, VPN users may show wrong city)
- Analytics data may have a 24-48h delay from Google's side

---

## Get Payment Analytics

**GET** `/payments?month=3&year=2026`

Returns daily revenue breakdown, per-stadium revenue, and summary for the given month. Data comes from the database (100% accurate, no delay).

**Auth:** Admin Bearer token required

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| month | int | Yes | Month number (1-12) |
| year | int | Yes | Year (2024-2030) |

### Response (200)

```json
{
  "month": 3,
  "year": 2026,
  "daily": [
    {
      "date": "2026-03-01",
      "total_revenue": 2500000,
      "booking_revenue": 2200000,
      "tournament_revenue": 300000,
      "payments_count": 18,
      "by_method": {
        "cash": 1200000,
        "click": 500000,
        "payme": 800000
      }
    }
  ],
  "by_stadium": [
    {
      "stadium_id": 1,
      "stadium_name": "Mega Arena",
      "revenue": 3200000,
      "booking_revenue": 2800000,
      "tournament_revenue": 400000
    }
  ],
  "summary": {
    "total_revenue": 4300000,
    "booking_revenue": 3700000,
    "tournament_revenue": 600000,
    "total_payments": 30,
    "avg_payment_amount": 143333,
    "cancelled_bookings": 5,
    "total_expenses": 1500000,
    "net_profit": 2800000
  }
}
```

### Response Fields

**daily** — one entry per day that had payments:

| Field | Description |
|-------|-------------|
| date | Date string (YYYY-MM-DD) |
| total_revenue | Total money received that day (UZS) |
| booking_revenue | Revenue from stadium bookings (UZS) |
| tournament_revenue | Revenue from tournament registrations (UZS) |
| payments_count | Number of payments received |
| by_method | Breakdown by payment method: `cash`, `click`, `payme` (UZS) |

**by_stadium** — revenue per stadium (sorted by highest revenue):

| Field | Description |
|-------|-------------|
| stadium_id | Stadium ID |
| stadium_name | Stadium name (uz) |
| revenue | Total revenue from this stadium (UZS) |
| booking_revenue | Booking revenue from this stadium (UZS) |
| tournament_revenue | Tournament revenue from this stadium (UZS) |

**summary** — totals for the entire month:

| Field | Description |
|-------|-------------|
| total_revenue | All money received (UZS) |
| booking_revenue | Total from bookings (UZS) |
| tournament_revenue | Total from tournaments (UZS) |
| total_payments | Number of payments |
| avg_payment_amount | Average payment size (UZS) |
| cancelled_bookings | Number of bookings cancelled that month |
| total_expenses | Sum of all expenses across all stadiums (UZS) |
| net_profit | total_revenue minus total_expenses (UZS) |

### Errors

- **401** — Invalid or missing token
- **403** — Not an admin
- **422** — Invalid month/year
