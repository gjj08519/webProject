const Controller = require('./Controller');
const Category = require('../models/Category');
const CategoryException = require('../exceptions/CategoryException');
const User = require('../models/User');
const Post = require('../models/Post');
const HttpStatusCode = require('../helpers/HttpStatusCode');

class CategoryController extends Controller {
    constructor(request, response, session) {
        super(request, response, session);

        switch (this.request.requestMethod) {

            case 'GET':

                if (this.request.parameters.header[0] != "" && this.request.parameters.header[1] == "edit") {
                    this.setAction(this.getEditForm);
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
            statusCode: 405,
            payload: {},
            message: "Invalid request method!"
        });
        return this.response;
    }
    async new() {

        let existUser = false;
        const userId = this.request.parameters.body.userId;
        if (!this.session.exists('user_id')) {
            throw new CategoryException(`Cannot create Category: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        // let a=this.request.cookies.name;
        // let b= this.session.data.user_id;
        const user = await User.findById(userId);
        // if(this.session.data.user_id!=userId){
        //     throw new CategoryException(`Cannot create Category: You must be logged in.`);
        // }
        if (userId == "") {

            throw new CategoryException('Cannot create Category: Missing userId.');
        }
        const title = this.request.parameters.body.title;
        if (title == "") {

            throw new CategoryException('Cannot create Category: Missing title.');
        }
        const description = this.request.parameters.body.description;
        if (description == "") {

            throw new CategoryException('Cannot create Category: Missing description.');
        }
        let users = await User.findAll();
        for (var i = 0; i < users.length; i++) {
            if (userId == users[i].id) {
                existUser = true;
                break;
            }
        }
        if (!existUser) {

            throw new CategoryException(`Cannot create Category: User does not exist with ID ${userId}.`);
        }
       

        const category = await Category.create(this.request.parameters.body.userId, this.request.parameters.body.title, this.request.parameters.body.description);

        /*    if (category == null) {
                await this.response.setResponse({
                    statusCode: 400,
                    payload: {},
                    message: "Category not created."
                });
                return this.response;
            } else {*/
        await this.response.setResponse({
            // redirect: `category/${category.getId()}`,
            redirect: "/",
            payload: category,
            message: "Category created successfully!"
        });
        return this.response;
        // }

    }
    async list() {

        let categories = await Category.findAll();
        if (categories == null) {
            await this.response.setResponse({
                statusCode: 400,
                payload: [],
                message: "Categories not  retrieved "
            });

        } else {
            await this.response.setResponse({
                template: 'Category/ListView',
                title: 'All Categories',
                payload: categories,
                message: "Categories retrieved successfully!"
            });
        }
        return this.response;
    }
    async show() {
        const categoryId = this.request.parameters.header[0];

        let category = await Category.findById(this.request.parameters.header[0]);

        if (category == null) {
            throw new CategoryException(`Cannot retrieve Category: Category does not exist with ID ${categoryId}.`);
        }
        // let category = await Category.findById(this.request.parameters.header[0]);
        /*  if (category == null) {
              await this.response.setResponse({
                  statusCode: 400,
                  payload: {},
                  message: "Category not retrieved."
              });
          } else {*/
            
        const postArray = await Post.findByCategory(categoryId);
        
        if(postArray.length!=0){
            for(let i=0;i<postArray.length;i++){
                postArray[i].votes=await postArray[i].getVotes(); 
            }
        }

      //  let postsVotes=await Post.getVotedPosts(userId);

        await this.response.setResponse({
            template: "Category/ShowView",
            title: category.getTitle(),
            isAuthenticated: this.session.exists('user_id'),
            payload: category,
            message: "Category retrieved successfully!",
            posts: postArray,
           
            userId:this.session.data.user_id
        });
        // }
        return this.response;
    }
    async edit() {
        //let category = await Category.findById(this.request.parameters.header[0]);
        if (!this.session.exists('user_id')) {
            throw new CategoryException(`Cannot update Category: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        const categoryId = this.request.parameters.header[0];

        let category = await Category.findById(this.request.parameters.header[0]);

        if (category == null) {
            throw new CategoryException(`Cannot update Category: Category does not exist with ID ${categoryId}.`, HttpStatusCode.BAD_REQUEST);
        }
        if (this.request.parameters.body.title == "") {
            throw new CategoryException(`Cannot update Category: No update parameters were provided.`);
        }
        if (this.request.parameters.body.description == "") {
            throw new CategoryException(`Cannot update Category: No update parameters were provided.`);
        }
        // First we check if the user is not null
        /*  if (category == null) {
              await this.response.setResponse({
                  statusCode: 400,
                  payload: {},
                  message: "Category not updated."
              });
              return this.response;
          }*/
        /*  if (this.request.parameters.body.title == "" || this.request.parameters.body.description == "") {
              await this.response.setResponse({
                  
                  payload: {},
                  message: "Category not updated."
              });
              return this.response;
          }*/
        // If we have a user, set the name and type to the request name and type
        if (this.request.parameters.body.title) {
            category.setTitle(this.request.parameters.body.title);
        }
        if (this.request.parameters.body.description) {
            category.setDescription(this.request.parameters.body.description);
        }
        let b = category.user.id;
        let a = this.session.data.user_id;
        if (this.session.data.user_id != category.user.id) {
            throw new CategoryException(`Cannot update Category: You cannot update a category created by someone other than yourself.`, HttpStatusCode.FORBIDDEN);
        }
        if (category.getDeletedAt() != null) {
            throw new CategoryException(`Cannot update Category: You cannot update a category that has been deleted.`, HttpStatusCode.BAD_REQUEST);
        }
        if (!(await category.save())) {
			throw new CategoryException('Cannot update category.');
		}

       
        await this.response.setResponse({
            redirect: `category/${category.getId()}`,
            payload: category,
            message: "Category updated successfully!"
            
        });
        return this.response;
    }
    async destroy() {
        // check if the pokemon exists in the database
        //let category = await Category.findById(this.request.parameters.header[0]);
        const categoryId = this.request.parameters.header[0];
        if (!this.session.exists('user_id')) {
            throw new CategoryException(`Cannot delete Category: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }

        let category = await Category.findById(this.request.parameters.header[0]);

        if (category == null) {
            throw new CategoryException(`Cannot delete Category: Category does not exist with ID ${categoryId}.`);
        }
        if (this.session.data.user_id != category.user.id) {
            throw new CategoryException(`Cannot delete Category: You cannot delete a category created by someone other than yourself.`, HttpStatusCode.FORBIDDEN);
        }
        // if (category == null) {
        //    await this.response.setResponse({
        //   statusCode: 400,
        //  payload: {},
        //  message: "Category not deleted."
        // });
        // return this.response;
        // }
        if (category.getDeletedAt() != null) {
            throw new CategoryException(`Cannot delete Category: You cannot delete a category that has been deleted.`, HttpStatusCode.BAD_REQUEST);
        }
       if(!await category.remove()){
        throw new CategoryException(`Cannot delete Category.`)
       }

        await this.response.setResponse({
            redirect: `/`,
            payload: category,
            message: 'Category deleted successfully!'
        });
        return this.response;
    }
    async getEditForm() {

        // let category = await Category.findById(this.request.parameters.header[0]);
        const categoryId = this.request.parameters.header[0];

        let category = await Category.findById(this.request.parameters.header[0]);

        if (category == null) {
            throw new CategoryException(`Cannot update Category: Category does not exist with ID ${categoryId}.`, HttpStatusCode.BAD_REQUEST);
        }
        //let b = category.user.id;
        //let a = this.session.data.user_id;
        let user = category.getUser();
        if (this.session.exists('user_id') == "") {
            throw new CategoryException(`Cannot update Category: You must be logged in.`, HttpStatusCode.UNAUTHORIZED);
        }
        if (this.session.data.user_id != category.user.id) {
            throw new CategoryException(`Cannot update Category: You cannot update a category created by someone other than yourself.`, HttpStatusCode.FORBIDDEN);
        }
        await this.response.setResponse({
            template: "Category/EditView",
            title: 'Edit Category',
            payload: category, user

        });
        return this.response;
    }


}

module.exports = CategoryController;
