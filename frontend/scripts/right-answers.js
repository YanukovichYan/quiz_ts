(function () {
    const RightAnswers = {
        quiz: null,
        rightAnswers: null,
        breadcrumbsTitle: null,
        questionTitleElement: null,
        chosenAnswers: null,
        chosenAndRight: null,
        chosenAndFalse: null,
        user: [],
        init() {
            const url = new URL(location.href)
            const testId = url.searchParams.get('id')
            if (testId) {
                const xhr = new XMLHttpRequest()
                xhr.open('GET', 'https://testologia.site/get-quiz?id=' + testId, false)
                xhr.send()
                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.quiz = JSON.parse(xhr.responseText)
                    } catch (e) {
                        location.href = "#/"
                    }
                } else {
                    location.href = "#/"
                }
            } else {
                location.href = "#/"
            }

            if (testId) {
                const xhr = new XMLHttpRequest()
                xhr.open('GET', 'https://testologia.site/get-quiz-right?id=' + testId, false)
                xhr.send()
                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.rightAnswers = JSON.parse(xhr.responseText)
                    } catch (e) {
                        location.href = "#/"
                    }
                } else {
                    location.href = "#/"
                }
            }
            this.startQuiz()
            this.showRightAnswers()
            this.showQuestion()
        },
        startQuiz() {
            this.breadcrumbsTitle = document.getElementById('breadcrumbs-title')
            this.questionTitleElement = document.getElementById('question-title')
            this.breadcrumbsTitle.innerText = this.quiz.name
            this.chosenAnswers = JSON.parse(localStorage.getItem('chosenAnswers'))
            this.user = JSON.parse(localStorage.getItem('user'))
            document.getElementById('right-answers-sub-title').innerHTML = `Тест выполнил <span> ${this.user.name} ${this.user.lastName}, ${this.user.email}</span>`
        },
        showRightAnswers() {
            this.chosenAndRight = this.rightAnswers.filter((answer, index) => {
                return this.rightAnswers[index] === this.chosenAnswers[index].chosenAnswerId
            })

            this.chosenAndFalse = this.chosenAnswers.filter((answer, index) => {
                return this.chosenAnswers[index].chosenAnswerId !== this.rightAnswers[index]
            })
        },
        showQuestion() {
            this.quiz.questions.forEach((question, index) => {

                const questionItem = document.createElement('div')
                questionItem.className = "question-item"

                const questionTitle = document.createElement('div')
                questionTitle.className = "question-item-title"
                questionTitle.innerHTML = "<span>Вопрос " + (index + 1) + ':</span> ' + question.question

                questionItem.appendChild(questionTitle)

                question.answers.forEach(answer => {

                    const questionAnswer = document.createElement('div')
                    questionAnswer.className = "question-answer"

                    const questionAnswerCircle = document.createElement('div')
                    questionAnswerCircle.className = "question-answer-circle"
                    questionAnswerCircle.setAttribute('id', answer.id)

                    const questionAnswerText = document.createElement('div')
                    questionAnswerText.className = "question-answer-text"
                    questionAnswerText.setAttribute('id', answer.id)

                    questionAnswerText.innerText = answer.answer

                    this.chosenAndRight.forEach(el => {
                        if (el === answer.id) {
                            questionAnswerText.classList.add('answer-text-true')
                            questionAnswerCircle.classList.add('answer-circle-true')
                        }
                    })

                    this.chosenAndFalse.forEach(el => {
                        if (el.chosenAnswerId === answer.id) {
                            questionAnswerText.classList.add('answer-text-false')
                            questionAnswerCircle.classList.add('answer-circle-false')
                        }
                    })

                    questionAnswer.appendChild(questionAnswerCircle)
                    questionAnswer.appendChild(questionAnswerText)

                    questionItem.appendChild(questionAnswer)

                })
                document.getElementById('questions-items').appendChild(questionItem)

                this.goToResultsTest()
            })

        },
        goToResultsTest() {
            const seeResultsTest = document.getElementById('results-test')
            seeResultsTest.onclick = function () {
                window.history.back()
            }
        }
    }

    RightAnswers.init()
})()