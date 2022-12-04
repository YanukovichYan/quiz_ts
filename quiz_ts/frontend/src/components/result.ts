import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QueryParamsType} from "../types/query-params.type";
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/default-response.type";
import {PassTestResponseType} from "../types/pass-test-response.type";

export class Result {

    readonly routeParams: QueryParamsType

    constructor() {
        this.routeParams = UrlManager.getQueryParams()

        this.init()
    }

    private async init(): Promise<void> {

        const userInfo: UserInfoType | null = Auth.getUserInfo()
        if (!userInfo) {
            location.href = '#/'
            return
        }

        if (this.routeParams.id) {
            try {
                const result: DefaultResponseType | PassTestResponseType = await CustomHttp.request(`${config.host}/tests/${this.routeParams.id}/result?userId=${userInfo.userId}`)

                if (result) {
                    if ((result as DefaultResponseType).error) {
                        throw new Error((result as DefaultResponseType).message)
                    }

                    const resultScoreElement: HTMLElement | null = document.getElementById('result-score')
                    if (resultScoreElement) {
                        resultScoreElement.innerText = `${(result as PassTestResponseType).score}/${(result as PassTestResponseType).total}`
                    }
                    this.seeRightsAnswers()
                    return
                }
            } catch (e) {
                console.log(e)
            }
        }
        location.href = '#/'
    }

    private seeRightsAnswers(): void {

        const rightsAnswersButton: HTMLElement | null = document.getElementById('rightsAnswers')
        if (rightsAnswersButton) {
            rightsAnswersButton.onclick = () => {
                location.href = '#/right?id=' + this.routeParams?.id
            }
        }

    }
}
