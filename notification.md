# Notifications API

Base URL: `/api/v1/admin/notifications`

**Authentication:** All operations require `Authorization: Bearer {token}` (Admin only).

---

## Endpoints

### 1. Send Notification

**POST** `/send` (Admin only)

Send a push notification to a specific user or broadcast to all users. Messages are delivered in the user's preferred language (Uzbek or Russian) based on their device token settings.

#### Request

```json
{
  "title_uz": "Yangi aksiya!",
  "title_ru": "Новая акция!",
  "body_uz": "Bugun barcha stadionlarda 50% chegirma!",
  "body_ru": "Сегодня скидка 50% на все стадионы!",
  "data": {
    "type": "promo",
    "screen": "home"
  },
  "user_id": 123
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title_uz | string | Yes | Notification title in Uzbek |
| title_ru | string | Yes | Notification title in Russian |
| body_uz | string | Yes | Notification body in Uzbek |
| body_ru | string | Yes | Notification body in Russian |
| data | object | No | Extra payload sent with the notification |
| user_id | integer | No | Target user ID. If omitted — broadcasts to **all** users |

#### Response (200)

```json
{
  "sent": 45,
  "failed": 2
}
```

`sent` — number of device tokens that received the notification successfully.
`failed` — number of tokens that failed (stale tokens are auto-deactivated).

#### Examples

**Broadcast to all users** — omit `user_id`:

```json
{
  "title_uz": "Yangi funksiya!",
  "title_ru": "Новая функция!",
  "body_uz": "Endi turnirga onlayn yozilish mumkin",
  "body_ru": "Теперь можно записаться на турнир онлайн"
}
```

**Send to one user** — include `user_id`:

```json
{
  "title_uz": "Sizga maxsus taklif!",
  "title_ru": "Специальное предложение для вас!",
  "body_uz": "Keyingi buyurtmangizga 30% chegirma",
  "body_ru": "Скидка 30% на следующий заказ",
  "user_id": 42
}
```

#### Errors

- **401** - Unauthorized
- **404** - No device tokens found (user has no registered devices)
- **503** - Firebase not initialized
