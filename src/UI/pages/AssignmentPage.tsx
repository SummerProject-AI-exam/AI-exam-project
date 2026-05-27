import { useNavigate, useParams } from "react-router-dom";
import { useState } from 'react'
import CreateAssignmentModal from "../components/CreateAssignmentModal"

function AssignmentPage() {

    const navigate = useNavigate()
    const { id } = useParams()

    console.log('Assignment course id:', id)

    const [showModal, setShowModal] = useState(false)


    return (
        <div>
            <div className="assignment-top-bar">
                <button onClick={() => navigate(`/teacher/course/${id}`)}>
                    Back to course
                </button>
                <button>
                    LogOut
                </button>
            </div>

            <h1>Assignments</h1>

            <button onClick={() => setShowModal(true)}>
                Create Assignment
            </button>

            {showModal && (
                <CreateAssignmentModal
                    courseId={id!}
                    onClose={() => setShowModal(false)}
                />
            )}

            <div className="assignment-list">
                <div className="assignment-card">
                    Assignment 1
                </div>
                <div className="assignment-card">
                    Assignment 2
                </div>
            </div>

        </div>
    )

}

export default AssignmentPage
