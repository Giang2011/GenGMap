// app/itinerary/[shareableId]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import SearchableSelect from './SearchableSelect';

// Dynamic import để tránh lỗi SSR với Leaflet
const DayMap = dynamic(() => import('./DayMap'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
    <p className="text-gray-500">Đang tải bản đồ...</p>
  </div>
});

export default function ItineraryPage() {
  const { shareableId } = useParams();
  const [days, setDays] = useState([]);
  const [itineraryInfo, setItineraryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    async function fetchItinerary() {
      try {
        const response = await fetch(`http://localhost:4000/api/itinerary/${shareableId}`);
        const data = await response.json();
        console.log("Itinerary response:", data);

        if (!data || !data.ItineraryItems) {
          setDays([]);
          return;
        }

        // Lưu thông tin itinerary
        setItineraryInfo({
          id: data.id,
          shareableId: data.shareable_id,
          title: data.title,
          createdAt: data.created_at
        });

        // Nhóm các địa điểm theo ngày
        const grouped = {};
        data.ItineraryItems.forEach(item => {
          const day = item.day_number;
          if (!grouped[day]) grouped[day] = [];
          grouped[day].push(item);
        });

        // Chuyển thành mảng có thứ tự ngày tăng dần
        const formattedDays = Object.keys(grouped)
          .sort((a, b) => Number(a) - Number(b))
          .map(dayNumber => ({
            day: Number(dayNumber),
            locations: grouped[dayNumber].sort((a, b) => a.order_in_day - b.order_in_day)
          }));

        setDays(formattedDays);
      } catch (err) {
        console.error('Lỗi khi fetch itinerary:', err);
      } finally {
        setLoading(false);
      }
    }

    if (shareableId) fetchItinerary();
  }, [shareableId]);

  // Fetch danh sách destinations khi vào chế độ edit
  useEffect(() => {
    if (isEditing) {
      fetchAvailableDestinations();
    }
  }, [isEditing]);

  async function fetchAvailableDestinations() {
    try {
      const response = await fetch('http://localhost:4000/api/destinations');
      const data = await response.json();
      setAvailableDestinations(data);
    } catch (err) {
      console.error('Lỗi khi fetch destinations:', err);
    }
  }

  // Xóa một địa điểm khỏi lộ trình
  const removeLocation = (dayIndex, locationIndex) => {
    const newDays = [...days];
    newDays[dayIndex].locations.splice(locationIndex, 1);
    
    // Cập nhật lại order_in_day
    newDays[dayIndex].locations.forEach((loc, idx) => {
      loc.order_in_day = idx + 1;
    });
    
    setDays(newDays);
  };

  // Thêm địa điểm vào ngày cụ thể
  const addLocationToDay = (dayIndex, destinationId) => {
    const destination = availableDestinations.find(dest => dest.id === parseInt(destinationId));
    if (!destination) return;

    const newDays = [...days];
    const newLocation = {
      Destination: destination,
      day_number: newDays[dayIndex].day,
      order_in_day: newDays[dayIndex].locations.length + 1
    };
    
    newDays[dayIndex].locations.push(newLocation);
    setDays(newDays);
  };

  // Drag and Drop functions
  const handleDragStart = (e, dayIndex, locationIndex) => {
    setDraggedItem({ dayIndex, locationIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetDayIndex, targetLocationIndex) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const { dayIndex: sourceDayIndex, locationIndex: sourceLocationIndex } = draggedItem;
    
    // Nếu thả vào cùng vị trí thì không làm gì
    if (sourceDayIndex === targetDayIndex && sourceLocationIndex === targetLocationIndex) {
      setDraggedItem(null);
      return;
    }

    const newDays = [...days];
    
    // Lấy item được kéo
    const draggedLocation = newDays[sourceDayIndex].locations[sourceLocationIndex];
    
    // Xóa item từ vị trí cũ
    newDays[sourceDayIndex].locations.splice(sourceLocationIndex, 1);
    
    // Cập nhật day_number cho item được kéo
    draggedLocation.day_number = newDays[targetDayIndex].day;
    
    // Thêm vào vị trí mới
    newDays[targetDayIndex].locations.splice(targetLocationIndex, 0, draggedLocation);
    
    // Cập nhật lại order_in_day cho cả hai ngày
    newDays[sourceDayIndex].locations.forEach((loc, idx) => {
      loc.order_in_day = idx + 1;
    });
    
    newDays[targetDayIndex].locations.forEach((loc, idx) => {
      loc.order_in_day = idx + 1;
    });
    
    setDays(newDays);
    setDraggedItem(null);
  };

  // Move item up/down within same day
  const moveLocation = (dayIndex, locationIndex, direction) => {
    const newDays = [...days];
    const locations = newDays[dayIndex].locations;
    
    const newIndex = direction === 'up' ? locationIndex - 1 : locationIndex + 1;
    
    if (newIndex < 0 || newIndex >= locations.length) return;
    
    // Swap items
    [locations[locationIndex], locations[newIndex]] = [locations[newIndex], locations[locationIndex]];
    
    // Update order_in_day
    locations.forEach((loc, idx) => {
      loc.order_in_day = idx + 1;
    });
    
    setDays(newDays);
  };

  // Lưu thay đổi
  const saveChanges = async () => {
    setSaving(true);
    try {
      const items = [];
      
      days.forEach(dayObj => {
        dayObj.locations.forEach((location, index) => {
          items.push({
            destination_id: location.Destination.id,
            day_number: dayObj.day,
            order_in_day: index + 1
          });
        });
      });

      const response = await fetch(`http://localhost:4000/api/itineraries/${shareableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items })
      });

      if (response.ok) {
        setIsEditing(false);
        // Refresh lại data
        window.location.reload();
      } else {
        console.error('Lỗi khi lưu:', await response.text());
        alert('Có lỗi xảy ra khi lưu thay đổi');
      }
    } catch (err) {
      console.error('Lỗi khi lưu:', err);
      alert('Có lỗi xảy ra khi lưu thay đổi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (days.length === 0) return <p>Không tìm thấy lộ trình hợp lệ.</p>;

  return (
    <div className="p-6">
      {/* Hiển thị thông tin itinerary */}
      {itineraryInfo && (
        <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{itineraryInfo.title}</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong className="text-indigo-700">🔗 ID để chia sẻ:</strong> <span className="font-mono bg-white px-2 py-1 rounded border">{itineraryInfo.shareableId}</span></p>
                <p><strong className="text-indigo-700">📅 Ngày tạo:</strong> {new Date(itineraryInfo.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  ✏️ Chỉnh sửa
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                  >
                    ❌ Hủy
                  </button>
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Thông báo trạng thái edit */}
      {isEditing && (
        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl shadow-sm">
          <p className="text-yellow-900 text-sm font-medium mb-2">
            ⚠️ <strong>Chế độ chỉnh sửa đang bật</strong>
          </p>
          <div className="text-yellow-800 text-xs space-y-1">
            <p>• 🔍 <strong>Tìm kiếm:</strong> Gõ tên địa điểm để tìm và thêm nhanh</p>
            <p>• 🖱️ <strong>Kéo thả:</strong> Kéo các địa điểm để sắp xếp lại thứ tự</p>
            <p>• ▲▼ <strong>Di chuyển:</strong> Dùng nút mũi tên để di chuyển từng bước</p>
            <p>• 🗑️ <strong>Xóa:</strong> Bấm nút thùng rác để xóa địa điểm</p>
            <p>• 💾 <strong>Lưu:</strong> Nhớ bấm "Lưu thay đổi" khi hoàn thành</p>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">📋 Chi tiết lộ trình</h2>
      {days.map((dayObj, index) => (
        <div key={index} className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
              {dayObj.day}
            </span>
            Ngày {dayObj.day}
          </h3>
          
          {/* Bản đồ cho ngày này */}
          <div className="mb-6">
            <DayMap locations={dayObj.locations} dayNumber={dayObj.day} />
          </div>

          {/* Thêm địa điểm mới (chỉ khi đang edit) */}
          {isEditing && (
            <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-sm">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <span className="text-lg">➕</span>
                Thêm địa điểm vào ngày {dayObj.day}
              </h4>
              <SearchableSelect
                options={availableDestinations}
                onSelect={(destinationId) => addLocationToDay(index, destinationId)}
                placeholder="🔍 Tìm kiếm địa điểm để thêm..."
              />
            </div>
          )}
          
          {/* Danh sách chi tiết các địa điểm */}
          <div className="space-y-3">
            {dayObj.locations.map((item, i) => (
              <div
                key={i}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, index, i)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index, i)}
                className={`p-5 bg-white border rounded-xl shadow-sm transition-all duration-200 ${
                  isEditing 
                    ? 'border-yellow-300 hover:shadow-lg hover:border-yellow-400 cursor-move' 
                    : 'border-gray-200 hover:shadow-lg hover:border-indigo-200'
                } ${draggedItem?.dayIndex === index && draggedItem?.locationIndex === i ? 'opacity-50 scale-95' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isEditing && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveLocation(index, i, 'up')}
                            disabled={i === 0}
                            className="w-6 h-6 bg-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded text-xs flex items-center justify-center transition-colors"
                            title="Di chuyển lên"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveLocation(index, i, 'down')}
                            disabled={i === dayObj.locations.length - 1}
                            className="w-6 h-6 bg-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded text-xs flex items-center justify-center transition-colors"
                            title="Di chuyển xuống"
                          >
                            ▼
                          </button>
                        </div>
                      )}
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-md">
                        {i + 1}
                      </span>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {item.Destination?.name || 'Không rõ tên địa điểm'}
                      </h4>
                      {isEditing && (
                        <div className="flex gap-1">
                          <span className="text-gray-400 text-sm">🖱️ Kéo để sắp xếp</span>
                          <button
                            onClick={() => removeLocation(index, i)}
                            className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
                            title="Xóa địa điểm này"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-2 ml-10">
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">🏷️ Loại:</span> 
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
                          {item.Destination?.category || 'Không rõ'}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 mt-0.5">📍 Địa chỉ:</span> 
                        <span className="text-gray-600">{item.Destination?.address || 'Không có địa chỉ'}</span>
                      </p>
                      {item.Destination?.description && (
                        <p className="flex items-start gap-2">
                          <span className="font-medium text-gray-700 mt-0.5">💬 Mô tả:</span> 
                          <span className="text-gray-600 italic">{item.Destination.description}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-xs font-medium shadow-sm">
                      ⭐ Thứ tự: {item.order_in_day}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
