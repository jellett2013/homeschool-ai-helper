'use client';
import React, { useState, useEffect, useRef, memo } from 'react';

const ensureURL = (u) => /^https?:\/\//i.test(u) ? u : `https://${u}`;
const linkify = (txt) =>
  txt.split(/(https?:\/\/[^\s]+|[\w.-]+\.[a-z]{2,}[^\s]*)/gi).map((p, i) =>
    /\./.test(p) && !/\s/.test(p) ? (
      <a key={i} href={ensureURL(p)} target="_blank" className="text-blue-600 hover:underline transition">{p}</a>
    ) : p
  );

const tagColors = {
  Religious: 'bg-purple-100 text-purple-800',
  Secular: 'bg-gray-100 text-gray-800',
  Digital: 'bg-sky-100 text-sky-800',
  Physical: 'bg-orange-100 text-orange-800',
  Both: 'bg-lime-100 text-lime-800',
};

const parseGPT = (txt) => {
  const lines = txt
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && l.includes('|') && l.split('|').length >= 8);
  if (!lines.length) return null;
  return lines.map((line) => {
    const [name, subject, description, link, tags = '', cost = '', justification = '', duration = ''] = line.split('|').map((s) => s.trim());
    return {
      name,
      subject,
      description,
      link: ensureURL(link),
      tags: tags.split(',').map((t) => t.trim()),
      cost,
      justification,
      duration,
    };
  });
};

const Spinner = () => (
  <div className="h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
);

const Card = memo(({ rec, inPlan, addToPlan, align, stateSel }) => (
  <div className="relative p-6 bg-white border rounded-xl shadow-md transition hover:shadow-lg animate-fade-in">
    {align && stateSel && (
      <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full shadow-sm">
        ✅ State‑Aligned
      </div>
    )}

    <h3 className="text-xl font-semibold text-blue-800 mb-1">{rec.name}</h3>
    <p className="text-sm text-gray-600 font-medium mb-2">{rec.subject}</p>
    <div className="text-sm text-gray-800 mb-2">{linkify(rec.description)}</div>

    <div className="grid grid-cols-2 gap-2 mb-2">
      {rec.tags.map(
        (t) =>
          t && (
            <span
              key={t}
              className={`text-xs px-2 py-1 rounded-full font-medium text-center ${tagColors[t] || 'bg-yellow-100 text-yellow-800'}`}
            >
              {t}
            </span>
          )
      )}
      {rec.cost && (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800 font-medium text-center">
          💲 {rec.cost}
        </span>
      )}
      {rec.duration && (
        <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-medium text-center">
          ⏳ {rec.duration}
        </span>
      )}
    </div>

    <details className="mb-3 text-sm">
      <summary className="cursor-pointer text-indigo-600 hover:underline">Why it qualifies?</summary>
      <p className="mt-1 text-gray-700">{rec.justification}</p>
    </details>

    <div className="flex justify-between items-center">
    <a
  href={rec.link}
  target="_blank"
  rel="noopener noreferrer"
  className="text-sm bg-gray-100 text-blue-800 px-3 py-1 rounded-lg hover:bg-gray-200 transition"
>
  🌐 Visit Site
</a>

      {inPlan ? (
        <button
          disabled
          className="text-sm bg-green-200 text-green-900 px-3 py-1 rounded-lg"
        >
          ✓ Added
        </button>
      ) : (
        <button
          onClick={() => addToPlan(rec)}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
        >
          ➕ Add to My Plan
        </button>
      )}
    </div>
  </div>
));


