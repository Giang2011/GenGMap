// 1. Nạp (import) các thư viện cần thiết
const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const axios = require('axios');
require('dotenv').config();

// 2. Tạo một ứng dụng express
const app = express();

// Middleware để xử lý JSON
app.use(express.json());

// 3. Xác định cổng mà máy chủ sẽ lắng nghe
const port = 3000;

// ================= SEQUELIZE SETUP (Phiên bản MySQL) =================

// Hàm để gọi OpenTripMap API
async function fetchDestinationsFromOpenTripMap(province) {
    const apiKey = process.env.OPENTRIPMAP_API_KEY;
    console.log(`🌐 Đang gọi OpenTripMap API cho tỉnh: ${province}`);
    
    try {
        // Bước 1: Tìm tọa độ của tỉnh
        const geoResponse = await axios.get(`https://api.opentripmap.com/0.1/en/places/geoname`, {
            params: {
                name: province,
                apikey: apiKey
            }
        });

        if (!geoResponse.data || !geoResponse.data.lat) {
            console.log('❌ Không tìm thấy tọa độ cho tỉnh này');
            return [];
        }

        const { lat, lon } = geoResponse.data;
        console.log(`📍 Tọa độ ${province}: ${lat}, ${lon}`);

        // Bước 2: Lấy dữ liệu cho 3 loại địa điểm
        const categoryConfigs = [
            {
                kinds: 'restaurants',
                category: 'am-thuc',
                name: 'Quán ăn'
            },
            {
                kinds: 'resorts,hostels,other_hotels',
                category: 'khach-san',
                name: 'Khách sạn'
            },
            {
                kinds: 'natural,museums,amusements',
                category: 'tham-quan',
                name: 'Địa điểm tham quan'
            }
        ];

        const allDestinations = [];

        for (const config of categoryConfigs) {
            console.log(`🔍 Đang lấy dữ liệu ${config.name}...`);
            
            // Lấy danh sách địa điểm cho từng loại
            const placesResponse = await axios.get(`https://api.opentripmap.com/0.1/en/places/radius`, {
                params: {
                    radius: 50000, // 50km
                    lon: lon,
                    lat: lat,
                    kinds: config.kinds,
                    format: 'json',
                    limit: 20, // 20 địa điểm mỗi loại
                    apikey: apiKey
                }
            });

            console.log(`📊 Tìm thấy ${placesResponse.data.length} ${config.name} từ OpenTripMap`);

            // Lấy chi tiết cho tất cả địa điểm trong loại này
            for (const place of placesResponse.data) {
                try {
                    const detailResponse = await axios.get(`https://api.opentripmap.com/0.1/en/places/xid/${place.xid}`, {
                        params: { apikey: apiKey }
                    });

                    const detail = detailResponse.data;
                    
                    if (detail.name && detail.point) {
                        allDestinations.push({
                            name: detail.name,
                            description: detail.wikipedia_extracts?.text || detail.info?.descr || `${config.name} thú vị tại ${province}`,
                            address: detail.address?.road || detail.address?.city || '',
                            city: province,
                            latitude: detail.point.lat,
                            longitude: detail.point.lon,
                            category: config.category,
                            image_url: detail.preview?.source || detail.image || ''
                        });
                    }
                    
                    // Delay nhỏ để tránh rate limit
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (detailError) {
                    console.log(`⚠️ Lỗi khi lấy chi tiết cho ${config.name} ${place.xid}:`, detailError.message);
                }
            }

            // Delay giữa các loại
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log(`✅ Đã xử lý thành công ${allDestinations.length} địa điểm tổng cộng`);
        
        // Thống kê theo loại
        const stats = {};
        categoryConfigs.forEach(config => {
            stats[config.category] = allDestinations.filter(dest => dest.category === config.category).length;
        });
        console.log('📋 Thống kê theo loại:', stats);

        return allDestinations;

    } catch (error) {
        console.error('❌ Lỗi khi gọi OpenTripMap API:', error.message);
        return [];
    }
}

// Hàm gọi Gemini AI để tạo lộ trình thông minh
async function generateItineraryWithAI(destinations, province, days) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
        console.log('⚠️ Không tìm thấy GEMINI_API_KEY, bỏ qua AI generation');
        return null;
    }

    try {
        console.log('🤖 Đang gọi Gemini AI để tạo lộ trình...');

        // Chuẩn bị dữ liệu cho AI
        const destinationData = destinations.map((dest, index) => ({
            id: dest.id,
            name: dest.name,
            description: dest.description,
            category: dest.category,
            address: dest.address,
            latitude: dest.latitude,
            longitude: dest.longitude
        }));

        const prompt = `
        Bạn là một chuyên gia du lịch. Hãy tạo lộ trình du lịch ${days} ngày cho ${province} dựa trên danh sách địa điểm sau:

        DANH SÁCH ĐỊA ĐIỂM:
        ${JSON.stringify(destinationData, null, 2)}

        YÊU CẦU:
        1. Tạo lộ trình ${days} ngày hợp lý và thực tế
        2. Mỗi ngày chỉ nên có 3-5 địa điểm để tránh quá tải
        3. Cân bằng giữa các loại: ăn uống (am-thuc), tham quan (tham-quan), nghỉ ngơi (khach-san)
        4. Sắp xếp theo địa lý gần nhau để tiết kiệm thời gian di chuyển
        5. Ưu tiên các địa điểm nổi tiếng và có giá trị trải nghiệm cao

        ĐỊNH DẠNG TRẢ VỀ (JSON):
        [
          {
            "day": 1,
            "destinations": [
              {"id": 1, "reason": "Lý do chọn địa điểm này"},
              {"id": 2, "reason": "Lý do chọn địa điểm này"}
            ]
          },
          {
            "day": 2,
            "destinations": [
              {"id": 3, "reason": "Lý do chọn địa điểm này"}
            ]
          }
        ]

        Chỉ trả về JSON, không có text thêm.
        `;

        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + geminiApiKey,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          }
        );

        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
            console.log('⚠️ Không nhận được phản hồi từ Gemini AI');
            return null;
        }

        // Parse JSON response
        const cleanedResponse = aiResponse.replace(/```json\n?|```\n?/g, '').trim();
        const itinerary = JSON.parse(cleanedResponse);

        console.log('✅ Gemini AI đã tạo lộ trình thành công');
        console.log('📋 Lộ trình AI:', JSON.stringify(itinerary, null, 2));

        return itinerary;

    } catch (error) {
        console.error('❌ Lỗi khi gọi Gemini AI:', error.message);
        if (error.response?.data) {
            console.error('Chi tiết lỗi:', error.response.data);
        }
        return null;
    }
}

