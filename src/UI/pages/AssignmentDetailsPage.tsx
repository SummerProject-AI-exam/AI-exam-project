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
            .order('created_at', { ascending: true})

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
        <div className="assignment-details-page">
            <TeacherNavbar />
            <div className="assignment-header-card">
                <h1>{assignment?.title}</h1>

                <div className="assignment-stats">

                    <span>Assignment Total: {assignment?.total_marks}</span>
                    <span>Question Total: {questionTotal}</span>
                </div>
            </div>
             

            

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
                    <div className="question-header">
                        <h3>Qustion {index + 1}</h3>

                        <p className="question-text">
                            {question.question}
                        </p>
                    </div>
                    <div className="answer-list">
                        {question.answer_a && (
                            <p>A: {question.answer_a}</p>
                        )}
                    
                        {question.answer_b && (
                            <p>B: {question.answer_b}</p>
                        )}
                    
                        {question.answer_c && (
                            <p>C: {question.answer_c}</p>
                        )}
                    
                        {question.answer_d && (
                            <p>D: {question.answer_d}</p>
                        )}
                    
                    
                        {question.answer_e && (
                            <p>E: {question.answer_e}</p>
                        )}

                        {question.answer_f && (
                            <p>F: {question.answer_f}</p>
                        )}

                    </div>
                    <div className="question-meta">
                        <span className="meta-badge">
                            {question.allow_multiple_answers
                                ? 'Multiple Answers'
                                : 'Single Answer'}
                        </span>

                        <span className="meta-badge">
                            {question.score} Marks
                        </span>

                        <span className="meta-badge correct-answer">
                            {question.allow_multiple_answers
                                ? 'Correct Answers: '
                                : 'Correct Answer: '}
                            {question.correct_answers?.split(',').join(', ')}
                        </span>
                    </div>

                        {/*
                        <strong>Type:</strong>
                        {' '}
                        {question.allow_multiple_answers
                            ? 'Multiple Answers'
                            : 'Single Answer'}
                    
                    
                      

                    <p>
                        <strong>
                            {question.allow_multiple_answers
                                ? 'Correct Answers:'
                                : 'Correct Answer:'}
                        </strong>
                        {" "}
                        {question.correct_answers?.split(',').join(', ')}
                    </p>

                    <p>
                        <strong>Marks:</strong>
                        {" "}
                        {question.score}
                    </p> */}

                    <div className="question-actions">

                        <button
                            className="edit-btn"
                            onClick={() => handleEdit(question)}
                        >
                            Edit
                        </button>

                        <button
                            className="delete-btn"
                            onClick={() => handleDelete(question.id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>      
            ))}    
        </div>
    )
}

export default AssignmentDetailsPage