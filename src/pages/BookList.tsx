import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Book {
  id: number;
  title: string;
  author: string | null;
  status: string;
  my_rating: number | null;
  tags: string[] | null;
  review: string | null;
  created_at: string;
  finished_at: string | null;
  added_at: string | null;
}

function Stars({ rating }: { rating: number | null }) {
  const r = rating ?? 0;
  return (
    <span className="text-sm">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= r ? 'text-amber-500' : 'text-gray-600'}>★</span>
      ))}
    </span>
  );
}

export default function BookList({ status }: { status: string }) {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [filtered, setFiltered] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => { load(); }, [status]);
  useEffect(() => { applyFilter(); }, [search, tagFilter, books]);

  async function load() {
    const { data } = await supabase.from('gl_books').select('*').eq('status', status).order('created_at', { ascending: false });
    const list = data ?? [];
    setBooks(list);
    const tags = new Set<string>();
    list.forEach((b) => b.tags?.forEach((t: string) => tags.add(t)));
    setAllTags(Array.from(tags));
  }

  function applyFilter() {
    let list = books;
    if (search) list = list.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));
    if (tagFilter) list = list.filter((b) => b.tags?.includes(tagFilter));
    setFiltered(list);
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/books')} className="text-gray-400 text-sm">← 返回</button>
        <h1 className="text-xl font-bold text-gray-100 flex-1">{status}</h1>
        <span className="text-gray-500 text-sm">{filtered.length}本</span>
      </div>

      <input
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
        placeholder="搜索标题..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTagFilter('')} className={`text-xs px-2 py-1 rounded-full ${!tagFilter ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>全部</button>
          {allTags.map((t) => (
            <button key={t} onClick={() => setTagFilter(tagFilter === t ? '' : t)} className={`text-xs px-2 py-1 rounded-full ${tagFilter === t ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>{t}</button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((b) => (
          <button key={b.id} onClick={() => navigate(`/books/${b.id}`)} className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-3 text-left w-full">
            <div className="flex-1 min-w-0">
              <p className="text-gray-100 truncate">{b.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 text-xs">{b.author}</span>
                {b.my_rating && <Stars rating={b.my_rating} />}
                {b.review && <span className="text-gray-500 text-xs truncate">{b.review}</span>}
              </div>
            </div>
            <span className="text-gray-600 text-xs shrink-0">
              {b.finished_at ? format(new Date(b.finished_at), 'yyyy-MM-dd') : b.added_at ? format(new Date(b.added_at), 'yyyy-MM-dd') : ''}
            </span>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-gray-500 text-sm text-center py-8">暂无数据</p>}
      </div>
    </div>
  );
}
