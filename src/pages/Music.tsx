import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface MusicItem {
  id: number;
  title: string;
  artist: string | null;
  status: string;
  tags: string[] | null;
  comment: string | null;
  source_url: string | null;
  created_at: string;
}

export default function Music() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MusicItem[]>([]);
  const [filtered, setFiltered] = useState<MusicItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { load(); }, []);
  useEffect(() => { applyFilter(); }, [search, statusFilter, items]);

  async function load() {
    const { data } = await supabase.from('gl_music').select('*').order('created_at', { ascending: false });
    setItems(data ?? []);
  }

  function applyFilter() {
    let list = items;
    if (search) list = list.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()) || m.artist?.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter((m) => m.status === statusFilter);
    setFiltered(list);
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">音乐</h1>
        <button onClick={() => navigate('/music/add')} className="bg-amber-500 text-gray-950 px-4 py-1.5 rounded-lg text-sm font-medium">添加</button>
      </div>

      <input
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
        placeholder="搜索标题或歌手..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex gap-2">
        <button onClick={() => setStatusFilter('')} className={`text-xs px-3 py-1.5 rounded-full ${!statusFilter ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>全部</button>
        <button onClick={() => setStatusFilter('想听')} className={`text-xs px-3 py-1.5 rounded-full ${statusFilter === '想听' ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>想听</button>
        <button onClick={() => setStatusFilter('听过')} className={`text-xs px-3 py-1.5 rounded-full ${statusFilter === '听过' ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>听过</button>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((m) => (
          <button key={m.id} onClick={() => navigate(`/music/${m.id}`)} className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-3 text-left w-full">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-lg shrink-0">🎵</div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-100 truncate">{m.title}</p>
              <p className="text-gray-500 text-xs">{m.artist} · {m.status}</p>
            </div>
            <span className="text-gray-600 text-xs shrink-0">{m.created_at ? format(new Date(m.created_at), 'MM-dd') : ''}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-gray-500 text-sm text-center py-8">暂无数据</p>}
      </div>
    </div>
  );
}
