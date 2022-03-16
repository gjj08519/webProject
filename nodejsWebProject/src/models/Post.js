const Model = require('./Model');
const User = require('./User');
const Category = require('./Category');
const PostException = require('../exceptions/PostException');

class Post extends Model {
    constructor(id, user, category, title, type, content, createdAt, editedAt, deletedAt) {
        super(id, createdAt, editedAt, deletedAt);
        this.user = user;
        this.category = category;
        this.title = title;
        this.type = type;
        this.content = content;
        this.upvotes=0;
        this.downvotes=0;
        this.votes=this.upvotes-this.downvotes;
        this.voteState="un";
    }
    getTitle() {
        return this.title;
    }
    getTitle() {
        return this.title;

    }
    getContent() {
        return this.content;
    }
    setContent(content) {
        this.content = content;
    }
    getUser() {

        return this.user;
    }
    getCategory() {
        return this.category;
    }
    getUpvotes(){
       
        return this.upvotes;
       
    }
    getDownvotes(){
       
        return this.downvotes;
       
    }
    async upVote(user_id) {

        const connection = await Model.connect();
        let upVotedYesNo = false;
        let result1;
        let result2;
        let result3;
        let alreadyUpvoted=false;
        const sql1 = `SELECT * FROM post_vote WHERE post_id=? AND user_id=?`;
        [result1] = await connection.execute(sql1, [this.id, user_id]);

        try {

            if (this.id == "") {
                upVotedYesNo = false;
                return upVotedYesNo;
            }
            
            if (result1.length==0) {
              const sql2 = `INSERT INTO post_vote (post_id, user_id,type)VALUES(?,?,'Up')`;
              [result2] = await connection.execute(sql2, [this.id, user_id]);
              if (result2.affectedRows > 0) {

                upVotedYesNo = true;
                this.upvotes++;
                this.voteState="Up";
               this.votes=this.upvotes-this.downvotes;
              }
            } else if (result1[0].type == 'Down') {
                const sql3 = `UPDATE post_vote SET type='Up' WHERE post_id=? AND user_id=?`;
                [result3] = await connection.execute(sql3, [this.id, user_id]);
                if (result3.affectedRows > 0) {

                    upVotedYesNo = true;
                    this.downvotes--;
                   this.upvotes++;
                   this.voteState="Up";
                    this.votes=this.upvotes-this.downvotes;
                }
            } else if (result1[0].type == 'Up') {
                alreadyUpvoted=true;
                
            }

        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }
        if(alreadyUpvoted){
            throw new PostException('Cannot up vote Post: Post has already been up voted.')
        }
        return upVotedYesNo;

    }

    async downVote(user_id) {
        const connection = await Model.connect();
        let downVotedYesNo = false;
        let result1;
        let result2;
        let result3;
        let alreadyDownvoted=false;
        try {

            if (this.id == "") {
                downVotedYesNo = false;
                return ;
            }
           
            const sql1 = `SELECT * FROM post_vote WHERE post_id=? AND user_id=?`;
            [result1] = await connection.execute(sql1, [this.id, user_id]);
            if(result1.length==0){
            const sql2 = `INSERT INTO post_vote (post_id, user_id,type)VALUES(?,?,'Down')`;
            [result2] = await connection.execute(sql2, [this.id, user_id]);
            
            if (result2.affectedRows > 0) {
                downVotedYesNo = true;
                this.downvotes++;
                this.voteState="Down";
            }
            }else if (result1[0].type == 'Up') {
                const sql3 = `UPDATE post_vote SET type='Down' WHERE post_id=? AND user_id=?`;
                [result3] = await connection.execute(sql3, [this.id, user_id]);
                if (result3.affectedRows > 0) {

                    downVotedYesNo = true;
                    this.downvotes++;
                    this.upvotes--;
                    this.voteState="Down";
                }
            } else if (result1[0].type == 'Down') {
                alreadyDownvoted=true;
                
            }

        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }
        if(alreadyDownvoted){
            throw new PostException('Cannot down vote Post: Post has already been down voted.')
        }
        return downVotedYesNo;

    }
    async unvote(user_id) {
        
        const connection = await Model.connect();
        let unVotedYesNo = false;
        let result;
        let result1;
        let alreadyUnvoted=false;
        try {
            const sql1 = `SELECT * FROM post_vote WHERE post_id=? AND user_id=?`;
            [result1] = await connection.execute(sql1, [this.id, user_id]);
            if(result1.length!=0){
                if (result1[0].type == 'Up'){
                    this.upvotes--;
                    this.voteState="un";
                }
                    
                if (result1[0].type == 'Down'){
                    this.downvotes--;
                    this.voteState="un";
                }
                    
               const sql = `DELETE FROM post_vote WHERE post_id=? AND user_id=?`;
               [result] = await connection.execute(sql, [this.id,user_id]);
               if (result.affectedRows > 0) {
                unVotedYesNo = true;
               }
            }else{
                alreadyUnvoted = true;
            }

        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }
        if(alreadyUnvoted){
            throw new PostException('Cannot unvote Post: Post must first be up or down voted.')
        }
     
        return unVotedYesNo;
    }
    
