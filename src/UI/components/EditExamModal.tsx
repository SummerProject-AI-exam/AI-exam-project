import { useState } from "react";
import { supabase } from '../lib/supabase'

type Props = {
    examData: any
    onClose: () => void
    onUpdated: () => void
}

function EditExamModal({
    examData,
    onClose,
    onUpdated
}: Props) {

    const [title, setTilte] = useState(examData.title)
    const [description, setDescription] = useState(examData.description || '')

    const formatForInput = (dateString: string) => {
        const date = new Date(dateString)

        const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        )

        return localDate
            .toISOString()
            .slice(0, 16)

    }

    const [startTime, setStartTime] = useState(
        formatForInput(examData.start_time)
            
    )

    const [endTime, setEndTime] = useState(
        formatForInput(examData.end_time)
            
    )

    const [durationTime, setDurationTime] = useState(String(examData.duration_time))

    const handleUpdate = async () => {

        if (
            !title ||
            !startTime ||
            !endTime ||
            !durationTime
        ) {
            alert('Please fill all required fields')
            return
        }

        if (new Date(startTime) >=new Date(endTime)) {
            alert('End time must be after start time')
            return
        }

        const { error } = await supabase
            .from('Exam')
            .update(
                {
                    title,
                    description,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                    duration_time: Number(durationTime),
                    
                }
            )
            .eq('id', examData.id)

        if (error) {
            console.log(error)
            alert(error.message)
            return
        }

        alert('Exam created successfully')

        onUpdated()
        onClose()
    }

    

    return (
        <div className="modal-overlay">
            <div className="modal">

                <h2>Edit Exam</h2>

                <input
                    type="text"
                    placeholder="Exam Title"
                    value={title}
                    onChange={(e) => setTilte(e.target.value)}
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label>
                    Start Time

                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </label>

                <label>
                    End Time

                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </label>
                <label>
                    Duration 
                <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={durationTime}
                    onChange={(e) => setDurationTime(e.target.value)}
                />
                </label>

                <div className="modal-buttons">
                    <button onClick={handleUpdate}>
                        Update
                    </button>

                    <button onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditExamModal