const Controller = require('./Controller');
const User = require('../models/User');
const HttpStatusCode = require('../helpers/HttpStatusCode');
const AuthException = require('../exceptions/AuthException');
const Cookie = require('../auth/Cookie');
//const UserController = require('./UserController');

class AuthController extends Controller {
    constructor(request, response, session) {
        super(request, response, session);

        switch (this.request.requestMethod) {
            case 'GET':

                if (this.request.parameters.header[0] === "register") {
                    this.setAction(this.getRegisterForm);
                } else
                    if (this.request.parameters.header[0] === "login") {
                        this.setAction(this.getLoginForm);
                    } else if (this.request.parameters.header[0] === "logout") {
                        this.setAction(this.logout);
                    }
                break;
            case 'POST':
                this.setAction(this.login);
                break;

            default:
                this.setAction(this.InvalidRequestMethod);
                break;
        }

    }
    async InvalidRequestMethod() {
        return await this.response.setResponse({
            statusCode: HttpStatusCode.METHOD_NOT_ALLOWED,
            template: 'ErrorView',
            message: "Invalid request method!"
        });
    }

    async login() {
        //  try {
        //  const pokemon = await Pokemon.create(this.request.parameters.body.name, this.request.parameters.body.type);
        const { email, password, remember } = this.request.getParameters().body;
        if (remember) {
            // setcookie("email",$email,time()+3600*24*365);
            const cookie = new Cookie("email", email);
            this.response.addCookie(cookie);
        }
        if (email == '') {
            throw new AuthException("Cannot log in: Missing email.");
        }
        if (password == '') {
            throw new AuthException("Cannot log in: Missing password.");
        }
       
            let user = await User.findByEmail(email);

        if (user == null) {
            throw new AuthException(`Cannot log in: Invalid credentials.`, HttpStatusCode.BAD_REQUEST);
        } else if (user.password != password) {
            throw new AuthException(`Cannot log in: Invalid credentials.`, HttpStatusCode.BAD_REQUEST);
        }
        try {
            user = await User.logIn(email, password);
            //let deleted = false;
            if (user == null) {
                throw new AuthException("No user find");
            } else if (user.getDeletedAt() == null) {
                this.session.set('user_id', user.getId());
                user.authticated = true;
            }
            await this.response.setResponse({
                redirect: `user/${user.getId()}`,
                payload: user,
                message: "Logged in successfully!",

                //  cookie:cookie
            });
            return this.response;
        } catch {
            console.log("error");

        }
        // let authticated=this.session.exists('pokemon_id');


    }
    async logout() {
        //  try {
        //  const pokemon = await Pokemon.create(this.request.parameters.body.name, this.request.parameters.body.type);
        //  let logout= false;
        // const { name, type } = this.request.getParameters().body;
        // const pokemon = await Pokemon.findById(name,type);

        if (!this.session.cookie.value) {
            throw new AuthException("No user find");
        } else {
            this.session.destroy();

        }

        await this.response.setResponse({
            redirect: `/`,
            payload: {},
            message: "Logged out successfully!",
            // logout: logout

        });
        //  } catch (error) {
        //     throw error;
        // }

        return this.response;
    }
    async getLoginForm() {

        const cookies = this.request.getCookies();

        await this.response.setResponse({
            template: "LoginFormView",
            title: 'Login',
            // statusCode: 200,
            // payload: pokemon
            cookies: cookies
        });
        return this.response;
    }
    async getRegisterForm() {

        await this.response.setResponse({
            template: "User/NewFormView",
            title: 'New User',
            //statusCode: 200,
        });
        return this.response;
    }
    async getEditForm() {
        let pokemon = await Pokemon.findById(this.request.parameters.header[0]);
        if (!pokemon) {
            throw new PokemonException(`Cannot retrieve Pokemon: Pokemon does not exist with ID ${id}.`);
        }
        await this.response.setResponse({
            template: "Pokemon/EditFormView",
            title: 'Edit Pokemon',
            //statusCode: 200,
            payload: pokemon,

        });
        return this.response;
    }
}

module.exports = AuthController;
