const Controller = require('./Controller');
const Comment = require('../models/Comment');
const CommentException = require('../exceptions/CommentException');
const Post = require('../models/Post');
//const Model = require('../models/Model');
const HttpStatusCode = require('../helpers/HttpStatusCode');
class CommentController extends Controller {
    constructor(request, response,session) {
        super(request, response,session);

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
            template: 'ErrorView',
            statusCode: HttpStatusCode.METHOD_NOT_ALLOWED,
            message: "Invalid request method!"
        });
        return this.response;
    }
    async upVote(){
        let comment = await Comment.findById(this.request.parameters.header[0])
        if (!this.session.exists('user_id')) {
            throw new CommentException(`Cannot up vote Comment: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        let user_id = this.session.data.user_id;
        await comment.upVote(user_id);
        await this.response.setResponse({
            JSON: JSON,
            payload: comment,
            message: "Comment was up voted successfully!"
        });
        return this.response;
    }
    async downVote(){
        let comment = await Comment.findById(this.request.parameters.header[0])
        if (!this.session.exists('user_id')) {
            throw new CommentException(`Cannot down vote Comment: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        let user_id = this.session.data.user_id;
        await comment.downVote(user_id);
        await this.response.setResponse({
            JSON: JSON,
            payload: comment,
            message: "Comment was down voted successfully!"
        });
        return this.response;
    }
    async unvote(){
        let comment = await Comment.findById(this.request.parameters.header[0])
        if (!this.session.exists('user_id')) {
            throw new CommentException(`Cannot unvote Comment: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        let user_id = this.session.data.user_id;
        await comment.unvote(user_id);
        await this.response.setResponse({
            JSON: JSON,
            payload: comment,
            message: "Comment was unvoted successfully!"
        });
        return this.response;
    }

    async bookmark(){
        let comment= await Comment.findById(this.request.parameters.header[0])
        if(!this.session.exists('user_id')){
            throw new CommentException( `Cannot bookmark Comment: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        let user_id=this.session.data.user_id;
      await comment.bookmark(user_id);
        await this.response.setResponse({
            JSON: JSON,
            payload: comment,
            message: "Comment was bookmarked successfully!"
        });
        return this.response;
       
    }
    async unbookmark(){
        let comment= await Comment.findById(this.request.parameters.header[0])
        if(!this.session.exists('user_id')){
            throw new CommentException( `Cannot unbookmark Comment: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        let user_id=this.session.data.user_id;
      await comment.unbookmark(user_id);
        await this.response.setResponse({
            JSON: JSON,
            payload: comment,
            message: "Comment was unbookmarked successfully!"
        });
        return this.response;
       
    }
    async new() {
        let post = await Post.findById(this.request.parameters.body.postId);
        if(post==null){
            throw new CommentException( `Cannot create Comment: Post does not exist with ID ${this.request.parameters.body.postId}.`, HttpStatusCode.BAD_REQUEST);  
        }
        if(this.request.parameters.body.content == ""){
            throw new CommentException( `Cannot create Comment: Missing content.`,HttpStatusCode.BAD_REQUEST);
        }
        let reply;
        let replyYesNo = true;
        if (this.request.parameters.body.replyId === undefined) {
            replyYesNo = false;
        }
        if(this.session.data.user_id!=this.request.parameters.body.userId){
            throw new CommentException( `Cannot create Comment: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }

        const comment = await Comment.create(this.request.parameters.body.userId, this.request.parameters.body.postId, this.request.parameters.body.content, this.request.parameters.body.replyId);
        
        if (replyYesNo) {
            reply = await Comment.findById(this.request.parameters.body.replyId);
        }
        if (!comment) {
			throw new CommentException('Comment not created.');
		}
        await this.response.setResponse({
            redirect: `post/${comment.getPost().getId()}`,
            payload: comment,
            message: "Comment created successfully!"
        });
        return this.response;
    }

    async show() {
        const commentId = this.request.parameters.header[0];
       let post= await Post.findById(this.request.parameters.body.postId);
        let comments = [];
        //  let replyComment = [];
        let currentArray = [];
        let nextArray = [];
        // let replyCommentPre = [,];
        let comment = await Comment.findById(this.request.parameters.header[0]);
        if (comment == null) {
            throw new CommentException(`Cannot retrieve Comment: Comment does not exist with ID ${commentId}.`);
        }
        comments = await Comment.findByAll();

        let currentID = commentId;
        let maxID = comments.length;
        let currentIndex = 0;
        // let currentComment;
        currentArray = await Comment.findByReplyId(commentId);
        if (currentArray.length) {

            for (var i = 0; i < currentArray.length; i++) {
                currentArray[i].offset = comment.offset + 1;
            }


            let index = 0;

            // currentID++;
            currentID = currentArray[index].id;
            let currentOfSet = 0;
            while (currentID <= maxID) {
                //  if (currentArray[index].offset != currentOfSet) {
                //      currentIndex++;
                //  }
                nextArray = await Comment.findByReplyId(currentID);
                //  currentComment = await Comment.findById(currentID);

                if (nextArray.length) {
                    if (currentArray[index].offset != currentOfSet) {
                        currentIndex++;
                    }
                    if (currentIndex <= index) {
                        currentIndex = index+1;
                    }
                    for (var i = 0; i < nextArray.length; i++) {
                        nextArray[i].offset = currentArray[index].offset + 1;
                        currentOfSet = nextArray[i].offset;
                        currentArray.splice(currentIndex++, 0, nextArray[i])

                    }

                }
                else {
                    currentOfSet = currentArray[index].offset;
                }
                //currentID++;

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

        //let comment = await Comment.findById(this.request.parameters.header[0]);
        if (comment == null) {
            await this.response.setResponse({
                statusCode: 400,
                payload: {},
                message: "Comment not retrieved."
            });
        } else {
            await this.response.setResponse({
                template: "Comment/ShowView",
                title: comment.getId(),
                payload: comment,
                isAuthenticated: this.session.exists('user_id'),
                message: "Comment retrieved successfully!",
                reply: currentArray,
                userId: this.session.data.user_id,
               // postTitle: post.getTitle()
            });
        }
        return this.response;
    }
    async edit() {

        // let comment = await Comment.findById(this.request.parameters.header[0]);
        const commentId = this.request.parameters.header[0];

        //let user = await User.findById(this.request.parameters.body.userId);
        let post = await Post.findById(this.request.parameters.body.postId);

        let comment = await Comment.findById(this.request.parameters.header[0]);
        if(!this.session.exists('user_id')){
            throw new CommentException( `Cannot update Comment: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        // let reply = await Comment.create(this.request.parameters.body.user_id, this.request.parameters.body.post_id, this.request.parameters.body.content, commentId)
        if (comment == null) {
            throw new CommentException(`Cannot update Comment: Comment does not exist with ID ${commentId}.`);
        }
        if (this.request.parameters.body.content == "") {
            throw new CommentException(`Cannot update Comment: No update parameters were provided.`);
        }
       
       
       // if (this.request.parameters.body.content == "") {
         //   await this.response.setResponse({
            //    statusCode: 400,
              //  payload: {},
                //message: "Comment not updated."
            //});
            //return this.response;
       // }
       

        if (this.request.parameters.body.content) {
            comment.setContent(this.request.parameters.body.content);
        }
     //   if (comment == null) {
       //     await this.response.setResponse({
                
         //       statusCode: 400,
           //     payload: {},
             //   message: "Comment not updated."
            //});
            //return this.response;
       // }
        if(this.session.data.user_id!=comment.getUser().getId()){
            throw new CommentException( `Cannot update Comment: You cannot update a comment created by someone other than yourself.`, HttpStatusCode.FORBIDDEN);
         }
         if (comment.getDeletedAt() != null) {
            throw new CommentException(`Cannot update Comment: You cannot update a comment that has been deleted.`, HttpStatusCode.BAD_REQUEST);
        }
        if (!(await comment.save())) {
			throw new CommentException('Cannot update comment.');
		}
 
        // Set the response here
        await this.response.setResponse({
            redirect: `post/${comment.getPost().getId()}`,
            payload: comment,
           // statusCode: 200,
            message: "Comment updated successfully!",
           
        });
        return this.response;
    }
    async destroy() {
        // check if the pokemon exists in the database
        // let comment = await Comment.findById(this.request.parameters.header[0]);
        const commentId = this.request.parameters.header[0];

        let comment = await Comment.findById(this.request.parameters.header[0]);
       // let post = await Post.findById(this.request.parameters.body.postId);
        if(!this.session.exists('user_id')){
            throw new CommentException( `Cannot delete Comment: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        if (comment == null) {
            throw new CommentException(`Cannot delete Comment: Comment does not exist with ID ${commentId}.`);
        }

       // if (comment == null) {
         //   await this.response.setResponse({
           //     statusCode: 400,
             //   payload: {},
               // message: "Comment not deleted."
            //});
            //return this.response;
        //}
        if(this.session.data.user_id!=comment.getUser().getId()){
            throw new CommentException( `Cannot delete Comment: You cannot delete a comment created by someone other than yourself.`, HttpStatusCode.FORBIDDEN);
         }
         if (comment.getDeletedAt() != null) {
            throw new CommentException(`Cannot delete Comment: You cannot delete a comment that has been deleted.`, HttpStatusCode.BAD_REQUEST);
        }
        if(!await comment.remove()){
            throw new CommentException(`Cannot delete Comment`);
        }

        await this.response.setResponse({
            redirect: `post/${comment.getPost().getId()}`,
           // statusCode: 200,
            payload: comment,
            message: 'Comment deleted successfully!',
           // postTitle: post.getTitle()
        });
        return this.response;
    }
    async getEditForm() {
        let comment = await Comment.findById(this.request.parameters.header[0]);
        if (comment == null) {
            throw new CommentException(`Cannot update Comment: Comment does not exist with ID ${this.request.parameters.header[0]}.`,HttpStatusCode.BAD_REQUEST);
        }
        if(this.session.exists('user_id')==""){
            throw new CommentException( `Cannot update Comment: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        if(this.session.data.user_id!=comment.getUser().getId()){
            throw new CommentException( `Cannot update Comment: You cannot update a comment created by someone other than yourself.`, HttpStatusCode.FORBIDDEN);
         }
        await this.response.setResponse({
            template: "Comment/EditView",
            title: 'Edit Comment',
            payload: comment

        });
        return this.response;
    }
}

module.exports = CommentController;
