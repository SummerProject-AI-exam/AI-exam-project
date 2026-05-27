import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface LoginFormProps {
  role: 'teacher' | 'student';
  onBack: () => void;
  onLoginSuccess: (userData: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, onBack, onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [studentIdInput, setStudentIdInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Student login and registration  
    if (role === 'student') {
      try {
        // Checking if the student exists in the database  
        const { data: existingStudent } = await supabase
          .from('Student')
          .select('*')
          .eq('student_email', email)
          .single();

        // Student already has an account 
        if (existingStudent) {
          // Checking for student ID match  
          if (existingStudent.student_id === studentIdInput) {
            alert(`Welcome back, ${existingStudent.student_first_name}! (Existing Account)`);
            onLoginSuccess(existingStudent);
            console.log('Logged in existing student:', existingStudent);
          } else {
            alert('This email is already taken, but the Student ID is incorrect. Please try again.');
          }
        } 
        
        // First login for student  
        else {
          alert("First time here? We are creating your account automatically with these credentials...");

          const { data: newStudent, error: insertError } = await supabase
            .from('Student')
            .insert([
              {
                student_email: email,
                student_id: studentIdInput, 
                student_first_name: 'New',   
                student_last_name: 'Student'  
              }
            ])
            .select()
            .single();

          if (insertError) {
            alert(`Failed to auto-register: ${insertError.message}`);
            console.error(insertError);
          } else if (newStudent) {
            alert(`Account successfully created! Welcome to the system.`);
            onLoginSuccess(newStudent);
            console.log('Created and logged in brand new student:', newStudent);
          }
        }

      } catch (err) {
        console.error('Unexpected error during auto-login flow:', err);
      } finally {
        setLoading(false);
      }
    } 
    
    // Teacher login and registration
    else {
      try {
        // Checking if the teacher exists in the database
        const { data: existingTeacher } = await supabase
          .from('Teacher')
          .select('*')
          .eq('teacher_email', email)
          .single();

        // Existing teacher logging in 
        if (existingTeacher) {
          alert(`Welcome back, Prof. ${existingTeacher.teacher_first_name}! (Existing Profile)`);
          onLoginSuccess(existingTeacher);
          console.log('Logged in existing teacher:', existingTeacher);
        } 
        
        // First time teacher logging in 
        else {
          alert("First time here, teacher? Creating your profile automatically...");

          const { data: newTeacher, error: insertError } = await supabase
            .from('Teacher')
            .insert([
              {
                teacher_email: email,
                teacher_first_name: 'New',
                teacher_last_name: 'Teacher'
              }
            ])
            .select()
            .single();

          if (insertError) {
            alert(`Failed to auto-register teacher: ${insertError.message}`);
            console.error(insertError);
          } else if (newTeacher) {
            alert(`Teacher profile successfully created! Welcome to the system.`);
            onLoginSuccess(newTeacher);
            console.log('Created and logged in brand new teacher:', newTeacher);
          }
        }
      } catch (err) {
        console.error('Unexpected error during teacher login flow:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <button onClick={onBack} style={{ float: 'left', cursor: 'pointer' }}> Back </button>
      <div style={{ clear: 'both' }}></div>
      
      <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input 
          type="email" 
          placeholder={role === 'teacher' ? "Teacher Email" : "Email"} 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required 
          disabled={loading}
          style={{ padding: '10px', fontSize: '16px' }}
        />

        {role === 'student' && (
          <input 
            type="text" 
            placeholder="Enter student ID" 
            value={studentIdInput} 
            onChange={(e) => setStudentIdInput(e.target.value)}
            required
            disabled={loading}
            style={{ padding: '10px' }}
          />
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            backgroundColor: role === 'teacher' ? '#28a745' : '#007bff',
            color: 'white', 
            border: 'none',
            fontSize: '15px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Verifying...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;