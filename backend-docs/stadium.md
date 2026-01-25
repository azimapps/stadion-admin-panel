# Stadium Management API

Base URL: `/api/v1/stadiums`

**Authentication:** Write operations (POST, PUT, DELETE) require `Authorization: Bearer {token}`. Read operations (GET) are public.

---

## Endpoints

### 1. Create Stadium

**POST** `/` (Admin only)

#### Request

```json
{
  "slug": "chilonzor-arena",
  "name_uz": "Chilonzor Arena",
  "name_ru": "Чилонзор Арена",
  "description_uz": "Zamonaviy futbol maydoni",
  "description_ru": "Современный футбольный стадион",
  "address_uz": "Chilonzor tumani, Bunyodkor ko'chasi 1",
  "address_ru": "Чилонзорский район, улица Бунёдкор 1",
  "latitude": 41.2856,
  "longitude": 69.2034,
  "is_metro_near": true,
  "metro_station": "Chilonzor",
  "metro_distance": 0.5,
  "capacity": "7x7",
  "surface_type": "artificial",
  "roof_type": "covered",
  "price_per_hour": 150000,
  "phone": ["+998901234567", "+998977654321"],
  "main_image": "https://example.com/images/main.jpg",
  "images": ["https://example.com/images/1.jpg"],
  "is_active": true
}
```

#### Fields

| Field | Type | Required | Values |
|-------|------|----------|---------|
| slug | string | Yes | Unique identifier |
| name_uz | string | Yes | - |
| name_ru | string | Yes | - |
| description_uz | string | No | - |
| description_ru | string | No | - |
| address_uz | string | Yes | - |
| address_ru | string | Yes | - |
| latitude | float | No | -90 to 90 |
| longitude | float | No | -180 to 180 |
| is_metro_near | boolean | No | - |
| metro_station | string | No | See metro stations list |
| metro_distance | float | No | Distance in km |
| capacity | string | Yes | 5x5, 6x6, 7x7, 8x8, 9x9, 10x10, 11x11 |
| surface_type | string | No | grass, artificial |
| roof_type | string | No | open, covered |
| price_per_hour | integer | Yes | Price in UZS |
| phone | array | Yes | List of phone numbers |
| main_image | string | No | Image URL |
| images | array | No | Array of image URLs |
| is_active | boolean | No | Default: true |

#### Response (201)

```json
{
  "id": 1,
  "slug": "chilonzor-arena",
  "name_uz": "Chilonzor Arena",
  "name_ru": "Чилонзор Арена",
  "description_uz": "Zamonaviy futbol maydoni",
  "description_ru": "Современный футбольный стадион",
  "address_uz": "Chilonzor tumani, Bunyodkor ko'chasi 1",
  "address_ru": "Чилонзорский район, улица Бунёдкор 1",
  "latitude": 41.2856,
  "longitude": 69.2034,
  "is_metro_near": true,
  "metro_station": "Chilonzor",
  "metro_distance": 0.5,
  "capacity": "7x7",
  "surface_type": "artificial",
  "roof_type": "covered",
  "price_per_hour": 150000,
  "phone": ["+998901234567", "+998977654321"],
  "main_image": "https://example.com/images/main.jpg",
  "images": ["https://example.com/images/1.jpg"],
  "is_active": true,
  "created_at": "2024-01-24T10:30:00",
  "updated_at": "2024-01-24T10:30:00",
  "deleted_at": null
}
```

#### Errors

- **400** - Slug already exists
- **401** - Unauthorized
- **422** - Validation error

---

### 2. List Stadiums

**GET** `/` (Public)

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| skip | integer | Offset (default: 0) |
| limit | integer | Limit (default: 100) |
| is_active | boolean | Filter by active status |
| capacity | string | Filter by capacity |
| surface_type | string | Filter by surface type |
| roof_type | string | Filter by roof type |
| is_metro_near | boolean | Filter by metro proximity |

#### Response (200)

Array of stadium objects (same structure as create response).

---

### 3. Get Stadium by Slug

**GET** `/slug/{slug}` (Public)

#### Response (200)

Stadium object (same structure as create response).

#### Errors

- **404** - Stadium not found

---

### 4. Get Stadium by ID

**GET** `/{stadium_id}` (Public)

#### Response (200)

Stadium object (same structure as create response).

#### Errors

- **404** - Stadium not found

---

### 5. Update Stadium

**PUT** `/{stadium_id}` (Admin only)

#### Request

All fields are optional. Only send fields to update:

```json
{
  "name_uz": "Updated Name",
  "price_per_hour": 200000,
  "is_active": false
}
```

#### Response (200)

Updated stadium object.

#### Errors

- **400** - Slug conflict
- **401** - Unauthorized
- **404** - Stadium not found

---

### 6. Delete Stadium

**DELETE** `/{stadium_id}` (Admin only)

Soft delete (sets `deleted_at` timestamp).

#### Response (204)

No content.

#### Errors

- **401** - Unauthorized
- **404** - Stadium not found

---

## Metro Stations

**Chilonzor Line (Red):** Buyuk Ipak Yoli, Pushkin, Hamid Olimjon, Amir Temur Xiyoboni, Mustaqillik Maydoni, Paxtakor, Xalqlar Doʻstligi, Milliy Bogʻ, Novza, Mirzo Ulugʻbek, Chilonzor, Olmazor, Choshtepa, Oʻzgarish, Sirgʻali, Yangihayot, Chinor

**Oʻzbekiston Line (Blue):** Beruniy, Tinchlik, Chorsu, Gʻafur Gʻulom, Alisher Navoiy, Oʻzbekiston, Kosmonavtlar, Oybek, Toshkent, Mashinasozlar, Doʻstlik

**Yunusobod Line (Green):** Turkiston, Yunusobod, Shahriston, Bodomzor, Minor, Abdulla Qodirii, Yunus Rajabiy, Ming Oʻrik

**Circle Line:** Texnopark, Yashnobod, Tuzel, Olmos, Rohat, Yangiobod, Qoʻyliq, Matonat, Qiyot, Tolariq, Xonobod, Quruvchilar, Turon, Qipchoq
