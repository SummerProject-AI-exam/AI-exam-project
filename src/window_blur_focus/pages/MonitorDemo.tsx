import { useEffect, useState } from 'react'
import { saveFraudEvent } from '../services/blurEventApi'


type Props = {
    sessionId?: string
}

function MonitoringDemo({
    sessionId
}: Props) {

    //const sessionId = '63cd50a6-deb3-4fdd-8290-fd9c0b0d5698'


    const [windowActive, setWindowActive] = useState(true)
    //const [events, setEvents] = useState<string[]>([])
    const[warning, setWarning] = useState(false)
    const[showHistoryWarning, setShowHistoryWarning] = useState(false)

    /*const addEvent = (message: string) => {
        const time = new Date().toLocaleTimeString()
        setEvents((prev) =>[`[${time}] ${message}`, ...prev])
    } */

    useEffect(() =>{
        let timer: ReturnType<typeof setTimeout>

        const handleBlur = async () => {

            //if (!sessionId) return
            //console.log("BLUR FIRED")
            setWindowActive(false)
            setWarning(true)
            setShowHistoryWarning(false)
            //addEvent('Window lost focus')

            if (sessionId) {
                await saveFraudEvent(
                    sessionId,
                    'WINDOW_BLUR',
                    0.9,
                    {
                        source: 'window',
                        action: 'blur'
                    }
                )
            }
        }

        const handleFocus = async () => {

            //if (!sessionId) return
            //console.log("FOCUS FIRED")
            setWindowActive(true)
            setWarning(true)
            setShowHistoryWarning(true)
            //addEvent('Window regained focus')


            if (sessionId) {
                await saveFraudEvent(
                    sessionId,
                    'WINDOW_FOCUS',
                    0.5,
                    {
                        source: 'window',
                        action: 'focus'
                    }
                )
        }

            //keep red warning for 3 seconds
            timer = setTimeout(() => {
                //console.log("TIMER FIRED")
                setWarning(false)
            }, 3000)
        }

        

        window.addEventListener('blur', handleBlur)
        window.addEventListener('focus', handleFocus)
        

        return () => {
            window.removeEventListener('blur', handleBlur)
            window.removeEventListener('focus', handleFocus)

            if (timer) clearTimeout(timer)
            
        }
    }, [sessionId])

    return (
        <div className="exam-monitor" >
            <h1>Exam Monitor</h1>

            <p className="monitor-status">
                Exam Window: {''}
                <strong>{windowActive ? 'ACTIVE' : 'INACTIVE'}</strong>
            </p>
            

            {/* Traffic Light indicator */}
            <div
                className={`monitor-indicator ${
                    warning ? 'inactive' : 'active'
                }`}
            />
                {/*style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: warning ? 'red' : 'green',
                    margin: '20px auto',
                    boxShadow: warning
                        ? '0 0 20px red'
                        : '0 0 20px green'
                }} 
                ></div>*/}

                {/* Warning Message */}
                {warning && (
                    <div className="monitor-warning">
                        
                        {/*style={{
                            background: 'red',
                            color: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                    > */}
                    
                        <strong>Attention!</strong>
                        <br />
                        You left the exam window
                    
                    </div>
                    
                )}
                {showHistoryWarning && (
                    <div className="monitor-history-warning">
                        {/*style={{
                            background: 'orange',
                            color: 'black',
                            padding: '15px',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                    > */}
                        Previous exam window exit detected
                    </div>    
                )}
            {/* 
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
                </div> */}
        </div>
    )
}

export default MonitoringDemo