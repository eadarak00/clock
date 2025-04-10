import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [breakLength, setBreakLength] = useState<number>(5);
  const [sessionLength, setSessionLength] = useState<number>(25);
  const [minutes, setMinutes] = useState<number>(25);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSession, setIsSession] = useState(true); // Nouveau état pour déterminer si c'est la session ou la pause
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Référence à l'élément audio

  // Formatage de l'affichage du temps
  const formatTime = (min: number, sec: number): string => {
    const m = min.toString().padStart(2, "0");
    const s = sec.toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Gestion des longueurs
  const handleIncrementBreak = () => {
    setBreakLength((prev) => Math.min(60, prev + 1));
  };

  const handleDecrementBreak = () => {
    setBreakLength((prev) => Math.max(1, prev - 1));
  };

  const handleIncrementSession = () => {
    const newSession = Math.min(60, sessionLength + 1);
    setSessionLength(newSession);
    if (!hasStarted) {
      setMinutes(newSession);
      setSeconds(0);
    }
  };

  const handleDecrementSession = () => {
    const newSession = Math.max(1, sessionLength - 1);
    setSessionLength(newSession);
    if (!hasStarted) {
      setMinutes(newSession);
      setSeconds(0);
    }
  };

  // Réinitialisation
  const handleReset = () => {
    setBreakLength(5);
    setSessionLength(25);
    setMinutes(25);
    setSeconds(0);
    setIsRunning(false);
    setHasStarted(false);
    setIsSession(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Arrêter le son et le rembobiner
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Gestion du Start/Stop
  const handleStartStop = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setMinutes(sessionLength);
      setSeconds(0);
    }

    setIsRunning((prev) => !prev);
  };

  // Timer effect
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds === 0) {
          return 59;
        } else {
          return prevSeconds - 1;
        }
      });

      setMinutes((prevMinutes) => {
        return seconds === 0 ? Math.max(0, prevMinutes - 1) : prevMinutes;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, seconds]);

  // Logic to switch between session and break when time hits 00:00
  useEffect(() => {
    if (minutes === 0 && seconds === 0) {
      // Joue le son lorsque le minuteur atteint 00:00
      if (audioRef.current) {
        audioRef.current.play();
      }

      if (isSession) {
        setIsSession(false);
        setMinutes(breakLength);
        setSeconds(0);
        document.getElementById("timer-label")!.innerText = "Pause commencée";
      } else {
        setIsSession(true);
        setMinutes(sessionLength);
        setSeconds(0);
        document.getElementById("timer-label")!.innerText = "Session commencée";
      }
    }
  }, [minutes, seconds, breakLength, sessionLength, isSession]);

  return (
    <div className="container">
      <h1 className="title">25 + 5 Clock</h1>

      <div className="length-controls">
        {/* Break Section */}
        <div id="break-label" className="control-box">
          <h3>Break Length</h3>
          <div id="break-action" className="actions">
            <button id="break-decrement" onClick={handleDecrementBreak}>
              -
            </button>
            <div id="break-length" className="value">
              {breakLength}
            </div>
            <button id="break-increment" onClick={handleIncrementBreak}>
              +
            </button>
          </div>
        </div>

        {/* Session Section */}
        <div id="session-label" className="control-box">
          <h3>Session Length</h3>
          <div id="session-action" className="actions">
            <button id="session-decrement" onClick={handleDecrementSession}>
              -
            </button>
            <div id="session-length" className="value">
              {sessionLength}
            </div>
            <button id="session-increment" onClick={handleIncrementSession}>
              +
            </button>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="timer-box">
        <h2 id="timer-label" className="timer-label">
          Session
        </h2>
        <div id="time-left" className="time-left">
          {formatTime(minutes, seconds)}
        </div>
      </div>

      {/* Controls */}
      <div className="control-buttons">
        <button id="start_stop" onClick={handleStartStop}>
          ⏯️
        </button>
        <button id="reset" onClick={handleReset}>
          🔄
        </button>
      </div>

      {/* Son pour signaler la fin du temps */}
      <audio id="beep" ref={audioRef} src="/beep.wav" />    
    </div>
  );
}

export default App;
