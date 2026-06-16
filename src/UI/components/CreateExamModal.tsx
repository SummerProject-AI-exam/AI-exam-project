import { useState } from "react";
import { supabase } from '../lib/supabase'

type Props = {
    courseId: string
    onClose: () => void
    onCreated: () => void
}

function CreateExamModal({
    courseId,
    onClose,
    onCreated
}: Props) {

    const [title, setTilte] = useState('')
    const [description, setDescription] = useState('')

    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [durationTime, setDurationTime] = useState('60')

    const handleSubmit = async () => {

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
            .insert([
                {
                    course_id: courseId,
                    title,
                    description,
                    start_time: new Date(startTime).toISOString(),
                    end_time: new Date(endTime).toISOString(),
                    duration_time: Number(durationTime),
                    status: 'Draft',
                    is_locked: false
                }
            ])

        if (error) {
            console.log(error)
            alert(error.message)
            return
        }

        alert('Exam created successfully')

        onCreated()
        onClose()
    }

    return (
        <div className="modal-overlay">
            <div className="modal">

                <h2>Create Exam</h2>

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
                    <button onClick={handleSubmit}>
                        Create
                    </button>

                    <button onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateExamModal