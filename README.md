# 🗺️ GenGMap - Ứng dụng Tạo Lộ trình Du lịch Thông minh

<div align="center">

![GenGMap Logo](https://img.shields.io/badge/GenGMap-Travel%20Planner-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**Ứng dụng web tạo lộ trình du lịch tự động sử dụng AI và dữ liệu từ OpenTripMap**

[🌟 Tính năng](#-tính-năng) •
[🚀 Cài đặt](#-cài-đặt) •
[📖 Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng) •
[🔧 API Reference](#-api-reference) •
[🤝 Đóng góp](#-đóng-góp)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

---

## 🌟 Giới thiệu

**GenGMap** là một ứng dụng web hiện đại giúp người dùng tạo lộ trình du lịch thông minh một cách tự động. Ứng dụng sử dụng công nghệ AI (Google Gemini) kết hợp với dữ liệu từ OpenTripMap API để đề xuất các địa điểm du lịch phù hợp và sắp xếp thành lộ trình hợp lý theo địa lý và thời gian.

### 🎯 Mục tiêu

- Đơn giản hóa quá trình lập kế hoạch du lịch
- Cung cấp lộ trình tối ưu dựa trên AI
- Hỗ trợ chỉnh sửa và tùy chỉnh lộ trình
- Hiển thị trực quan trên bản đồ tương tác

---

## ✨ Tính năng

### 🤖 Tạo lộ trình thông minh
- **AI-Powered**: Sử dụng Google Gemini AI để tạo lộ trình tối ưu
- **Tự động**: Chỉ cần nhập tỉnh/thành phố và số ngày
- **Đa dạng**: Kết hợp các loại địa điểm (ăn uống, tham quan, khách sạn)
- **Tối ưu địa lý**: Sắp xếp theo khoảng cách để tiết kiệm thời gian

### 🗺️ Bản đồ tương tác
- **Leaflet Maps**: Hiển thị địa điểm trên bản đồ chất lượng cao
- **Markers**: Đánh dấu rõ ràng từng địa điểm theo ngày
- **Responsive**: Tương thích mọi thiết bị

### ✏️ Chỉnh sửa linh hoạt
- **Drag & Drop**: Kéo thả để sắp xếp lại thứ tự
- **Thêm/Xóa**: Tự do thêm hoặc xóa địa điểm
- **Tìm kiếm**: Tìm kiếm nhanh địa điểm để thêm vào
- **Lưu trữ**: Lưu thay đổi vào cơ sở dữ liệu

### 🔗 Chia sẻ dễ dàng
- **Shareable URL**: Mỗi lộ trình có URL riêng để chia sẻ
- **Persistent**: Lộ trình được lưu trữ lâu dài

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: [Next.js 15.4.4](https://nextjs.org/) - React framework hiện đại
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **Maps**: [React Leaflet 5.0.0](https://react-leaflet.js.org/) - Bản đồ tương tác
- **UI Components**: [React Select 5.10.2](https://react-select.com/) - Select component nâng cao
- **Language**: JavaScript/JSX với ES6+

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) - JavaScript runtime
- **Framework**: [Express.js 5.1.0](https://expressjs.com/) - Web framework
- **Database**: [MySQL](https://www.mysql.com/) với [Sequelize ORM 6.37.7](https://sequelize.org/)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/) - Generative AI
- **External API**: [OpenTripMap API](https://opentripmap.io/) - Dữ liệu địa điểm du lịch
- **HTTP Client**: [Axios 1.10.0](https://axios-http.com/) - Promise based HTTP client

### Database Schema
```sql
-- Bảng destinations: Lưu trữ thông tin địa điểm
destinations (
  id, name, description, address, city, 
  latitude, longitude, category, image_url
)

-- Bảng itineraries: Lưu trữ thông tin lộ trình
itineraries (
  id, shareable_id, title, created_at
)

-- Bảng itinerary_items: Lưu trữ chi tiết từng chặng
itinerary_items (
  id, itinerary_id, destination_id, 
  day_number, order_in_day
)
```

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend      │    │     Backend      │    │   External APIs     │
│   (Next.js)     │◄──►│   (Express.js)   │◄──►│                     │
│                 │    │                  │    │ • OpenTripMap API   │
│ • React Pages   │    │ • REST API       │    │ • Google Gemini AI  │
│ • Leaflet Maps  │    │ • Business Logic │    │                     │
│ • Tailwind CSS  │    │ • Data Processing│    └─────────────────────┘
└─────────────────┘    └──────────────────┘              │
                                 │                        │
                       ┌──────────────────┐              │
                       │     Database     │              │
                       │    (MySQL)       │              │
                       │                  │              │
                       │ • Destinations   │              │
                       │ • Itineraries    │◄─────────────┘
                       │ • Itinerary Items│
                       └──────────────────┘
```

---

## 💻 Yêu cầu hệ thống

### Phần mềm cần thiết
- **Node.js**: ≥ 18.0.0
- **npm**: ≥ 8.0.0 hoặc **yarn**: ≥ 1.22.0
- **MySQL**: ≥ 8.0.0 (hoặc MariaDB ≥ 10.3)
- **Git**: Để clone repository

### API Keys cần thiết
- **OpenTripMap API Key**: [Đăng ký miễn phí](https://opentripmap.io/api)
- **Google Gemini API Key**: [Tạo tại Google AI Studio](https://aistudio.google.com/apikey)
- **Database**: MySQL connection string

---

## 🚀 Cài đặt

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/GenGMap.git
cd GenGMap
```

### 2. Cài đặt Backend
```bash
cd backend
npm install
```

### 3. Cài đặt Frontend
```bash
cd ../frontend
npm install
```

### 4. Chuẩn bị Database
```sql
-- Tạo database mới
CREATE DATABASE gengmap_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user mới (tùy chọn)
CREATE USER 'gengmap_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON gengmap_db.* TO 'gengmap_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## ⚙️ Cấu hình

### Backend Configuration

Tạo file `.env` trong thư mục `backend/`:

```env
# Database Configuration
DB_URI=mysql://username:password@localhost:3306/gengmap_db

# API Keys
OPENTRIPMAP_API_KEY=your_opentripmap_api_key
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration (optional)
PORT=4000
NODE_ENV=development
```

### Environment Variables chi tiết:

| Biến | Mô tả | Bắt buộc | Ví dụ |
|------|-------|----------|-------|
| `DB_URI` | MySQL connection string | ✅ | `mysql://user:pass@host:3306/db` |
| `OPENTRIPMAP_API_KEY` | API key từ OpenTripMap | ✅ | `5ae2e3f221c38a28845f05b6...` |
| `GEMINI_API_KEY` | API key từ Google Gemini | ✅ | `AIzaSyDNoTiw_pfWII-2wBo78r2...` |
| `PORT` | Port cho backend server | ❌ | `4000` (default) |
| `NODE_ENV` | Environment mode | ❌ | `development` |

### Frontend Configuration

Frontend tự động kết nối với backend tại `http://localhost:4000`. Nếu cần thay đổi, cập nhật các URL trong:
- `src/app/page.js`
- `src/app/itinerary/[shareableId]/page.js`

---

## 📖 Hướng dẫn sử dụng

### Khởi chạy ứng dụng

#### 1. Khởi động Backend
```bash
cd backend
npm run dev
# Hoặc production mode
npm start
```
Backend sẽ chạy tại: `http://localhost:4000`

#### 2. Khởi động Frontend
```bash
cd frontend
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:3000`

### Sử dụng ứng dụng

#### 🎯 Tạo lộ trình mới
1. Truy cập `http://localhost:3000`
2. Nhập tên tỉnh/thành phố (VD: "Nha Trang", "Đà Nẵng")
3. Chọn số ngày du lịch (1-4 ngày)
4. Nhấn "Tạo lộ trình ngay"
5. Chờ hệ thống xử lý (có thể mất 30-60 giây)

#### ✏️ Chỉnh sửa lộ trình
1. Trong trang lộ trình, nhấn "Chỉnh sửa"
2. **Thêm địa điểm**: Sử dụng ô tìm kiếm trong mỗi ngày
3. **Sắp xếp lại**: Kéo thả địa điểm hoặc dùng nút mũi tên
4. **Xóa địa điểm**: Nhấn nút thùng rác 🗑️
5. **Lưu thay đổi**: Nhấn "Lưu thay đổi" khi hoàn tất

#### 🗺️ Xem bản đồ
- Mỗi ngày có bản đồ riêng hiển thị các địa điểm
- Các marker được đánh số theo thứ tự trong ngày
- Click vào marker để xem thông tin chi tiết

#### 🔗 Chia sẻ lộ trình
- Copy URL của trang lộ trình để chia sẻ
- URL có format: `/itinerary/{shareable_id}`
- Lộ trình sẽ được lưu trữ vĩnh viễn

---

## 🔧 API Reference

### Base URL
```
http://localhost:4000/api
```

### Endpoints

#### 1. Lấy danh sách địa điểm
```http
GET /api/destinations
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Quán ăn ABC",
    "description": "Quán ăn nổi tiếng...",
    "address": "123 Đường ABC",
    "city": "Nha Trang",
    "latitude": 12.25,
    "longitude": 109.18,
    "category": "am-thuc",
    "image_url": "https://example.com/image.jpg"
  }
]
```

#### 2. Tạo lộ trình mới
```http
POST /api/generate-itinerary
Content-Type: application/json

{
  "province": "Nha Trang",
  "days": 3
}
```

**Response:**
```json
{
  "message": "Tạo lộ trình thành công!",
  "status": "success",
  "itinerary": {
    "id": 1,
    "shareable_id": "nha-trang-3d-1735123456789",
    "title": "Khám phá Nha Trang 3 ngày",
    "ItineraryItems": [...]
  },
  "shareableUrl": "/itinerary/nha-trang-3d-1735123456789"
}
```

#### 3. Lấy lộ trình theo ID
```http
GET /api/itinerary/{shareableId}
```

#### 4. Cập nhật lộ trình
```http
PUT /api/itineraries/{shareableId}
Content-Type: application/json

{
  "items": [
    {
      "destination_id": 1,
      "day_number": 1,
      "order_in_day": 1
    }
  ]
}
```

#### 5. Lấy tất cả lộ trình
```http
GET /api/itineraries
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Thiếu dữ liệu hoặc dữ liệu không hợp lệ |
| 404 | Not Found - Không tìm thấy resource |
| 500 | Internal Server Error - Lỗi server |

---

## 🚀 Deployment

### Chuẩn bị Production

#### 1. Build Frontend
```bash
cd frontend
npm run build
npm start
```

#### 2. Setup Production Backend
```bash
cd backend
NODE_ENV=production npm start
```

### Deployment Options

#### Option 1: VPS/Server truyền thống
1. **Setup Server**: Ubuntu 20.04+ với Node.js và MySQL
2. **Clone code**: `git clone` và `npm install`
3. **Configure**: Setup file `.env` với production values
4. **Process Manager**: Sử dụng PM2
```bash
npm install -g pm2
pm2 start backend/app.js --name "gengmap-backend"
pm2 start "npm run start" --name "gengmap-frontend" --cwd frontend
```

#### Option 2: Docker
```dockerfile
# Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
EXPOSE 4000
CMD ["npm", "start"]
```

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Option 3: Cloud Platforms
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Heroku, AWS EC2
- **Database**: PlanetScale, AWS RDS, Railway MySQL

### Production Environment Variables
```env
# Production database
DB_URI=mysql://prod_user:secure_password@prod_host:3306/prod_db

# API Keys (same as development)
OPENTRIPMAP_API_KEY=your_production_key
GEMINI_API_KEY=your_production_key

# Production settings
NODE_ENV=production
PORT=4000
```

---

## 🔍 Troubleshooting

### Lỗi thường gặp

#### 1. Backend không kết nối được database
```
❌ Không thể kết nối hoặc tạo bảng: SequelizeConnectionError
```
**Giải pháp:**
- Kiểm tra MySQL service đang chạy
- Xác nhận `DB_URI` trong file `.env`
- Kiểm tra firewall và network connectivity

#### 2. API Keys không hoạt động
```
⚠️ Không tìm thấy GEMINI_API_KEY
❌ Lỗi khi gọi OpenTripMap API: 401 Unauthorized
```
**Giải pháp:**
- Xác nhận API keys trong file `.env`
- Kiểm tra quota và limit của API keys
- Đảm bảo API keys chưa hết hạn

#### 3. Frontend không load được bản đồ
```
Đang tải bản đồ... (infinite loading)
```
**Giải pháp:**
- Kiểm tra console browser có lỗi JavaScript
- Xác nhận Leaflet CSS được load đúng
- Restart development server

#### 4. CORS Error
```
Access to fetch at 'http://localhost:4000' blocked by CORS policy
```
**Giải pháp:**
- Backend đã có CORS middleware, restart server
- Kiểm tra port backend đúng là 4000

#### 5. Database tables không được tạo
**Giải pháp:**
```bash
# Force sync tables
cd backend
node -e "require('./app.js')"
```

### Debug Mode
```bash
# Backend với debug logs
DEBUG=* npm run dev

# Frontend với verbose errors
npm run dev -- --turbo
```

### Performance Issues
- **Database**: Thêm index cho các trường tìm kiếm thường xuyên
- **API Rate Limiting**: Implement caching cho OpenTripMap API
- **Frontend**: Optimize images và lazy loading components

---

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Dưới đây là hướng dẫn để bạn có thể tham gia phát triển dự án.

### Development Setup

#### 1. Fork repository
```bash
git clone https://github.com/yourusername/GenGMap.git
cd GenGMap
git remote add upstream https://github.com/originaluser/GenGMap.git
```

#### 2. Tạo branch mới
```bash
git checkout -b feature/your-feature-name
# hoặc
git checkout -b bugfix/issue-description
```

#### 3. Development workflow
```bash
# Cài đặt dependencies
npm install # trong cả frontend và backend

# Chạy development mode
npm run dev

# Chạy tests (nếu có)
npm test

# Check linting
npm run lint
```

### Coding Standards

#### JavaScript/React
- Sử dụng ES6+ features
- Functional components với hooks
- Async/await thay vì Promises
- Meaningful variable names
- Comments cho logic phức tạp

#### CSS/Styling
- Tailwind CSS classes
- Responsive design mobile-first
- Consistent spacing và color scheme

#### Backend
- RESTful API design
- Proper error handling
- Database transactions cho operations quan trọng
- Logging cho debugging

### Pull Request Process

1. **Cập nhật documentation** nếu cần thiết
2. **Thêm tests** cho features mới
3. **Đảm bảo code passes linting**
4. **Update CHANGELOG.md** với thay đổi
5. **Tạo Pull Request** với mô tả chi tiết

### Bug Reports

Khi báo cáo bug, hãy bao gồm:
- **Môi trường**: OS, Node.js version, browser
- **Steps to reproduce**: Các bước tái tạo lỗi
- **Expected vs Actual behavior**
- **Screenshots** nếu có
- **Console logs/errors**

### Feature Requests

Đối với feature requests:
- **Mô tả chi tiết** use case
- **Giải thích** tại sao feature này hữu ích
- **Đề xuất implementation** nếu có

---

## 📚 Tài liệu tham khảo

### External APIs
- [OpenTripMap API Documentation](https://opentripmap.io/docs)
- [Google Gemini API Guide](https://ai.google.dev/docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html)

### Frameworks & Libraries
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/guide)
- [Sequelize ORM](https://sequelize.org/docs/v6/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Database
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Database Design Best Practices](https://dev.mysql.com/doc/mysql-tutorial-excerpt/5.7/en/designing-database.html)

---

## 📋 Roadmap

### Version 2.0 (Q2 2025)
- [ ] **User Authentication**: Đăng nhập, lưu lộ trình cá nhân
- [ ] **Social Features**: Chia sẻ, đánh giá, bình luận
- [ ] **Advanced AI**: Personalized recommendations
- [ ] **Mobile App**: React Native companion app

### Version 2.1 (Q3 2025)
- [ ] **Offline Support**: PWA với offline capabilities
- [ ] **Real-time Collaboration**: Chỉnh sửa lộ trình theo nhóm
- [ ] **Weather Integration**: Thông tin thời tiết theo thời gian thực
- [ ] **Budget Planning**: Ước tính chi phí du lịch

### Version 3.0 (Q4 2025)
- [ ] **Multi-language Support**: Hỗ trợ đa ngôn ngữ
- [ ] **International Destinations**: Mở rộng ra nước ngoài
- [ ] **AR Features**: Augmented Reality cho navigation
- [ ] **AI Chatbot**: Virtual travel assistant

---

## 📄 License

Dự án này được phân phối dưới [MIT License](LICENSE).

```
MIT License

Copyright (c) 2025 GenGMap Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Team

### Core Contributors
- **[Your Name]** - *Project Lead & Full-stack Developer*
- **[Contributor Name]** - *Frontend Specialist*
- **[Contributor Name]** - *Backend & AI Integration*

### Special Thanks
- OpenTripMap team cho dữ liệu địa điểm miễn phí
- Google AI team cho Gemini API
- Leaflet community cho open-source mapping solution

---

## 📞 Liên hệ & Hỗ trợ

### Getting Help
- **GitHub Issues**: [Tạo issue mới](https://github.com/yourusername/GenGMap/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/GenGMap/discussions)
- **Email**: gengmap.support@gmail.com

### Community
- **Discord**: [Join our server](https://discord.gg/gengmap)
- **Facebook Group**: [GenGMap Users](https://facebook.com/groups/gengmap)
- **Twitter**: [@GenGMapApp](https://twitter.com/gengmapapp)

---

<div align="center">

**⭐ Nếu dự án này hữu ích, hãy cho chúng tôi một star trên GitHub! ⭐**

Made with ❤️ by GenGMap Team

[⬆ Về đầu trang](#️-gengmap---ứng-dụng-tạo-lộ-trình-du-lịch-thông-minh)

</div>