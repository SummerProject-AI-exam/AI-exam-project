type Props = {
    question: any
    questionNumber: number

    selectedAnswers?: string[]

    onSingleAnswer?: (
        questionId: string,
        answer: string
    ) => void

    onMultipleAnswer?: (
        questionId: string,
        answer: string
    ) => void

    reviewMode?: boolean
}

function QuestionCard({
    question,
    questionNumber,
    selectedAnswers = [],
    onSingleAnswer,
    onMultipleAnswer,
    reviewMode = false
}: Props) {

    const options = [
        { label: 'A', value: question.answer_a },
        { label: 'B', value: question.answer_b },
        { label: 'C', value: question.answer_c },
        { label: 'D', value: question.answer_d },
        { label: 'E', value: question.answer_e },
        { label: 'F', value: question.answer_f }
    ].filter(option => option.value)

    return (
        <div className="student-dashboard-card">

            <h3>
                Question {questionNumber}
            </h3>

            <p
                style={{
                    fontWeight: '600',
                    marginBottom: '15px'
                }}
            >
                {question.question}
            </p>

            {options.map(option => (
                
                <label
                    key={option.label}
                    style={{
                        display: 'block',
                        marginBottom: '10px'
                    }}
                >
                    
                    <input
                        type={
                            question.allow_multiple_answers
                                ? 'checkbox'
                                : 'radio'
                        }
                        name={question.id}
                        value={option.value}
                        checked={
                            selectedAnswers.includes(
                                option.value
                            )
                        }
                        disabled={reviewMode}
                        onChange={() => {

                            if (reviewMode) return

                            if (
                                question.allow_multiple_answers
                            ) {
                                onMultipleAnswer?.(
                                    question.id,
                                    option.value
                                )
                            } else {
                                onSingleAnswer?.(
                                    question.id,
                                    option.value
                                )
                            }
                        }}
                    />

                    {' '}
                    <strong>
                        {option.label}.
                    </strong>
                    {' '}
                    {option.value}


                </label>
            ))}
        </div>
    )
}

export default QuestionCard