import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from '../lib/supabase';
import StudentNavbar from "../components/StudentNavbar";
import AnswerReview from "../components/AnswerReview";
import QuestionCard from "../components/QuestionCard";
import { formatDuration } from "../utils/formatDuration";
import ExamTimer from "../components/ExamTimer";

function StudentExamDetailsPage() {

    const { id } = useParams()

    const currentUser = JSON.parse(
        sessionStorage.getItem('currentUser') || '{}'
    )

    const [exam, setExam] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [answers, setAnswers] = useState<Record<string, string[]>>({})
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [examStarted, setExamStarted] = useState(false)
    const [examAvailable, setExamAvailable] = useState(false)
    const [examEnded, setExamEnded] = useState(false)

    const [score, setScore] = useState<number | null>(null)

    const [showReview, setShowReview] = useState(false)
    const [reviewAnswers, setReviewAnswers] = useState<any[]>([])


    useEffect(() => {

        const loadPage = async () => {

            await fetchExam()
            await fetchQuestions()
            await checkSubmission()
        }

        loadPage()
        
    }, [id])

    const fetchExam = async () => {

        const { data, error} = await supabase
            .from('Exam')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error(error)
            return
        }

        setExam(data)

        const now = new Date()
        const start = new Date(data.start_time)
        const end = new Date(data.end_time)

        setExamAvailable(now >= start && now <= end)
        setExamEnded(now > end)
    }

    const fetchQuestions = async () => {

        const { data, error } = await supabase
            .from('Multiple_Choice_Questions')
            .select('*')
            .eq('exam_id', id)

        if (error) {
            console.error(error)
            return
        }

        setQuestions(data || [])
    }

    const checkSubmission = async () => {

        const { data } = await supabase
            .from('exam_submissions')
            .select('*')
            .eq('exam_id', id)
            .eq('student_id', currentUser.id)
            .maybeSingle()

        if (data) {
            setAlreadySubmitted(true)
            setScore(data.total_score)
            return true
        }

        return false
    }

    const startExamSession = async () => {

        const { data } = await supabase
            .from('Exam_Sessions')
            .select('*')
            .eq('exam_id', id)
            .eq('student_id', currentUser.id)
            .maybeSingle()

        // session already exists
        if (data) return

        const { error } = await supabase
            .from('Exam_Sessions')
            .insert([
                {
                    exam_id: id,
                    student_id: currentUser.id,
                    started_at: new Date().toISOString(),
                    status: 'In Progress'
                }
            ])

        if (error) {
            console.error(error)
        }
            
    }

    const handleStartExam = async () => {

        await startExamSession()

        setExamStarted(true)
    }

    const handleSingleAnswer = (
        questionId: string,
        answer: string
    ) => {

        setAnswers(prev => ({
            ...prev,
            [questionId]: [answer]
        }))
    }

    const handleMultipleAnswer = (
        questionId: string,
        answer: string
    ) => {

        const currentAnswers = answers[questionId] || []

        if (currentAnswers.includes(answer)) {

            setAnswers(prev => ({
                ...prev,
                [questionId]: currentAnswers.filter(
                    a => a !== answer
                )
            }))
        } else {

            setAnswers(prev => ({
                ...prev,
                [questionId]: [
                    ...currentAnswers,
                    answer
                ]
            }))
        }
    }

    const handleSubmit = async () => {

        if (Object.keys(answers).length === 0) {
            alert('Please answer at least one question')
            return
        }

        if (
            !window.confirm(
                'Submit exam?'
            )
        ) {
            return
        }

        const isLate = new Date().getTime() > new Date(exam.end_time).getTime()

        const { data: submission, error } = await supabase
            .from('exam_submissions')
            .insert([
                {
                    exam_id: id,
                    student_id: currentUser.id,
                    submitted_at: new Date().toISOString(),
                    total_score: 0,
                    status: 'Submitted',
                    is_late: isLate
                }
            ])
            .select()
            .single()

        if (error || !submission) {
            console.error(error)
            return
        }

        let totalScore = 0

        for (const question of questions) {

            const studentAnswer = answers[question.id] || []

            const answerMap: Record<string, string> = { 
                A: question.answer_a,
                B: question.answer_b,
                C: question.answer_c,
                D: question.answer_d,
                E: question.answer_e,
                F: question.answer_f

            }

            const correctAnswers = (
                question.correct_answers || '')
                    .split(',')
                    .map((letter: string) =>
                        answerMap[letter.trim()]
                    )
                    .filter(Boolean)
                    .sort()

            const selectedAnswers =
                    [...studentAnswer].sort()

            //console.log('Correct:', correctAnswers)
            //console.log('Student:', selectedAnswers)

            const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(selectedAnswers)

            const scoreAwarded = isCorrect ? question.score : 0

            totalScore += scoreAwarded

            const { error: answerError } = await supabase
                .from('exam_answers')
                .insert([
                    {
                        submission_id: submission.id,
                        question_id: question.id,
                        question_type: question.allow_multiple_answers ? 'multiple' : 'single',
                        student_answer: studentAnswer.join(','),
                        is_correct: isCorrect,
                        score_awarded: scoreAwarded
                    }
                ])

            if (answerError) {
                console.error(answerError)
                return
            }
                    
        }

        await supabase
            .from('exam_submissions')
            .update({
                total_score: totalScore
            })
            .eq(
                'id',
                submission.id
            )

        await supabase
            .from('Exam_Sessions')
            .update({
                ended_at: new Date().toISOString(),
                status: 'Completed'
            })
            .eq('exam_id', id)
            .eq('student_id', currentUser.id)


        setScore(totalScore)

        alert(
            `Exam Submitted.\nScore: ${totalScore}`
        )

        setAlreadySubmitted(true)
    }

    const loadReviewAnswers = async () => {

        const { data: submission } = await supabase
            .from('exam_submissions')
            .select('id')
            .eq('exam_id', id)
            .eq('student_id', currentUser.id)
            .single()

        if (!submission) return

        const { data, error } = await supabase
            .from('exam_answers')
            .select(`
                *,
                Multiple_Choice_Questions (
                    question,
                    answer_a,
                    answer_b,
                    answer_c,
                    answer_d,
                    answer_e,
                    answer_f,
                    correct_answers,
                    allow_multiple_answers
                )
            `)
            .eq('submission_id', submission.id)

        if (error) {
            console.error(error)
            return
        }

        setReviewAnswers(data || [])
        setShowReview(true)
    } 

    const totalMarks = questions.reduce((sum, q) => sum + q.score, 0)

    return (
        <div>
            <StudentNavbar />

            <div className="student-page-container">
                <div className="student-detail-card">

                    <h1>
                        {exam?.title}
                    </h1>

                    <p>
                        {exam?.description}
                    </p>

                    {!alreadySubmitted && examStarted && (

                        <ExamTimer
                            endTime={exam?.end_time}
                            onTimeUp={handleSubmit}
                        />
                    )}
                    <p>
                        Start:
                        {' '}
                        {exam?.start_time &&
                            new Date(exam.start_time).toLocaleString('en-GB')}

                    </p>

                    <p>
                        End:
                        {' '}
                        {exam?.end_time && 
                            new Date(exam.end_time).toLocaleString('en-GB')}

                    </p>

                    <p>
                        Duration:
                        {' '}
                        {exam?.duration_time && formatDuration(exam.duration_time) } 
                    </p>
                    <p>
                        Total Marks: {totalMarks}
                    </p>
                </div>

                {alreadySubmitted ? (
                    <>
                   
                        <div className="student-detail-card">
                            <h2>Exam Submitted</h2>
                            <p>
                                You have already submitted this exam.
                            </p>

                            {score !== null && (
                                <p>
                                    Your Score: {score}
                                </p>
                            )}

                            <button
                                className="enroll-btn"
                                onClick={() => {
                                    if (showReview) {
                                        setShowReview(false)
                                    } else {
                                        loadReviewAnswers()
                                    }
                                }}
                            >
                                {showReview
                                    ? 'Hide Review'
                                    : 'Review Answers'}
                            </button>

                        </div>

                        {showReview && (
                            <AnswerReview
                                reviewAnswers={reviewAnswers}
                                type="exam"
                                
                            />
                        )}

                    </>

                ) : examEnded ? (

                    <div className="student-detail-card">
                        <h2>Exam Closed</h2>

                        <p>
                            The exam end time has passed
                        </p>
                    </div>
                ) : !examAvailable ? (

                    <div className="student-detail-card">
                        <h2>Exam Not Started</h2>

                        <p>
                            You can start this exam only after the scheduled start time
                        </p>

                    </div>
                

                ) : !examStarted ? (

                    <div className="student-detail-card">

                        <h2>Ready to Start?</h2>

                        <p>
                            Click the button below when you are ready to begin the exam
                        </p>

                        

                        <button
                            className="enroll-btn"
                            onClick={handleStartExam}
                        >
                            Start Exam
                        </button>
                        
                    </div>
                       

                ) : (

                    <>
                        {questions.map((question, index) => (
                            
                            <QuestionCard
                                key={question.id}
                                question={question}
                                questionNumber={index + 1}
                                selectedAnswers={
                                    answers[question.id] || []
                                }
                                onSingleAnswer={
                                    handleSingleAnswer
                                }
                                onMultipleAnswer={
                                    handleMultipleAnswer
                                }
                            />
                            
                        ))}
                        
                        <button
                            className="enroll-btn"
                            onClick={handleSubmit}
                        >
                            Submit Exam
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default StudentExamDetailsPage