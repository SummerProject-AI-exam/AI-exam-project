import { useState } from "react";
import { supabase } from '../lib/supabase'


type Props = {
    onClose: () => void
    onCreated: () => void
}

function CreateCourseModal({ onClose, onCreated }: Props) {
    const [courseName, setCourseName] = useState('')
    const [courseCode,  setCourseCode] = useState('')
    const [courseDescription, setCourseDescription] = useState('')
    const [scheduledPublishDate, serScheduledPublishDate] = useState('')
    const [courseEndDate, setCourseEndDate] = useState('')

    const handleSubmit = async () => {
        console.log('Submit clicked')
        const currentUser = JSON.parse(
            sessionStorage.getItem('currentUser') || '{}'
        )
        const teacherId = currentUser.id

        const { data, error } = await supabase
            .from('Course')
            .insert([
                {
                    course_name: courseName,
                    course_code: courseCode,
                    course_description: courseDescription,
                    teacher_id: teacherId,
                    scheduled_publish_date: scheduledPublishDate,
                    course_end_date: courseEndDate
                }
            ])

            if (error) {
                console.log('SUPABASE_ERROR:', error)
                alert('Failed to create course')
                return
            }

            console.log(data)
            alert('Course created succefully')
        
        onCreated()
        onClose()

    }


    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Create Course</h2>

                <input
                type="text"
                placeholder="Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)} />

                <input
                type="text"
                placeholder="Course Code"
                value={courseCode}
                onChange={(e) =>setCourseCode(e.target.value)} />

                <textarea
                placeholder="Course Description"
                value={courseDescription}
                onChange={(e) =>setCourseDescription(e.target.value)} />


                <label>Scheduled Publish Date</label>
                <input 
                    type="datetime-local"
                    value={scheduledPublishDate}
                    onChange={(e) => serScheduledPublishDate(e.target.value)} />


                <label>Course End Date</label>
                <input
                    type="datetime-local"
                    value={courseEndDate}
                    onChange={(e) => setCourseEndDate(e.target.value)} />

                <div className="modal-buttons">
                    <button onClick={handleSubmit}>
                        Add Course
                    </button>
                    <button onClick={onClose}>
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    )
}

export default CreateCourseModal