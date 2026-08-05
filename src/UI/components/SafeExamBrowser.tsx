import { useState, useEffect } from 'react';
import { EXAM_CONFIG } from '../../sebconfig/examConfig';
import { AutosaveBadge, SebTroubleshootingModal, PreFlightChecklist } from './SafeExamBrowserHelpers';

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

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setExamSubmitted(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [userInsideSEB, examSubmitted]);

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
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
            textAlign: 'center', 
            padding: '40px 16px', 
            minHeight: '100vh', 
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            boxSizing: 'border-box'
        }}>

            {!userInsideSEB && (
                <div style={{ background: '#ffffff', padding: '32px 24px', borderRadius: '12px', maxWidth: '420px', width: '100%', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h2 style={{ color: '#0f172a', marginTop: '0', fontSize: '20px', fontWeight: '600', marginBottom: '6px' }}>Safe Exam Portal</h2>
                    <p style={{ color: '#64748b', lineHeight: '1.5', fontSize: '14px', margin: '0 0 16px 0' }}>This test requires safe exam browser to be launched</p>

                    <PreFlightChecklist />

                    <a
                        href={sebDeepLinkUrl}
                        style={{ background: '#0f172a', color: 'white', padding: '12px 20px', borderRadius: '6px', display: 'block', fontWeight: '600', textDecoration: 'none', fontSize: '14px', transition: 'background-color 0.2s' }}
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
                        padding: '28px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px', 
                        maxWidth: '600px', 
                        width: '100%', 
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        userSelect: 'none'
                    }}
                >
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: !isOnline ? '#ef4444' : '#10b981' }}></span>
                            <span style={{ color: '#475569', fontSize: '13px', fontWeight: '500' }}>
                                {!isOnline ? 'Connection Lost' : 'Environment Locked'}
                            </span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: secondsLeft < EXAM_CONFIG.warningThresholdSeconds ? '#ef4444' : '#0f172a', fontFamily: 'monospace' }}>
                            Time Left: {formatTime(secondsLeft)}
                        </span>
                    </div> 

                    {!isOnline && (
                        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', border: '1px solid #fee2e2', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a11 11 0 0 1 15.66 0"></path><path d="M8.34 16.16a5.74 5.74 0 0 1 7.32 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                            You are currently offline. Keep typing, your work is preserved, but you cannot submit until your connection returns.
                        </div>
                    )}

                    {isOnline && secondsLeft < EXAM_CONFIG.warningThresholdSeconds && (
                        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', border: '1px solid #fee2e2', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            Warning: Less than 1 minute remaining. Your work will auto-submit at 00:00.
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ textAlign: 'left', margin: '0 auto 20px auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                                <label style={{ fontWeight: '600', display: 'block', color: '#0f172a', fontSize: '15px' }}>
                                    Question 1: First example question
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <AutosaveBadge value={answer} />
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                        {getWordCount(answer)} words <span style={{ color: '#cbd5e1' }}>|</span> {answer.length} characters
                                    </span>
                                </div>
                            </div>
                            <textarea
                                rows={6}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                onPaste={handlePaste}
                                placeholder="Your answer here..."
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    boxSizing: 'border-box', 
                                    borderRadius: '6px', 
                                    border: '1px solid #cbd5e1', 
                                    fontSize: '15px', 
                                    lineHeight: '1.5', 
                                    outline: 'none', 
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
                                background: !isOnline ? '#94a3b8' : '#0f172a', 
                                color: 'white', 
                                border: 'none', 
                                padding: '12px 20px', 
                                borderRadius: '6px', 
                                width: '100%', 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                cursor: !isOnline ? 'not-allowed' : 'pointer', 
                                transition: 'background-color 0.2s'
                            }}
                        >
                            {!isOnline ? 'Reconnecting...' : 'Submit Exam'}
                        </button>    
                    </form>

                    <div style={{ background: '#f8fafc', color: '#475569', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', marginTop: '20px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: '1.4' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: '0' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <span>Press <strong>Ctrl + Q</strong> (Windows) or <strong>Cmd + Q</strong> (Mac) to exit with a password <strong>{EXAM_CONFIG.exitPassword}</strong>.</span>
                    </div>

                    <SebTroubleshootingModal />
                </div>    
            )}

            {userInsideSEB && examSubmitted && (
                <div style={{ background: '#ffffff', padding: '36px 24px', borderRadius: '12px', maxWidth: '420px', width: '100%', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h2 style={{ color: '#0f172a', marginTop: '0', fontSize: '20px', fontWeight: '600', marginBottom: '6px' }}>Exam Submitted Successfully</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px', lineHeight: '1.4' }}>Your answers have been submitted and saved</p>
                    
                    <button 
                        onClick={() => window.close()} 
                        style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', width: '100%', transition: 'background-color 0.2s' }}
                    >
                        Close Exam Session
                    </button>
                </div>
            )}

        </div>
    );
}

export default ExamPortal;