    async getVotes() {
        const connection = await Model.connect();
        let results1;
        let results2;
      
       
        try {
            const sql1 = `SELECT * FROM post_vote WHERE post_id= ? AND type ='Up'`;
            [results1] = await connection.execute(sql1, [this.id]);
            if (results1.length!=0) {
                this.upvotes=results1.length;
            } else {
                this.upvotes=0;
            }

            const sql2 =`SELECT * FROM post_vote WHERE type='Down' AND post_id=?`;
            [results2] = await connection.execute(sql2, [this.id]);
            if (results2.length!=0) {
                this.downvotes=results2.length;
            } else {
                this.downvotes=0;
            }


        } catch {
            console.log("error");
            // return posts = [];
        } finally {
            await connection.end();
        }
        this.votes=this.upvotes-this.downvotes;
        return this.votes;


    }

    async bookmark(user_id) {
        let alreadyBookmarked = false;
        let posts = await Post.getBookmarkedPosts(user_id);
        if (posts.length > 0) {
            for (let i = 0; i < posts.length; i++) {
                if (posts[i].getId() == this.id) {
                    alreadyBookmarked = true;

                }
            }
        }
        if (alreadyBookmarked) {
            throw new PostException(`Cannot bookmark Post: Post has already been bookmarked.`)
        }

        const connection = await Model.connect();
        let bookmarkYesNo = false;
        let result;


        try {

            if (this.id == "") {
                bookmarkYesNo = false;
                return bookmarkYesNo;
            }

            const sql = `INSERT INTO bookmarked_post (post_id, user_id)VALUES(?,?)`;
            [result] = await connection.execute(sql, [this.id, user_id]);
            if (result.affectedRows > 0) {

                bookmarkYesNo = true;
                this.bookmarked = true;
            }


        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }
        return bookmarkYesNo;

    }
    async unbookmark(user_id) {
        let alreadyBookmarked = false;
        let posts = await Post.getBookmarkedPosts(user_id);
        if (posts.length > 0) {
            for (let i = 0; i < posts.length; i++) {
                if (posts[i].getId() == this.id) {
                    alreadyBookmarked = true;
                }
            }
        }
        if (!alreadyBookmarked) {
            throw new PostException(`Cannot unbookmark Post: Post has not been bookmarked.`)
        }

        const connection = await Model.connect();
        let unbookmarkYesNo = false;
        let result;


        try {
            //if (this.id == "") {
            //     bookmarkYesNo = false;
            //    return bookmarkYesNo;
            //}

            const sql = `DELETE FROM bookmarked_post WHERE user_id=?`;
            [result] = await connection.execute(sql, [user_id]);
            if (result.affectedRows > 0) {

                unbookmarkYesNo = true;
                this.bookmarked = false;
            }


        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }
        return unbookmarkYesNo;
    }
    static async getVotedPosts(user_id) {
        const connection = await Model.connect();
        let results;
        let posts = [];
       // let category = [];
        const sql = `SELECT post_id FROM post_vote WHERE user_id= ?`;
        try {
            [results] = await connection.execute(sql, [user_id]);
            if (!results.length) {
                posts = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    posts[i] = await Post.findById(results[i].post_id);

                }
            }
        } catch {
            console.log("error");
            // return posts = [];
        } finally {
            await connection.end();
        }

