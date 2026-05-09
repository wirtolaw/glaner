import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieList from './pages/MovieList';
import MovieDetail from './pages/MovieDetail';
import MovieAdd from './pages/MovieAdd';
import Books from './pages/Books';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import BookAdd from './pages/BookAdd';
import Music from './pages/Music';
import MusicDetail from './pages/MusicDetail';
import MusicAdd from './pages/MusicAdd';
import Places from './pages/Places';
import CityPage from './pages/CityPage';
import PlaceDetail from './pages/PlaceDetail';
import PlaceAdd from './pages/PlaceAdd';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center">
        <div className="w-full max-w-[430px] flex flex-col min-h-screen pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/want" element={<MovieList status="想看" />} />
            <Route path="/movies/watched" element={<MovieList status="看过" />} />
            <Route path="/movies/add" element={<MovieAdd />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/want" element={<BookList status="想读" />} />
            <Route path="/books/read" element={<BookList status="读过" />} />
            <Route path="/books/add" element={<BookAdd />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/music" element={<Music />} />
            <Route path="/music/add" element={<MusicAdd />} />
            <Route path="/music/:id" element={<MusicDetail />} />
            <Route path="/places" element={<Places />} />
            <Route path="/places/add" element={<PlaceAdd />} />
            <Route path="/places/city/:city" element={<CityPage />} />
            <Route path="/places/:id" element={<PlaceDetail />} />
          </Routes>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
          <div className="max-w-[430px] mx-auto flex justify-around items-center h-14">
            <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? 'text-amber-500' : 'text-gray-400'}`}>
              <span className="text-lg">🏠</span>
              <span>主页</span>
            </NavLink>
            <NavLink to="/movies" className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? 'text-amber-500' : 'text-gray-400'}`}>
              <span className="text-lg">🎬</span>
              <span>影</span>
            </NavLink>
            <NavLink to="/books" className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? 'text-amber-500' : 'text-gray-400'}`}>
              <span className="text-lg">📖</span>
              <span>书</span>
            </NavLink>
            <NavLink to="/music" className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? 'text-amber-500' : 'text-gray-400'}`}>
              <span className="text-lg">🎵</span>
              <span>音</span>
            </NavLink>
            <NavLink to="/places" className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? 'text-amber-500' : 'text-gray-400'}`}>
              <span className="text-lg">🌍</span>
              <span>城</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </HashRouter>
  );
}

export default App;