// 4. Kết nối tới cơ sở dữ liệu MySQL
const dbUri = process.env.DB_URI;
const sequelize = dbUri
  ? new Sequelize(dbUri)
  : new Sequelize('my_express_app', 'root', '', {
      host: 'localhost',
      dialect: 'mysql'
    });

// 5. Định nghĩa các Models (Models tương ứng với các bảng trong CSDL)

// Bảng Destinations (Địa điểm)
const Destination = sequelize.define('Destination', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  address: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8)
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8)
  },
  category: {
    type: DataTypes.STRING
  },
  image_url: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'destinations'
});

// Bảng Itineraries (Lộ trình)
const Itinerary = sequelize.define('Itinerary', {
  shareable_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'itineraries',
  timestamps: true, // Tự động thêm createdAt và updatedAt
  createdAt: 'created_at',
  updatedAt: false // Chỉ cần created_at
});

// Bảng Itinerary_Items (Các chặng trong lộ trình)
const ItineraryItem = sequelize.define('ItineraryItem', {
  day_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_in_day: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'itinerary_items' // Đặt tên bảng theo snake_case
});

// Thiết lập quan hệ giữa các bảng
// Itinerary có nhiều ItineraryItems
Itinerary.hasMany(ItineraryItem, {
  foreignKey: 'itinerary_id',
  onDelete: 'CASCADE'
});