        return posts;


    }
    
    


    static async getBookmarkedPosts(user_id) {
        const connection = await Model.connect();
        let results;
        let posts = [];
       // let category = [];
        const sql = `SELECT post_id FROM bookmarked_post WHERE user_id= ?`;
        try {
            [results] = await connection.execute(sql, [user_id]);
            if (!results.length) {
                posts = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    posts[i] = await Post.findById(results[i].post_id);

                }
            }
        } catch {
            console.log("error");
            // return posts = [];
        } finally {
            await connection.end();
        }

        return posts;


    }
    static async create(user_id, category_id, title, type, content) {

        if (title == "") {
            throw new PostException('Cannot create Post: Missing title.');
        }
        if (type == "") {
            throw new PostException('Cannot create Post: Missing type.');
        }
        if (content == "") {
            throw new PostException('Cannot create Post: Missing content.');
        }
        let existUser = false;
        let users1 = await User.findAll();
        for (var i = 0; i < users1.length; i++) {
            if (user_id == users1[i].id) {
                existUser = true;
                break;
            }
        }
        if (existUser == false) {
            throw new PostException(`Cannot create Post: User does not exist with ID ${user_id}.`);
        }
        let existCategory = false;
        let categorys1 = await Category.findAll();
        for (var i = 0; i < categorys1.length; i++) {
            if (category_id == categorys1[i].id) {
                existCategory = true;
                break;
            }
        }
        if (existCategory == false) {
            throw new PostException(`Cannot create Post: Category does not exist with ID ${category_id}.`);
        }
        const connection = await Model.connect();
        let result;
        let post;
        let results;
        let duplicateTitle;

        const sql = `SELECT * FROM post WHERE title= ?`;
        [results] = await connection.execute(sql, [title]);

        if (results.length != 0) {
            duplicateTitle = true;
        } else {
            duplicateTitle = false
        }

        try {
            if (title != "" && type != "" && content != "" && user_id != "" && category_id != "" && !duplicateTitle) {
                const sql = `INSERT INTO post (user_id, category_id,title, type, content)VALUES(?,?,?,?,?)`;
                [result] = await connection.execute(sql, [user_id, category_id, title, type, content]);
                const user = await User.findById(user_id);
                const category = await Category.findById(category_id);
                post = new Post(result.insertId, user, category, title, type, content, null, null, null, 0, 0);
            } else {
                post = null;
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }
        return post;
    }
    /**
     * Finds the user by their ID and returns a user object.
     * @param {number} id The user's ID.
     * @returns {user} The user object.
     */
    static async findById(id) {
        const connection = await Model.connect();

        let results;
        let results1;
        let results2;
        let post;
        try {
            const sql = `SELECT * FROM post WHERE id= ?`;
            [results] = await connection.execute(sql, [id]);
            if (results.length != 0) {
                const user = await User.findById(results[0].user_id);
                const category = await Category.findById(results[0].category_id);
                post = new Post(results[0].id, user, category, results[0].title, results[0].type, results[0].content, results[0].created_at, results[0].edited_at, results[0].deleted_at, results[0].upvote, results[0].downvote);
            } else {
                post = null;
            }

            const sql1 = `SELECT * FROM post_vote WHERE type='Up' AND post_id=?`;
            [results1] = await connection.execute(sql1, [id]);
            if(results1.length != 0){
                post.upvotes=results1.length;
               
                
            }else{
                post.upvotes=0;
            }

            const sql2= `SELECT * FROM post_vote WHERE type='Down' AND post_id=?`;
            [results2] = await connection.execute(sql2, [id]);
            if(results2.length != 0){
                post.downvotes=results2.length;
            }else{
                post.downvotes=0;
            }
            post.votes=post.upvotes-post.downvotes;
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return post;
    }
    static async findByUser(user_id) {
        const connection = await Model.connect();

        let results;
        let postArray = [];
        let user ;
        let category=[];
        try {
            const sql = `SELECT * FROM post WHERE user_id= ?`;
            [results] = await connection.execute(sql, [user_id]);
            if (!results.length) {
                postArray = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    user = await User.findById(user_id);
                    category[i] = await Category.findById(results[i].category_id);
                    postArray[i] = new Post(results[i].id, user, category[i], results[i].title, results[i].type, results[i].content, results[i].created_at, results[i].edited_at, results[i].deleted_at, results[i].upvote, results[i].downvote);

                }
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return postArray;
    }
    static async findByCategory(category_id) {
        const connection = await Model.connect();

        let results;
        let postArray = [];
        let user = [];
        let category;
        try {
            const sql = `SELECT * FROM post WHERE category_id= ?`;
            [results] = await connection.execute(sql, [category_id]);
            if (!results.length) {
                postArray = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    user[i] = await User.findById(results[i].user_id);
                    category = await Category.findById(category_id);
                    postArray[i] = new Post(results[i].id, user[i], category, results[i].title, results[i].type, results[i].content, results[i].created_at, results[i].edited_at, results[i].deleted_at, results[i].upvote, results[i].downvote);

                }
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return postArray;
    }
    static async findAll() {
        const connection = await Model.connect();
        let postArray = [];

        let results;
        const sql = `SELECT * FROM post`;
        try {
            [results] = await connection.execute(sql);
            if (!results.length) {
                postArray = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    const user = await User.findById(results[i].user_id);
                    const category = await Category.findById(results[i].category_id);
                    postArray[i] = new Post(results[i].id, user, category, results[i].title, results[i].type, results[i].content, results[i].created_at, results[i].edited_at, results[i].deleted_at);

                }
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return postArray;
    }

    async save() {

        if (this.content == "") {
            throw new PostException('Cannot update Post: Missing content.');
        }
        if (this.type != "Text" && this.type == "URL") {
            throw new PostException('Cannot update Post: Only text posts are editable.');
        }
        const connection = await Model.connect();
        let result;

        let saveYesNo;



        try {
            if (this.content == "") {
                saveYesNo = false;
                return saveYesNo;
            }
            if (this.type != "Text" && this.type == "URL") {
                saveYesNo = false;
                return saveYesNo;
            }
            const sql = `UPDATE post SET content= ?,type=?, edited_at= now() WHERE id = ?`;
            [result] = await connection.execute(sql, [this.content, this.type, this.id]);
            if (result.affectedRows > 0) {
                saveYesNo = true;
            }


        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }
        return saveYesNo;

    }

    /**
     * Deletes the user with this ID from the database.
     * @returns {boolean} If the operation was successful.
     */
    async remove() {
        const connection = await Model.connect();
        let result;
        let deleteYesNo;
        try {
            const sql = `UPDATE post SET deleted_at= now() WHERE id = ?`;
            [result] = await connection.execute(sql, [this.id]);
            if (result.affectedRows >= 1) {
                deleteYesNo = true;

            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }
        return deleteYesNo;

    }

}

module.exports = Post;
