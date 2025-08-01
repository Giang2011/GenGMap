'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';

const provinces = [
  { value: "An Giang", label: "An Giang" },
  { value: "Bà Rịa - Vũng Tàu", label: "Bà Rịa - Vũng Tàu" },
  { value: "Bắc Giang", label: "Bắc Giang" },
  { value: "Bắc Kạn", label: "Bắc Kạn" },
  { value: "Bạc Liêu", label: "Bạc Liêu" },
  { value: "Bắc Ninh", label: "Bắc Ninh" },
  { value: "Bến Tre", label: "Bến Tre" },
  { value: "Bình Định", label: "Bình Định" },
  { value: "Bình Dương", label: "Bình Dương" },
  { value: "Bình Phước", label: "Bình Phước" },
  { value: "Bình Thuận", label: "Bình Thuận" },
  { value: "Cà Mau", label: "Cà Mau" },
  { value: "Cần Thơ", label: "Cần Thơ" },
  { value: "Cao Bằng", label: "Cao Bằng" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
  { value: "Đắk Lắk", label: "Đắk Lắk" },
  { value: "Đắk Nông", label: "Đắk Nông" },
  { value: "Điện Biên", label: "Điện Biên" },
  { value: "Đồng Nai", label: "Đồng Nai" },
  { value: "Đồng Tháp", label: "Đồng Tháp" },
  { value: "Gia Lai", label: "Gia Lai" },
  { value: "Hà Giang", label: "Hà Giang" },
  { value: "Hà Nam", label: "Hà Nam" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "Hà Tĩnh", label: "Hà Tĩnh" },
  { value: "Hải Dương", label: "Hải Dương" },
  { value: "Hải Phòng", label: "Hải Phòng" },
  { value: "Hậu Giang", label: "Hậu Giang" },
  { value: "Hòa Bình", label: "Hòa Bình" },
  { value: "Hưng Yên", label: "Hưng Yên" },
  { value: "Khánh Hòa", label: "Khánh Hòa" },
  { value: "Kiên Giang", label: "Kiên Giang" },
  { value: "Kon Tum", label: "Kon Tum" },
  { value: "Lai Châu", label: "Lai Châu" },
  { value: "Lâm Đồng", label: "Lâm Đồng" },
  { value: "Lạng Sơn", label: "Lạng Sơn" },
  { value: "Lào Cai", label: "Lào Cai" },
  { value: "Long An", label: "Long An" },
  { value: "Nam Định", label: "Nam Định" },
  { value: "Nghệ An", label: "Nghệ An" },
  { value: "Ninh Bình", label: "Ninh Bình" },
  { value: "Ninh Thuận", label: "Ninh Thuận" },
  { value: "Phú Thọ", label: "Phú Thọ" },
  { value: "Phú Yên", label: "Phú Yên" },
  { value: "Quảng Bình", label: "Quảng Bình" },
  { value: "Quảng Nam", label: "Quảng Nam" },
  { value: "Quảng Ngãi", label: "Quảng Ngãi" },
  { value: "Quảng Ninh", label: "Quảng Ninh" },
  { value: "Quảng Trị", label: "Quảng Trị" },
  { value: "Sóc Trăng", label: "Sóc Trăng" },
  { value: "Sơn La", label: "Sơn La" },
  { value: "Tây Ninh", label: "Tây Ninh" },
  { value: "Thái Bình", label: "Thái Bình" },
  { value: "Thái Nguyên", label: "Thái Nguyên" },
  { value: "Thanh Hóa", label: "Thanh Hóa" },
  { value: "Thừa Thiên Huế", label: "Thừa Thiên Huế" },
  { value: "Tiền Giang", label: "Tiền Giang" },
  { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
  { value: "Trà Vinh", label: "Trà Vinh" },
  { value: "Tuyên Quang", label: "Tuyên Quang" },
  { value: "Vĩnh Long", label: "Vĩnh Long" },
  { value: "Vĩnh Phúc", label: "Vĩnh Phúc" },
  { value: "Yên Bái", label: "Yên Bái" },
];


const days = [
  { value: 1, label: '1 ngày' },
  { value: 2, label: '2 ngày' },
  { value: 3, label: '3 ngày' },
  { value: 4, label: '4 ngày' },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDays, setSelectedDays] = useState(null);

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
          province: selectedProvince.value,
          days: selectedDays.value,
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-4 bg-black">
      <h1 className="text-3xl font-bold">Tạo lộ trình du lịch</h1>

      <div className="w-full max-w-md">
        <label className="block mb-1">Chọn tỉnh/thành phố</label>
        <Select
          options={provinces}
          onChange={setSelectedProvince}
          placeholder="Chọn tỉnh..."
        />
      </div>

      <div className="w-full max-w-md">
        <label className="block mb-1 mt-4">Chọn số ngày</label>
        <Select
          options={days}
          onChange={setSelectedDays}
          placeholder="Chọn số ngày..."
        />
      </div>

      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Tạo lộ trình
      </button>
    </main>
  );
}