const Sidebar = memo(({ plan, togglePurchased, removeItem, planRef, mounted }) => {
  const grouped = plan.reduce((a, it) => {
    (a[it.subject || 'Other'] ??= []).push(it);
    return a;
  }, {});
  const subjects = Object.keys(grouped).sort();
  return (
    <aside ref={planRef} className="bg-white p-4 rounded-xl shadow-md border max-h-[90vh] overflow-auto w-full">
      <h2 className="text-xl font-bold mb-4 text-blue-700">📒 My Plan</h2>
      {plan.length === 0 ? (
        <p className="text-sm text-gray-700">No items yet.</p>
      ) : (
        subjects.map((s) => (
          <div key={s} className="mb-6">
            <h3 className="font-semibold mb-2">{s}</h3>
            <ul className="space-y-3">
              {grouped[s].map((p) => (
                <li key={p.name} className="relative border p-4 rounded-lg">
<a
  href={p.link}
  target="_blank"
  rel="noopener noreferrer"
  className="font-medium text-blue-700 hover:underline block"
>
  {p.name}
</a>
                  <div className="text-xs mt-1 flex flex-wrap gap-2">
                    {p.cost && <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800">{p.cost}</span>}
                    {p.duration && <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">{p.duration}</span>}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                    <input type="checkbox" checked={p.purchased} onChange={() => togglePurchased(p.name)} className="accent-blue-600" />
                    Done
                  </label>
                  <button onClick={() => removeItem(p.name)} className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700">✕</button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </aside>
  );
});

export default function Home() {
  const [rawAI, setRawAI] = useState('');
  const [grade, setGrade] = useState('');
  const [style, setStyle] = useState('');
  const [subject, setSubj] = useState('');
  const [stateSel, setStateSel] = useState('');
  const [align, setAlign] = useState(false);
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [plan, setPlan] = useState([]);
  const [previousNames, setPreviousNames] = useState([]);
  const planRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('myPlan');
    if (stored) setPlan(JSON.parse(stored));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('myPlan', JSON.stringify(plan));
  }, [plan, mounted]);

  const addToPlan = (rec) => {
    if (!plan.find((p) => p.name === rec.name)) {
      setPlan([...plan, { ...rec, purchased: false }]);
    }
  };

  const togglePurchased = (name) =>
    setPlan(plan.map((p) => (p.name === name ? { ...p, purchased: !p.purchased } : p)));

  const removeItem = (name) => setPlan(plan.filter((p) => p.name !== name));

  const runSearch = async (excluded = []) => {
    setError('');
    setLoading(true);
    setRawAI('');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel: grade,
          learningStyle: style,
          subject,
          state: stateSel,
          alignToState: align,
          duration,
          exclude: excluded,
        }),
      });
      clearTimeout(timer);
      const { result } = await res.json();
      setRawAI(result);
      const parsed = parseGPT(result);
      if (parsed) {
        setRecs(parsed);
        setPreviousNames((prev) => [...prev, ...parsed.map((r) => r.name)]);
      } else {
        setError('⚠ Unexpected AI format—retry.');
      }
    } catch {
      setError('❌ Timed out—try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setPreviousNames([]);
    runSearch([]);
  };

  const handleRerun = () => runSearch(previousNames);

  const handleStartOver = () => {
    setSubmitted(false);
    setError('');
    setRawAI('');
    setRecs([]);
    setPreviousNames([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 text-gray-900">
      <div className="max-w-screen-2xl mx-auto px-4 py-6 lg:grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          {/* Form column */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border space-y-4">
            <h1 className="text-xl font-bold text-blue-700">Curriculum Preferences</h1>
            <select required className="w-full p-3 border rounded-lg text-gray-800" value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">Grade level *</option>
              {['K–1','2–3','4–5','6–8','9–12'].map(g => <option key={g}>{g}</option>)}
            </select>
            <input className="w-full p-3 border rounded-lg text-gray-800" placeholder="Learning style (optional)" value={style} onChange={(e) => setStyle(e.target.value)} />
            <input className="w-full p-3 border rounded-lg text-gray-800" placeholder="Preferred subject (optional)" value={subject} onChange={(e) => setSubj(e.target.value)} />
            <select className="w-full p-3 border rounded-lg text-gray-800" value={stateSel} onChange={(e) => setStateSel(e.target.value)}>
              <option value="">State (optional)</option>
              {["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
                "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
                "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
                "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
                "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
                "Wisconsin","Wyoming"].map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="w-full p-3 border rounded-lg text-gray-800" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="">Duration (optional)</option>
              <option value="6 weeks">6 weeks</option>
              <option value="Quarter">Quarter</option>
              <option value="Semester">Semester</option>
              <option value="Full Year">Full Year</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input type="checkbox" checked={align} onChange={(e) => setAlign(e.target.checked)} className="accent-blue-600" />
              Align to state guidelines
            </label>
            <button className="w-full py-3 font-bold text-white rounded-lg bg-gradient-to-r from-pink-500 to-blue-600 hover:brightness-110 transition">
              🔍 Generate Plan
            </button>
          </form>
        </div>

        <div className="lg:col-span-6 relative">
          {/* Results column */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 rounded-xl">
              <Spinner />
              <p className="mt-2 text-sm text-blue-700">Loading…</p>
            </div>
          )}
          {submitted && (
            <div className="mb-4 flex justify-between items-center">
              <button onClick={handleStartOver} className="text-sm text-blue-600 hover:underline">← Start Over</button>
              <button onClick={handleRerun} className="text-sm bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg hover:brightness-105">🔁 Re-run Search</button>
            </div>
          )}
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          {rawAI && (
            <div className="mb-6 text-left">
              <h3 className="font-bold text-sm text-gray-700 mb-2">🔍 Raw GPT Output:</h3>
              <pre className="text-xs p-3 bg-gray-100 border border-gray-300 rounded-lg whitespace-pre-wrap">{rawAI}</pre>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {recs.map((r) => (
    <Card
      key={r.name}
      rec={r}
      inPlan={!!plan.find((p) => p.name === r.name)}
      addToPlan={addToPlan}
      align={align}
      stateSel={stateSel}
    />
  ))}
</div>


        </div>

        <div className="lg:col-span-3">
          {/* Sidebar column */}
          <Sidebar plan={plan} togglePurchased={togglePurchased} removeItem={removeItem} planRef={planRef} mounted={mounted} />
        </div>
      </div>
    </main>
  );
}
