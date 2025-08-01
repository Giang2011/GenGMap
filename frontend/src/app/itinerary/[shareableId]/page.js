// app/itinerary/[shareableId]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ItineraryPage() {
  const { shareableId } = useParams();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (days.length === 0) return <p>Không tìm thấy lộ trình hợp lệ.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lộ trình gợi ý</h1>
      {days.map((dayObj, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Ngày {dayObj.day}</h2>
          <div className="flex flex-wrap gap-2">
            {dayObj.locations.map((item, i) => (
              <button
                key={i}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
              >
                {item.Destination?.name || 'Không rõ tên địa điểm'}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
