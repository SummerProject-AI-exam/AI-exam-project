import React, { useState } from 'react';

interface LoginFormProps {
  role: 'teacher' | 'student';
  onBack: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API authentication 
  };

  return (
    <div style = {{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <button onClick = {onBack} style = {{ float: 'left', cursor: 'pointer' }}> Back </button>
      <div style = {{ clear: 'both' }}></div>
      
      <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Login </h2>
      
      <form onSubmit = {handleSubmit} style = {{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required 
          style = {{ padding: '10px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          required 
          style = {{ padding: '10px' }}
        />
        <button type="submit" style = {{ padding: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
          Sign In
        </button>
      </form>
    </div>
  );
};

export default LoginForm;