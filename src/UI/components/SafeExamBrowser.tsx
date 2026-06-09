import { useState } from 'react';

function App() {
    // Checking if the browser opening the page is Safe Exam Browser
    const userInsideSEB = navigator.userAgent.includes('SEB');

    // SEB config file link:
    const sebConfigUrl = "";

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '60px 20px' }}>
            
            {!userInsideSEB ? (
              <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', maxWidth: '480px', margin: '0 auto'}}>
                <p style={{ color: '#050505', }}>Click to launch SEB environment</p>
                <a
                    href={sebConfigUrl}
                    style={{ background: '#676768', color: 'white', padding: '14px 28px', textDecoration: 'none', borderRadius: '6px', display: 'inline-block', fontWeight: 'bold', marginTop: '20px' }}
                >
                    Start Exam
                </a>
              </div>
            ) : (
              <div style={{ background: '#ffffff', padding: '40px', border: '2px solid #000000', borderRadius: '12px', maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ color: '#030303' }}>Exam active</h2>
                <div style={{ textAlign: 'left', margin: '35px 0', padding: '20px', background: '#f8f9fa', borderRadius: '6px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>
                        Question 1: What is 1+1?
                    </label>
                    <textarea rows={4} placeholder="Your answer here..." style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>

                <div style={{ background: '#666766', padding: '20px', borderRadius: '6px', border: '1px solid #ffffff', marginBottom: '20px' }}>
                    <p style={{ margin: '0', fontSize: '14px' }}>Press <strong>Ctrl + Q</strong> (Windows) or <strong>Cmd + Q</strong> (Mac) and type password <strong>1234</strong> to exit the exam</p>
                </div>
               </div>         
            )}

        </div>
    );
}

export default App;