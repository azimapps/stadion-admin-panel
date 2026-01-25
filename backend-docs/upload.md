# Image Upload API

Base URL: `/api/v1/upload`

**Authentication:** Requires `Authorization: Bearer {token}`

**Storage:** Images uploaded to Google Cloud Storage in `stadium/` folder.

---

## Upload Stadium Images

**POST** `/stadium-images` (Admin only)

Upload single or multiple stadium images (max 10).

### Request

- **Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| files | file[] | Yes | One or more image files |

### Constraints

- **Max files:** 10 per request
- **Allowed types:** JPEG, JPG, PNG, WebP
- **Max size per file:** 5MB

### Response (200)

```json
{
  "uploaded": [
    {
      "url": "https://storage.googleapis.com/bucket/stadium/20240124_103000_abc123.jpg",
      "filename": "stadium-1.jpg",
      "content_type": "image/jpeg",
      "size": 245678
    }
  ],
  "errors": [],
  "total": 1,
  "success": 1,
  "failed": 0
}
```

### Errors

- **400** - Too many files or invalid file type/size
- **401** - Unauthorized

---

## File Naming

Files automatically renamed: `stadium/20240124_103000_abc123.jpg`
- Stored in `stadium/` folder
- Timestamp + unique ID
- Original extension preserved

---

## Notes

1. Works for single or multiple files
2. Returns public URLs ready to use
3. Use URLs in stadium `main_image` and `images` fields
