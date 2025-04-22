'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const SUBJECT_COLORS = {
    Math: 'bg-red-500 text-white',
    English: 'bg-blue-600 text-white',
    Science: 'bg-green-600 text-white',
    'Social Studies': 'bg-yellow-500 text-black',
    PE: 'bg-purple-600 text-white',
    Art: 'bg-pink-500 text-white',
    Elective: 'bg-teal-500 text-white',
    Free: 'bg-gray-300 text-gray-700',
  };
  

export default function SchedulePage() {
  const [scheduleMatrix, setScheduleMatrix] = useState([]);
  const [hoursPerDay, setHoursPerDay] = useState(5);
  const [startHour, setStartHour] = useState(9); // NEW
  const [useHalfHour, setUseHalfHour] = useState(false); // NEW
  const [customSessions, setCustomSessions] = useState({});
  const [includedSubjects, setIncludedSubjects] = useState([]);
  const [hourLabels, setHourLabels] = useState([]);
  const [activeDays, setActiveDays] = useState([...ALL_DAYS]);
  const [showLegend, setShowLegend] = useState(false);
  const [curriculumMap, setCurriculumMap] = useState({});
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [lastMatrix, setLastMatrix] = useState([]);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [defaultSessions, setDefaultSessions] = useState({});
  const [studentName, setStudentName] = useState('');
  const [savedSchedules, setSavedSchedules] = useState({});
  



  const generateHourLabels = (count, start = 9, halfHour = false) => {
    const labels = [];
    for (let i = 0; i < count; i++) {
      const totalMins = start * 60 + i * (halfHour ? 30 : 60);
      const hr = Math.floor(totalMins / 60);
      const min = totalMins % 60;
      const ampm = hr >= 12 ? 'PM' : 'AM';
      const displayHr = hr % 12 === 0 ? 12 : hr % 12;
      labels.push(`${displayHr}:${min === 0 ? '00' : '30'} ${ampm}`);
    }
    return labels;
  };
  useEffect(() => {
    const stored = localStorage.getItem('savedSchedules');
    if (stored) {
      setSavedSchedules(JSON.parse(stored));
    }
  }, []);
  
  useEffect(() => {
    const stored = localStorage.getItem('myPlan');
    if (stored) {
      const parsed = JSON.parse(stored);
      const included = parsed.filter((item) => item.scheduled);
  
      const subjectToCurriculum = {};
      included.forEach((item) => {
        const subj = item.subject || 'Elective';
        if (!subjectToCurriculum[subj]) {
          subjectToCurriculum[subj] = item.name;
        }
      });
  
      setCurriculumMap(subjectToCurriculum);
      setIncludedSubjects([...new Set(included.map((i) => i.subject || 'Elective'))]);
  
      const sessionDefaults = {};
      included.forEach((i) => {
        const subj = i.subject || 'Elective';
        sessionDefaults[subj] = sessionDefaults[subj] || 3;
      });
  
      setCustomSessions(sessionDefaults);
      setDefaultSessions(sessionDefaults); // <-- Save a copy of the default sessions
    }
  }, []);
  

  useEffect(() => {
    // Only restore scheduleMatrix from localStorage on first load
    const stored = localStorage.getItem('scheduleMatrix');
    const hasRestoredOnce = localStorage.getItem('restoredScheduleOnce');
  
    if (stored && !hasRestoredOnce) {
      const parsed = JSON.parse(stored);
      setScheduleMatrix(parsed);
      setHourLabels(generateHourLabels(parsed.length, startHour, useHalfHour));
      localStorage.setItem('restoredScheduleOnce', 'true');
      return;
    }
  
    const blocksPerHour = useHalfHour ? 2 : 1;
    const totalSlots = hoursPerDay * blocksPerHour * activeDays.length;
    const blocks = [];
  
    Object.entries(customSessions).forEach(([subject, count]) => {
      blocks.push(...Array(Number(count)).fill(subject));
    });
  
    while (blocks.length < totalSlots) {
      blocks.push('Free');
    }
  
    const filledMatrix = [];
    const rows = hoursPerDay * blocksPerHour;
    for (let i = 0; i < rows; i++) {
      filledMatrix.push(blocks.slice(i * activeDays.length, (i + 1) * activeDays.length));
    }
  
    setHourLabels(generateHourLabels(rows, startHour, useHalfHour));
    setScheduleMatrix(filledMatrix);
  }, [customSessions, hoursPerDay, activeDays, startHour, useHalfHour]);
  

  const handleSessionChange = (subject, value) => {
    setCustomSessions((prev) => ({
      ...prev,
      [subject]: Math.max(0, parseInt(value) || 0),
    }));
  };

  const toggleDay = (day) => {
    setActiveDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b))
    );
  };

  const handleSaveSchedule = () => {
    let trimmedName = studentName.trim();
  
    if (!trimmedName) {
      const newName = prompt("Please enter a name for this schedule:");
      if (!newName) {
        alert("Schedule not saved — no name provided.");
        return;
      }
      trimmedName = newName.trim();
      setStudentName(trimmedName); // Update dropdown to reflect the new student name
    }
  
    if (savedSchedules[trimmedName]) {
      const confirmOverwrite = confirm(`A schedule for "${trimmedName}" already exists. Overwrite it?`);
      if (!confirmOverwrite) return;
    }
  
    const newSchedules = { ...savedSchedules, [trimmedName]: scheduleMatrix };
    setSavedSchedules(newSchedules);
    localStorage.setItem('savedSchedules', JSON.stringify(newSchedules));
    alert(`Schedule saved for "${trimmedName}"`);
  };
  
  
    
    const handleLoadSchedule = (name) => {
        const saved = localStorage.getItem('savedSchedules');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed[name]) {
            setScheduleMatrix(parsed[name]);
            alert(`Loaded schedule for ${name}`);
          } else {
            alert(`No schedule found for ${name}`);
          }
        }
      };
      

  
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <Link href="/" className="fixed top-4 left-4 z-50">
        <button className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-full shadow-md border hover:bg-blue-50 transition">
          ← Back to Curriculum Explorer
        </button>
      </Link>
  
      <div className="max-w-6xl mx-auto mt-16">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">
  📅 Weekly Schedule
  {studentName && (
    <span className="ml-3 inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full shadow-sm align-middle">
      {studentName}
    </span>
  )}
