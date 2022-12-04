import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QueryParamsType} from "../types/query-params.type";
import {QuizAnswersType, QuizQuestionType, QuizType} from "../types/quiz.type";
import {DefaultResponseType} from "../types/default-response.type";
import {UserResultType} from "../types/user-result.type";
import {ActionTestType} from "../types/action-test.type";
import {UserInfoType} from "../types/user-info.type";
import {PassTestResponseType} from "../types/pass-test-response.type";

export class Test {

    private progressBarElement: HTMLElement | null
    private passButtonElement: HTMLElement | null
    private nextButtonElement: HTMLElement | null
    private prevButtonElement: HTMLElement | null
    private questionTitleElement: HTMLElement | null
    private optionsElement: HTMLElement | null
    private quiz: QuizType | null
    private currentQuestionIndex: number
    readonly userResult: UserResultType[]
    private routeParams: QueryParamsType
    private interval: number = 0


    constructor() {
        this.progressBarElement = null;
        this.passButtonElement = null;
        this.nextButtonElement = null;
        this.prevButtonElement = null;
        this.questionTitleElement = null;
        this.optionsElement = null;
        this.quiz = null;
        this.currentQuestionIndex = 1;
        this.userResult = [];
        // this.user = {};
        this.routeParams = UrlManager.getQueryParams()

        this.init()
    }

