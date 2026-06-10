import { useState } from 'react';

function App() {
    // Checking if the browser opening the page is Safe Exam Browser
    const userInsideSEB = navigator.userAgent.includes('SEB');

    // State that tracks the exam progress
    const [examSubmitted, setExamSubmitted] = useState(false);
    const [answer, setAnswer] = useState('');

    // SEB config file link that automatically launches SEB
    const sebDeepLinkUrl = "";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setExamSubmitted(true);
    };

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '60px 20px', minHeight: '100vh', backgroundColor: '#f4f5f6' }}>

            {!userInsideSEB && (
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', maxWidth: '480px', margin: '0 auto' }}>
                    <h2 style={{ color: '#1a1a1a', marginTop: '0' }}>This exam requires Safe Exam Browser</h2>

                    <a
                        href={sebDeepLinkUrl}
                        style={{ background: '#0070f3', color: 'white', padding: '14px 28px', borderRadius: '6px', display: 'inline-block', fontWeight: 'bold' }}
                    >
                        Open in Safe Exam Browser    
                    </a>
                </div>
            )}
            
            {userInsideSEB && !examSubmitted && (
                <div style={{ background: '#ffffff', padding: '20px', border: '1px solid #0070f3', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ color: '#030303', margin: '0' }}>Exam is active</h2>    

                    <form onSubmit={handleSubmit}>
                        <div style={{ textAlign: 'left', margin: '20px auto' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                Question 1: First example question
                            </label>
                            <textarea
                                rows={5}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Your answer here"
                                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px' }}
                        >
                            Submit Exam
                        </button>    
                    </form>

                    <div style={{ background: '#fff3cd', color: '#856404', padding: '20px', marginTop: '20px' }}>
                        Press Ctrl + Q (Windows) or Cmd + Q (Mac) to finish the exam and exit SEB with password 1234.
                    </div>
                </div>    
            )}

            {userInsideSEB && examSubmitted && (
                <div style={{ background: '#ffffff', padding: '20px', border: '1px solid #10b981', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ color: '#10b981', marginTop: '0' }}>Exam Submitted</h2>
                    <p style={{ color: '#333', fontWeight: '500' }}>You can now exit Safe Exam Browser.</p>
                </div>
            )}

        </div>
    );
}

export default App;