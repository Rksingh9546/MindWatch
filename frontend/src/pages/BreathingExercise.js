import React, { useEffect, useState } from 'react';

const PHASES = [
  { name: 'Inhale', duration: 4, icon: 'bi-wind' },
  { name: 'Hold', duration: 7, icon: 'bi-pause-circle' },
  { name: 'Exhale', duration: 8, icon: 'bi-cloud' },
];

export default function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [totalCycles, setTotalCycles] = useState(4);

  useEffect(() => {
    if (!running) return undefined;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
    const next = (phaseIdx + 1) % 3;
    if (next === 0) {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      if (newCycles >= totalCycles) {
        setRunning(false);
        setCycles(0);
        setPhaseIdx(0);
        setCountdown(4);
        return undefined;
      }
    }
    setPhaseIdx(next);
    setCountdown(PHASES[next].duration);
    return undefined;
  }, [running, countdown, phaseIdx, cycles, totalCycles]);

  const start = () => {
    setRunning(true);
    setPhaseIdx(0);
    setCountdown(4);
    setCycles(0);
  };

  const phase = PHASES[phaseIdx];
  const scale = running ? (phase.name === 'Inhale' ? 1.2 : phase.name === 'Hold' ? 1.15 : 0.85) : 1;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Breathing Exercise</h1>
        <p className="text-muted">4-7-8 technique — proven to reduce stress and anxiety</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card-mw p-5 text-center">
            <div
              className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 200,
                height: 200,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.2))',
                border: '3px solid var(--mw-primary)',
                transform: `scale(${scale})`,
                transition: 'transform 1s ease',
              }}
            >
              <div>
                <i className={`bi ${phase.icon} display-4 text-primary`} />
                <div className="display-3 fw-bold mt-2">{running ? countdown : '—'}</div>
                <div className="text-muted">{running ? phase.name : 'Ready'}</div>
              </div>
            </div>

            {!running && (
              <div className="mb-4">
                <label className="form-label">Cycles</label>
                <input type="range" className="form-range" min={1} max={8} value={totalCycles} onChange={(e) => setTotalCycles(+e.target.value)} />
                <div>{totalCycles} cycles (~{totalCycles * 19}s)</div>
              </div>
            )}

            {running && <p className="text-muted mb-3">Cycle {cycles + 1} of {totalCycles}</p>}

            <div className="d-flex gap-2 justify-content-center">
              {!running ? (
                <button type="button" className="btn btn-mw-primary btn-lg px-5" onClick={start}>
                  <i className="bi bi-play-fill me-2" />Start
                </button>
              ) : (
                <button type="button" className="btn btn-outline-danger btn-lg" onClick={() => setRunning(false)}>
                  Stop
                </button>
              )}
            </div>

            <div className="row g-3 mt-5 text-start">
              {PHASES.map((p) => (
                <div className="col-md-4" key={p.name}>
                  <div className="p-3 rounded" style={{ background: 'rgba(99,102,241,0.08)' }}>
                    <strong>{p.name}</strong> — {p.duration}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
