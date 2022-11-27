import {UrlManager} from "../utils/url-manager.ts";
import {CustomHttp} from "../services/custom-http.ts";
import config from "../../config/config";
import {Auth} from "../services/auth.ts";

export class RightAnswers {
    constructor() {
        this.quiz = null
        this.rightAnswers = null
        this.breadcrumbsTitle = null
        this.questionTitleElement = null
        this.chosenAnswers = null
        this.chosenAndRight = null
        this.chosenAndFalse = null
        this.user = []
        this.routeParams = UrlManager.getQueryParams()
        this.userInfo = Auth.getUserInfo()

        this.init()
    }

    async init() {
        try {
            const result = await CustomHttp.request(`${config.host}/tests/${this.routeParams.id}/result/details?userId=${this.userInfo.userId}`)
            if (result) {
                if (result.error) throw new Error(result.error)
            }
            this.quiz = result.test
        } catch (e) {
            console.log(e)
        }

        console.log("this.quiz", this.quiz)
        this.startQuiz()
        // this.showRightAnswers()
        this.showQuestion()
    }

    startQuiz() {
        this.breadcrumbsTitle = document.getElementById('breadcrumbs-title')
        this.breadcrumbsTitle.innerText = this.quiz.name
        document.getElementById('right-answers-sub-title').innerHTML =
            `Тест выполнил <span> ${this.userInfo.fullName}, 
                ${this.userInfo.userEmail}</span>`
    }

    showRightAnswers() {
        this.chosenAndRight = this.rightAnswers.filter((answer, index) => {
            return this.rightAnswers[index] === this.chosenAnswers[index].chosenAnswerId
        })

        this.chosenAndFalse = this.chosenAnswers.filter((answer, index) => {
            return this.chosenAnswers[index].chosenAnswerId !== this.rightAnswers[index]
        })
    }

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

                // console.log("1", (answer.hasOwnProperty('correct') === true))

                if (answer.hasOwnProperty('correct') && (answer.correct=== true)) {
                    // console.log('TRUE', answer.hasOwnProperty('correct'))
                    questionAnswerText.classList.add('answer-text-true')
                    questionAnswerCircle.classList.add('answer-circle-true')
                }
                // console.log('FALSE', answer.hasOwnProperty('correct'))
                // console.log('ПРОВЕРКА', (answer.hasOwnProperty('correct') === false))

                if (answer.hasOwnProperty('correct') && (answer.correct === false)) {
                    // console.log('FALSE', answer.hasOwnProperty('correct'))
                    questionAnswerText.classList.add('answer-text-false')
                    questionAnswerCircle.classList.add('answer-circle-false')
                }

                // this.chosenAndRight.forEach(el => {
                //     if (el === answer.id) {
                //         questionAnswerText.classList.add('answer-text-true')
                //         questionAnswerCircle.classList.add('answer-circle-true')
                //     }
                // })

                // this.chosenAndFalse.forEach(el => {
                //     if (el.chosenAnswerId === answer.id) {
                //         questionAnswerText.classList.add('answer-text-false')
                //         questionAnswerCircle.classList.add('answer-circle-false')
                //     }
                // })

                questionAnswer.appendChild(questionAnswerCircle)
                questionAnswer.appendChild(questionAnswerText)
                questionItem.appendChild(questionAnswer)
            })
            document.getElementById('questions-items').appendChild(questionItem)

            this.goToResultsTest()
        })

    }

    goToResultsTest() {
        const seeResultsTest = document.getElementById('results-test')
        seeResultsTest.onclick = function () {
            window.history.back()
        }
    }
}

