'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix cho icon markers trong Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DayMap({ locations, dayNumber }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!locations || locations.length === 0) return;

    // Tạo map nếu chưa có
    if (!mapInstanceRef.current) {
      const firstLocation = locations[0].Destination;
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [firstLocation.latitude, firstLocation.longitude],
        13
      );

      // Thêm tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    
    // Xóa tất cả markers và polylines cũ
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Tạo markers và tập hợp tọa độ
    const coordinates = [];
    
    locations.forEach((item, index) => {
      const { latitude, longitude, name, category, address, description } = item.Destination;
      
      // Thêm tọa độ vào mảng
      coordinates.push([latitude, longitude]);
      
      // Tạo custom icon với số thứ tự - màu gradient đẹp
      const customIcon = L.divIcon({
        html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 3px 8px rgba(102, 126, 234, 0.4); font-size: 14px;">${index + 1}</div>`,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      // Tạo marker
      const marker = L.marker([latitude, longitude], { icon: customIcon })
        .addTo(map);
      
      // Tạo popup content với màu sắc đẹp hơn
      const popupContent = `
        <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="margin: 0 0 10px 0; font-weight: 600; color: #1f2937; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">${name}</h3>
          <p style="margin: 6px 0; font-size: 13px; display: flex; align-items: center;">
            <strong style="color: #374151; margin-right: 8px;">Loại:</strong> 
            <span style="background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%); color: #92400e; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">
              ${category}
            </span>
          </p>
          <p style="margin: 6px 0; font-size: 13px; color: #4b5563;"><strong style="color: #374151;">📍 Địa chỉ:</strong> ${address}</p>
          ${description ? `<p style="margin: 6px 0; font-size: 12px; color: #6b7280; font-style: italic;"><strong style="color: #374151;">💬 Mô tả:</strong> ${description}</p>` : ''}
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #9ca3af; text-align: right;"><strong>⭐ Thứ tự:</strong> ${item.order_in_day}</p>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });

    // Tạo polyline nối các điểm với màu gradient đẹp
    if (coordinates.length > 1) {
      const polyline = L.polyline(coordinates, {
        color: '#667eea',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 12',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      
      // Fit map để hiển thị tất cả các điểm
      map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    } else if (coordinates.length === 1) {
      // Nếu chỉ có 1 điểm, center map tại điểm đó
      map.setView(coordinates[0], 15);
    }

  }, [locations, dayNumber]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!locations || locations.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Không có địa điểm nào trong ngày này</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div 
        ref={mapRef} 
        className="h-64 w-full rounded-lg border border-gray-300"
        style={{ minHeight: '300px' }}
      />
      <div className="mt-2 text-xs text-gray-600">
        <p>🗺️ Bản đồ hiển thị {locations.length} địa điểm được nối theo thứ tự</p>
      </div>
    </div>
  );
}
