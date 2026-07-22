import { useState, useEffect } from 'react';

// Autosave status  
export function AutosaveBadge({ value }: { value: string }) {
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
        if (!value) return;
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSaved(timeString);
    }, [value]);

    if (!lastSaved) return null;

    return (
        <span style={{ fontSize: '12px', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            Saved at {lastSaved}
        </span>
    );
}

// Student troubleshoot 
export function SebTroubleshootingModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ marginTop: '16px' }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
                {isOpen ? 'Hide Instructions' : 'Need Help or Stuck?'}
            </button>

            {isOpen && (
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '10px', marginTop: '10px', textAlign: 'left', fontSize: '13px', color: '#334155', border: '1px solid #cbd5e1' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#0f172a' }}>Troubleshooting Quick Guide:</strong>
                    <ul style={{ margin: '0', paddingLeft: '18px', lineHeight: '1.6' }}>
                        <li><strong>Frozen screen?</strong> Wait 5 seconds for local autosave, then force close using quit keys.</li>
                        <li><strong>Offline error?</strong> Keep typing! Your answer stays saved in memory until you reconnect.</li>
                        <li><strong>Quit Keys:</strong> <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>Ctrl + Q</code> (Win) or <code style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>Cmd + Q</code> (Mac).</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

// Readiness Checklist
export function PreFlightChecklist() {
    const isOnline = navigator.onLine;
    const hasSufficientHeight = window.innerHeight >= 600;

    return (
        <div style={{ margin: '20px 0', padding: '14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '13px' }}>
            <div style={{ fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Readiness Checklist:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ color: isOnline ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{isOnline ? '✓' : '✗'}</span> Internet Connection: {isOnline ? 'Ready' : 'Offline'}
                </div>
                <div style={{ color: hasSufficientHeight ? '#059669' : '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{hasSufficientHeight ? '✓' : '⚠'}</span> Screen Size: {hasSufficientHeight ? 'Optimal' : 'Window might be too small'}
                </div>
            </div>
        </div>
    );
}