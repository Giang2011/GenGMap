# GenGMap

## Hướng dẫn sử dụng API cho Frontend

### 1. Lấy danh sách địa điểm
- **GET** `/api/destinations`
- Trả về danh sách các địa điểm du lịch.

#### Ví dụ kết quả trả về
```json
[
  {
    "id": 10,
    "name": "Quán ăn ABC",
    "category": "am-thuc",
    "description": "Quán ăn nổi tiếng với các món đặc sản.",
    "address": "123 Đường ABC, Nha Trang",
    "city": "Nha Trang",
    "latitude": 12.25,
    "longitude": 109.18,
    "image_url": "https://example.com/image.jpg"
  },
  {
    "id": 11,
    "name": "Bãi biển XYZ",
    "category": "bien",
    "description": "Bãi biển đẹp, nước trong xanh.",
    "address": "Bãi biển XYZ, Nha Trang",
    "city": "Nha Trang",
    "latitude": 12.26,
    "longitude": 109.19,
    "image_url": "https://example.com/beach.jpg"
  }
  // Các địa điểm khác
]
```

### 2. Tạo lộ trình du lịch thông minh
- **POST** `/api/generate-itinerary`
- Body (JSON):
  ```json
  {
    "province": "Tên tỉnh/thành phố",
    "days": Số ngày (ví dụ: 3)
  }
  ```
- Trả về lộ trình du lịch, danh sách các địa điểm theo từng ngày.

#### Ví dụ kết quả trả về
```json
{
  "message": "Tạo lộ trình thành công!",
  "status": "success",
  "itinerary": {
    "id": 1,
    "shareable_id": "nha-trang-3d-1721820000000",
    "title": "Khám phá Nha Trang 3 ngày",
    "created_at": "2025-07-24T10:00:00.000Z",
    "ItineraryItems": [
      {
        "day_number": 1,
        "order_in_day": 1,
        "Destination": {
          "id": 10,
          "name": "Quán ăn ABC",
          "category": "am-thuc",
          "description": "...",
          "address": "...",
          "city": "Nha Trang",
          "latitude": 12.25,
          "longitude": 109.18,
          "image_url": "..."
        }
      }
      // Các địa điểm khác
    ]
  },
  "shareableUrl": "/itinerary/nha-trang-3d-1721820000000"
}
```

### 3. Lấy tất cả lộ trình đã tạo
- **GET** `/api/itineraries`
- Trả về danh sách các lộ trình đã tạo.

### 4. Lấy lộ trình theo shareable_id
- **GET** `/api/itinerary/:shareableId`
- Trả về chi tiết lộ trình theo shareable_id.

#### Ví dụ kết quả trả về
```json
{
  "id": 1,
  "shareable_id": "nha-trang-3d-1721820000000",
  "title": "Khám phá Nha Trang 3 ngày",
  "created_at": "2025-07-24T10:00:00.000Z",
  "ItineraryItems": [
    {
      "day_number": 1,
      "order_in_day": 1,
      "Destination": {
        "id": 10,
        "name": "Quán ăn ABC",
        "category": "am-thuc",
        "description": "Quán ăn nổi tiếng với các món đặc sản.",
        "address": "123 Đường ABC, Nha Trang",
        "city": "Nha Trang",
        "latitude": 12.25,
        "longitude": 109.18,
        "image_url": "https://example.com/image.jpg"
      }
    },
    {
      "day_number": 1,
      "order_in_day": 2,
      "Destination": {
        "id": 11,
        "name": "Bãi biển XYZ",
        "category": "bien",
        "description": "Bãi biển đẹp, nước trong xanh.",
        "address": "Bãi biển XYZ, Nha Trang",
        "city": "Nha Trang",
        "latitude": 12.26,
        "longitude": 109.19,
        "image_url": "https://example.com/beach.jpg"
      }
    }
    // Các địa điểm khác theo từng ngày
  ]
}
```

### 5. Cập nhật lộ trình
- **PUT** `/api/itineraries/:shareableId`
- Body (JSON):
  ```json
  {
    "items": [
      {
        "destination_id": 1,
        "day_number": 1,
        "order_in_day": 1
      }
      // ...
    ]
  }
  ```
- Dùng để cập nhật lại các chặng trong lộ trình.

---

**Lưu ý:**  
- Các API đều trả về dữ liệu dạng JSON.
- Đảm bảo backend đã chạy tại `http://localhost:3000`.
- Tham khảo chi tiết các trường dữ liệu trong response để hiển thị lên giao diện người dùng.