</h1>

  
        <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">🛠 Customize Schedule</h2>
  
          {/* Student Name + Save/Load Buttons */}
          <div className="mb-4 flex gap-4 items-end">
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Select Student:</label>
  <select
    value={studentName}
    onChange={(e) => setStudentName(e.target.value)}
    className="p-2 border rounded-md w-48"
  >
    <option value="">-- Choose or create --</option>
    {Object.keys(savedSchedules).map((name) => (
      <option key={name} value={name}>
        {name}
      </option>
    ))}
  </select>
</div>

  
<button
  onClick={handleSaveSchedule}
  className="px-4 py-2 rounded-md text-sm font-semibold transition bg-blue-100 text-blue-800 hover:bg-blue-200"
>
  💾 Save Schedule
</button>
  
            <button
              onClick={() => handleLoadSchedule(studentName)}
              disabled={!studentName}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                studentName
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              📂 Load Schedule
            </button>
          </div>
  
          {/* Main Customization Controls */}
          <div className="mb-4 flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours per day:</label>
              <input
                type="number"
                min={1}
                max={15}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-20 p-2 border rounded-md"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start hour:</label>
              <input
                type="number"
                min={5}
                max={12}
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="w-20 p-2 border rounded-md"
              />
            </div>
  
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={useHalfHour}
                onChange={() => setUseHalfHour(!useHalfHour)}
                className="accent-purple-600"
              />
              <label className="text-sm text-gray-800">Use 30-minute blocks</label>
            </div>
          </div>
  
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Days of the week:</p>
            <div className="flex gap-2 flex-wrap">
              {ALL_DAYS.map((day) => (
                <label key={day} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={activeDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="accent-blue-600"
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={showCurriculum}
                onChange={() => setShowCurriculum(!showCurriculum)}
                className="accent-purple-600"
              />
              Show curriculum name instead of subject
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {includedSubjects.map((subj) => (
              <div key={subj}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {subj} sessions/week:
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={customSessions[subj] || 0}
                  onChange={(e) => handleSessionChange(subj, e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            ))}
          </div>
        </div>

        {scheduleMatrix.length === 0 ? (
          <p className="text-gray-600">
            No scheduled items found. Add curriculum to "My Plan" and check "Include in Weekly Schedule".
          </p>
        ) : (
            <>  {/* ← Start of Fragment */}
            <div className="overflow-auto border rounded-lg shadow-sm">
              <table className="min-w-full table-fixed border-collapse">
                <thead className="bg-white">
                  <tr>
                    <th className="w-20 border p-2 text-left text-sm font-medium text-gray-700">Time</th>
                    {activeDays.map((day) => (
                      <th key={day} className="border p-2 text-center text-sm font-semibold text-gray-800">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scheduleMatrix.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="border p-2 text-sm font-medium text-gray-600">{hourLabels[rowIdx]}</td>
                      {row.map((subject, colIdx) => (
                        <td
                          key={`${rowIdx}-${colIdx}`}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData('text/plain', JSON.stringify({ row: rowIdx, col: colIdx }))
                          }
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            const from = JSON.parse(e.dataTransfer.getData('text/plain'));
                            setScheduleMatrix((prev) => {
                              const updated = prev.map((r) => [...r]);
                              const temp = updated[from.row][from.col];
                              updated[from.row][from.col] = updated[rowIdx][colIdx];
                              updated[rowIdx][colIdx] = temp;
                              setLastMatrix(prev); // Save for undo
                              localStorage.setItem('scheduleMatrix', JSON.stringify(updated));
                              return updated;
                            });
                          }}
                          className={`relative group border p-2 text-center rounded-lg m-1 shadow-sm transition cursor-move ${
                            SUBJECT_COLORS[subject] || 'bg-white'
                          } ${
                            subject === 'Free'
                              ? 'text-gray-500 text-xs font-normal'
                              : 'text-gray-800 text-sm font-bold'
                          }`}
                        >
                          {showCurriculum && subject !== 'Free' && curriculumMap[subject]
                            ? curriculumMap[subject]
                            : subject}
          
                          {subject !== 'Free' && curriculumMap[subject] && (
                            <div className="absolute z-50 hidden group-hover:block top-full mt-1 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 text-xs text-gray-700 w-48">
                              📘 <span className="font-semibold">{curriculumMap[subject]}</span>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          
            {lastMatrix.length > 0 && (
              <button
                onClick={() => {
                  setScheduleMatrix(lastMatrix);
                  setLastMatrix([]);
                  localStorage.setItem('scheduleMatrix', JSON.stringify(lastMatrix));
                }}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
              >
                ↩ Undo Last Change
              </button>
            )}


<div className="mt-4 flex flex-wrap gap-4">
  <button
    onClick={() => {
      if (confirm("Are you sure you want to restore the default subject sessions and suggested layout? This will overwrite your current customizations.")) {
        setCustomSessions(defaultSessions);
      }
    }}
    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm hover:bg-blue-200 border border-blue-300 transition"
  >
    🔁 Restore Subject Sessions
  </button>

  <button
    onClick={() => {
      if (confirm("Are you sure you want to reset your entire schedule to the suggested layout? This will overwrite your changes.")) {
        const blocksPerHour = useHalfHour ? 2 : 1;
        const totalSlots = hoursPerDay * blocksPerHour * activeDays.length;
        const blocks = [];

        Object.entries(defaultSessions).forEach(([subject, count]) => {
          blocks.push(...Array(Number(count)).fill(subject));
        });

        while (blocks.length < totalSlots) blocks.push('Free');

        const filledMatrix = [];
        const rows = hoursPerDay * blocksPerHour;
        for (let i = 0; i < rows; i++) {
          filledMatrix.push(blocks.slice(i * activeDays.length, (i + 1) * activeDays.length));
        }

        setScheduleMatrix(filledMatrix);
      }
    }}
    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm hover:bg-blue-200 border border-blue-300 transition"
  >
    ♻️ Reset to Suggested Schedule
  </button>
</div>



          </>
        )}
        {/* Floating Legend */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowLegend((prev) => !prev)}
            className="bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
          >
            {showLegend ? 'Hide Legend' : '📘 Legend'}
          </button>

          {showLegend && (
            <div className="mt-2 p-4 border rounded-lg shadow-lg bg-white w-64 text-sm text-gray-800">
              <h3 className="font-bold mb-2 text-blue-700">Subject Colors</h3>
              <ul className="grid grid-cols-2 gap-2">
  {Object.keys(SUBJECT_COLORS).map((subj) => (
    <li key={subj} className={`flex items-center gap-2 px-2 py-1 rounded ${SUBJECT_COLORS[subj]} border`}>
      <span className="w-4 h-4 rounded-sm border border-gray-300 bg-white" />
      <span className="text-xs font-medium">{subj}</span>
    </li>
  ))}
</ul>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
