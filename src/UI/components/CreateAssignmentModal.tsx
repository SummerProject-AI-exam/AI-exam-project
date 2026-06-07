import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = {
    courseId: string
    onClose: () => void
    onCreated: () => void
}

function CreateAssignmentModal({ courseId, onClose, onCreated }: Props) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [assignmentType, setAssignmentType] = useState('MCQ')
    const [dueDate, setDueDate] = useState('')
    //const [isActive, setIsActive] = useState(true)
    const [totalMarks, setTotalMarks] = useState('')
    const [publishDate, setPublishDate] = useState('')
    

    const handleSubmit = async () => {

        if (!title || !publishDate || !dueDate || !totalMarks) {
            alert('Please fill all required fields')
            return
        }

        //Validate Dates
        const now = new Date()

        if (new Date(publishDate) < now) {
            alert('Publish date cannot be a past date')
            return
        }

        if (new Date(publishDate) > new Date(dueDate)) {
            alert('Publish date cannot be after due date')
            return
        }

        const isActive = true

        const { error } = await supabase
            .from('Assignment')
            .insert([
                {
                    course_id: courseId,
                    title: title,
                    description: description,
                    assignment_type: assignmentType,
                    publish_date: publishDate,
                    due_date: dueDate,
                    is_active: isActive,
                    total_marks: Number(totalMarks)
                }
            ])

        if (error) {
            console.error(error)
            alert('Failed to create assignment')
            return
        }

        alert('Assignment created successfully')
        onCreated()
        onClose()
        
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Create Assignment</h2>

                <input
                    type="text"
                    placeholder="Assignment Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)} />

                <select
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value)} 
                >
                    <option value="MCQ">MCQ Quiz</option>
                    <option value="Code based">Code </option>
                    
                    </select>
                <label>
                    Publish Date
                    <input
                        type="datetime-local"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)} />
                </label>
                <label>
                    Due Date
                <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)} />
                </label>
                    <input
                        type="number"
                        placeholder="Total Marks"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}  />
                {/*}
                <label>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)} />
                    Published Immediately
                </label>*/}

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


export default CreateAssignmentModal