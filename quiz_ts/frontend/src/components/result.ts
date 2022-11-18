import {UrlManager} from "../utils/url-manager.ts";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";

export class Result {
    constructor() {
        this.routeParams = UrlManager.getQueryParams()

        this.init()
    }

    async init() {
        const userInfo = Auth.getUserInfo()
        if (!userInfo) location.href = '#/'
        if (this.routeParams.id) {
            try {
                const result = await CustomHttp.request(`${config.host}/tests/${this.routeParams.id}/result?userId=${userInfo.userId}`)

                if (result) {
                    if (result.error) {
                        throw new Error(result.error)
                    }
                    document.getElementById('result-score').innerText = `${result.score}/${result.total}`
                    this.seeRightsAnswers()
                    return
                }
            } catch (e) {
                console.log(e)
            }
        }
        location.href = '#/'
    }

    seeRightsAnswers() {
        const rightsAnswersButton = document.getElementById('rightsAnswers')
        rightsAnswersButton.onclick = () => {
            location.href = '#/right?id=' + this.routeParams.id
        }
    }
}
