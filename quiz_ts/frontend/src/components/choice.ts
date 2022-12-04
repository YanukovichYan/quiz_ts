import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QuizListType} from "../types/quiz-list.type";
import {TestResultType} from "../types/test-result.type";
import {UrlManager} from "../utils/url-manager";
import {QueryParamsType} from "../types/query-params.type";
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Choice {
    private quizzes: QuizListType[] = []
    private testResults: TestResultType[] | null = null
    private routeParams: QueryParamsType

    constructor() {
        this.routeParams = UrlManager.getQueryParams()
        this.init()
    }

    private async init(): Promise<void> {
        try {
            this.quizzes = await CustomHttp.request(`${config.host}/tests`, 'GET')
        } catch (e) {
            console.log(e)
            return
        }

        const userInfo: UserInfoType | null = Auth.getUserInfo()
        if (userInfo) {
            try {
                const result: TestResultType | DefaultResponseType = await CustomHttp.request(`${config.host}/tests/results?userId=${userInfo.userId}`, 'GET')
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message)
                    }
                    this.testResults = result as unknown as TestResultType[]
                }
            } catch (e) {
                console.log(e)
                return
            }
        }
        this.processQuizzes()
    }

    private processQuizzes(): void {
        const choiceOptionsElement: HTMLElement | null = document.getElementById('choice-options')

        if (this.quizzes && this.quizzes.length > 0 && choiceOptionsElement) {
            this.quizzes.forEach((quiz: QuizListType) => {
                const that: Choice = this

                const choiceOptionElement: HTMLElement | null = document.createElement('div')
                choiceOptionElement.className = 'choice-option'
                choiceOptionElement.setAttribute('data-id', String(quiz.id))
                choiceOptionElement.onclick = function () {
                    that.chooseQuiz(<HTMLElement>this)
                }

                const choiceOptionTextElement: HTMLElement | null = document.createElement('div')
                choiceOptionTextElement.className = 'choice-option-text'
                choiceOptionTextElement.innerText = quiz.name

                const choiceOptionArrowElement: HTMLElement | null = document.createElement('div')
                choiceOptionArrowElement.className = 'choice-option-arrow'

                const choiceOptionImageElement: HTMLElement | null = document.createElement('img')
                choiceOptionImageElement.setAttribute('src', '/images/arrow.png')
                choiceOptionImageElement.setAttribute('alt', 'arrow')

                choiceOptionArrowElement.appendChild(choiceOptionImageElement)
                choiceOptionElement.appendChild(choiceOptionTextElement)
                choiceOptionElement.appendChild(choiceOptionArrowElement)
                choiceOptionsElement.appendChild(choiceOptionElement)

                if (this.testResults) {
                    this.testResults.forEach(backResults => {
                        if (backResults.testId === quiz.id) {
                            const choiceOptionsResultTest: HTMLElement | null = document.createElement('div')
                            choiceOptionsResultTest.className = 'choice-options-result-test'

                            const choiceOptionsResultTestText: HTMLElement | null = document.createElement('div')
                            choiceOptionsResultTestText.className = 'choice-options-result-test-text'
                            choiceOptionsResultTestText.innerText = 'Результат'

                            const choiceOptionsResultTestScore: HTMLElement | null = document.createElement('div')
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

    private chooseQuiz(element: HTMLElement): void {
        const dataId: string | null = element.getAttribute('data-id')
        if (dataId) {
            location.href = '#/test?id=' + dataId
        }
    }
}