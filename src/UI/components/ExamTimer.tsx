import { useEffect, useState } from "react";

type Props = {
    endTime: string
    onTimeUp?: () => void
}

function ExamTimer ({
    endTime,
    onTimeUp
}: Props) {

    const [timeLeft, setTimeLeft] = useState("")

    useEffect(() => {

        if (!endTime) return

        const timer = setInterval(() => {

            const now = new Date().getTime()

            const end = new Date(endTime).getTime()

            const differance = end - now

            if (differance <= 0) {

                clearInterval(timer)

                setTimeLeft("00:00:00")

                if (onTimeUp) {
                    onTimeUp()
                }

                return
            }

            const hours = Math.floor(differance / (1000 * 60 * 60))

            const minutes = Math.floor((differance % (1000 * 60 * 60)) / (1000 * 60))

            const seconds = Math.floor((differance % (1000 * 60)) / 1000)

            setTimeLeft(
                `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds
                    .toString()
                    .padStart(2, "0")}`
                    
                
            )
        }, 1000)

        return () => clearInterval(timer)
    }, [endTime, onTimeUp])

    return (

        <div className="exam-timer">
            <h3>
                Time Remaining
            </h3>

            <h2>
                {timeLeft}
            </h2>
        </div>
    )
}

export default ExamTimer