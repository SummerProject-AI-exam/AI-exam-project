import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import TeacherNavbar from '../components/TeacherNavbar'
import CreateQuestionModal from '../components/CreateQuestionModal'
import EditQuestionModal from '../components/EditQuestionModal'

function AssignmentDetailsPage() {

    const { id } = useParams()

    const [assignment, setAssignment] = useState<any>(null)

    const [questions, setQuestions] = useState<any[]>([])

    const [showModal, setShowModal] = useState(false)

    const [showEditModal, setShowEditModal] = useState(false)

    const [selectedQuestion, setSelectedQuestion] = useState<any>(null)

    const [questionTotal, setQuestionTotal] = useState(0)

    const fetchAssignment = async () => {
        const { data } = await supabase
            .from('Assignment')
            .select('*')
            .eq('id', id)
            .single()

        setAssignment(data)    
    }

    const fetchQuestions = async () => {
        
        const { data } = await supabase
            .from('assignment_questions')
            .select('*')
            .eq('assignment_id', id)

        setQuestions(data || [])  
        
        const total = (data || []).reduce((sum, question) => sum + Number(question.score), 0)

        setQuestionTotal(total)
        

    }

    useEffect(() => {
        fetchAssignment()
        fetchQuestions()
    }, [id])

    const handleDelete = async (questionId: string) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this question?'
        )

        if (!confirmed) return

        const { error } = await supabase
            .from('assignment_questions')
            .delete()
            .eq('id', questionId)

        if (error) {
            console.error(error)
            alert('Failed to delete question')
            return
        }

        alert('Question deleted successfully')

        fetchQuestions()
    }

    const handleEdit = (question: any) => {
        setSelectedQuestion(question)
        setShowEditModal(true)
    }

    return (
        <div>
            <TeacherNavbar />

            <h1>{assignment?.title}</h1>

            <p>
                Assignment Total:
                {" "}
                {assignment?.total_marks}
            </p>

            <p>
                Question Total:
                {" "}
                {questionTotal}
            </p>

            {assignment && (
                questionTotal === assignment.total_marks
                    ? (
                        <p style={{ color: 'green' }}>
                            Marks tally correctly
                        </p>
                    )
                    : (
                        <p style={{ color: 'red '}}>
                            Mraks mismatch:
                            {" "}
                            {assignment.total_marks - questionTotal}
                            {" "}
                            marks remaining
                        </p>
                    )
            )}

            <button
                className="add-question-btn"
                onClick={() => setShowModal(true)}
            >
                Add Question
            </button>

            {showModal && (
                <CreateQuestionModal
                    assignmentId={id!}
                    onClose={() => setShowModal(false)}
                    onCreated={fetchQuestions}
                />
            )}

            {showEditModal && selectedQuestion && (
                <EditQuestionModal
                    questionData={selectedQuestion}
                    onClose={() => setShowEditModal(false)}
                    onUpdated={fetchQuestions}
                />
            )}

            {questions.map((question, index) => (
                <div
                    key={question.id}
                    className="question-card"
                >
                    <h3>Qustion {index + 1}: {question.question}</h3>

                    <p>A: {question.answer_a}</p>
                    <p>B: {question.answer_b}</p>
                    <p>C: {question.answer_c}</p>
                    <p>D: {question.answer_d}</p>
                    
                    {question.answer_e && (
                        <p>E: {question.answer_e}</p>
                    )}

                    {question.answer_f && (
                        <p>F: {question.answer_f}</p>
                    )}
                    
                      

                    <p>
                        <strong>Correct Answer:</strong>
                        {" "}
                        {question.correct_answer}
                    </p>

                    <p>
                        <strong>Marks:</strong>
                        {" "}
                        {question.score}
                    </p>

                    <button
                        onClick={() => handleEdit(question)}
                    >
                        Edit
                    </button>

                    <button
                        onClick={() => handleDelete(question.id)}
                    >
                        Delete
                    </button>
                </div>      
            ))}    
        </div>
    )
}

export default AssignmentDetailsPage