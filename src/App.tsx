import { useState } from 'react';
import RoleSelection from './components/RoleSelection';
import LoginForm from './components/LoginForm';

// View states
type viewState = 'selection' | 'teacher-login' | 'student-login' | 'student-dashboard' | 'teacher-dashboard';

function App() {
  const [view, setView] = useState<viewState>('selection');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Role handler  
  const handleLoginSuccess = (userData: any, role: 'student' | 'teacher') => {
    setCurrentUser(userData);
    if (role === 'teacher') {
      setView('teacher-dashboard');
    } else {
      setView('student-dashboard');
    }
  };

  return (
    <div className="App">
      {view === 'selection' && (
        <RoleSelection
          onSelectRole={(role) => setView(role === 'teacher' ? 'teacher-login' : 'student-login')}
        />
      )}

      {view === 'teacher-login' && (
        <LoginForm
          role="teacher"
          onBack={() => setView('selection')}
          onLoginSuccess={(data) => handleLoginSuccess(data, 'teacher')} 
        />
      )}

      {view === 'student-login' && (
        <LoginForm
          role="student"
          onBack={() => setView('selection')}
          onLoginSuccess={(data) => handleLoginSuccess(data, 'student')} 
        />
      )}

      {view === 'student-dashboard' && currentUser && (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#007bff' }}>Student Dashboard</h1>
          <h2 style={{ color: '#007bff' }}>Welcome back, {currentUser.student_first_name}!</h2>
          <p><strong>Student Email:</strong> {currentUser.student_email}</p>
          <p><strong>Student ID:</strong> {currentUser.student_id}</p>
          {/* <p><strong>Database UUID:</strong> {currentUser.id}</p> */}
          <button 
            onClick={() => { setCurrentUser(null); setView('selection'); }} 
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
          >
            Log Out
          </button>
        </div>
      )}

      {view === 'teacher-dashboard' && currentUser && (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#28a745' }}>Teacher Dashboard</h1>
          <h2 style={{ color: '#28a745' }}>Welcome back, {currentUser.teacher_first_name}!</h2>
          <p><strong>Teacher Email:</strong> {currentUser.teacher_email}</p>
          {/* <p><strong>Database UUID:</strong> {currentUser.id}</p> */}
          <button 
            onClick={() => { setCurrentUser(null); setView('selection'); }} 
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
