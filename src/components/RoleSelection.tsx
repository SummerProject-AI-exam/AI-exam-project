import React from 'react';

interface RoleSelectionProps {
    onSelectRole: (role: 'teacher' | 'student') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole}) => {
    return (
        <div style = {{ textAlign: 'center', marginTop: '50px'}}>
            <h1>Role Selection</h1>
            <div style = {{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px'}}>
                <button
                    onClick = {() => onSelectRole('teacher')}
                    style = {{ padding: '10px 20px', fontSize: '18px', color: '#28a745', cursor: 'pointer'}}
                >
                Login as teacher
                </button>
                <button
                    onClick = {() => onSelectRole('student')}
                    style = {{ padding: '10px 20px', fontSize: '18px', color: '#007bff', cursor: 'pointer'}}
                >
                Login as student
                </button>
            </div>
        </div>
    );
};

export default RoleSelection;