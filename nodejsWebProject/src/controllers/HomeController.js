const Controller = require('./Controller');
const Category = require('../models/Category');

class HomeController extends Controller {
    constructor(request, response, session) {
        super(request, response, session)
        this.setAction(this.home);
    }


    async home() {
      /* if (this.request.requestMethod == "GET") {

         await this.response.setResponse({
                template: "HomeView",
                statusCode: 200,
                payload: {}
            });
        return this.response;
       }*/
        let userId=this.session.data.user_id;
            let categories = await Category.findAll();
            await this.response.setResponse({
                template: "HomeView",
                title: "Welcome",
               // statusCode: 200,
                payload: categories,
                message: 'Homepage!',
                userId:userId,
                isAuthenticated: this.session.exists('user_id'),
            });
            return this.response;
        }
    }
    

module.exports = HomeController;
