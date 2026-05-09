import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Movie {
  id: number;
  title: string;
  year: number | null;
  country: string | null;
  status: string;
  my_rating: number | null;
  review: string | null;
  created_at: string;
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

export default function Movies() {
  const navigate = useNavigate();
  const [wantCount, setWantCount] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);
  const [randomMovie, setRandomMovie] = useState<Movie | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [wantMovies, setWantMovies] = useState<Movie[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const [wc, wac, all, want] = await Promise.all([
      supabase.from('gl_movies').select('id', { count: 'exact', head: true }).eq('status', '想看'),
      supabase.from('gl_movies').select('id', { count: 'exact', head: true }).eq('status', '看过'),
      supabase.from('gl_movies').select('*').order('created_at', { ascending: false }),
      supabase.from('gl_movies').select('*').eq('status', '想看'),
    ]);
    setWantCount(wc.count ?? 0);
    setWatchedCount(wac.count ?? 0);
    setAllMovies(all.data ?? []);
    setWantMovies(want.data ?? []);
    if (want.data && want.data.length > 0) {
      setRandomMovie(want.data[Math.floor(Math.random() * want.data.length)]);
    }
  }

  function pickRandom() {
    if (wantMovies.length > 0) {
      setRandomMovie(wantMovies[Math.floor(Math.random() * wantMovies.length)]);
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">电影</h1>
        <button onClick={() => navigate('/movies/add')} className="bg-amber-500 text-gray-950 px-4 py-1.5 rounded-lg text-sm font-medium">添加</button>
      </div>

      {randomMovie && (
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-gray-500 text-xs mb-2">随机想看</p>
          <div className="flex gap-3">
            <div className="w-20 h-28 bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 text-2xl shrink-0">🎬</div>
            <div className="flex-1 min-w-0">
              <button onClick={() => navigate(`/movies/${randomMovie.id}`)} className="text-gray-100 font-medium text-left">{randomMovie.title}</button>
              <p className="text-gray-500 text-xs mt-1">{randomMovie.year} · {randomMovie.country}</p>
              {randomMovie.review && <p className="text-gray-400 text-sm mt-2 line-clamp-2">{randomMovie.review}</p>}
            </div>
          </div>
          <button onClick={pickRandom} className="mt-3 text-amber-500 text-sm">换一部</button>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => navigate('/movies/want')} className="flex-1 bg-gray-900 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-500">{wantCount}</p>
          <p className="text-gray-500 text-xs">想看</p>
        </button>
        <button onClick={() => navigate('/movies/watched')} className="flex-1 bg-gray-900 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-500">{watchedCount}</p>
          <p className="text-gray-500 text-xs">看过</p>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-300">时间线</h2>
        {allMovies.map((m) => (
          <button key={m.id} onClick={() => navigate(`/movies/${m.id}`)} className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-3 text-left w-full">
            <div className="flex-1 min-w-0">
              <p className="text-gray-100 truncate">{m.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 text-xs">{m.status}</span>
                {m.my_rating && <Stars rating={m.my_rating} />}
              </div>
            </div>
            <span className="text-gray-600 text-xs shrink-0">{m.created_at ? format(new Date(m.created_at), 'MM-dd') : ''}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