// ItineraryItem thuộc về một Itinerary
ItineraryItem.belongsTo(Itinerary, {
  foreignKey: 'itinerary_id'
});

// Destination có nhiều ItineraryItems
Destination.hasMany(ItineraryItem, {
  foreignKey: 'destination_id',
  onDelete: 'CASCADE'
});

// ItineraryItem thuộc về một Destination
ItineraryItem.belongsTo(Destination, {
  foreignKey: 'destination_id'
});

// ================= EXPRESS ROUTES =================

app.get('/', (req, res) => {
  res.send('Chào mừng đến với ứng dụng Express và Sequelize + MySQLhihi!');
});

app.get('/users', async (req, res) => {
    try {
        const destinations = await Destination.findAll();
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ error: 'Đã có lỗi xảy ra' });
    }
});

// Route để lấy tất cả địa điểm
app.get('/api/destinations', async (req, res) => {
    try {
        const destinations = await Destination.findAll();
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ error: 'Đã có lỗi xảy ra khi lấy danh sách địa điểm' });
    }
});

// Route để lấy tất cả lộ trình
app.get('/api/itineraries', async (req, res) => {
    try {
        const itineraries = await Itinerary.findAll({
            include: [{
                model: ItineraryItem,
                include: [Destination]
            }]
        });
        res.json(itineraries);
    } catch (error) {
        res.status(500).json({ error: 'Đã có lỗi xảy ra khi lấy danh sách lộ trình' });
    }
});

// Route để lấy lộ trình theo shareable_id
app.get('/api/itinerary/:shareableId', async (req, res) => {
    try {
        const itinerary = await Itinerary.findOne({
            where: { shareable_id: req.params.shareableId },
            include: [{
                model: ItineraryItem,
                include: [Destination],
                order: [['day_number', 'ASC'], ['order_in_day', 'ASC']]
            }]
        });
        
        if (!itinerary) {
            return res.status(404).json({ error: 'Không tìm thấy lộ trình' });
        }
        
        res.json(itinerary);
    } catch (error) {
        res.status(500).json({ error: 'Đã có lỗi xảy ra khi lấy lộ trình' });
    }
});

