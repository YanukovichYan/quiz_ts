import {UrlManager} from "../utils/url-manager.js";

export class Result {
    constructor() {
        this.routeParams = UrlManager.getQueryParams()

        let score = this.routeParams.score;
        let total = this.routeParams.total;
        if (score && total) {
            document.getElementById('result-score').innerText = this.routeParams.score + "/" + this.routeParams.total
        }
        // } else {
        //     location.href = '#/'
        // }
    }

    // seeResults() {
    //     const seeResultsTest = document.getElementById('results-test')
    //     const url = new URL(location.href)
    //     const testId = url.searchParams.get('id')
    //     seeResultsTest.onclick = function () {
    //         location.href = 'right-answers.html?' + 'id=' + testId
    //     }
    // }
}

// this.seeResults()
