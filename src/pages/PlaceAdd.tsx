import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PLACE_TYPES = [
  { value: 'travel', label: '旅游' },
  { value: 'writing_material', label: '写作素材' },
  { value: 'life', label: '生活' },
];

export default function PlaceAdd() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [placeType, setPlaceType] = useState('travel');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [saving, setSaving] = useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    await supabase.from('gl_places').insert({
      title: title.trim(),
      content: content || null,
      city: city || null,
      country: country || null,
      region: region || null,
      place_type: placeType,
      tags: tags.length > 0 ? tags : null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    });
    setSaving(false);
    navigate('/places');
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-sm">← 返回</button>
        <h1 className="text-xl font-bold text-gray-100 flex-1">添加地点</h1>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-gray-500 text-xs">标题 *</label>
          <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-gray-500 text-xs">内容</label>
          <textarea className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500 min-h-[120px]" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-gray-500 text-xs">城市</label>
            <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="text-gray-500 text-xs">国家</label>
            <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-gray-500 text-xs">地区</label>
          <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={region} onChange={(e) => setRegion(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-gray-500 text-xs">纬度</label>
            <input type="number" step="any" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="31.2304" />
          </div>
          <div className="flex-1">
            <label className="text-gray-500 text-xs">经度</label>
            <input type="number" step="any" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="121.4737" />
          </div>
        </div>

        <div>
          <label className="text-gray-500 text-xs">类型</label>
          <div className="flex gap-2 mt-1">
            {PLACE_TYPES.map((pt) => (
              <button key={pt.value} onClick={() => setPlaceType(pt.value)} className={`flex-1 py-2 rounded-lg text-sm ${placeType === pt.value ? 'bg-amber-500 text-gray-950 font-medium' : 'bg-gray-800 text-gray-400'}`}>{pt.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-gray-500 text-xs">标签</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {tags.map((t) => (
              <span key={t} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                {t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))} className="text-gray-500 hover:text-gray-300">×</button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input className="bg-gray-800 border-none rounded-full px-2 py-1 text-xs text-gray-100 w-20 focus:outline-none" placeholder="添加标签" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag()} />
              <button onClick={addTag} className="text-amber-500 text-xs">+</button>
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving || !title.trim()} className="w-full bg-amber-500 text-gray-950 py-2.5 rounded-lg font-medium disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
      </div>
    </div>
  );
}