// API tạo lộ trình du lịch
app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const { province, days } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!province || !days) {
            return res.status(400).json({ 
                error: 'Vui lòng cung cấp tỉnh thành (province) và số ngày (days)' 
            });
        }

        if (days <= 0 || days > 30) {
            return res.status(400).json({ 
                error: 'Số ngày phải từ 1 đến 30' 
            });
        }

        console.log(`🔍 Đang kiểm tra dữ liệu cho tỉnh: ${province}, ${days} ngày`);

        // Kiểm tra xem có dữ liệu về tỉnh này trong database không
        const existingDestinations = await Destination.findAll({
            where: {
                city: {
                    [Op.like]: `%${province}%`
                }
            }
        });

        console.log(`📊 Tìm thấy ${existingDestinations.length} địa điểm trong database`);

        // Kiểm tra xem có đủ các loại địa điểm không
        const categories = ['am-thuc', 'khach-san', 'tham-quan'];
        const categoryCounts = {};
        
        categories.forEach(cat => {
            categoryCounts[cat] = existingDestinations.filter(dest => 
                dest.category && dest.category.includes(cat)
            ).length;
        });

        console.log('📋 Thống kê theo danh mục:', categoryCounts);

        // Nếu không có đủ dữ liệu (ít nhất 2 địa điểm mỗi loại cho mỗi ngày)
        const minRequired = days * 2; // Tối thiểu 2 địa điểm mỗi loại cho mỗi ngày
        const needsExternalData = categories.some(cat => categoryCounts[cat] < minRequired);

        if (needsExternalData || existingDestinations.length < days * 6) {
            console.log('⚠️ Không đủ dữ liệu trong database, đang gọi API bên ngoài...');
            
            // Gọi OpenTripMap API để lấy dữ liệu
            const newDestinations = await fetchDestinationsFromOpenTripMap(province);
            
            if (newDestinations.length === 0) {
                return res.status(404).json({
                    message: 'Không tìm thấy dữ liệu cho tỉnh này',
                    status: 'no_data_found',
                    currentData: {
                        totalDestinations: existingDestinations.length,
                        categoryCounts: categoryCounts,
                        minRequired: minRequired
                    }
                });
            }

            // Lưu dữ liệu mới vào database
            console.log(`💾 Đang lưu ${newDestinations.length} địa điểm mới vào database...`);
            const savedDestinations = await Destination.bulkCreate(newDestinations, {
                ignoreDuplicates: true // Bỏ qua nếu đã tồn tại
            });

            console.log(`✅ Đã lưu ${savedDestinations.length} địa điểm mới`);

            // Lấy lại toàn bộ dữ liệu sau khi đã thêm mới
            const updatedDestinations = await Destination.findAll({
                where: {
                    city: {
                        [Op.like]: `%${province}%`
                    }
                }
            });

            console.log(`📊 Tổng số địa điểm sau khi cập nhật: ${updatedDestinations.length}`);

            // Kiểm tra lại xem có đủ dữ liệu để tạo lộ trình không
            if (updatedDestinations.length < days * 3) {
                return res.json({
                    message: 'Đã thu thập thêm dữ liệu nhưng vẫn chưa đủ để tạo lộ trình',
                    status: 'insufficient_data',
                    newDataAdded: savedDestinations.length,
                    totalDestinations: updatedDestinations.length,
                    note: 'Có thể thử với ít ngày hơn hoặc tỉnh thành khác'
                });
            }

            // Sử dụng dữ liệu đã cập nhật để tạo lộ trình
            existingDestinations.splice(0, existingDestinations.length, ...updatedDestinations);
        }

        // Nếu có đủ dữ liệu, tạo lộ trình
        console.log('✅ Có đủ dữ liệu, đang tạo lộ trình với AI...');
        
        // Tạo ID chia sẻ duy nhất
        const shareableId = `${province.toLowerCase().replace(/\s+/g, '-')}-${days}d-${Date.now()}`;
        
        // Tạo lộ trình mới
        const newItinerary = await Itinerary.create({
            shareable_id: shareableId,
            title: `Khám phá ${province} ${days} ngày`
        });

        // Gọi AI để tạo lộ trình thông minh
        const aiItinerary = await generateItineraryWithAI(existingDestinations, province, days);
        
        if (!aiItinerary || aiItinerary.length === 0) {
            // Fallback về logic cũ nếu AI không hoạt động
            console.log('⚠️ AI không hoạt động, sử dụng logic phân bổ đơn giản...');
            const destinationsPerDay = Math.ceil(Math.min(existingDestinations.length, days * 4) / days);
            
            for (let day = 1; day <= days; day++) {
                const startIndex = (day - 1) * destinationsPerDay;
                const endIndex = Math.min(startIndex + destinationsPerDay, existingDestinations.length);
                const dayDestinations = existingDestinations.slice(startIndex, endIndex);
                
                for (let i = 0; i < dayDestinations.length; i++) {
                    await ItineraryItem.create({
                        itinerary_id: newItinerary.id,
                        destination_id: dayDestinations[i].id,
                        day_number: day,
                        order_in_day: i + 1
                    });
                }
            }
        } else {
            // Sử dụng kết quả từ AI
            console.log('🤖 Sử dụng lộ trình được tạo bởi AI...');
            for (const dayPlan of aiItinerary) {
                for (let i = 0; i < dayPlan.destinations.length; i++) {
                    const destination = existingDestinations.find(d => d.id === dayPlan.destinations[i].id);
                    if (destination) {
                        await ItineraryItem.create({
                            itinerary_id: newItinerary.id,
                            destination_id: destination.id,
                            day_number: dayPlan.day,
                            order_in_day: i + 1
                        });
                    }
                }
            }
        }

        // Lấy lộ trình vừa tạo với đầy đủ thông tin
        const createdItinerary = await Itinerary.findOne({
            where: { id: newItinerary.id },
            include: [{
                model: ItineraryItem,
                include: [Destination],
                order: [['day_number', 'ASC'], ['order_in_day', 'ASC']]
            }]
        });

        res.json({
            message: 'Tạo lộ trình thành công!',
            status: 'success',
            itinerary: createdItinerary,
            shareableUrl: `/itinerary/${shareableId}`
        });

    } catch (error) {
        console.error('❌ Lỗi khi tạo lộ trình:', error);
        res.status(500).json({ 
            error: 'Đã có lỗi xảy ra khi tạo lộ trình',
            details: error.message 
        });
    }
});

