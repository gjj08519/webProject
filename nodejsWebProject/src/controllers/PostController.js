const Controller = require('./Controller');
const Post = require('../models/Post');
const PostException = require('../exceptions/PostException');
const Category = require('../models/Category');
//const User = require('../models/User');
const Comment = require('../models/Comment');
//const Model = require('../models/Model');
const HttpStatusCode = require('../helpers/HttpStatusCode');

class PostController extends Controller {
    constructor(request, response, session) {
        super(request, response, session);

        switch (this.request.requestMethod) {

            case 'GET':
                if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "upvote") {
                    this.setAction(this.upVote);
                } else if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "downvote") {
                    this.setAction(this.downVote);
                } else if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "unvote") {
                    this.setAction(this.unvote);
                } else if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "bookmark") {
                    this.setAction(this.bookmark);
                } else if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "unbookmark") {
                    this.setAction(this.unbookmark);
                } else
                    if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "edit") {
                        this.setAction(this.getEditForm);
                    } else
                        if (this.request.parameters.header.length) {
                            this.setAction(this.show);
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
    async upVote() {
        let post = await Post.findById(this.request.parameters.header[0])
        if (!this.session.exists('user_id')) {
            throw new PostException(`Cannot up vote Post: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        let user_id = this.session.data.user_id;
        await post.upVote(user_id);
        await this.response.setResponse({
            JSON: JSON,
            payload: post,
            message: "Post was up voted successfully!"
        });
        return this.response;
    }
    async downVote() {
        let post = await Post.findById(this.request.parameters.header[0])
        if (!this.session.exists('user_id')) {
            throw new PostException(`Cannot down vote Post: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        let user_id = this.session.data.user_id;
        await post.downVote(user_id);
        await this.response.setResponse({
            JSON: JSON,
            payload: post,
            message: "Post was down voted successfully!"
        });
        return this.response;
    }
    async unvote() {
        let post = await Post.findById(this.request.parameters.header[0])
        if (!this.session.exists('user_id')) {
            throw new PostException(`Cannot unvote Post: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        let user_id = this.session.data.user_id;
        await post.unvote(user_id);
        await this.response.setResponse({
            JSON: JSON,
            payload: post,
            message: "Post was unvoted successfully!"
        });
        return this.response;
    }
    async bookmark() {
        let post = await Post.findById(this.request.parameters.header[0])
        if (!this.session.exists('user_id')) {
            throw new PostException(`Cannot bookmark Post: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        let user_id = this.session.data.user_id;
        await post.bookmark(user_id);
        await this.response.setResponse({
            JSON: JSON,
            payload: post,
            message: "Post was bookmarked successfully!"
        });
        return this.response;

    }
    async unbookmark() {
        let post = await Post.findById(this.request.parameters.header[0])
        if (!this.session.exists('user_id')) {
            throw new PostException(`Cannot unbookmark Post: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        let user_id = this.session.data.user_id;
        await post.unbookmark(user_id);
        await this.response.setResponse({
            JSON: JSON,
            payload: post,
            message: "Post was unbookmarked successfully!"
        });
        return this.response;

    }
    async new() {


        let category = await Category.findById(this.request.parameters.body.categoryId);

        const post = await Post.create(this.request.parameters.body.userId, this.request.parameters.body.categoryId, this.request.parameters.body.title, this.request.parameters.body.type, this.request.parameters.body.content);
        if (this.session.data.user_id != this.request.parameters.body.userId) {
            throw new PostException(`Cannot create Post: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        if (!post) {
            throw new PostException('Post not created.');
        }
        await this.response.setResponse({
            redirect: `category/${post.getCategory().getId()}`,
            payload: post,
            message: "Post created successfully!"
        });
        return this.response;
    }

    async show() {
        let postId = this.request.parameters.header[0];

        let post = await Post.findById(this.request.parameters.header[0]);
        
        
        if (post == null) {
            throw new PostException(`Cannot retrieve Post: Post does not exist with ID ${postId}.`);
        }
        //let post = await Post.findById(this.request.parameters.header[0]);
        //  if (post == null) {
        //    await  this.response.setResponse({
        //      statusCode: 400,
        //    payload: {},
        //  message: "Post not retrieved."
        // });
        //} else {
        const commentArray = await Comment.findByPost(postId);
        if(commentArray.length!=0){
            for(let i=0;i<commentArray.length;i++){
                commentArray[i].votes=await commentArray[i].getVotes(); 
            }
        }
        /*  let currentArray = [];
  
          let currentID;
  
          let maxID = commentArray.length;
          let currentIndex = 0;
          // let currentComment;
  
          //   currentArray = await Comment.findByReplyId(null);
          if (commentArray.length) {
  
              for (var i = 0; i < commentArray.length; i++) {
                  if (commentArray[i].reply == null) {
                      currentArray.push(commentArray[i]);
                  }
              }
  
              let index = 0;
  
              // currentID++;
              currentID = currentArray[0].getId();
  
              while (currentID <= maxID) {
                  if (currentArray[currentID].reply == null) {
                      currentIndex++;
                      
  
                  } else {
                      nextArray = await Comment.findByReplyId(currentID);
                      //  currentComment = await Comment.findById(currentID);
  
                      for (var i = 0; i < nextArray.length; i++) {
                          nextArray[i].offset = currentArray[currentIndex].offset + 1;
  
                          currentArray.splice(++currentIndex, 0, nextArray[i])
                      }
                  }
               //   currentID++;
                 index++;
                   if (currentArray[index] != null) {
                    currentID = currentArray[index].id;
                  } else {
                      break;
                 }
  
              }
  
          } else {
              currentArray = [];
          }
  
  
  
  */
        let userId = this.session.data.user_id;
        let alreadyBookmarkedPost = false;
        let posts = await Post.getBookmarkedPosts(userId);
        if (posts.length > 0) {
            // for (let i = 0; i < posts.length; i++) {
            //   if (posts[i].getId() == this.id) {
            alreadyBookmarkedPost = true;
            //  break;
            //  //  }
            // }
        }

       let alreadyBookmarkedComment = [];
      //  let commentIsBookmarked = await Comment.getBookmarkedComments(userId);
        for(let i=0;i<commentArray.length;i++){
            alreadyBookmarkedComment[i] = await commentArray[i].BookmarkedYesNo(commentArray[i].getId(),this.session.data.user_id)
            if(alreadyBookmarkedComment[i]){
                commentArray[i].bookmarKed=true; 
               // commentArray[i].state="bookmarKed";
            }else{
                commentArray[i].bookmarKed=false; 
               // commentArray[i].state="unbookmarKed";
            }
        }

        






        let yesNoText = false;
        if (post.type == "Text") {
            yesNoText = true;
        }
        await this.response.setResponse({
            template: "Post/ShowView",
            title: post.getTitle(),
            isAuthenticated: this.session.exists('user_id'),
            payload: post,
            userId: this.session.data.user_id,
            state: alreadyBookmarkedPost,
           // stateComment: alreadyBookmarkedComment,
            message: "Post retrieved successfully!",
            comments: commentArray,
            yesNoText: yesNoText
        });
        // }
        return this.response;
    }
    async edit() {
        //let post = await Post.findById(this.request.parameters.header[0]);
        const postId = this.request.parameters.header[0];

        let post = await Post.findById(this.request.parameters.header[0]);
        if (post == null) {
            throw new PostException(`Cannot update Post: Post does not exist with ID ${postId}.`);
        }
        if (post.getDeletedAt() != null) {
            throw new PostException(`Cannot update Post: You cannot update a post that has been deleted.`, HttpStatusCode.BAD_REQUEST);
        }
        if (!this.session.exists('user_id')) {
            throw new PostException(`Cannot update Post: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }

        if (this.request.parameters.body.content == "") {
            throw new PostException(`Cannot update Post: No update parameters were provided.`);
        }
        if (this.session.data.user_id != post.getUser().getId()) {
            throw new PostException(`Cannot update Post: You cannot update a post created by someone other than yourself.`, HttpStatusCode.FORBIDDEN);
        }
        // First we check if the user is not null
        /* if (post == null) {
             await this.response.setResponse({
                 statusCode: 400,
                 payload: {},
                 message: "Post not updated."
             });
             return this.response;
         }
         if (this.request.parameters.body.content == "") {
             await this.response.setResponse({
                 statusCode: 400,
                 payload: {},
                 message: "Post not updated."
             });
             return this.response;
         }*/
        // If we have a user, set the name and type to the request name and type
        if (this.request.parameters.body.title) {
            post.setTitle(this.request.parameters.body.title);

        }
        if (this.request.parameters.body.content) {
            post.setContent(this.request.parameters.body.content);
        }

        if (!(await post.save())) {
            throw new PostException('Cannot update post.');
        }

        await this.response.setResponse({
            redirect: `post/${post.getId()}`,
            payload: post,
            message: "Post updated successfully!"
        });


        return this.response;
    }
    async destroy() {

        const postId = this.request.parameters.header[0];

        let post = await Post.findById(this.request.parameters.header[0]);

        if (!this.session.exists('user_id')) {
            throw new PostException(`Cannot delete Post: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        if (post == null) {
            throw new PostException(`Cannot delete Post: Post does not exist with ID ${postId}.`);
        }

        if (this.session.data.user_id != post.getUser().getId()) {
            throw new PostException(`Cannot delete Post: You cannot delete a post created by someone other than yourself.`, HttpStatusCode.FORBIDDEN);
        }
        if (post.getDeletedAt() != null) {
            throw new PostException(`Cannot delete Post: You cannot delete a post that has been deleted.`, HttpStatusCode.BAD_REQUEST);
        }
        if (!await post.remove()) {
            throw new PostException(`Cannot delete Post: Post does not exist with ID ${postId}.`);
        }

        await this.response.setResponse({
            redirect: `post/${post.getId()}`,
            payload: post,
            message: 'Post deleted successfully!'
        });
        return this.response;
    }
    async getEditForm() {
        let post = await Post.findById(this.request.parameters.header[0]);
        if (post == null) {
            throw new PostException(`Cannot update Post: Post does not exist with ID ${this.request.parameters.header[0]}.`, HttpStatusCode.BAD_REQUEST);
        }
        let user = post.getUser();
        let category = post.getCategory();
        if (this.session.exists('user_id') == "") {
            throw new PostException(`Cannot update Post: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        if (this.session.data.user_id != user.getId()) {
            throw new PostException(`Cannot update Post: You cannot update a post created by someone other than yourself.`, HttpStatusCode.FORBIDDEN);
        }
        await this.response.setResponse({
            template: "Post/EditView",
            title: 'Edit Post',
            payload: post, category, user

        });
        return this.response;
    }

}

module.exports = PostController;
