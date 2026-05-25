import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

const App = () => {
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [violationCount, setViolationCount] = useState<number>(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isExamActive && document.visibilityState === 'hidden') {
        setShowWarning(true);
        setViolationCount((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isExamActive]);

  const startExam = () => {
    setIsExamActive(true);
    setShowWarning(false);
    setViolationCount(0);
  };

  const stopExam = () => {
    setIsExamActive(false);
    setShowWarning(false);
  };

  return (
    <div style={styles.container}>
      <h1>Exam Monitoring Demo</h1>
      
      {!isExamActive ? (
        <button onClick={startExam} style={styles.startButton}>
          Click to start the exam
        </button>
      ) : (
        <div>
          <div style={styles.examArea}>
            <h2>Exam in Progress...</h2>
            <p>Violation counter: <strong>{violationCount}</strong></p>
            <button onClick={stopExam} style={styles.stopButton}>
              Finish Exam
            </button>
          </div>
        </div>
      )}

      {showWarning && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{ color: 'red' }}>Tab switch detected!</h2>
            <p>You switched tabs. This incident has been logged.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'sans-serif',
    textAlign: 'center',
    padding: '50px',
  },
  startButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  stopButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  examArea: {
    border: '2px solid #333',
    padding: '20px',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0px 0px 20px rgba(0,0,0,0.5)',
    textAlign: 'center',
  }
};

export default App;