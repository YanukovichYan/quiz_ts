import {Form} from "./components/form";
import {Choice} from "./components/choice";
import {Test} from "./components/test";
import {Result} from "./components/result";
import {Auth} from "./services/auth";
import {RightAnswers} from "./components/right-answers"
import {RouteType} from "./types/route.type";

export class Router {

    readonly contentElement: HTMLElement | null
    readonly stylesElement: HTMLElement | null
    readonly titleElement: HTMLElement | null
    readonly profileElement: HTMLElement | null
    readonly profileFullNameElement: HTMLElement | null

    private routes: RouteType[]

    constructor() {
        this.contentElement = document.getElementById('content')
        this.stylesElement = document.getElementById('styles')
        this.titleElement = document.getElementById('page-title')
        this.profileElement = document.getElementById('profile')
        this.profileFullNameElement = document.getElementById('profile-full-name')

        this.routes = [
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/index.html',
                styles: 'styles/index.css',
                load: () => {
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/choice',
                title: 'Выбор теста',
                template: 'templates/choice.html',
                styles: 'styles/choice.css',
                load: () => {
                    new Choice();
                }
            },
            {
                route: '#/test',
                title: 'Прохождение теста',
                template: 'templates/test.html',
                styles: 'styles/test.css',
                load: () => {
                    new Test();
                }
            },
            {
                route: '#/result',
                title: 'Результаты',
                template: 'templates/result.html',
                styles: 'styles/result.css',
                load: () => {
                    new Result();
                }
            },
            {
                route: '#/right',
                title: 'Результат прохождения теста',
                template: 'templates/right-answers.html',
                styles: 'styles/right-answers.css',
                load: () => {
                    new RightAnswers();
                }
            },
        ]
    }


    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0]

        if (urlRoute === '#/logout') {
            await Auth.logout()
            window.location.href = '#/'
            return
        }

        const newRoute: RouteType | undefined = this.routes.find(item => {
            return item.route === urlRoute
        });

        if (!newRoute) {
            window.location.href = '#/'
            return
        }

        if (!this.contentElement || !this.stylesElement
            || !this.profileElement || !this.profileFullNameElement || !this.profileElement) {
            if (urlRoute === '#/') {
                return
            } else {
                window.location.href = '#/'
                return
            }
        }
        console.log('123')
        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(response => response.text())
        this.stylesElement.setAttribute('href', newRoute.styles)

        const userInfo = Auth.getUserInfo()
        const accessInfo = localStorage.getItem(Auth.accessTokenKey)
        if (userInfo && accessInfo) {
            this.profileElement.style.display = 'flex'
            this.profileFullNameElement.innerText = userInfo.fullName
        } else {
            this.profileElement.style.display = 'none '
        }

        newRoute.load()
        this.titleElement.innerText = newRoute.title
    }
}