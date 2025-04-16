'use client';
import React, { useState, useEffect, memo, useRef } from 'react';

/* ---------- helpers ---------- */
const ensureURL = (u) =>
  /^https?:\/\//i.test(u) ? u : `https://${u}`;

const linkify = (txt) =>
  txt.split(/(https?:\/\/[^\s]+|[\w.-]+\.[a-z]{2,}[^\s]*)/gi).map((p, i) =>
    /\./.test(p) && !/\s/.test(p) ? (
      <a key={i} href={ensureURL(p)} target="_blank" className="text-blue-600 hover:underline">
        {p}
      </a>
    ) : (
      p
    )
  );

const tagColors = {
  Religious:'bg-purple-100 text-purple-800',
  Secular:'bg-gray-100 text-gray-800',
  Digital:'bg-sky-100 text-sky-800',
  Physical:'bg-orange-100 text-orange-800',
  Both:'bg-lime-100 text-lime-800',
};

const parseGPT = (txt) => {
  const lines = txt
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && l.includes('|') && l.split('|').length >= 4);

  if (!lines.length) return null;

  const results = [];

  for (const line of lines) {
    try {
      const [name, subject, description, link, tags = '', cost = '', justification = ''] = line
        .split('|')
        .map((s) => s.trim());

      results.push({
        name,
        subject,
        description,
        link: /^https?:\/\//i.test(link) ? link : `https://${link}`,
        tags: tags.split(',').map((t) => t.trim()),
        cost,
        justification,
      });
    } catch (err) {
      console.warn('❌ Skipping malformed line:', line);
    }
  }

  // Fallback: if nothing could be parsed, return null
  return results.length ? results : null;
};


const Spinner=()=> <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>;