// API để cập nhật lộ trình (Xóa và Ghi lại)
app.put('/api/itineraries/:shareableId', async (req, res) => {
    try {
        const { shareableId } = req.params;
        const { items } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ 
                error: 'Vui lòng cung cấp mảng items để cập nhật' 
            });
        }

        console.log(`🔄 Đang cập nhật lộ trình: ${shareableId}`);
        console.log(`📊 Số lượng items mới: ${items.length}`);

        // Kiểm tra xem lộ trình có tồn tại không
        const existingItinerary = await Itinerary.findOne({
            where: { shareable_id: shareableId }
        });

        if (!existingItinerary) {
            return res.status(404).json({ 
                error: 'Không tìm thấy lộ trình với ID này' 
            });
        }

        // Validate dữ liệu items
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.destination_id || !item.day_number || !item.order_in_day) {
                return res.status(400).json({ 
                    error: `Item thứ ${i + 1} thiếu thông tin bắt buộc (destination_id, day_number, order_in_day)` 
                });
            }

            // Kiểm tra destination có tồn tại không
            const destinationExists = await Destination.findByPk(item.destination_id);
            if (!destinationExists) {
                return res.status(400).json({ 
                    error: `Destination với ID ${item.destination_id} không tồn tại` 
                });
            }
        }

        // Sử dụng database transaction để đảm bảo an toàn dữ liệu
        const result = await sequelize.transaction(async (transaction) => {
            // Bước 1: Xóa tất cả itinerary_items cũ
            console.log('🗑️ Đang xóa các items cũ...');
            await ItineraryItem.destroy({
                where: { itinerary_id: existingItinerary.id },
                transaction
            });

            // Bước 2: Thêm lại các items mới
            console.log('➕ Đang thêm các items mới...');
            const newItems = items.map(item => ({
                itinerary_id: existingItinerary.id,
                destination_id: item.destination_id,
                day_number: item.day_number,
                order_in_day: item.order_in_day
            }));

            await ItineraryItem.bulkCreate(newItems, { transaction });

            // Bước 3: Lấy lại lộ trình đã cập nhật với đầy đủ thông tin
            const updatedItinerary = await Itinerary.findOne({
                where: { id: existingItinerary.id },
                include: [{
                    model: ItineraryItem,
                    include: [Destination],
                    order: [['day_number', 'ASC'], ['order_in_day', 'ASC']]
                }],
                transaction
            });

            return updatedItinerary;
        });

        console.log('✅ Cập nhật lộ trình thành công');

        res.json({
            message: 'Cập nhật lộ trình thành công!',
            status: 'success',
            itinerary: result,
            updated_items_count: items.length
        });

    } catch (error) {
        console.error('❌ Lỗi khi cập nhật lộ trình:', error);
        res.status(500).json({ 
            error: 'Đã có lỗi xảy ra khi cập nhật lộ trình',
            details: error.message 
        });
    }
});

// ================= START SERVER =================

app.listen(port, async () => {
  console.log(`Ứng dụng ví dụ đang chạy tại http://localhost:${port}`);
  
  try {
    // Thử kết nối tới database
    await sequelize.authenticate();
    console.log('✅ Kết nối MySQL thành công.');

    // Đồng bộ model với cơ sở dữ liệu (tạo bảng nếu chưa có)
    await sequelize.sync();
    console.log('✅ Bảng đã được tạo (hoặc đã tồn tại) thành công!');
  } catch (error) {
    console.error('❌ Không thể kết nối hoặc tạo bảng:', error);
  }
});