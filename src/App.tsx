import { useState } from 'react';
import RoleSelection from './components/RoleSelection';
import LoginForm from './components/LoginForm';

type viewState = 'selection' | 'teacher-login' | 'student-login';

function App() {
  const [view, setView] = useState<viewState>('selection');

  return (
    <div className = "App">
      {view === 'selection' && (
        <RoleSelection
          onSelectRole = {(role) => setView(role === 'teacher' ? 'teacher-login' : 'student-login')}
        />
      )}

      {view === 'teacher-login' && (
        <LoginForm
          role = "teacher"
          onBack = {() => setView('selection')}
        />
      )}

      {view === 'student-login' && (
        <LoginForm
          role = "student"
          onBack = {() => setView('selection')}
        />
      )}
    </div>
  );
};

export default App
