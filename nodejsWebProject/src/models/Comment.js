const Model = require('./Model');
const User = require('./User');
const Category = require('./Category');
const Post = require('./Post');
const CommentException = require('../exceptions/CommentException');

class Comment extends Model {
    constructor(id, user, post, reply, content, createdAt, editedAt, deletedAt) {
        super(id, createdAt, editedAt, deletedAt);
        this.post = post;
        this.user = user;
        this.reply = reply;
        this.content = content;
        this.offset = 0;
       this.bookmarKed = false;
        this.upvotes = 0;
        this.downvotes = 0;
        this.votes = this.upvotes - this.downvotes;
        this.voteState = "un";
       // this.state="unbookmarked";
    }
    getContent() {
        return this.content;
    }
    getRepliedTo() {
        return this.reply;
    }

    setContent(content) {
        this.content = content;
    }
    getUser() {

        return this.user;
    }
    getPost() {
        return this.post;
    }
    getReply() {
        return this.reply;
    }
    getUpvotes() {

        return this.upvotes;

    }
    getDownvotes() {

        return this.downvotes;

    }
    async upVote(user_id) {

        const connection = await Model.connect();
        let upVotedYesNo = false;
        let result1;
        let result2;
        let result3;
        let alreadyUpvoted = false;
        const sql1 = `SELECT * FROM comment_vote WHERE comment_id=? AND user_id=?`;
        [result1] = await connection.execute(sql1, [this.id, user_id]);

        try {

            if (this.id == "") {
                upVotedYesNo = false;
                return upVotedYesNo;
            }

            if (result1.length == 0) {
                const sql2 = `INSERT INTO comment_vote (comment_id, user_id,type)VALUES(?,?,'Up')`;
                [result2] = await connection.execute(sql2, [this.id, user_id]);
                if (result2.affectedRows > 0) {

                    upVotedYesNo = true;
                    this.upvotes++;
                    this.voteState = "Up";
                    this.votes = this.upvotes - this.downvotes;
                }
            } else if (result1[0].type == 'Down') {
                const sql3 = `UPDATE comment_vote SET type='Up' WHERE comment_id=? AND user_id=?`;
                [result3] = await connection.execute(sql3, [this.id, user_id]);
                if (result3.affectedRows > 0) {

                    upVotedYesNo = true;
                    this.downvotes--;
                    this.upvotes++;
                    this.voteState = "Up";
                    this.votes = this.upvotes - this.downvotes;
                }
            } else if (result1[0].type == 'Up') {
                alreadyUpvoted = true;

            }

        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }
        if (alreadyUpvoted) {
            throw new CommentException('Cannot up vote Comment: Comment has already been up voted.')
        }
        return upVotedYesNo;

    }

