import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const STATUSES = ['想看', '在看', '看过'];

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('想看');
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [review, setReview] = useState('');
  const [addedAt, setAddedAt] = useState<string | null>(null);
  const [watchedAt, setWatchedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const { data } = await supabase.from('gl_movies').select('*').eq('id', Number(id)).single();
    if (!data) return;
    setTitle(data.title ?? '');
    setYear(data.year);
    setCountry(data.country ?? '');
    setStatus(data.status ?? '想看');
    setRating(data.my_rating ?? 0);
    setTags(data.tags ?? []);
    setReview(data.review ?? '');
    setAddedAt(data.added_at);
    setWatchedAt(data.watched_at);
  }

  async function save() {
    setSaving(true);
    await supabase.from('gl_movies').update({
      title, year, country, status, my_rating: rating || null, tags, review: review || null,
      watched_at: status === '看过' && !watchedAt ? new Date().toISOString() : watchedAt,
    }).eq('id', Number(id));
    setSaving(false);
    navigate('/movies');
  }

  async function remove() {
    if (!confirm('确定删除？')) return;
    await supabase.from('gl_movies').delete().eq('id', Number(id));
    navigate('/movies');
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-sm">← 返回</button>
        <h1 className="text-xl font-bold text-gray-100 flex-1">电影详情</h1>
      </div>

      <div className="w-full h-48 bg-gray-900 rounded-xl flex items-center justify-center text-gray-600 text-5xl">🎬</div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-gray-500 text-xs">标题</label>
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

        <div className="text-gray-600 text-xs space-y-1">
          {addedAt && <p>添加于 {format(new Date(addedAt), 'yyyy-MM-dd HH:mm')}</p>}
          {watchedAt && <p>看过于 {format(new Date(watchedAt), 'yyyy-MM-dd HH:mm')}</p>}
        </div>

        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="flex-1 bg-amber-500 text-gray-950 py-2.5 rounded-lg font-medium">{saving ? '保存中...' : '保存'}</button>
          <button onClick={remove} className="bg-red-900 text-red-300 px-4 py-2.5 rounded-lg text-sm">删除</button>
        </div>
      </div>
    </div>
  );
}
