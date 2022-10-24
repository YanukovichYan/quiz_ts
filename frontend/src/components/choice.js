import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Choice {
    constructor() {
        this.quizzes = [];
        this.testResults = null

        this.init()
    }

    async init() {
        try {
            const result = await CustomHttp.request(`${config.host}/tests`, 'GET')
            if (result) {
                if (result.error) {
                    throw new Error(result.error)
                }
                this.quizzes = result
            }
        } catch (e) {
            return console.log(e)
        }

        const userInfo = Auth.getUserInfo()
        if (userInfo) {
            try {
                const results = await CustomHttp.request(`${config.host}/tests/results?userId=${userInfo.userId}`, 'GET')
                if (results) {
                    if (results.error) {
                        throw new Error(results.error)
                    }
                    this.testResults = results
                }
            } catch (e) {
                return console.log(e)
            }
        }
        this.processQuizzes()
    }

    processQuizzes() {
        const choiceOptionsElement = document.getElementById('choice-options')

        if (this.quizzes && this.quizzes.length > 0) {
            this.quizzes.forEach(quiz => {
                const that = this

                const choiceOptionElement = document.createElement('div')
                choiceOptionElement.className = 'choice-option'
                choiceOptionElement.setAttribute('data-id', quiz.id)
                choiceOptionElement.onclick = function () {
                    that.chooseQuiz(this)
                }

                const choiceOptionTextElement = document.createElement('div')
                choiceOptionTextElement.className = 'choice-option-text'
                choiceOptionTextElement.innerText = quiz.name

                const choiceOptionArrowElement = document.createElement('div')
                choiceOptionArrowElement.className = 'choice-option-arrow'

                const choiceOptionImageElement = document.createElement('img')
                choiceOptionImageElement.setAttribute('src', '/images/arrow.png')
                choiceOptionImageElement.setAttribute('alt', 'arrow')

                choiceOptionArrowElement.appendChild(choiceOptionImageElement)
                choiceOptionElement.appendChild(choiceOptionTextElement)
                choiceOptionElement.appendChild(choiceOptionArrowElement)
                choiceOptionsElement.appendChild(choiceOptionElement)

                if (this.testResults) {
                    this.testResults.forEach(backResults => {
                        if (backResults.testId === quiz.id) {
                            const choiceOptionsResultTest = document.createElement('div')
                            choiceOptionsResultTest.className = 'choice-options-result-test'

                            const choiceOptionsResultTestText = document.createElement('div')
                            choiceOptionsResultTestText.className = 'choice-options-result-test-text'
                            choiceOptionsResultTestText.innerText = 'Результат'

                            const choiceOptionsResultTestScore = document.createElement('div')
                            choiceOptionsResultTestScore.className = 'choice-options-result-test-text'
                            choiceOptionsResultTestScore.innerText = `${backResults.score}/${backResults.total}`

                            choiceOptionsResultTest.appendChild(choiceOptionsResultTestText)
                            choiceOptionsResultTest.appendChild(choiceOptionsResultTestScore)
                            choiceOptionElement.appendChild(choiceOptionsResultTest)
                        }
                    })
                }
            })
        }
    }

    chooseQuiz(element) {
        const dataId = element.getAttribute('data-id')
        if (dataId) {
            location.href = '#/test?id=' + dataId
        }
    }
}