    async downVote(user_id) {
        const connection = await Model.connect();
        let downVotedYesNo = false;
        let result1;
        let result2;
        let result3;
        let alreadyDownvoted = false;
        try {

            if (this.id == "") {
                downVotedYesNo = false;
                return;
            }

            const sql1 = `SELECT * FROM comment_vote WHERE comment_id=? AND user_id=?`;
            [result1] = await connection.execute(sql1, [this.id, user_id]);
            if (result1.length == 0) {
                const sql2 = `INSERT INTO comment_vote (comment_id, user_id,type)VALUES(?,?,'Down')`;
                [result2] = await connection.execute(sql2, [this.id, user_id]);

                if (result2.affectedRows > 0) {
                    downVotedYesNo = true;
                    this.downvotes++;
                    this.voteState = "Down";
                }
            } else if (result1[0].type == 'Up') {
                const sql3 = `UPDATE comment_vote SET type='Down' WHERE comment_id=? AND user_id=?`;
                [result3] = await connection.execute(sql3, [this.id, user_id]);
                if (result3.affectedRows > 0) {

                    downVotedYesNo = true;
                    this.downvotes++;
                    this.upvotes--;
                    this.voteState = "Down";
                }
            } else if (result1[0].type == 'Down') {
                alreadyDownvoted = true;

            }

        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }
        if (alreadyDownvoted) {
            throw new CommentException('Cannot down vote Comment: Comment has already been down voted.')
        }
        return downVotedYesNo;

    }
    async unvote(user_id) {

        const connection = await Model.connect();
        let unVotedYesNo = false;
        let result;
        let result1;
        let alreadyUnvoted = false;
        try {
            const sql1 = `SELECT * FROM comment_vote WHERE comment_id=? AND user_id=?`;
            [result1] = await connection.execute(sql1, [this.id, user_id]);
            if (result1.length != 0) {
                if (result1[0].type == 'Up'){
                    this.upvotes--;
                    this.voteState="un";
                }
                    
                if (result1[0].type == 'Down'){
                    this.downvotes--;
                    this.voteState="un";
                }
                const sql = `DELETE FROM comment_vote WHERE comment_id=? AND user_id=?`;
                [result] = await connection.execute(sql, [this.id, user_id]);
                if (result.affectedRows > 0) {
                    unVotedYesNo = true;
                }
            } else {
                alreadyUnvoted = true;
            }

        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }
        if (alreadyUnvoted) {
            throw new CommentException('Cannot unvote Comment: Comment must first be up or down voted.')
        }

        return unVotedYesNo;
    }
    async getVotes() {
        const connection = await Model.connect();
        let results1;
        let results2;
      
       
        try {
            const sql1 = `SELECT * FROM comment_vote WHERE comment_id= ? AND type ='Up'`;
            [results1] = await connection.execute(sql1, [this.id]);
            if (results1.length!=0) {
                this.upvotes=results1.length;
            } else {
                this.upvotes=0;
            }

            const sql2 =`SELECT * FROM comment_vote WHERE type='Down' AND comment_id=?`;
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
        let comments = await Comment.getBookmarkedComments(user_id);
        if (comments.length > 0) {
            for (let i = 0; i < comments.length; i++) {
                if (comments[i].getId() == this.id) {
                    alreadyBookmarked = true;
                }
            }
        }
        if (alreadyBookmarked) {
            throw new CommentException(`Cannot bookmark Comment: Comment has already been bookmarked.`)
        }

        const connection = await Model.connect();
        let bookmarkYesNo = false;
        let result;


        try {

            if (this.id == "") {
                bookmarkYesNo = false;
                return bookmarkYesNo;
            }

            const sql = `INSERT INTO bookmarked_comment (comment_id, user_id)VALUES(?,?)`;
            [result] = await connection.execute(sql, [this.id, user_id]);
            if (result.affectedRows > 0) {

                bookmarkYesNo = true;
                this.bookmarked = true;
               //  this.state="bookmarked";
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
        let comments = await Comment.getBookmarkedComments(user_id);
        if (comments.length > 0) {
            for (let i = 0; i < comments.length; i++) {
                if (comments[i].getId() == this.id) {
                    alreadyBookmarked = true;
                }
            }
        }
        if (!alreadyBookmarked) {
            throw new CommentException(`Cannot unbookmark Comment: Comment has not been bookmarked.`)
        }

        const connection = await Model.connect();
        let unbookmarkYesNo = false;
        let result;


        try {
            //if (this.id == "") {
            //     bookmarkYesNo = false;
            //    return bookmarkYesNo;
            //}

            const sql = `DELETE FROM bookmarked_comment WHERE user_id=?`;
            [result] = await connection.execute(sql, [user_id]);
            if (result.affectedRows > 0) {

                unbookmarkYesNo = true;
                this.bookmarked = false;
                 //this.state="unbookmarked";
            }


        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }
        return unbookmarkYesNo;
    }

    static async getVotedComments(user_id) {
        const connection = await Model.connect();
        let results;
        let comments = [];

        const sql = `SELECT comment_id FROM comment_vote WHERE user_id= ?`;
        try {
            [results] = await connection.execute(sql, [user_id]);
            if (!results.length) {
                comments = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    comments[i] = await Comment.findById(results[i].comment_id);

                }
            }
        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }

        return comments;


    }

    async BookmarkedYesNo(comment_id,user_id){
        const connection = await Model.connect();
        let bookmarkedYesNo=false;
        let results;
        const sql = `SELECT * FROM bookmarked_comment WHERE comment_id= ? AND user_id=?`;
        try {
            [results] = await connection.execute(sql, [comment_id,user_id]);
            if (results.length!=0) {
                bookmarkedYesNo=true;
            } else {
                bookmarkedYesNo=false;
            }
        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }

       return bookmarkedYesNo;


    }


    static async getBookmarkedComments(user_id) {
        const connection = await Model.connect();
        let results;
        let comments = [];

        const sql = `SELECT comment_id FROM bookmarked_comment WHERE user_id= ?`;
        try {
            [results] = await connection.execute(sql, [user_id]);
            if (!results.length) {
                comments = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    comments[i] = await Comment.findById(results[i].comment_id);

                }
            }
        } catch {
            console.log("error");

        } finally {
            await connection.end();
        }

        return comments;


    }
    static async create(user_id, post_id, content, reply_id) {

        if (content == "") {
            throw new CommentException('Cannot create Comment: Missing content.');
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
            throw new CommentException(`Cannot create Comment: User does not exist with ID ${user_id}.`);
        }
        let existPost = false;
        let posts1 = await Post.findAll();
        for (var i = 0; i < posts1.length; i++) {
            if (post_id == posts1[i].id) {
                existPost = true;
                break;
            }
        }
        if (existPost == false) {
            throw new CommentException(`Cannot create Comment: Post does not exist with ID ${post_id}.`);
        }

        const connection = await Model.connect();
        let result;
        let comment;
        let results;
        let reply;


        try {
            if (reply_id === undefined) {
                results = true;
            }

            if (user_id != "" && post_id != "" && content != "" && results) {
                const sql = `INSERT INTO comment (user_id,post_id,content)VALUES(?,?,?)`;
                [result] = await connection.execute(sql, [user_id, post_id, content]);
                const user = await User.findById(user_id);
                const post = await Post.findById(post_id);
                comment = new Comment(result.insertId, user, post, reply, content, null, null, null);
            } else
                if (user_id != "" && post_id != "" && content != "" && !results) {
                    const sql = `INSERT INTO comment (user_id,post_id,reply_id,content)VALUES(?,?,?,?)`;
                    [result] = await connection.execute(sql, [user_id, post_id, reply_id, content]);
                    const user = await User.findById(user_id);
                    const post = await Post.findById(post_id);
                    reply = await Comment.findById(reply_id);
                    comment = new Comment(result.insertId, user, post, reply, content, null, null, null);
                } else {
                    comment = null;
                }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }
        return comment;

    }

    static async findById(id) {
        const connection = await Model.connect();
        let results1;
        let results2;
        let results;
        let comment;
        try {
            const sql = `SELECT * FROM comment WHERE id= ?`;
            [results] = await connection.execute(sql, [id]);
            if (results.length != 0) {
                const user = await User.findById(results[0].user_id);
                const post = await Post.findById(results[0].post_id);
                comment = new Comment(results[0].id, user, post, results[0].reply_id, results[0].content, results[0].created_at, results[0].edited_at, results[0].deleted_at);

            } else {
                comment = null;
            }
            const sql1 = `SELECT * FROM comment_vote WHERE type='Up' AND comment_id=?`;
            [results1] = await connection.execute(sql1, [id]);
            if (results1.length != 0) {
                comment.upvotes = results1.length;
            } else {
                comment.upvotes = 0;
            }

            const sql2 = `SELECT * FROM comment_vote WHERE type='Down' AND comment_id=?`;
            [results2] = await connection.execute(sql2, [id]);
            if (results2.length != 0) {
                comment.downvotes = results2.length;
            } else {
                comment.downvotes = 0;
            }

            comment.votes=comment.upvotes-comment.downvotes;


        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return comment;
    }
    static async findByAll() {
        const connection = await Model.connect();
        let commentArray = [];

        let results;
        const sql = `SELECT * FROM comment`;
        try {
            [results] = await connection.execute(sql);
            if (!results.length) {
                commentArray = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    const user = await User.findById(results[i].user_id);
                    const post = await Post.findById(results[i].post_id);
                    commentArray[i] = new Comment(results[i].id, user, post, results[i].reply_id, results[i].content, results[i].created_at, results[i].edited_at, results[i].deleted_at);
                }
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return commentArray;
    }

    static async findByUser(user_id) {
        const connection = await Model.connect();

        let results;
        let commentArray = [];
        let user ;
        let post= [];
        try {
            const sql = `SELECT * FROM comment WHERE user_id= ?`;
            [results] = await connection.execute(sql, [user_id]);
            if (!results.length) {
                commentArray = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    user = await User.findById(user_id);
                    post[i] = await Post.findById(results[i].post_id);
                    commentArray[i] = new Comment(results[i].id, user, post[i], results[i].reply_id, results[i].content, results[i].created_at, results[i].edited_at, results[i].deleted_at);
                }
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return commentArray;
    }


    static async findByPost(post_id) {
        const connection = await Model.connect();

        let results;
        let commentArray = [];
        let user = [];
        let post;
        try {
            const sql = `SELECT * FROM comment WHERE post_id= ?`;
            [results] = await connection.execute(sql, [post_id]);
            if (!results.length) {
                commentArray = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    user[i] = await User.findById(results[i].user_id);
                    post = await Post.findById(post_id);
                    commentArray[i] = new Comment(results[i].id, user[i], post, results[i].reply_id, results[i].content, results[i].created_at, results[i].edited_at, results[i].deleted_at);
                }
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return commentArray;
    }
    static async findByReplyId(reply_id) {
        const connection = await Model.connect();

        let results;
        let commentArray = [];
        let user = [];
        let post = [];

        try {
            const sql = `SELECT * FROM comment WHERE reply_id= ?`;
            [results] = await connection.execute(sql, [reply_id]);
            if (!results.length) {
                commentArray = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    user[i] = await User.findById(results[i].user_id);
                    post[i] = await Post.findById(results[i].post_id);
                    // reply = await Comment.findById(reply_id);
                    commentArray[i] = new Comment(results[i].id, user[i], post[i], reply_id, results[i].content, results[i].created_at, results[i].edited_at, results[i].deleted_at);
                }
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return commentArray;
    }
    /*  static async findAllReplyComment(comment) {
          let replyComment = [];
          let count = 0;
          let currentArray = [];
          //   let comments = await Comment.findByAll();
          let currentParent = comment;
          currentArray = await Comment.findByReply(currentParent);
          var j;
          var i;
          if (currentArray.length) {
              for (j = 0; j < currentArray.length; j++) {
                  replyComment.push(currentArray[j]);
                  count++;
              }
              for (i = 0; i < replyComment.length; i++) {
                  currentArray = await Comment.findByReply(replyComment[i]);
                  if (currentArray.length) {
                      replyComment.push(currentArray[j]);
                    
                  } else {
                     
                      continue;
                  }
  
              }
  
  
          } else {
              currentArray = [];
              replyComment = [];
          }
  
  
          
  
  
          
  
          return replyComment;
  
      }
  
  /**
       * Persists the current state of this user object to the database.
       * @returns {boolean} If the operation was successful.
       */
    async save() {
        if (this.content == "") {
            throw new CommentException('Cannot update Comment: Missing content.');
        }
        const connection = await Model.connect();
        let result;

        let saveYesNo;


        try {

            if (this.content == "") {
                saveYesNo = false;
                return saveYesNo;
            }

            const sql = `UPDATE comment SET content= ?, edited_at= now() WHERE id = ?`;
            [result] = await connection.execute(sql, [this.content, this.id]);
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
            const sql = `UPDATE comment SET deleted_at= now() WHERE id = ?`;
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

module.exports = Comment;
