'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDays, setSelectedDays] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // tránh render sai lệch giữa server và client


  const handleSubmit = async () => {
    console.log('Đã nhấn nút tạo lộ trình'); // debug
    console.log('selectedProvince:', selectedProvince);
    console.log('selectedDays:', selectedDays);

    if (!selectedProvince || !selectedDays) {
      alert('Vui lòng chọn đầy đủ tỉnh và số ngày');
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          province: selectedProvince,
          days: parseInt(selectedDays),
        }),
      });

      const data = await response.json();

      if (data.shareableUrl) {
        router.push(data.shareableUrl);
      } else {
        alert('Không tạo được lộ trình.');
      }
    } catch (error) {
      console.error('Lỗi khi gửi request:', error);
      alert('Đã có lỗi xảy ra.');
    }
  };



  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-4 bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          🗺️ Tạo lộ trình du lịch
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              📍 Tỉnh/Thành phố
            </label>
            <input
              type="text"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              placeholder="Nhập tên tỉnh/thành phố (vd: Hà Nội, TP. Hồ Chí Minh...)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              📅 Số ngày du lịch
            </label>
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-black"
            >
              <option value="">Chọn số ngày...</option>
              <option value="1">1 ngày</option>
              <option value="2">2 ngày</option>
              <option value="3">3 ngày</option>
              <option value="4">4 ngày</option>
            </select>
          </div>

          <button
            className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={handleSubmit}
          >
            ✨ Tạo lộ trình ngay
          </button>
        </div>
      </div>
    </main>
  );
}
