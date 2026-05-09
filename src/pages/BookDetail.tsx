import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const STATUSES = ['想读', '在读', '读过'];
const NOTE_TYPES = ['摘录', '感想', '总结'];

interface BookNote {
  id: number;
  title: string | null;
  content: string | null;
  note_type: string | null;
  created_at: string;
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('想读');
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [review, setReview] = useState('');
  const [addedAt, setAddedAt] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [finishedAt, setFinishedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('感想');

  useEffect(() => { load(); }, [id]);

  async function load() {
    const [bookRes, notesRes] = await Promise.all([
      supabase.from('gl_books').select('*').eq('id', Number(id)).single(),
      supabase.from('gl_book_notes').select('*').eq('book_id', Number(id)).order('created_at', { ascending: false }),
    ]);
    const data = bookRes.data;
    if (!data) return;
    setTitle(data.title ?? '');
    setAuthor(data.author ?? '');
    setYear(data.year);
    setCountry(data.country ?? '');
    setStatus(data.status ?? '想读');
    setRating(data.my_rating ?? 0);
    setTags(data.tags ?? []);
    setReview(data.review ?? '');
    setAddedAt(data.added_at);
    setStartedAt(data.started_at);
    setFinishedAt(data.finished_at);
    setNotes(notesRes.data ?? []);
  }

  async function save() {
    setSaving(true);
    await supabase.from('gl_books').update({
      title, author: author || null, year, country: country || null, status,
      my_rating: rating || null, tags, review: review || null,
      started_at: status === '在读' && !startedAt ? new Date().toISOString() : startedAt,
      finished_at: status === '读过' && !finishedAt ? new Date().toISOString() : finishedAt,
    }).eq('id', Number(id));
    setSaving(false);
    navigate('/books');
  }

  async function remove() {
    if (!confirm('确定删除？')) return;
    await supabase.from('gl_book_notes').delete().eq('book_id', Number(id));
    await supabase.from('gl_books').delete().eq('id', Number(id));
    navigate('/books');
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  async function addNote() {
    if (!noteContent.trim()) return;
    await supabase.from('gl_book_notes').insert({
      book_id: Number(id),
      title: noteTitle || null,
      content: noteContent,
      note_type: noteType,
    });
    setNoteTitle('');
    setNoteContent('');
    setShowNoteForm(false);
    const { data } = await supabase.from('gl_book_notes').select('*').eq('book_id', Number(id)).order('created_at', { ascending: false });
    setNotes(data ?? []);
  }

  async function deleteNote(noteId: number) {
    if (!confirm('删除笔记？')) return;
    await supabase.from('gl_book_notes').delete().eq('id', noteId);
    setNotes(notes.filter((n) => n.id !== noteId));
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-sm">← 返回</button>
        <h1 className="text-xl font-bold text-gray-100 flex-1">书籍详情</h1>
      </div>

      <div className="w-full h-48 bg-gray-900 rounded-xl flex items-center justify-center text-gray-600 text-5xl">📖</div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-gray-500 text-xs">标题</label>
          <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-gray-500 text-xs">作者</label>
          <input className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-amber-500" value={author} onChange={(e) => setAuthor(e.target.value)} />
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
          {startedAt && <p>开始于 {format(new Date(startedAt), 'yyyy-MM-dd HH:mm')}</p>}
          {finishedAt && <p>读完于 {format(new Date(finishedAt), 'yyyy-MM-dd HH:mm')}</p>}
        </div>

        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="flex-1 bg-amber-500 text-gray-950 py-2.5 rounded-lg font-medium">{saving ? '保存中...' : '保存'}</button>
          <button onClick={remove} className="bg-red-900 text-red-300 px-4 py-2.5 rounded-lg text-sm">删除</button>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-300">读书笔记</h2>
          <button onClick={() => setShowNoteForm(!showNoteForm)} className="text-amber-500 text-sm">{showNoteForm ? '取消' : '+ 添加笔记'}</button>
        </div>

        {showNoteForm && (
          <div className="bg-gray-900 rounded-xl p-4 mb-3 flex flex-col gap-2">
            <div className="flex gap-2">
              {NOTE_TYPES.map((nt) => (
                <button key={nt} onClick={() => setNoteType(nt)} className={`text-xs px-2 py-1 rounded-full ${noteType === nt ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>{nt}</button>
              ))}
            </div>
            <input className="w-full bg-gray-800 border-none rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none" placeholder="标题（可选）" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} />
            <textarea className="w-full bg-gray-800 border-none rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none min-h-[80px]" placeholder="内容" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
            <button onClick={addNote} className="bg-amber-500 text-gray-950 py-2 rounded-lg text-sm font-medium">保存笔记</button>
          </div>
        )}

        {notes.length === 0 && !showNoteForm && <p className="text-gray-600 text-sm">暂无笔记</p>}
        {notes.map((n) => (
          <div key={n.id} className="bg-gray-900 rounded-lg p-3 mb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {n.note_type && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{n.note_type}</span>}
                  {n.title && <span className="text-gray-200 text-sm font-medium">{n.title}</span>}
                </div>
                <p className="text-gray-400 text-sm mt-1">{n.content}</p>
                <p className="text-gray-600 text-xs mt-1">{n.created_at ? format(new Date(n.created_at), 'yyyy-MM-dd') : ''}</p>
              </div>
              <button onClick={() => deleteNote(n.id)} className="text-gray-600 text-xs ml-2">删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
