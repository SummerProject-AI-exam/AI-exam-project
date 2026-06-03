import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from 'react'
import CreateAssignmentModal from "../components/CreateAssignmentModal"
import { supabase } from "../lib/supabase"
import TeacherNavbar from "../components/TeacherNavbar";

type Assignment = {
    id: string
    title: string
    description: string
    assignment_type: string
    due_date: string
    total_marks: number
    is_active: boolean
}

function AssignmentPage() {

    const navigate = useNavigate()
    const { id } = useParams()

    //console.log('Assignment course id:', id)

    const [showModal, setShowModal] = useState(false)
    const [assignments, setAssignments] = useState<Assignment[]>([])

    useEffect(() => {
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

        fetchAssignments()
    }, [id])


    return (
        <div>
            <TeacherNavbar />

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
                {assignments.map((assignment) =>(
                    <div
                        key={assignment.id}
                        className="assignment-card"
                    >
                        <h3>{assignment.title}</h3>

                        <p>{assignment.description}</p>

                        <div className="assignment-meta">
                           <span>{assignment.assignment_type}</span> 
                        

                            <span>
                                Due:{""}
                                {new Date(assignment.due_date).toLocaleDateString("en-GB")}
                            </span>

                            <span>
                                Status:{""}
                                {assignment.is_active?"Active":"Inactive"}
                            </span>
                        </div>
                    </div>    
                ))}
                
            </div>

        </div>
    )

}

export default AssignmentPage
