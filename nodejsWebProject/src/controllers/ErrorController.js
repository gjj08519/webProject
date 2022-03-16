const Controller = require('./Controller');
const HttpStatusCode = require('../helpers/HttpStatusCode');

class ErrorController extends Controller {
    constructor(request, response, session) {
        super(request, response, session)
        this.setAction(this.error);
    }

   async error() {
        await this.response.setResponse({
            template: "ErrorView",
            title: "Error",
            statusCode: HttpStatusCode.NOT_FOUND,
            //payload: {},
            message: 'Invalid request path!'
        });
        return this.response;
    }
}

module.exports = ErrorController;
