const Model = require('./Model');
const User = require('./User');
const CategoryException = require('../exceptions/CategoryException');
class Category extends Model {

    constructor(id, user, title, description, createdAt, editedAt, deletedAt) {
        super(id, createdAt, editedAt, deletedAt);
        this.user = user;
        this.title = title;
        this.description = description;

    }
getName(){
    return this.user.username;
}
    getTitle() {
        return this.title;

    }
    setTitle(title) {
        this.title = title;
    }
    getDescription() {
        return this.description;
    }
    setDescription(description) {
        this.description = description;
    }
    getUser() {

        return this.user;
    }
    static async create(user_id, title, description) {

        let existUser = false;
       let users = await User.findAll();
     for (var i = 0; i < users.length; i++) {
        if (user_id == users[i].id) {
               existUser = true;
             break;
          }
        }

        if (!existUser) {
            
          throw new CategoryException(`Cannot create Category: User does not exist with ID ${user_id}.`);
       }

        if (title == "") {

            throw new CategoryException('Cannot create Category: Missing title.');
        }
        if (description == "") {

            throw new CategoryException('Cannot create Category: Missing description.');
        }
        let duplicateTitle = false;
        let categories = await Category.findAll();
        for (var i = 0; i < categories.length; i++) {
            if (title == categories[i].title) {
                duplicateTitle = true;
                break;
            }
        }
        if (duplicateTitle) {
            throw new CategoryException('Cannot create Category: Duplicate title.');
        }
        
        
        

        const connection = await Model.connect();
        let result;
        let category;
        let results;


        try {
            if (user_id != "" && title != "" && description != "") {
                const sql = `INSERT INTO category (user_id, title, description)VALUES(?,?,?)`;
                [result] = await connection.execute(sql, [user_id, title, description]);
                const user = await User.findById(user_id);
                category = new Category(result.insertId, user, title, description, null, null, null);
            } else {
                category = null;
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }
        return category;
    }
    static async findById(id) {
        const connection = await Model.connect();

        let results;
        let category;
        try {
            const sql = `SELECT * FROM category WHERE id= ?`;
            [results] = await connection.execute(sql, [id]);
            if (results.length != 0) {
                const user = await User.findById(results[0].user_id);
                category = new Category(results[0].id, user, results[0].title, results[0].description, results[0].created_at, results[0].edited_at, results[0].deleted_at);
            } else {
                category = null;
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return category;
    }
    static async findAll() {
        const connection = await Model.connect();
        let categoryArray = [];

        let results;
        const sql = `SELECT * FROM category`;
        try {
            [results] = await connection.execute(sql);
            if (!results.length) {
                categoryArray = [];
            } else {
                for (var i = 0; i < results.length; i++) {
                    const user = await User.findById(results[i].user_id);
                    categoryArray[i] = new Category(results[i].id, user, results[i].title, results[i].description, results[i].created_at, results[i].edited_at, results[i].deleted_at);
                }
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return categoryArray;
    }
    static async findByTitle(title) {
        const connection = await Model.connect();

        let results;
        let category;
        try {
            const sql = `SELECT * FROM category WHERE title= ?`;
            [results] = await connection.execute(sql, [title]);
            if (results.length != 0) {
                const user = await User.findById(results[0].user_id);
                category = new Category(results[0].id, user, results[0].title, results[0].description, results[0].created_at, results[0].edited_at, results[0].deleted_at);
            } else {
                category = null;
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return category;
    }
    async save() {
        if (this.title == "") {

            throw new CategoryException('Cannot update Category: Missing title.');
        }
        const connection = await Model.connect();
        let result;

        let saveYesNo;



        try {

            if (this.title == "") {
                saveYesNo = false;
                return saveYesNo;
            }
            const sql = `UPDATE category SET title= ?,description=?, edited_at= now() WHERE id = ?`;
            [result] = await connection.execute(sql, [this.title, this.description, this.id]);
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
    async remove() {
        const connection = await Model.connect();
        let result;
        let deleteYesNo;
        try {
            const sql = `UPDATE category SET deleted_at= now() WHERE id = ?`;
          
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

module.exports = Category;
