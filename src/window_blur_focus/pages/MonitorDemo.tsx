import { useEffect, useState } from 'react'

function MonitoringDemo() {
    const [windowActive, setWindowActive] = useState(true)
    //const [tabActive, setTabActive] = useState(true)
    const [events, setEvents] = useState<string[]>([])
    const[warning, setWarning] = useState(false)
    const[violationDetected, setViolationDetected] = useState(false)
    const[showHistoryWarning, setShowHistoryWarning] = useState(false)

    const addEvent = (message: string) => {
        const time = new Date().toLocaleTimeString()
        setEvents((prev) =>[`[${time}] ${message}`, ...prev])
    }

    useEffect(() =>{
        const handleBlur = () => {
            setWindowActive(false)
            setWarning(true)
            setShowHistoryWarning(false)
            setViolationDetected(true)
            addEvent('Window lost focus')
        }

        const handleFocus = () => {
            setWindowActive(true)
            setWarning(false)
            setShowHistoryWarning(true)
            //setViolationDetected(true)
            addEvent('Window regained focus')
        }

        /*const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarning(true)
                setTabActive(false)
                addEvent('Tab hidden / switched')
            } else {
                setTabActive(true)
                setWarning(false)
                addEvent('Tab active again')
            }

        } */

        window.addEventListener('blur', handleBlur)
        window.addEventListener('focus', handleFocus)
        //document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            window.removeEventListener('blur', handleBlur)
            window.removeEventListener('focus', handleFocus)
            //document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    return (
        <div style={{ padding: '40px' }} >
            <h1>Exam Monitoring Prototype</h1>

            <p>
                window status: {''}
                <strong>{windowActive ? 'ACTIVE' : 'INACTIVE'}</strong>
            </p>
            <p>Warnig: {warning.toString()}</p>
            <p>Violation: {violationDetected.toString()}</p>
            {/*
            <p>
                Tab Status:{''}
                <strong>{tabActive ? 'ACTIVE' : 'HIDDEN'}</strong>
            </p> */}

            {/* Traffic Light indicator */}
            <div
                style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: warning ? 'red' : 'green',
                    margin: '20px auto',
                    boxShadow: warning
                        ? '0 0 20px red'
                        : '0 0 20px green'
                }}
                ></div>

                {/* Warning Message */}
                {warning && (
                    <div
                        style={{
                            background: 'red',
                            color: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                    >
                        Suspecious Activity Detected!
                    </div>
                )}
                {showHistoryWarning && (
                    <div
                        style={{
                            background: 'orange',
                            color: 'black',
                            padding: '15px',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                    >
                        Previous suspicious activity detected
                    </div>    
                )}

            <h2>Event Log</h2>

            
            <div 
                style={{
                    border: '1px solid gray',
                    padding: '20px',
                    maxHeight: '300px',
                    overflow: 'auto',
                }} >
                    {events.map((event, index) => (
                        <p key={index}>{event}</p>
                    ))}
                </div>
        </div>
    )
}

export default MonitoringDemo