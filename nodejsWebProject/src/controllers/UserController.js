const Controller = require('./Controller');
const User = require('../models/User');
const UserException = require('../exceptions/UserException');
const HttpStatusCode = require('../helpers/HttpStatusCode');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
class UserController extends Controller {
    constructor(request, response, session) {
        super(request, response, session);

        switch (this.request.requestMethod) {

            case 'GET':
                if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "posts") {
                    this.setAction(this.getPosts);
                } else if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "comments") {
                    this.setAction(this.getComments);
                } else if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "postvotes") {
                    this.setAction(this.getPostVotes);
                }else if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "commentvotes") {
                    this.setAction(this.getCommentVotes);
                }else if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "postbookmarks") {
                    this.setAction(this.getPostBookmarks);
                } else if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "commentbookmarks") {
                    this.setAction(this.getCommentBookmarks);
                } else
                if (this.request.parameters.header[0] == "new") {
                    this.setAction(this.getNewForm);
                } else
                    if (this.request.parameters.header.length) {
                        this.setAction(this.show);
                    } else {
                        this.setAction(this.list);
                    }
                break;
            case 'POST':
                this.setAction(this.new);
                break;
            case 'PUT':
                this.setAction(this.edit);
                break;
            case 'DELETE':
                this.setAction(this.destroy);
                break;
            default:
                this.setAction(this.InvalidRequestMethod);
                break;
        }

    }
    InvalidRequestMethod() {
        this.response.setResponse({
            statusCode: HttpStatusCode.METHOD_NOT_ALLOWED,
            template: 'ErrorView',
            message: "Invalid request method!"
        });
        return this.response;
    }
    async getPosts(){
        let posts=await Post.findByUser(this.request.parameters.header[0]); 
        await this.response.setResponse({
            JSON: JSON,
            payload: posts,
            message: "User's posts  were retrieved successfully!"
        });
        return this.response;
    }
    async getComments(){
        let comments=await Comment.findByUser(this.request.parameters.header[0]) 
        await this.response.setResponse({
            JSON: JSON,
            payload: comments,
            message: "User's comments  were retrieved successfully!"
        });
        return this.response;
    }
    async getPostVotes(){
        let posts=await Post.getVotedPosts(this.session.data.user_id) 
    
        await this.response.setResponse({
            JSON: JSON,
            payload: posts,
            message: "User's post votes were retrieved successfully!"
        });
        return this.response;
    }
    async getCommentVotes(){
        let comments=await Comment.getVotedComments(this.session.data.user_id) 
       
           await this.response.setResponse({
               JSON: JSON,
               payload: comments,
               message: "User's comment votes were retrieved successfully!"
           });
           return this.response;
         
    
     }
  async getPostBookmarks(){
     let posts=await Post.getBookmarkedPosts(this.session.data.user_id) 
    // this.response.addHeader('Content-Type', 'application/json')
        await this.response.setResponse({
         JSON: JSON,
          //json: JSON.stringify(posts),
            payload: posts,
            message: "User's post bookmarks were retrieved successfully!"
        });
        return this.response;
      

  }
  
  async getCommentBookmarks(){
    let comments=await Comment.getBookmarkedComments(this.session.data.user_id) 
    this.response.addHeader('Content-Type', 'application/json')
       await this.response.setResponse({
           json: JSON.stringify(comments),
           payload: comments,
           message: "User's comment bookmarks were retrieved successfully!"
       });
       return this.response;
     

 }
    async new() {

        const user = await User.create(this.request.parameters.body.username, this.request.parameters.body.email, this.request.parameters.body.password);
        //  if (user == null) {
        //       await  this.response.setResponse({
        //           statusCode: 400,
        //          payload: {},
        //          message: "User not created."
        //     });
        //      return this.response;
        // }
        await this.response.setResponse({
            redirect: `auth/login`,
            payload: user,
            message: "User created successfully!"
        });
        return this.response;
    }
    async list() {

        let users = await User.findAll();

        // if (users == null) {
        //   await  this.response.setResponse({
        //     statusCode: 200,
        //   payload: [],
        // message: "Users retrieved successfully!"
        //});

        //} else {
        await this.response.setResponse({
            statusCode: 200,
            payload: users,
            message: "Users retrieved successfully!"
        });
        // }
        return this.response;
    }
    async show() {
        const userId = this.request.parameters.header[0];
       let posts=await Post.getBookmarkedPosts(userId);
       let comments=await Comment.getBookmarkedComments(userId);
        let user = await User.findById(this.request.parameters.header[0]);
        let postsVotes=await Post.getVotedPosts(userId);
        let commentsVotes=await Comment.getVotedComments(userId);
        let userposts=await Post.findByUser(userId); 
        let usercomments=await Comment.findByUser(userId) 
        if (user == null) {
            throw new UserException(`Cannot retrieve User: User does not exist with ID ${userId}.`);
        }
        // let user = await User.findById(this.request.parameters.header[0]);
        if (user == null) {
            await this.response.setResponse({

                statusCode: 400,
                payload: {},
                message: "User not retrieved."
            });
        } else {
           await  this.response.setResponse({
                template: "User/ShowView",
                title: user.getUsername(),
                payload: user,
                posts: posts,
                postsVotes:postsVotes,
                commentsVotes:commentsVotes,
                comments:comments,
                userposts:userposts,
                usercomments:usercomments,
                message: "User retrieved successfully!",
                isAuthenticated: this.session.exists('user_id'),
            });
        }
        return this.response;
    }
    async edit() {

        const userId = this.request.parameters.header[0];
        if (!this.session.exists('user_id')) {
            throw new UserException(`Cannot update User: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        if (this.session.data.user_id != this.request.parameters.header[0]) {
            throw new UserException(`Cannot update User: You cannot update a user other than yourself.`, HttpStatusCode.FORBIDDEN);
        }
        let user = await User.findById(this.request.parameters.header[0]);
        
        
        if (user == null) {
            throw new UserException(`Cannot update User: User does not exist with ID ${userId}.`);
        }
        // let user = await User.findById(this.request.parameters.header[0]);
        if (this.request.parameters.body.username == "") {
            throw new UserException('Cannot update User: No update parameters were provided.', HttpStatusCode.BAD_REQUEST);
        }
        if (this.request.parameters.body.email == "") {
            throw new UserException('Cannot update User: No update parameters were provided.', HttpStatusCode.BAD_REQUEST);
        }
        if (this.request.parameters.body.password == "") {
            throw new UserException('Cannot update User: No update parameters were provided.', HttpStatusCode.BAD_REQUEST);
        }

        //   if (this.request.parameters.body.username == "" || this.request.parameters.body.email == "") {
        //     await  this.response.setResponse({
        //       statusCode: 400,
        //     payload: {},
        //   message: "User not updated."
        //});
        //return this.response;
        //}
        // If we have a user, set the name and type to the request name and type
        if (this.request.parameters.body.username) {
            user.setUsername(this.request.parameters.body.username);
        }
        if (this.request.parameters.body.email) {
            user.setEmail(this.request.parameters.body.email);
        }
        if (this.request.parameters.body.password) {
            user.setPassword(this.request.parameters.body.password);
        }
        let a = this.session.data.user_id;
        
        if (!(await user.save())) {
			throw new UserException('Cannot update user.');
		}

        // Set the response here
        await this.response.setResponse({
            redirect: `user/${user.getId()}`,
            payload: user,
            message: "User updated successfully!"
        });
        return this.response;
    }
    async destroy() {
        const userId = this.request.parameters.header[0];

        let user = await User.findById(this.request.parameters.header[0]);

        if (user == null) {
            throw new UserException(`Cannot delete User: User does not exist with ID ${userId}.`);
        }
        // check if the pokemon exists in the database
        //  let user = await User.findById(this.request.parameters.header[0]);
        /* if (user == null) {
             await this.response.setResponse({
                 statusCode: 400,
                 payload: {},
                 message: "User not deleted."
             });
             return this.response;
         }*/
        if (!this.session.exists('user_id')) {
            throw new UserException(`Cannot delete User: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        // let a= this.session.data.user_id;
        if (this.session.data.user_id != this.request.parameters.header[0]) {
            throw new UserException(`Cannot delete User: You cannot delete a user other than yourself.`, HttpStatusCode.FORBIDDEN);
        }
        await user.remove();

        this.session.destroy();

        await this.response.setResponse({
            redirect: `user/${user.getId()}`,
            payload: user,
            message: 'User deleted successfully!'

        });
        return this.response;
    }
    async getNewForm() {

        await this.response.setResponse({
            template: "User/NewFormView",
            statusCode: 200,
            payload: {}
        });
        return this.response;
    }

}

module.exports = UserController;
