import { useState, useEffect } from 'react';
import { EXAM_CONFIG } from '../../sebconfig/examConfig';

function ExamPortal() {
    const userInsideSEB = navigator.userAgent.includes('SEB');

    const [examSubmitted, setExamSubmitted] = useState(false);
    const [answer, setAnswer] = useState(() => localStorage.getItem('exam_answer') || '');
    const [secondsLeft, setSecondsLeft] = useState(EXAM_CONFIG.examDurationSeconds);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const sebDeepLinkUrl = EXAM_CONFIG.sebDeepLinkUrl;

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!examSubmitted) {
            localStorage.setItem('exam_answer', answer);
        } else {
            localStorage.removeItem('exam_answer');
        }
    }, [answer, examSubmitted]);

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

    const getWordCount = (text: string) => {
        const trimmed = text.trim();
        return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isOnline) return;
        setExamSubmitted(true);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        alert("Pasting text is disabled in this exam session.");
    };

    //First page outside of SEB that guides to launch SEB
    return (
        <div style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
            textAlign: 'center', 
            padding: '80px 20px', 
            minHeight: '100vh', 
            backgroundColor: '#f8fafc',
            backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            boxSizing: 'border-box'
        }}>

            {!userInsideSEB && (
                <div style={{ background: '#ffffff', padding: '40px 32px', borderRadius: '16px', maxWidth: '440px', width: '100%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0070f3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h2 style={{ color: '#0f172a', marginTop: '0', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.025em', marginBottom: '8px' }}>Safe Exam Portal</h2>
                    <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px', margin: '0 0 24px 0' }}>This test requires safe exam browser to be launched</p>

                    <a
                        href={sebDeepLinkUrl}
                        style={{ background: '#0070f3', color: 'white', padding: '14px 24px', borderRadius: '8px', display: 'block', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px', boxShadow: '0 4px 14px rgba(0, 112, 243, 0.3)', transition: 'background-color 0.2s' }}
                    >
                        Launch Safe Exam Browser
                    </a>
                </div>
            )}
            
            {userInsideSEB && !examSubmitted && (
                <div 
                    onContextMenu={handleContextMenu}
                    onCopy={(e) => e.preventDefault()}
                    style={{ 
                        background: '#ffffff', 
                        padding: '36px', 
                        border: !isOnline ? '2px solid #b91c1c' : secondsLeft < EXAM_CONFIG.warningThresholdSeconds ? '2px solid #d32f2f' : '1px solid #e2e8f0', 
                        borderRadius: '16px', 
                        maxWidth: '640px', 
                        width: '100%', 
                        boxShadow: !isOnline ? '0 20px 25px -5px rgba(185, 28, 28, 0.08)' : secondsLeft < EXAM_CONFIG.warningThresholdSeconds ? '0 20px 25px -5px rgba(211, 47, 47, 0.08)' : '0 10px 25px -5px rgba(0, 0, 0, 0.02)', 
                        transition: 'all 0.3s ease',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        userSelect: 'none'
                    }}
                >
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '18px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: !isOnline ? '#b91c1c' : '#0288d1' }}></span>
                            <span style={{ color: !isOnline ? '#b91c1c' : '#0288d1', background: !isOnline ? '#fef2f2' : '#e1f5fe', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.025em' }}>
                                {!isOnline ? 'Connection Lost' : 'Environment Locked'}
                            </span>
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: secondsLeft < EXAM_CONFIG.warningThresholdSeconds ? '#d32f2f' : '#333', fontFamily: 'monospace', backgroundColor: secondsLeft < EXAM_CONFIG.warningThresholdSeconds ? '#ffebee' : '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: secondsLeft < EXAM_CONFIG.warningThresholdSeconds ? '1px solid #ffebee' : '1px solid #f1f5f9' }}>
                            Time Left: {formatTime(secondsLeft)}
                        </span>
                    </div> 

                    {!isOnline && (
                        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #fee2e2', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a11 11 0 0 1 15.66 0"></path><path d="M8.34 16.16a5.74 5.74 0 0 1 7.32 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                            You are currently offline. Keep typing, your work is preserved, but you cannot submit until your connection returns.
                        </div>
                    )}

                    {isOnline && secondsLeft < EXAM_CONFIG.warningThresholdSeconds && (
                        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold', fontSize: '14px', border: '1px solid #ffebee', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            Warning: Less than 1 minute remaining. Your work will auto-submit at 00:00.
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ textAlign: 'left', margin: '0 auto 24px auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', color: '#333', fontSize: '16px' }}>
                                    Question 1: First example question
                                </label>
                                <span style={{ fontSize: '13px', color: '#777', fontWeight: '500' }}>
                                    {getWordCount(answer)} words <span style={{ color: '#cbd5e1', margin: '0 4px' }}>|</span> {answer.length} characters
                                </span>
                            </div>
                            <textarea
                                rows={6}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onPaste={handlePaste}
                                placeholder="Your answer here..."
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    boxSizing: 'border-box', 
                                    borderRadius: '10px', 
                                    border: !isOnline ? '1px solid #f87171' : secondsLeft < EXAM_CONFIG.warningThresholdSeconds ? '1px solid #d32f2f' : '1px solid #ccc', 
                                    fontSize: '16px', 
                                    lineHeight: '1.6', 
                                    transition: 'all 0.2s ease', 
                                    outline: 'none', 
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', 
                                    color: '#0f172a',
                                    WebkitUserSelect: 'text',
                                    MozUserSelect: 'text',
                                    msUserSelect: 'text',
                                    userSelect: 'text'
                                }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!isOnline}
                            style={{ 
                                background: !isOnline ? '#94a3b8' : secondsLeft < EXAM_CONFIG.warningThresholdSeconds ? '#e53935' : '#10b981', 
                                color: 'white', 
                                border: 'none', 
                                padding: '14px 24px', 
                                borderRadius: '8px', 
                                width: '100%', 
                                fontSize: '16px', 
                                fontWeight: 'bold', 
                                cursor: !isOnline ? 'not-allowed' : 'pointer', 
                                transition: 'background-color 0.2s', 
                                boxShadow: !isOnline ? 'none' : secondsLeft < EXAM_CONFIG.warningThresholdSeconds ? '0 4px 12px rgba(229, 57, 53, 0.2)' : '0 4px 12px rgba(16, 185, 129, 0.15)' 
                            }}
                        >
                            {!isOnline ? 'Reconnecting...' : 'Submit Exam'}
                        </button>    
                    </form>

                    <div style={{ background: '#fff3cd', color: '#856404', padding: '14px 18px', borderRadius: '10px', border: '1px solid #ffeeba', fontSize: '14px', marginTop: '28px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.5' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginTop: '2px', flexShrink: '0' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <span>Press <strong>Ctrl + Q</strong> (Windows) or <strong>Cmd + Q</strong> (Mac) to exit with a password <strong>{EXAM_CONFIG.exitPassword}</strong>.</span>
                    </div>
                </div>    
            )}

            {userInsideSEB && examSubmitted && (
                <div style={{ background: '#ffffff', padding: '48px 36px', borderRadius: '16px', maxWidth: '480px', width: '100%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h2 style={{ color: '#10b981', marginTop: '0', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.025em', marginBottom: '8px' }}>Exam Submitted Successfully</h2>
                    <p style={{ color: '#666', marginBottom: '32px', fontSize: '15px', lineHeight: '1.5' }}>Your answers have been submitted and saved</p>
                    
                    <button 
                        onClick={() => window.close()} 
                        style={{ background: '#676768', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', width: '100%', transition: 'background-color 0.2s' }}
                    >
                        Close Exam Session
                    </button>
                </div>
            )}

        </div>
    );
}

export default ExamPortal;