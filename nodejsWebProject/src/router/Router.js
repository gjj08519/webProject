const UserController = require('../controllers/UserController');
const CategoryController = require('../controllers/CategoryController');
const PostController = require('../controllers/PostController');
const CommentController = require('../controllers/CommentController');
const HomeController = require('../controllers/HomeController');
const ErrorController = require('../controllers/ErrorController');
const AuthController=require('../controllers/AuthController');
class Router {
    constructor(request, response, session) {
        this.request = request;
        this.response = response;
        this.session = session;
        this.setController(this.request.controllerName);
    }
    getController(){
        return this.controller;
    }
    
    setController(controllerName) {
        if (controllerName!="" && controllerName != "user"&&controllerName != "category"&&controllerName != "post"&&controllerName != "comment"&&controllerName != "auth") {
            this.controller = new ErrorController(this.request, this.response, this.session);
        } else
            if (controllerName == "") {
                this.controller = new HomeController(this.request, this.response, this.session);
            }else if(controllerName == "auth"){
                this.controller =  new AuthController(this.request, this.response, this.session);
            } else if(controllerName == "user"){
                this.controller = new UserController(this.request, this.response, this.session);
            }else if(controllerName == "category"){
                this.controller = new CategoryController(this.request, this.response, this.session);
            }else if(controllerName == "post"){
                this.controller = new PostController(this.request, this.response, this.session);
            }else if(controllerName == "comment"){
                this.controller = new CommentController(this.request, this.response, this.session);
            }
    }
    async dispatch() {
      //  return this.controller.doAction();
      try{
        this.response=await this.controller.doAction();
 }catch(error){
    this.response = await this.response.setResponse({
        template: "ErrorView",
        title: 'Error',
        statusCode: error.statusCode,
        // payload: {},
         message:error.message,
        });
       
      }
     
     return this.response;
    }
}

module.exports = Router;
