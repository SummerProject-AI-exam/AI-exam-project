import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import TeacherNavbar from '../components/TeacherNavbar'
//import CreateQuestionModal from '../components/CreateQuestionModal'
//import EditQuestionModal from '../components/EditQuestionModal'

function ExamDetailsPage() {

    const { id } = useParams()

    const [exam, setExam] = useState<any>(null)

    const [questions, setQuestions] = useState<any[]>([])

    //const [showModal, setShowModal] = useState(false)

    //const [showEditModal, setShowEditModal] = useState(false)

    //const [selectedQuestion, setSelectedQuestion] = useState<any>(null)

    const [questionTotal, setQuestionTotal] = useState(0)

    const fetchExam = async () => {
        const { data, error } = await supabase
            .from('Exam')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error(error)
            return
        }

        setExam(data)    
    }

    const fetchQuestions = async () => {
        
        const { data, error  } = await supabase
            .from('Multiple_Choice_Questions')
            .select('*')
            .eq('exam_id', id)
            .order('created_at', { ascending: true})

        if (error) {
            console.error(error)
            return
        }

        setQuestions(data || [])  
        
        const total = (data || []).reduce((sum, question) => sum + Number(question.score), 0)

        setQuestionTotal(total)
        

    }

    useEffect(() => {
        fetchExam()
        fetchQuestions()
    }, [id])

    /*const handleDelete = async (questionId: string) => {
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
    } */

    return (
        <div className="assignment-details-page">
            <TeacherNavbar />
            <div className="assignment-header-card">
                <h1>{exam?.title}</h1>

                <div className="assignment-stats">

                    <span>
                        Duration:
                        {' '}
                        {exam?.duration_time}
                        {' '}
                        mins
                    </span>
                    <span>
                        Questions: 
                        {' '}
                        {questions.length}
                    </span>

                    <span>
                        Total Marks:
                        {' '}
                        {questionTotal}
                    </span>
                </div>
            </div>
             

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
                            Marks:
                            {' '}
                            {question.score}
                        </span>

                        <span className="meta-badge">
                            Correct:
                            {' '}
                            {question.correct_answer}
                        </span>

                    </div>

                    
                </div>      
            ))}    
        </div>
    )
}

export default ExamDetailsPage