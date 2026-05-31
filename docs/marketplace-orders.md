# Marketplace Orders (Admin)

Admin view of marketplace orders + the full lifecycle controls: set delivery fee, mark as sent / delivered, cancel, manage refund flag and admin notes. For product/size CRUD, see [`marketplace-crud-froma.md`](./marketplace-crud-froma.md). For the client side (checkout / Payme / Click), see [`../client/marketplace-orders.md`](../client/marketplace-orders.md).

Base URL: `/api/v1/admin/marketplace`

**Authentication:** All endpoints require `Authorization: Bearer {admin_token}` (JWT with `role: admin`).

---

## Table of contents

1. [List orders](#1-list-orders)
2. [Get order](#2-get-order)
3. [Set delivery fee (confirm)](#3-set-delivery-fee-confirm)
4. [Mark delivery sent](#4-mark-delivery-sent)
5. [Mark delivered](#5-mark-delivered)
6. [Cancel order](#6-cancel-order)
7. [Update admin notes](#7-update-admin-notes)
8. [Clear refund flag](#8-clear-refund-flag)
9. [Order lifecycle reference](#9-order-lifecycle-reference)
10. [Order response shape](#10-order-response-shape)

---

## 1. List orders

Returns all marketplace orders, newest first. Use the filters to narrow by status, user, or refund queue.

**GET** `/orders`

#### Query params

| Param | Type | Default | Notes |
|---|---|---|---|
| status | string | — | One of `awaiting_prepayment`, `prepaid`, `confirmed`, `delivery_sent`, `delivery_completed`, `cancelled` |
| needs_refund | bool | — | `true` to show only orders flagged for offline refund |
| user_id | int | — | Filter to a single buyer |
| limit | int | 50 | 1–200 |
| offset | int | 0 | For paging |

#### Response (200)

Array of [order objects](#10-order-response-shape).

#### Errors

| Status | When |
|---|---|
| 400 | `status` value isn't a valid enum |
| 401 | Missing / invalid admin token |

#### Common views

| Goal | Query |
|---|---|
| Orders needing delivery fee | `?status=prepaid` |
| Out-for-delivery queue | `?status=delivery_sent` |
| Refund queue | `?needs_refund=true` |
| One buyer's history | `?user_id=42` |

---

## 2. Get order

**GET** `/orders/{order_id}`

#### Response (200)

A single [order object](#10-order-response-shape).

#### Errors

| Status | When |
|---|---|
| 404 | Order not found / soft-deleted |

---

## 3. Set delivery fee (confirm)

Sets the delivery fee on a `prepaid` order and transitions it to `confirmed`. After this, `total_price` and `remaining_amount` populate on the order, and the buyer gets a `marketplace_order_confirmed` push.

**PATCH** `/orders/{order_id}/delivery-fee`

#### Request

```json
{
  "delivery_fee": 15000
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| delivery_fee | int | Yes | UZS, `>= 0`. Pass `0` for free delivery. |

#### Response (200)

The updated [order object](#10-order-response-shape) — `status` is now `confirmed`, `confirmed_at` is set, `total_price = items_total + delivery_fee`, `remaining_amount = total_price - paid_amount`.

#### Side effects

- Push `marketplace_order_confirmed` sent to the buyer (payload includes `fee`).

#### Errors

| Status | When |
|---|---|
| 400 | Order isn't in `prepaid` status |
| 404 | Order not found |

---

## 4. Mark delivery sent

Transition a `confirmed` order to `delivery_sent` once the courier has picked it up.

**PATCH** `/orders/{order_id}/mark-sent`

#### Request

No body.

#### Response (200)

The updated [order object](#10-order-response-shape) — `status` is now `delivery_sent`, `delivery_sent_at` is set.

#### Side effects

- Push `marketplace_order_delivery_sent` sent to the buyer.

#### Errors

| Status | When |
|---|---|
| 400 | Order isn't in `confirmed` status |
| 404 | Order not found |

---

## 5. Mark delivered

Transition a `delivery_sent` order to `delivery_completed`. This is the **terminal happy-path** status. The backend assumes the courier collected the remaining amount in cash on delivery, so it sets `paid_amount = items_total + delivery_fee` and `remaining_amount` becomes `0`.

**PATCH** `/orders/{order_id}/mark-delivered`

#### Request

No body.

#### Response (200)

The updated [order object](#10-order-response-shape) — `status` is now `delivery_completed`, `delivery_completed_at` is set, `paid_amount == total_price`, `remaining_amount == 0`.

#### Side effects

- Push `marketplace_order_delivery_completed` sent to the buyer.

#### Errors

| Status | When |
|---|---|
| 400 | Order isn't in `delivery_sent` status |
| 404 | Order not found |

> Cash collection is recorded automatically — no separate "collect cash" endpoint. If the courier didn't actually collect, fix `paid_amount` via the DB (no admin-facing endpoint exposes that).

---

## 6. Cancel order

Cancel an order in any non-terminal status. The backend handles two side effects automatically:

- **Stock restock:** if the order had already taken stock (`prepaid`, `confirmed`, or `delivery_sent` — and wasn't already flagged `needs_refund`), each line's `quantity` is added back to its `MarketplaceProductSize.stock`.
- **Refund flag:** if `paid_amount > 0`, `needs_refund` is set to `true` so the order shows up in the refund queue (see [Clear refund flag](#8-clear-refund-flag)).

**PATCH** `/orders/{order_id}/cancel`

#### Request

No body.

#### Response (200)

The updated [order object](#10-order-response-shape) — `status` is now `cancelled`, `cancelled_at` is set, `needs_refund=true` if any money was already paid.

#### Side effects

- Push `marketplace_order_cancelled_admin` sent to the buyer.
- Stock returned for paid orders (see above).
- Refund flag set if `paid_amount > 0`.

#### Errors

| Status | When |
|---|---|
| 400 | Order is already `delivery_completed` or `cancelled` |
| 404 | Order not found |

> For `awaiting_prepayment` orders, the 5-minute cron usually auto-cancels them — you generally don't need to do this manually.

---

## 7. Update admin notes

Free-text notes for internal use (courier instructions, refund context, customer comments, etc.). Not shown to the buyer.

**PATCH** `/orders/{order_id}/notes`

#### Request

```json
{
  "admin_notes": "Buyer asked to call before arriving. Refunded 50k via Payme on 2026-05-30."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| admin_notes | string \| null | No | Pass `null` to clear |

#### Response (200)

The updated [order object](#10-order-response-shape).

#### Errors

| Status | When |
|---|---|
| 404 | Order not found |

---

## 8. Clear refund flag

Use this **after** you've completed an offline refund (via Payme/Click admin panel or cash) to remove the order from the `needs_refund=true` queue.

**PATCH** `/orders/{order_id}/clear-refund-flag`

#### Request

No body.

#### Response (200)

The updated [order object](#10-order-response-shape) — `needs_refund` is now `false`.

#### Errors

| Status | When |
|---|---|
| 404 | Order not found |

> This does **not** push notify the buyer and does **not** change `paid_amount`. It's a pure bookkeeping flag for the admin queue.

---

## 9. Order lifecycle reference

```
awaiting_prepayment ──┬─> prepaid ─> confirmed ─> delivery_sent ─> delivery_completed
                      │
                      └─> cancelled  (any non-terminal status can cancel)
```

| Status | How it gets here | Admin action available |
|---|---|---|
| `awaiting_prepayment` | Client `POST /checkout`. | Cancel (rarely needed — 5-min cron handles expiry). |
| `prepaid` | Payme/Click webhook confirmed prepayment. Stock decremented. | **Set delivery fee** → `confirmed`. Or cancel (will restock + flag refund). |
| `confirmed` | Admin set `delivery_fee`. | **Mark sent** → `delivery_sent`. Or cancel (will restock + flag refund). |
| `delivery_sent` | Admin marked as shipped. | **Mark delivered** → `delivery_completed`. Or cancel (will restock + flag refund). |
| `delivery_completed` | Admin marked as delivered. Cash collected. | Terminal — only notes / refund flag are editable. |
| `cancelled` | Admin or 5-min expiry cron. | Terminal — only notes / refund flag are editable. |

### Auto-cancellation
A background job cancels `awaiting_prepayment` orders ~60s after `payment_deadline` (5 min from checkout). The 1-min-warning push fires at `payment_deadline - 60s`. No admin action required.

### Refund handling
There is no automated refund — when `needs_refund=true`, an admin refunds the buyer offline (Payme/Click merchant panel or cash) and then calls [Clear refund flag](#8-clear-refund-flag). The `needs_refund` flag is set in two cases:
1. Admin cancels an order with `paid_amount > 0`.
2. Oversold race condition: webhook arrives but stock ran out (handled by the webhook layer, not by an admin endpoint).

---

## 10. Order response shape

```json
{
  "id": 1287,
  "user_id": 42,
  "buyer_phone": "+998901234567",
  "buyer_fullname": "Abdulla Karimov",

  "address_text": "Tashkent, Yunusobod, Amir Temur ko'chasi 12",
  "address_lat": 41.3275,
  "address_lng": 69.2817,

  "items_total": 240000,
  "prepayment_total": 50000,
  "delivery_fee": 15000,
  "paid_amount": 50000,
  "total_price": 255000,
  "remaining_amount": 205000,

  "status": "confirmed",
  "payment_deadline": "2026-05-31T10:35:00Z",

  "prepaid_at": "2026-05-31T10:32:14Z",
  "confirmed_at": "2026-05-31T10:48:02Z",
  "delivery_sent_at": null,
  "delivery_completed_at": null,
  "cancelled_at": null,

  "admin_notes": null,
  "needs_refund": false,

  "items": [
    {
      "id": 5012,
      "product_id": 88,
      "product_size_id": 304,
      "quantity": 2,
      "unit_price": 120000,
      "prepayment_per_unit": 25000,
      "product_title": "Stadion24 Home Jersey 2026",
      "size_label": "L",
      "product_image": "https://storage.googleapis.com/stadion24-photos/marketplace/...jpg",
      "line_total": 240000,
      "line_prepayment": 50000
    }
  ],

  "created_at": "2026-05-31T10:30:00Z",
  "updated_at": "2026-05-31T10:48:02Z"
}
```

### Field notes

| Field | Notes |
|---|---|
| `buyer_phone` / `buyer_fullname` | Snapshotted from the user at checkout — editing the user profile later does not update these. |
| `items_total` | Sum of `unit_price * quantity` across all items. Frozen at checkout. |
| `prepayment_total` | Sum of `prepayment_per_unit * quantity`. What the user paid via Payme/Click. |
| `delivery_fee` | `null` until admin sets it (see §3). |
| `paid_amount` | What the buyer has actually paid so far. Equals `prepayment_total` after prepay, equals `total_price` after `mark-delivered`. |
| `total_price` | `items_total + delivery_fee`. `null` until `delivery_fee` is set. |
| `remaining_amount` | `total_price - paid_amount`. `null` until `delivery_fee` is set. This is what the courier must collect on delivery. |
| `needs_refund` | `true` means admin must refund the buyer offline; clear via §8 once done. |
| `items[].product_title` / `size_label` / `product_image` | Snapshotted at checkout — editing the product later doesn't change these. |
