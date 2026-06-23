import { useState} from 'react'
import { supabase } from '../lib/supabase'

type Assignment = {
    id: string
    title: string
    description: string
    assignment_type: string
    publish_date: string
    due_date: string
    total_marks: number
}

type Props = {
    assignment: Assignment
    onClose: () => void
    onUpdated: () => void

}

function EditAssignmentModal({
    assignment,
    onClose,
    onUpdated
}: Props) {

    const [title, setTitle] = useState(assignment.title)

    const [description, setDescription] = useState(assignment.description)
    const [assignmentType, setAssignmentType] = useState(assignment.assignment_type)
    const [publishDate, setPublishDate] = useState(
        assignment.publish_date
            ? new Date(assignment.publish_date)
                .toISOString()
                .slice(0, 16)
            : ''
    )

    const [dueDate, setDueDate] = useState(
        assignment.due_date
            ?new Date(assignment.due_date)
                .toISOString()
                .slice(0, 16)
            : ''
    )

    const [totalMarks, setTotalMarks] = useState(assignment.total_marks.toString())
 

    const handleUpdate = async () => {

        if (
            !title ||
            !publishDate ||
            !dueDate ||
            !totalMarks
        ) {
            alert('Please fill all required fields')
            return
        }

        if (
            new Date(publishDate) > new Date(dueDate)
        ) {
            alert('Due date must be after publish date')
            return
        }

        const { error } = await supabase
            .from('Assignment')
            .update({
                title: title,
                description: description,
                assignment_type: assignmentType,
                publish_date: new Date(publishDate).toISOString(),
                due_date: new Date(dueDate).toISOString(),
                total_marks: Number(totalMarks)
            })
            .eq('id', assignment.id)

        if (error) {
            console.error(error)
            alert('Failed to update assignment')
            return
        }

        alert('Assignment updated successfully')

        onUpdated()
        onClose()
    }

    return (
        <div className="modal-overlay">
            <div className="modal">

                <h2>Edit Assignment</h2>

                <input
                    type="text"
                    placeholder="Assignment Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <select
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value)}
                >
                    <option value="MCQ">
                        MCQ Quiz
                    </option>

                    <option value="Code based">
                        Code
                    </option>
                </select>

                <label>
                    Publish Date

                    <input
                        type="datetime-local"
                        value={publishDate}
                        onChange={(e)=> setPublishDate(e.target.value)}
                    />
                </label>

                <label>
                    Due Date

                    <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </label>

                <input
                    type="number"
                    placeholder="Total-Marks"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                />

                <div className="modal-buttons">

                    <button
                        onClick={handleUpdate}
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditAssignmentModal