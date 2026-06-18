import { useState, useEffect } from 'react';

function ExamPortal() {
    const userInsideSEB = navigator.userAgent.includes('SEB');

    const [examSubmitted, setExamSubmitted] = useState(false);
    const [answer, setAnswer] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(600);

    const sebDeepLinkUrl = "";

    //Timer to simulate a real exam situation and a character counter for the text area
    useEffect(() => {
        if (!userInsideSEB || examSubmitted) return;
        
        if (secondsLeft === 0) {
            setExamSubmitted(true);
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [userInsideSEB, examSubmitted, secondsLeft]);

    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setExamSubmitted(true);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    //First page outside of SEB that guides to launch SEB
    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '60px 20px', minHeight: '100vh', backgroundColor: '#f4f5f6' }}>

            {!userInsideSEB && (
                <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', maxWidth: '480px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ color: '#1a1a1a', marginTop: '0' }}>Safe Exam Portal</h2>
                    <p style={{ color: '#666', lineHeight: '1.5' }}>This test requires safe exam browser to be launched</p>

                    <a
                        href={sebDeepLinkUrl}
                        style={{ background: '#0070f3', color: 'white', padding: '14px 28px', borderRadius: '6px', display: 'inline-block', fontWeight: 'bold', textDecoration: 'none', marginTop: '15px', boxShadow: '0 4px 14px rgba(0, 112, 243, 0.3)' }}
                    >
                        Launch Safe Exam Browser
                    </a>
                </div>
            )}
            
            {userInsideSEB && !examSubmitted && (
                <div 
                    onContextMenu={handleContextMenu}
                    style={{ background: '#ffffff', padding: '30px', border: secondsLeft < 60 ? '2px solid #d32f2f' : '2px solid #0070f3', borderRadius: '12px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,112,243,0.08)', transition: 'border 0.3s ease' }}
                >
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                        <span style={{ background: '#e1f5fe', color: '#0288d1', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>Environment Locked</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: secondsLeft < 60 ? '#d32f2f' : '#333' }}>Time Left: {formatTime(secondsLeft)}</span>
                    </div> 

                    {secondsLeft < 60 && (
                        <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                            Warning: Less than 1 minute remaining. Your work will auto-submit at 00:00.
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ textAlign: 'left', margin: '20px auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                    Question 1: First example question
                                </label>
                                <span style={{ fontSize: '12px', color: '#777' }}>{answer.length} characters</span>
                            </div>
                            <textarea
                                rows={5}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Your answer here..."
                                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '6px', border: secondsLeft < 60 ? '1px solid #d32f2f' : '1px solid #ccc', fontSize: '16px', transition: 'border 0.3s ease' }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            style={{ background: secondsLeft < 60 ? '#e53935' : '#10b981', color: 'white', border: 'none', padding: '14px 24px', borderRadius: '6px', width: '100%', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.3s ease' }}
                        >
                            Submit Exam
                        </button>    
                    </form>

                    <div style={{ background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '6px', border: '1px solid #ffeeba', fontSize: '14px', marginTop: '25px' }}>
                        Press <strong>Ctrl + Q</strong> (Windows) or <strong>Cmd + Q</strong> (Mac) to exit with a password <strong>1234</strong>.
                    </div>
                </div>    
            )}

            {userInsideSEB && examSubmitted && (
                <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', maxWidth: '500px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ color: '#10b981', marginTop: '0' }}>Exam Submitted Successfully</h2>
                    <p style={{ color: '#666', marginBottom: '25px' }}>Your answers have been submitted and saved</p>
                    
                    <button 
                        onClick={() => window.close()} 
                        style={{ background: '#676768', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Close Exam Session
                    </button>
                </div>
            )}

        </div>
    );
}

export default ExamPortal;