/* ---------- Card ---------- */
const Card=memo(({rec,inPlan,addToPlan,align,stateSel})=>(
  <div className="relative p-6 bg-white border rounded-xl shadow-md">
    {align&&stateSel&&<div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">✅ State‑Aligned</div>}
    <div className="mb-2 flex flex-wrap gap-2">
      {rec.tags.map(t=>t&&<span key={t} className={`text-xs px-2 py-1 rounded-full ${tagColors[t]||'bg-yellow-100 text-yellow-800'}`}>{t}</span>)}
      {rec.cost&&<span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800">{rec.cost}</span>}
    </div>

    <h3 className="text-lg font-bold text-blue-800">{rec.name}</h3>
    <p className="text-sm text-gray-700">{rec.subject}</p>
    <p className="text-gray-800 mb-3">{linkify(rec.description)}</p>

    <details className="mb-2">
      <summary className="cursor-pointer text-sm text-indigo-600 hover:underline">Why it qualifies?</summary>
      <p className="mt-1 text-sm text-gray-700">{rec.justification}</p>
    </details>

    {rec.link&&<a href={rec.link} target="_blank" className="text-sm text-blue-600 hover:underline">Visit →</a>}

    {inPlan
      ? <button disabled className="mt-4 text-sm bg-green-200 text-green-900 px-3 py-1 rounded-lg">✓ Added to My Plan</button>
      : <button onClick={()=>addToPlan(rec)} className="mt-4 text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">➕ Add to My Plan</button>}
  </div>
));

/* ---------- Sidebar, Main, etc. ---------- */
/*  (everything else in page.js stays exactly the same as your last working version) */


/* ---------- Sidebar ---------- */
const Sidebar = memo(({ plan, togglePurchased, removeItem, exportPdf, planRef, mounted }) => {
  const grouped = plan.reduce((a, it) => {
    (a[it.subject || 'Other'] ??= []).push(it);
    return a;
  }, {});
  const subjects = Object.keys(grouped).sort();

  return (
    <aside
      ref={planRef}
      className="bg-white p-6 rounded-xl shadow-md border h-fit max-h-[90vh] overflow-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">📒 My Plan</h2>
        {mounted && plan.length > 0 && (
          <button
            onClick={exportPdf}
            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
          >
            📄 Export PDF
          </button>
        )}
      </div>

      {plan.length === 0 ? (
        <p className="text-sm text-gray-700">
          No items yet. Add curriculum from the recommendations.
        </p>
      ) : (
        subjects.map((s) => (
          <div key={s} className="mb-6">
            <h3 className="font-semibold mb-2">{s}</h3>
            <ul className="space-y-3">
              {grouped[s].map((p) => (
                <li key={p.name} className="relative border p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">{p.name}</h4>

                  <div className="text-xs mt-1 flex gap-2 items-center">
                    {p.cost && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800">
                        {p.cost}
                      </span>
                    )}
                    <span className="text-gray-600">{p.justification}</span>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                    <input
                      type="checkbox"
                      checked={p.purchased}
                      onChange={() => togglePurchased(p.name)}
                    />
                    Purchased / complete
                  </label>
                  <button
                    onClick={() => removeItem(p.name)}
                    className="absolute top-2 right-2 text-xs text-red-500"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </aside>
  );
});

/* ---------- Main ---------- */
export default function Home() {
  /* form */
  const [rawAI, setRawAI] = useState('');
const [grade,setGrade]=useState('');
  const [style,setStyle]=useState('');
  const [subject,setSubj]=useState('');
  const [stateSel,setStateSel]=useState('');
  const [align,setAlign]=useState(false);

  /* ui */
  const [loading,setLoading]=useState(false);
  const [recs,setRecs]=useState([]);
  const [submitted,setSubmitted]=useState(false);
  const [error,setError]=useState('');
  const [mounted,setMounted]=useState(false);

  /* plan */
  const [plan,setPlan]=useState([]);
  useEffect(() => {
    const stored = localStorage.getItem('myPlan');
    if (stored) setPlan(JSON.parse(stored));
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted) localStorage.setItem('myPlan', JSON.stringify(plan));
  }, [plan, mounted]);

  const addToPlan = (rec) =>
    !plan.find((p) => p.name === rec.name) && setPlan([...plan, { ...rec, purchased: false }]);

  const togglePurchased = (name) =>
    setPlan(plan.map((p) => (p.name === name ? { ...p, purchased: !p.purchased } : p)));

  const removeItem = (name) => setPlan(plan.filter((p) => p.name !== name));

  /* PDF export (dynamic import) */
  const planRef = useRef(null);
  const exportPdf = async () => {
    const { default: html2pdf } = await import('html2pdf.js/dist/html2pdf.min.js');
    html2pdf()
      .from(planRef.current)
      .set({
        margin: 10,
        filename: 'Homeschool_Plan.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    setLoading(true);
    setRawAI(''); // reset previous output
  
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
        }),
      });
  
      clearTimeout(timer);
  
      const { result } = await res.json();
      setRawAI(result); // 🧠 show raw GPT output
  
      const parsed = parseGPT(result);
      if (parsed) {
        setRecs(parsed);
      } else {
        setError('⚠ Unexpected AI format—retry.');
      }
    } catch {
      setError('❌ Timed out—try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-pink-50 flex justify-center">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
        {/* LEFT */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10 rounded-xl">
              <Spinner />
              <p className="mt-2 text-sm text-blue-700">Generating…</p>
            </div>
          )}

          <h1 className="text-4xl font-bold text-blue-700 mb-4">
            🏡 Homeschool AI Helper
          </h1>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border space-y-4">
              {/* form fields (unchanged) */}
              <select required className="w-full p-3 border rounded-lg text-gray-800"
                value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="" className="text-gray-400">Grade level *</option>
                {['K–1','2–3','4–5','6–8','9–12'].map(g => <option key={g}>{g}</option>)}
              </select>
              <input className="w-full p-3 border rounded-lg placeholder:text-gray-400 text-gray-800"
                placeholder="Learning style (optional)" value={style} onChange={(e) => setStyle(e.target.value)}/>
              <input className="w-full p-3 border rounded-lg placeholder:text-gray-400 text-gray-800"
                placeholder="Preferred subject (optional)" value={subject} onChange={(e) => setSubj(e.target.value)}/>
              <select className="w-full p-3 border rounded-lg text-gray-800"
                value={stateSel} onChange={(e) => setStateSel(e.target.value)}>
                <option value="" className="text-gray-400">State (optional)</option>
                {['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'].map(s => <option key={s}>{s}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" checked={align} onChange={(e) => setAlign(e.target.checked)}/> Align to state guidelines
              </label>
              <button className="w-full py-3 font-bold text-white rounded-lg bg-gradient-to-r from-pink-500 to-blue-600 hover:brightness-110">
                🔍 Generate Plan
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-6">
              <button onClick={() => { setSubmitted(false); setError(''); setRecs([]); }} className="text-sm text-blue-600 hover:underline">
                ← New search
              </button>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="grid gap-6">
                {recs.map((r) => (
                  <Card key={r.name} rec={r} inPlan={!!plan.find((p) => p.name === r.name)}
                    addToPlan={addToPlan} align={align} stateSel={stateSel} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <Sidebar plan={plan} togglePurchased={togglePurchased} removeItem={removeItem}
          exportPdf={exportPdf} planRef={planRef} mounted={mounted}/>
      </div>
    </main>
  );
}
