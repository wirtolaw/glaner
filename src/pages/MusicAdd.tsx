import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const STATUSES = ['想听', '听过'];

export default function MusicAdd() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [status, setStatus] = useState('想听');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [comment, setComment] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [saving, setSaving] = useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    await supabase.from('gl_music').insert({
      title: title.trim(),
      artist: artist || null,
      status,
      tags: tags.length > 0 ? tags : null,
      comment: comment || null,
      source_url: sourceUrl || null,
      added_at: new Date().toISOString(),
    });
    setSaving(false);
    navigate('/music');
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-sm">← 返回</button>
        <h1 className="text-xl font-bold text-gray-100 flex-1">添加音乐</h1>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-gray-500 text-xs">标题 *</label>
          <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-gray-500 text-xs">歌手/乐队</label>
          <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={artist} onChange={(e) => setArtist(e.target.value)} />
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
          <label className="text-gray-500 text-xs">评论</label>
          <textarea className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500 min-h-[80px]" value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>

        <div>
          <label className="text-gray-500 text-xs">来源链接</label>
          <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
        </div>

        <button onClick={save} disabled={saving || !title.trim()} className="w-full bg-amber-500 text-gray-950 py-2.5 rounded-lg font-medium disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
      </div>
    </div>
  );
}
