import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const STATUSES = ['想看', '在看', '看过'];

export default function MovieAdd() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('想看');
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();
    await supabase.from('gl_movies').insert({
      title: title.trim(),
      year,
      country: country || null,
      status,
      my_rating: rating || null,
      tags: tags.length > 0 ? tags : null,
      review: review || null,
      added_at: now,
      watched_at: status === '看过' ? now : null,
    });
    setSaving(false);
    navigate('/movies');
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-sm">← 返回</button>
        <h1 className="text-xl font-bold text-gray-100 flex-1">添加电影</h1>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-gray-500 text-xs">标题 *</label>
          <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-gray-500 text-xs">年份</label>
            <input type="number" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={year ?? ''} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div className="flex-1">
            <label className="text-gray-500 text-xs">国家</label>
            <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-gray-500 text-xs">状态</label>
          <div className="flex gap-2 mt-1">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`flex-1 py-2 rounded-lg text-sm ${status === s ? 'bg-amber-500 text-gray-950 font-medium' : 'bg-gray-800 text-gray-400'}`}>{s}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-gray-500 text-xs">评分</label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(rating === i ? 0 : i)} className={`text-2xl ${i <= rating ? 'text-amber-500' : 'text-gray-600'}`}>★</button>
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

        <div>
          <label className="text-gray-500 text-xs">短评</label>
          <textarea className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500 min-h-[80px]" value={review} onChange={(e) => setReview(e.target.value)} />
        </div>

        <button onClick={save} disabled={saving || !title.trim()} className="w-full bg-amber-500 text-gray-950 py-2.5 rounded-lg font-medium disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
      </div>
    </div>
  );
}
