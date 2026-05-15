# Marketplace CRUD (Admin)

CRUD-only reference for products, sizes, and image upload. Order/finance flow is covered separately.

Base URL: `/api/v1/admin/marketplace`

**Authentication:** All endpoints require `Authorization: Bearer {admin_token}` (JWT with `role: admin`).

---

## Table of contents

1. [Image upload](#1-image-upload)
2. [Create product](#2-create-product)
3. [List products](#3-list-products)
4. [Get product](#4-get-product)
5. [Update product](#5-update-product)
6. [Delete product](#6-delete-product)
7. [Add size to product](#7-add-size-to-product)
8. [Update size](#8-update-size)
9. [Delete size](#9-delete-size)

---

## 1. Image upload

Upload one image to GCS. Use the returned `url` in the product `images[]` array.

**POST** `/upload-image`

#### Request — `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| file | file | Yes | jpeg, jpg, png, or webp. Max 1 MB. |

#### Response (200)

```json
{
  "url": "https://storage.googleapis.com/stadion24-photos/marketplace/20260515_140523_a1b2c3d4.jpg",
  "filename": "jersey-front.jpg",
  "size": 184321
}
```

#### Errors

| Status | When |
|---|---|
| 400 | Invalid file type |
| 400 | File larger than 1 MB |
| 500 | Upload failed |

---

## 2. Create product

**POST** `/products`

#### Request

```json
{
  "title": "Uzbekistan National Team Jersey 2026",
  "description": "Official home jersey. Breathable Dri-FIT fabric.",
  "images": [
    "https://storage.googleapis.com/.../front.jpg",
    "https://storage.googleapis.com/.../back.jpg"
  ],
  "price": 350000,
  "prepayment_amount": 50000,
  "category": "jerseys",
  "status": "active",
  "sizes": [
    {"size_label": "S",  "hint_label": "165-172 sm, 55-65 kg", "stock": 8},
    {"size_label": "M",  "hint_label": "172-180 sm, 65-75 kg", "stock": 12},
    {"size_label": "L",  "hint_label": "178-186 sm, 75-85 kg", "stock": 10},
    {"size_label": "XL", "hint_label": "184-192 sm, 85-95 kg", "stock": 6}
  ]
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | Yes | 1–255 chars |
| description | string | No | Free text |
| images | string[] | No | List of GCS URLs. **First URL is the cover image.** Default: `[]` |
| price | integer | Yes | UZS, ≥ 0, per unit |
| prepayment_amount | integer | Yes | UZS, ≥ 0. Must be ≤ `price`. This is what the user pays online to reserve. |
| category | string | No | Free string, max 100 chars (e.g. `"jerseys"`, `"boots"`) |
| status | enum | No | `active` \| `hidden` \| `sold_out`. Default: `active` |
| sizes | array | No | Optional inline sizes — see fields below |
| sizes[].size_label | string | Yes | 1–50 chars (e.g. `"S"`, `"42"`) |
| sizes[].hint_label | string | No | Free text hint (e.g. `"170-180 sm, 65-75 kg"`) |
| sizes[].stock | integer | Yes | ≥ 0 |

#### Response (201)

```json
{
  "id": 1,
  "title": "Uzbekistan National Team Jersey 2026",
  "description": "Official home jersey. Breathable Dri-FIT fabric.",
  "images": ["https://.../front.jpg", "https://.../back.jpg"],
  "price": 350000,
  "prepayment_amount": 50000,
  "category": "jerseys",
  "likes_count": 0,
  "status": "active",
  "sizes": [
    {"id": 1, "size_label": "S",  "hint_label": "165-172 sm, 55-65 kg", "stock": 8},
    {"id": 2, "size_label": "M",  "hint_label": "172-180 sm, 65-75 kg", "stock": 12},
    {"id": 3, "size_label": "L",  "hint_label": "178-186 sm, 75-85 kg", "stock": 10},
    {"id": 4, "size_label": "XL", "hint_label": "184-192 sm, 85-95 kg", "stock": 6}
  ],
  "is_liked_by_me": false,
  "total_stock": 36,
  "created_at": "2026-05-15T10:23:45.123Z",
  "updated_at": "2026-05-15T10:23:45.123Z"
}
```

#### Errors

| Status | When |
|---|---|
| 422 | Validation failed (e.g. `prepayment_amount > price`) |
| 401 | Missing/invalid token |
| 403 | Token is not an admin token |

---

## 3. List products

Admin view — returns products in **all** statuses (active, hidden, sold_out).

**GET** `/products`

#### Query params

| Param | Type | Default | Notes |
|---|---|---|---|
| search | string | - | Case-insensitive `ILIKE` on `title` |
| category | string | - | Exact match |
| status | enum | - | `active` \| `hidden` \| `sold_out` |
| limit | int | 50 | 1–200 |
| offset | int | 0 | ≥ 0 |

Example: `GET /products?status=active&category=boots&limit=20`

#### Response (200)

```json
[
  {
    "id": 2,
    "title": "Adidas Predator Edge Boots",
    "description": "Pro-level firm-ground football boots.",
    "images": ["https://.../boots-1.jpg"],
    "price": 1450000,
    "prepayment_amount": 200000,
    "category": "boots",
    "likes_count": 3,
    "status": "active",
    "sizes": [
      {"id": 5, "size_label": "40", "hint_label": "EU 40 / oyoq 25.5 sm", "stock": 3},
      {"id": 6, "size_label": "41", "hint_label": "EU 41 / oyoq 26.0 sm", "stock": 5}
    ],
    "is_liked_by_me": false,
    "total_stock": 8,
    "created_at": "2026-05-15T10:30:00Z",
    "updated_at": "2026-05-15T10:30:00Z"
  }
]
```

Sorted by `created_at DESC`.

---

## 4. Get product

**GET** `/products/{product_id}`

#### Response (200)

Same shape as the create response.

#### Errors

| Status | When |
|---|---|
| 404 | Product not found or soft-deleted |

---

## 5. Update product

Partial update. Only the fields you send are changed. Sizes are managed via the size endpoints below — **not** via this endpoint.

**PATCH** `/products/{product_id}`

#### Request — all fields optional

```json
{
  "title": "Uzbekistan Jersey 2026 (Away)",
  "description": "Updated description",
  "images": ["https://.../new-cover.jpg"],
  "price": 380000,
  "prepayment_amount": 60000,
  "category": "jerseys",
  "status": "hidden"
}
```

#### Fields

| Field | Type | Notes |
|---|---|---|
| title | string | 1–255 chars |
| description | string | Free text |
| images | string[] | Replaces the entire array |
| price | integer | UZS, ≥ 0 |
| prepayment_amount | integer | UZS, ≥ 0. Validated against `price` (current or updated) — must be ≤ `price` |
| category | string | Max 100 chars |
| status | enum | `active` \| `hidden` \| `sold_out` |

#### Response (200)

Same shape as get/create. `updated_at` will reflect the change.

#### Errors

| Status | When |
|---|---|
| 400 | `prepayment_amount > price` (using new and/or existing values) |
| 404 | Product not found |

---

## 6. Delete product

Soft delete — sets `deleted_at`, hides from all listings (admin and client). Sizes remain in DB but are inaccessible. Existing orders still keep snapshots.

**DELETE** `/products/{product_id}`

#### Response (204) — no body

#### Errors

| Status | When |
|---|---|
| 404 | Product not found |

---

## 7. Add size to product

**POST** `/products/{product_id}/sizes`

#### Request

```json
{
  "size_label": "XXL",
  "hint_label": "190+ sm, 95+ kg",
  "stock": 4
}
```

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| size_label | string | Yes | 1–50 chars |
| hint_label | string | No | Free text |
| stock | integer | Yes | ≥ 0 |

#### Response (201)

```json
{
  "id": 11,
  "size_label": "XXL",
  "hint_label": "190+ sm, 95+ kg",
  "stock": 4
}
```

#### Errors

| Status | When |
|---|---|
| 404 | Product not found or soft-deleted |

---

## 8. Update size

Partial update. Common use: adjust `stock` after restocking, rename a label, change a hint.

**PATCH** `/sizes/{size_id}`

#### Request — all fields optional

```json
{
  "size_label": "XXL",
  "hint_label": "190+ sm, 95+ kg",
  "stock": 12
}
```

#### Fields

| Field | Type | Notes |
|---|---|---|
| size_label | string | 1–50 chars |
| hint_label | string | Free text or `null` |
| stock | integer | ≥ 0 |

#### Response (200)

```json
{
  "id": 11,
  "size_label": "XXL",
  "hint_label": "190+ sm, 95+ kg",
  "stock": 12
}
```

#### Errors

| Status | When |
|---|---|
| 404 | Size not found or soft-deleted |

---

## 9. Delete size

Soft delete — sets `deleted_at`. Existing cart items / order items referencing it keep their snapshots; new buyers can't pick it.

**DELETE** `/sizes/{size_id}`

#### Response (204) — no body

#### Errors

| Status | When |
|---|---|
| 404 | Size not found |

---

## Common patterns

### Typical flow: create a product end-to-end

```
1. POST /upload-image           (×N for each image)  → collect URLs
2. POST /products                with images[] + sizes[] inline
   ↓
3. (later) PATCH /sizes/{id}     to top up stock
4. (later) PATCH /products/{id}  to change price / hide
```

### Hiding vs deleting

- **Hide** (`status: "hidden"`) — invisible to clients, but admin can still see, edit, and re-activate. Existing orders unaffected.
- **Delete** (`DELETE`) — soft-deleted, gone from admin lists too. Use only for products you want fully gone.

### About `total_stock`

Every product response includes `total_stock = SUM(sizes[].stock)`. When all sizes hit 0, you can flip the product to `status: "sold_out"` or restock. The system does **not** auto-flip status — admin controls it.

### Snapshots

Once an order is placed, the order item stores snapshots of `unit_price`, `prepayment_per_unit`, `product_title`, `size_label`, and `product_image`. Editing or deleting a product after orders exist is safe — past orders keep their original data.
