import { useState } from "react";
import { supabase } from '../lib/supabase'


type Props = {
    onClose: () => void
}

function CreateCourseModal({ onClose }: Props) {
    const [courseName, setCourseName] = useState('')
    const [courseCode,  setCourseCode] = useState('')
    const [courseDescription, setCourseDescription] = useState('')

    const handleSubmit = async () => {
        console.log('Submit clicked')
        const teacherId = '32d961cf-b8ff-4e85-8c77-ab151c47e937'

        const { data, error } = await supabase
            .from('Course')
            .insert([
                {
                    course_name: courseName,
                    course_code: courseCode,
                    course_description: courseDescription,
                    teacher_id: teacherId
                }
            ])

            if (error) {
                console.log('SUPABASE_ERROR:', error)
                alert('Failed to create course')
                return
            }

            console.log(data)
            alert('Course created succefully')

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