    private async init(): Promise<void> {
        if (this.routeParams.id) {

            try {
                const result: DefaultResponseType | QuizType = await CustomHttp.request(`${config.host}/tests/${this.routeParams.id}`, 'GET')
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message)
                    }

                    this.quiz = result as QuizType
                    this.startQuiz()
                }
            } catch (e) {
                console.log(e)
            }
        }
    }

    private startQuiz(): void {
        if (!this.quiz) return

        this.progressBarElement = document.getElementById('progress-bar')

        this.questionTitleElement = document.getElementById('title')
        this.optionsElement = document.getElementById('options')

        this.nextButtonElement = document.getElementById('next')
        if (this.nextButtonElement) {
            this.nextButtonElement.onclick = this.move.bind(this, ActionTestType.next)
        }

        this.prevButtonElement = document.getElementById('prev')
        if (this.prevButtonElement) {
            this.prevButtonElement.onclick = this.move.bind(this, ActionTestType.prev)
        }

        this.passButtonElement = document.getElementById('pass')

        if (this.passButtonElement) {
            this.passButtonElement.onclick = this.move.bind(this, ActionTestType.pass)
        }

        const preTitleElement: HTMLElement | null = document.getElementById('pre-title')
        if (preTitleElement) {
            preTitleElement.innerText = this.quiz.name
        }

        localStorage.removeItem('chosenAnswers')
        localStorage.removeItem('user')

        this.prepareProgressBar()
        this.showQuestion()

        const timerElement: HTMLElement | null = document.getElementById('timer')
        let seconds: number = 1000
        const that: Test = this
        this.interval = window.setInterval(function () {
            seconds--
            if (timerElement) {
                timerElement.innerText = seconds.toString()
            }
            if (seconds === 0) {
                clearInterval(that.interval)
                that.complete()
            }
        }.bind(this), 1000)
    }

    prepareProgressBar(): void {
        if (this.quiz) {
            for (let i = 0; i < this.quiz.questions.length; i++) {
                const itemElement: HTMLElement | null = document.createElement('div')
                itemElement.className = 'test-progress-bar-item' + (i === 0 ? ' active' : '')

                const itemCircleElement: HTMLElement | null = document.createElement('div')
                itemCircleElement.className = 'test-progress-bar-item-circle'

                const itemTextElement: HTMLElement | null = document.createElement('div')
                itemTextElement.className = 'test-progress-bar-item-text'
                itemTextElement.innerText = 'Вопрос ' + (i + 1)

                itemElement.appendChild(itemCircleElement)
                itemElement.appendChild(itemTextElement)

                if (this.progressBarElement) {
                    this.progressBarElement.appendChild(itemElement)
                }
            }
        }
    }

    private showQuestion(): void {
        if (!this.quiz) return
        const that: Test = this
        const activeQuestion: QuizQuestionType = this.quiz.questions[this.currentQuestionIndex - 1]

        if (this.questionTitleElement) {
            this.questionTitleElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex + ':</span> ' + activeQuestion.question
        }

        if (this.optionsElement) {
            this.optionsElement.innerHTML = ''
        }

        const chosenOption: UserResultType | undefined = this.userResult?.find(item => {
            return item.questionId === activeQuestion.id
        })

        activeQuestion.answers.forEach((answer: QuizAnswersType) => {
            const optionElement: HTMLElement | null = document.createElement('div')
            optionElement.className = 'test-question-option'

            const inputId: string = 'answer' + answer.id
            const inputElement: HTMLElement | null = document.createElement('input')
            inputElement.className = 'option-answer'
            inputElement.setAttribute('id', inputId)
            inputElement.setAttribute('type', 'radio')
            inputElement.setAttribute('name', 'answer')
            inputElement.setAttribute('value', answer.id.toString())
            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                inputElement.setAttribute('checked', 'checked')
            }

            inputElement.onchange = function () {
                that.chooseAnswer()
            }

            const labelElement: HTMLElement | null = document.createElement('label')
            labelElement.setAttribute('for', inputId)
            labelElement.innerText = answer.answer

            optionElement.appendChild(inputElement)
            optionElement.appendChild(labelElement)

            if (this.optionsElement) {
                this.optionsElement.appendChild(optionElement)
            }
        })

        if (this.nextButtonElement && this.passButtonElement) {
            if (chosenOption && chosenOption.chosenAnswerId) {
                this.nextButtonElement.removeAttribute('disabled')
                this.passButtonElement.setAttribute('disabled', 'disabled')
            } else {
                this.nextButtonElement.setAttribute('disabled', 'disabled')
                this.passButtonElement.removeAttribute('disabled')
            }
            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextButtonElement.innerText = 'Завершить'
            } else {
                this.nextButtonElement.innerText = 'Дальше'
            }
        }
        if (this.prevButtonElement) {
            if (this.currentQuestionIndex > 1) {
                this.prevButtonElement.removeAttribute('disabled')
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled')
            }
        }
    }

    private chooseAnswer(): void {
        if (this.nextButtonElement) this.nextButtonElement.removeAttribute('disabled')
        if (this.passButtonElement) this.passButtonElement.setAttribute('disabled', 'disabled')
    }

    private move(action: ActionTestType): void {
        if (!this.quiz) return;
        const activeQuestion: QuizQuestionType = this.quiz.questions[this.currentQuestionIndex - 1];

        const chosenAnswer: HTMLInputElement | undefined = Array.from(document.getElementsByClassName('option-answer')).find(element => {
            return (element as HTMLInputElement).checked
        }) as HTMLInputElement;

        let chosenAnswerId: number | null = null
        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value)
        }

        const existingResult: UserResultType | undefined = this.userResult.find(item => {
            return item.questionId === activeQuestion.id
        })

        if (chosenAnswerId) {
            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId,
                })
            }
        }

        if (action === ActionTestType.next || ActionTestType.pass) {
            this.currentQuestionIndex++
        } else {
            this.currentQuestionIndex--
        }

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            clearInterval(this.interval)
            this.complete()
            return
        }

        if (this.progressBarElement) {
            Array.from(this.progressBarElement.children).forEach((item: Element, index: number) => {
                const currentItemIndex: number = index + 1
                item.classList.remove('complete')
                item.classList.remove('active')
                if (currentItemIndex === this.currentQuestionIndex) {
                    item.classList.add('active')
                } else if (currentItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complete')
                }
            })
        }

        this.showQuestion()
    }

    private async complete(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo()
        if (!userInfo) {
            location.href = '#/'
            return
        }

        try {
            const result: DefaultResponseType | PassTestResponseType = await CustomHttp.request(`${config.host}/tests/${this.routeParams.id}/pass`, 'POST', {
                userId: userInfo.userId,
                results: this.userResult
            })

            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message)
                }

                location.href = '#/result?id=' + this.routeParams.id
            }
        } catch (e) {
            console.log(e)
        }
    }
}
