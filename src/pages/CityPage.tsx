import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Place {
  id: number;
  title: string;
  content: string | null;
  city: string | null;
  tags: string[] | null;
  place_type: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  travel: '旅游',
  writing_material: '写作素材',
  life: '生活',
};

export default function CityPage() {
  const { city } = useParams();
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const decodedCity = decodeURIComponent(city ?? '');

  useEffect(() => { load(); }, [city]);

  async function load() {
    const { data } = await supabase.from('gl_places').select('*').eq('city', decodedCity).order('created_at', { ascending: false });
    setPlaces(data ?? []);
  }

  const grouped: Record<string, Place[]> = {};
  places.forEach((p) => {
    const key = p.place_type ?? 'other';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/places')} className="text-gray-400 text-sm">← 返回</button>
        <h1 className="text-xl font-bold text-gray-100 flex-1">{decodedCity}</h1>
        <span className="text-gray-500 text-sm">{places.length}条记录</span>
      </div>

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <h2 className="text-sm font-medium text-amber-500 mb-2">{TYPE_LABELS[type] ?? type}</h2>
          <div className="flex flex-col gap-2">
            {items.map((p) => (
              <button key={p.id} onClick={() => navigate(`/places/${p.id}`)} className="bg-gray-900 rounded-lg px-4 py-3 text-left w-full">
                <p className="text-gray-100">{p.title}</p>
                {p.content && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.content}</p>}
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tags.map((t) => (
                      <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {places.length === 0 && <p className="text-gray-500 text-sm text-center py-8">暂无数据</p>}
    </div>
  );
}
