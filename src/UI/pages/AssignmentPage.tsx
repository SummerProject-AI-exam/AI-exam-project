import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateAssignmentModal from "../components/CreateAssignmentModal"
import { supabase } from "../lib/supabase"
import TeacherNavbar from "../components/TeacherNavbar";
import EditAssignmentModal from "../components/EditAssignmentModal";

type Assignment = {
    id: string
    title: string
    description: string
    assignment_type: string
    due_date: string
    publish_date: string
    total_marks: number
    is_active: boolean
}

function AssignmentPage() {

    const navigate = useNavigate()
    const { id } = useParams()

    //console.log('Assignment course id:', id)

    const [showModal, setShowModal] = useState(false)
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [courseName, setCourseName] = useState('')

    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)

    const fetchAssignments = async () => {
        const { data, error } = await supabase
            .from("Assignment")
            .select("*")
            .eq("course_id", id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching assignments:", error)
            return
        }

        setAssignments(data || [])
    }

    useEffect(() => {
        fetchAssignments()
    }, [id])

    useEffect(() => {
        const fetchCourse = async () => {
            const { data, error } = await supabase
                .from('Course')
                .select('course_name')
                .eq('id', id)
                .single()

            if (error) {
                console.error(error)
                return
            }

            if (data) {
                setCourseName(data.course_name)
            }
        }

        fetchCourse()
    }, [id])

    const handleDeleteAssignment = async (
        assignmentId: string
    ) => {

        const confirmed = window.confirm(
            'Delete this assignment?'
        )

        if (!confirmed) return

        const { error } = await supabase
            .from('Assignment')
            .delete()
            .eq('id', assignmentId)

        if (error) {
            console.error(error)
            alert('Failed to delete assignment')
            return
        }

        fetchAssignments()

    }


    return (
        <div>
            <TeacherNavbar />

            <h1>{courseName} Assignments</h1>

            <button 
                className="create-assignment-btn"
                onClick={() => setShowModal(true)}>
                Create Assignment
            </button>

            {showModal && (
                <CreateAssignmentModal
                    courseId={id!}
                    onClose={() => setShowModal(false)}
                    onCreated={fetchAssignments}
                />
            )}

            {editingAssignment && (
                <EditAssignmentModal
                    assignment={editingAssignment}
                    onClose={() => setEditingAssignment(null)}
                    onUpdated={() => {
                        fetchAssignments()
                        setEditingAssignment(null)
                    }}
                />
            )}

            <div className="assignment-list">
                {assignments.map((assignment) => (
                    <div
                        key={assignment.id}
                        className="assignment-card"
                        
                    >
                        <h3>{assignment.title}</h3>

                        <p>{assignment.description}</p>

                        <div className="assignment-meta">
                            <span>{assignment.assignment_type}</span>

                            <span>
                                Publish:{""}
                                {assignment.publish_date
                                    ? new Date(assignment.publish_date).toLocaleDateString("en-GB")
                                    : "Not scheduled"}
                            </span>

                            <span>
                                Due:{""}
                                {new Date(assignment.due_date).toLocaleDateString("en-GB")}
                            </span>

                            <span>
                                Total Score:{""}
                                {assignment.total_marks}
                            </span>
                        </div>

                        <div className="exam-actions">
                            <button
                                className="manage-btn"
                                onClick={() => navigate(`/teacher/assignment/${assignment.id}`)}
                            >
                                Manage Questions
                            </button>

                            <button
                                className="edit-btn"
                                onClick={() => setEditingAssignment(assignment)}
                            >
                                Edit
                            </button>

                            <button
                                className="delete-btn"
                                onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                                Delete

                            </button>
                        </div>
                    </div>    
                ))}
            </div>

        </div>
    )

}

export default AssignmentPage
