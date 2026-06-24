import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from '../lib/supabase';
import StudentNavbar from "../components/StudentNavbar";
import AnswerReview from "../components/AnswerReview";
import QuestionCard from "../components/QuestionCard";

function StudentAssignmentDetailsPage() {

    const { id } = useParams()

    const currentUser = JSON.parse(
        sessionStorage.getItem('currentUser') || '{}'
    )

    const [assignment, setAssignment] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [answers, setAnswers] = useState<Record<string, string[]>>({})
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)

    const [score, setScore] = useState<number | null>(null)

    const [showReview, setShowReview] = useState(false)
    const [reviewAnswers, setReviewAnswers] = useState<any[]>([])


    useEffect(() => {
        fetchAssignment()
        fetchQuestions()
        checkSubmission()
    }, [id])

    const fetchAssignment = async () => {

        const { data, error} = await supabase
            .from('Assignment')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error(error)
            return
        }

        setAssignment(data)
    }

    const fetchQuestions = async () => {

        const { data, error } = await supabase
            .from('assignment_questions')
            .select('*')
            .eq('assignment_id', id)

        if (error) {
            console.error(error)
            return
        }

        setQuestions(data || [])
    }

    const checkSubmission = async () => {

        const { data } = await supabase
            .from('assignment_submissions')
            .select('*')
            .eq('assignment_id', id)
            .eq('student_id', currentUser.id)
            .maybeSingle()

        if (data) {
            setAlreadySubmitted(true)
            setScore(data.total_score)
        }
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
                'Submit assignment?'
            )
        ) {
            return
        }

        const isLate = new Date().getTime() > new Date(assignment.due_date).getTime()

        const { data: submission, error } = await supabase
            .from('assignment_submissions')
            .insert([
                {
                    assignment_id: id,
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
                .from('student_answers')
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
            .from('assignment_submissions')
            .update({
                total_score: totalScore
            })
            .eq(
                'id',
                submission.id
            )
        setScore(totalScore)

        alert(
            `Assignment Submitted.\nScore: ${totalScore}`
        )

        setAlreadySubmitted(true)
    }

    const loadReviewAnswers = async () => {

        const { data: submission } = await supabase
            .from('assignment_submissions')
            .select('id')
            .eq('assignment_id', id)
            .eq('student_id', currentUser.id)
            .single()

        if (!submission) return

        const { data, error } = await supabase
            .from('student_answers')
            .select(`
                *,
                assignment_questions (
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

    return (
        <div>
            <StudentNavbar />

            <div className="student-page-container">
                <div className="student-detail-card">

                    <h1>
                        {assignment?.title}
                    </h1>

                    <p>
                        {assignment?.description}
                    </p>

                    <p>
                        Due:
                        {' '}
                        {assignment?.due_date && new Date(
                            assignment.due_date).toLocaleDateString(
                                'en-GB'
                            )}
                    </p>
                    <p>
                        Total Marks:
                        {' '}
                        {assignment?.total_marks}
                    </p>
                </div>

                {alreadySubmitted ? (
                    <>
                   
                        <div className="student-detail-card">
                            <h2>Assignment Submitted</h2>
                            <p>
                                You have already submitted this assignment.
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
                            />
                        )}

                    </>

                    
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
                            Submit Assignment
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default StudentAssignmentDetailsPage