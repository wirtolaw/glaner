import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface ActivityItem {
  type: 'movie' | 'book' | 'music' | 'place';
  id: number;
  title: string;
  date: string;
  extra?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ActivityItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [wantMovies, setWantMovies] = useState(0);
  const [readingBooks, setReadingBooks] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [timeline, setTimeline] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStats();
    loadTimeline(0);
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          pageRef.current += 1;
          loadTimeline(pageRef.current);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  async function loadStats() {
    const [m, b, p] = await Promise.all([
      supabase.from('gl_movies').select('id', { count: 'exact', head: true }).eq('status', '想看'),
      supabase.from('gl_books').select('id', { count: 'exact', head: true }).eq('status', '在读'),
      supabase.from('gl_places').select('city'),
    ]);
    setWantMovies(m.count ?? 0);
    setReadingBooks(b.count ?? 0);
    const cities = new Set((p.data ?? []).map((r) => r.city).filter(Boolean));
    setCityCount(cities.size);
  }

  const loadTimeline = useCallback(async (page: number) => {
    setLoading(true);
    const from = page * 20;
    const to = from + 19;
    const [movies, books, music, places] = await Promise.all([
      supabase.from('gl_movies').select('id, title, created_at, status').order('created_at', { ascending: false }).range(from, to),
      supabase.from('gl_books').select('id, title, author, created_at, status').order('created_at', { ascending: false }).range(from, to),
      supabase.from('gl_music').select('id, title, artist, created_at').order('created_at', { ascending: false }).range(from, to),
      supabase.from('gl_places').select('id, title, city, created_at').order('created_at', { ascending: false }).range(from, to),
    ]);
    const items: ActivityItem[] = [
      ...(movies.data ?? []).map((m) => ({ type: 'movie' as const, id: m.id, title: m.title, date: m.created_at, extra: m.status })),
      ...(books.data ?? []).map((b) => ({ type: 'book' as const, id: b.id, title: b.title, date: b.created_at, extra: `${b.author ?? ''} · ${b.status}` })),
      ...(music.data ?? []).map((m) => ({ type: 'music' as const, id: m.id, title: m.title, date: m.created_at, extra: m.artist })),
      ...(places.data ?? []).map((p) => ({ type: 'place' as const, id: p.id, title: p.title, date: p.created_at, extra: p.city })),
    ];
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sliced = items.slice(0, 20);
    if (sliced.length < 20) setHasMore(false);
    setTimeline((prev) => (page === 0 ? sliced : [...prev, ...sliced]));
    setLoading(false);
  }, []);

  async function doSearch(q: string) {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const pattern = `%${q}%`;
    const [movies, books, music, places] = await Promise.all([
      supabase.from('gl_movies').select('id, title, created_at').ilike('title', pattern).limit(10),
      supabase.from('gl_books').select('id, title, created_at').ilike('title', pattern).limit(10),
      supabase.from('gl_music').select('id, title, created_at').ilike('title', pattern).limit(10),
      supabase.from('gl_places').select('id, title, created_at').ilike('title', pattern).limit(10),
    ]);
    const results: ActivityItem[] = [
      ...(movies.data ?? []).map((m) => ({ type: 'movie' as const, id: m.id, title: m.title, date: m.created_at })),
      ...(books.data ?? []).map((b) => ({ type: 'book' as const, id: b.id, title: b.title, date: b.created_at })),
      ...(music.data ?? []).map((m) => ({ type: 'music' as const, id: m.id, title: m.title, date: m.created_at })),
      ...(places.data ?? []).map((p) => ({ type: 'place' as const, id: p.id, title: p.title, date: p.created_at })),
    ];
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSearchResults(results);
    setSearching(false);
  }

  function navigateItem(item: ActivityItem) {
    const base = item.type === 'movie' ? '/movies' : item.type === 'book' ? '/books' : item.type === 'music' ? '/music' : '/places';
    navigate(`${base}/${item.id}`);
  }

  const typeIcon = (t: string) => t === 'movie' ? '🎬' : t === 'book' ? '📖' : t === 'music' ? '🎵' : '🌍';

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-amber-500">Glaner</h1>

      <input
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
        placeholder="搜索..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); doSearch(e.target.value); }}
      />

      {search && (
        <div className="flex flex-col gap-1">
          {searching && <p className="text-gray-500 text-sm">搜索中...</p>}
          {!searching && searchResults.length === 0 && <p className="text-gray-500 text-sm">无结果</p>}
          {searchResults.map((item) => (
            <button key={`${item.type}-${item.id}`} onClick={() => navigateItem(item)} className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2 text-left w-full">
              <span>{typeIcon(item.type)}</span>
              <span className="text-gray-100 flex-1 truncate">{item.title}</span>
            </button>
          ))}
        </div>
      )}

      {!search && (
        <>
          <div className="flex justify-center gap-4 text-sm text-gray-400">
            <span>{wantMovies}部想看</span>
            <span>·</span>
            <span>{readingBooks}本在读</span>
            <span>·</span>
            <span>{cityCount}个城市</span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-gray-300">最近动态</h2>
            {timeline.map((item) => (
              <button key={`${item.type}-${item.id}`} onClick={() => navigateItem(item)} className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-3 text-left w-full">
                <span className="text-lg">{typeIcon(item.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-100 truncate">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.extra}</p>
                </div>
                <span className="text-gray-600 text-xs shrink-0">{item.date ? format(new Date(item.date), 'MM-dd') : ''}</span>
              </button>
            ))}
            <div ref={sentinelRef} className="h-4" />
            {loading && <p className="text-gray-500 text-sm text-center">加载中...</p>}
          </div>
        </>
      )}
    </div>
  );
}
