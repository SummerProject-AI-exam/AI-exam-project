import QuestionCard from "./QuestionCard"


type Props = {
    reviewAnswers: any[]
}

function AnswerReview({
    reviewAnswers
}: Props) {

    return (
        <>
            {reviewAnswers.map((item, index) => {

                const question = item.assignment_questions

                const answerMap: Record<string, string> = {
                    A: question.answer_a,
                    B: question.answer_b,
                    C: question.answer_c,
                    D: question.answer_d,
                    E: question.answer_e,
                    F: question.answer_f
                }

                const correctAnswerText =
                    question.correct_answers
                        .split(',')
                        .map((letter: string) =>
                            answerMap[letter.trim()]
                        )
                        .join(', ')

                return (
                    <div
                        key={item.id}
                        
                    >
                        <QuestionCard
                            question={question}
                            questionNumber={
                                index + 1
                            }
                            selectedAnswers={[
                                item.student_answer
                            ]}
                            reviewMode={true}
                        />

                        <div
                            className="student-detail-card"
                        >
                            <p>
                                <strong>Your Answer:</strong>
                                {' '}
                                {item.student_answer}
                            </p>

                            <p>
                                <strong>Correct Answer:</strong>
                                {' '}
                                {correctAnswerText}
                            </p>

                            <p>
                                {item.is_correct
                                    ? 'Correct'
                                    : 'Incorrect'}
                            </p>

                            <p>
                                Score:
                                {' '}
                                {item.score_awarded}
                            </p>
                        </div>
                    </div>

                )
                    
            })}
        </>
    )
}

export default AnswerReview