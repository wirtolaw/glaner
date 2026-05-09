import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import L from 'leaflet';

interface Place {
  id: number;
  title: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function Places() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [35, 105],
      zoom: 4,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  useEffect(() => {
    const map = leafletMap.current;
    if (!map || places.length === 0) return;

    const cityGroups: Record<string, { lat: number; lng: number; count: number; city: string }> = {};
    places.forEach((p) => {
      if (!p.city || p.latitude == null || p.longitude == null) return;
      if (!cityGroups[p.city]) {
        cityGroups[p.city] = { lat: p.latitude, lng: p.longitude, count: 0, city: p.city };
      }
      cityGroups[p.city].count += 1;
    });

    Object.values(cityGroups).forEach((g) => {
      const icon = L.divIcon({
        html: `<div style="background:#f59e0b;color:#111;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${g.count}</div>`,
        iconSize: [32, 32],
        className: '',
      });
      const marker = L.marker([g.lat, g.lng], { icon }).addTo(map);
      marker.bindTooltip(g.city, { direction: 'top', offset: [0, -16] });
      marker.on('click', () => navigate(`/places/city/${encodeURIComponent(g.city)}`));
    });

    const coords = Object.values(cityGroups).map((g) => [g.lat, g.lng] as [number, number]);
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords.map((c) => L.latLng(c[0], c[1]))), { padding: [40, 40] });
    }
  }, [places, navigate]);

  async function load() {
    const { data } = await supabase.from('gl_places').select('id, title, city, country, latitude, longitude');
    setPlaces(data ?? []);
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 bg-gray-950 z-10">
        <h1 className="text-2xl font-bold text-gray-100">城市</h1>
        <button onClick={() => navigate('/places/add')} className="bg-amber-500 text-gray-950 px-4 py-1.5 rounded-lg text-sm font-medium">添加</button>
      </div>
      <div ref={mapRef} className="flex-1" />
    </div>
  );
}
