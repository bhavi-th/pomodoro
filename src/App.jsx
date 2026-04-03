import { useEffect, useReducer, useRef, useState } from 'react';
import './App.css';

const CONFIG = {
  FOCUS: { label: 'DEEP_WORK', seconds: 1500 },
  SHORT: { label: 'REGEN_PHASE', seconds: 300 },
  LONG: { label: 'COOLDOWN', seconds: 900 },
};

function timerReducer(state, action) {
  switch (action.type) {
    case 'TICK':
      if (state.timeLeft <= 0) return { ...state, isActive: false };
      return { ...state, timeLeft: state.timeLeft - 1 };
    case 'TOGGLE':
      return { ...state, isActive: !state.isActive };
    case 'SET_MODE':
      return { ...state, mode: action.mode, timeLeft: CONFIG[action.mode].seconds, isActive: false };
    case 'RESET':
      return { ...state, timeLeft: CONFIG[state.mode].seconds, isActive: false };
    case 'FORCE_PAUSE':
      return { ...state, isActive: false };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(timerReducer, {
    mode: 'FOCUS',
    timeLeft: CONFIG.FOCUS.seconds,
    isActive: false,
  });

  const [sysTime, setSysTime] = useState(new Date().toLocaleTimeString());
  const [currentTask, setCurrentTask] = useState("");
  const timerRef = useRef(null);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    const clockInterval = setInterval(() => setSysTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (state.isActive && state.timeLeft > 0) {
      document.title = `${formatTime(state.timeLeft)} - ACTIVE`;
      timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    } else if (state.timeLeft === 0 && state.isActive) {
      document.title = "TASK_COMPLETE";
      new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => {});
    } else {
      document.title = "STANDBY";
    }
    return () => clearInterval(timerRef.current);
  }, [state.isActive, state.timeLeft]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && state.isActive) {
        dispatch({ type: 'FORCE_PAUSE' });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [state.isActive]);

  return (
    <div className="terminal-root">
      <div className="grid-overlay"></div>
      <div className="scanlines"></div>
      
      <div className="hud-container">
        <header className="hud-header">
          <div className="stat-box">MODE: {state.isActive ? 'ENGAGED' : 'READY'}</div>
          <div className="terminal-title">STRIKE_FORCE // PRODUCTIVITY_OS</div>
          <div className="stat-box">TIME: {sysTime}</div>
        </header>

        <main className="main-layout">
          {/* TASK MATRIX SECTION */}
          <aside className="side-panel">
            <div className="label">PRIMARY_OBJECTIVE</div>
            <div className="task-input-container">
              <textarea 
                className="task-input"
                placeholder="ENTER_MISSION_PARAMETERS..."
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                disabled={state.isActive}
              />
              <div className="task-status">
                {state.isActive ? "STRICT_LOCK_ENABLED" : "AWAITING_INPUT"}
              </div>
            </div>
          </aside>

          {/* CENTRAL CHRONOMETER */}
          <section className="core-display">
            <div className="corner-bracket top-left"></div>
            <div className="corner-bracket top-right"></div>
            <div className="corner-bracket bottom-left"></div>
            <div className="corner-bracket bottom-right"></div>

            <div className="mode-tag">{CONFIG[state.mode].label}</div>
            <div className={`timer-main ${state.isActive ? 'timer-active' : ''}`}>
              {formatTime(state.timeLeft)}
            </div>
            
            <div className="progress-container">
              <div 
                className="progress-fill" 
                style={{ width: `${(state.timeLeft / CONFIG[state.mode].seconds) * 100}%` }}
              ></div>
            </div>

            <div className="controls">
              <button className="btn-main" onClick={() => dispatch({ type: 'TOGGLE' })}>
                {state.isActive ? 'HALT_EXECUTION' : 'START_MISSION'}
              </button>
              <button className="btn-sub" onClick={() => dispatch({ type: 'RESET' })}>REBOOT</button>
            </div>
          </section>

          {/* PROTOCOL SELECTOR */}
          <aside className="side-panel">
            <div className="label">PROTOCOL_SELECTION</div>
            {Object.keys(CONFIG).map(m => (
              <button 
                key={m} 
                className={`mode-btn ${state.mode === m ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_MODE', mode: m })}
                disabled={state.isActive}
              >
                {m}
              </button>
            ))}
          </aside>
        </main>
      </div>
    </div>
  );
}
