import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import { supabase } from "../lib/supabase"
import TeacherNavbar from "../components/TeacherNavbar";
import CreateExamModal from "../components/CreateExamModal";
import EditExamModal from "../components/EditExamModal";
import { formatDuration } from "../utils/formatDuration";


type Exam = {
    id: string
    title: string
    description: string
    start_time: string
    end_time: string
    duration_time: number
    status: string
    is_locked: boolean
}

function ExamPage() {

    //const navigate = useNavigate()
    const { id } = useParams()

    const navigate = useNavigate()

    //console.log('Assignment course id:', id)

    const [showModal, setShowModal] = useState(false)
    const [exams, setExams] = useState<Exam[]>([])
    const [courseName, setCourseName] = useState('')

    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedExam, setSelectedExam] = useState<any>(null)

    const fetchExams = async () => {
        const { data, error } = await supabase
            .from("Exam")
            .select("*")
            .eq("course_id", id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error(error)
            return
        }

        setExams(data || [])
    }

    const fetchCourse = async () => {

        const { data, error } = await supabase
            .from("Course")
            .select("course_name")
            .eq("id", id)
            .single()

        if (error) {
            console.error(error)
            return
        }

        setCourseName(data.course_name)
    }

    useEffect(() => {
        fetchExams()
        fetchCourse()
    }, [id])
    /*
    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60

        if (hours === 0) {
            return `${minutes} mins`
        }

        if (remainingMinutes === 0) {
            return `${hours} hr${hours > 1 ? 's' : ''}`
        }

        return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} mins`
    } */

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    const handleDelete = async (examId: string) => {

        const confirmed = window.confirm(
            'Are you sure you want to delete this exam?'
        )

        if (!confirmed) return

        const { error } = await supabase
            .from('Exam')
            .delete()
            .eq('id', examId)

        if (error) {
            console.error(error)
            alert('Failed to delete exam')
            return
        }

        alert('Exam deleted successfully')

        fetchExams()
    }

    const handleEdit = (exam: any) => {
        setSelectedExam(exam)
        setShowEditModal(true)
    }

    
    return (
        <div>
            <TeacherNavbar />

            <h1>{courseName} Exams</h1>

            <button 
                className="create-exam-btn"
                onClick={() => setShowModal(true)}>
                Create Exam
            </button>

            {showModal && (
                <CreateExamModal
                    courseId={id!}
                    onClose={() => setShowModal(false)}
                    onCreated={fetchExams}
                />
            )}

            {showEditModal && selectedExam && (
                <EditExamModal
                    examData={selectedExam}
                    onClose={() => setShowEditModal(false)}
                    onUpdated={fetchExams}
                />
            )}

            <div className="exam-list">
                {exams.map((exam) => (
                    <div
                        key={exam.id}
                        className="exam-card"
                    >
                        <h3>{exam.title}</h3>

                        <p>{exam.description}</p>

                        <div className="exam-meta">

                            <span className="meta-badge">
                                Start:{formatDateTime(exam.start_time)}    
                            </span>

                            <span className="meta-badge">
                                End:{formatDateTime(exam.end_time)}    
                            </span>

                            <span className="meta-badge">
                                Duration: {formatDuration(exam.duration_time)}
                                
                            </span>

                            <span
                                className={
                                    exam.is_locked
                                        ? " Locked"
                                        : " Unlocked"
                                }
                            >
                                {exam.is_locked
                                    ? 'Locked'
                                    : 'Available'}
                            </span>
                        </div>

                        <div className="exam-actions">
                            <button 
                                className="manage-btn"
                                onClick={() => navigate(`/teacher/exam/${exam.id}`)
                                }
                            >
                                
                                Manage Qusetions
                            </button>

                            <button 
                                className="edit-btn"
                                onClick={() => handleEdit(exam)}
                            >
                                Edit
                            </button>

                            <button 
                                className="delete-btn"
                                onClick={() => handleDelete(exam.id)}
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

export default ExamPage
