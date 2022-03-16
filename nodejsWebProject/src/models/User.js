//const { create } = require('domain');
const Model = require('./Model');
const UserException = require('../exceptions/UserException');
const AuthException = require('../exceptions/AuthException');
//const Post = require('./Post');
//const Post = require('../models/Post');
class User extends Model {

    /**
     * Creates a new user.
     * @param {number} id
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @param {string} avatar
     * @param {date} createdAt
     * @param {date} editedAt
     * @param {date} deletedAt
     */
    constructor(id, username, email, password, avatar, createdAt, editedAt, deletedAt) {
        super(id, createdAt, editedAt, deletedAt);
        this.username = username;
        this.email = email;
        this.password = password;
        this.avatar = avatar;
        this.authticated=false;
    }
    getUsername() {
        return this.username;
    }
    getEmail() {
        return this.email;
    }
    setEmail(email) {
        this.email = email;
    }
    getPassword() {
        return this.password;
    }
    setPassword(password) {
        this.password = password;
    }
    getAvatar() {
        return this.avatar;
    }
    setAvatar(newAvatar) {
        this.avatar = newAvatar;
    }
    setUsername(newUsername) {
        this.username = newUsername;
    }
    /**
         * Creates a new user in the database and returns a user object.
         * @param {string} username The user's name .
         * @param {string} email The user's email .
         * @param {string} password The user's password .
         * @returns {user} The created user.
         */
    
     
     
    static async create(username, email, password) {
        if (username == "") {
			throw new UserException('Cannot create User: Missing username.');
		}
        if (email == "") {
			throw new UserException('Cannot create User: Missing email.');
		}if (password == "") {
			throw new UserException('Cannot create User: Missing password.');
		}

        let duplicateName = false;
        let users = await User.findAll();
		for (var i = 0; i < users.length; i++) {
			if (username == users[i].username) {
				duplicateName = true;
				break;
			}
		}
		if (duplicateName) {
			throw new UserException('Cannot create User: Duplicate username.');
		}

        let duplicateEmail = false;
        let users1 = await User.findAll();
		for (var i = 0; i < users1.length; i++) {
			if (email == users1[i].email) {
				duplicateEmail = true;
				break;
			}
		}
		if (duplicateEmail) {
			throw new UserException('Cannot create User: Duplicate email.');
		}

        let result;
        let user;
        const connection = await Model.connect();
        try {
            if (username != "" && email != "" && password != "") {
                const sql = `INSERT INTO user (username, email, password)VALUES(?,?,?)`;
                [result] = await connection.execute(sql, [username, email, password]);
                user = new User(result.insertId, username, email, password, null, null, null, null);
                
            } else {
                user = null;
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }
        return user;
    }
    static async logIn(email,password,session) {
        if (email == "") {
			throw new AuthException('Cannot log in: Missing email.');
		}if (password == "") {
			throw new AuthException('Cannot log in: Missing password.');
		}
		const connection = await Model.connect();
		const sql = `SELECT * FROM user WHERE email = ? and password = ?`;
		let results;
		let user;
		try {
			
			[results] = await connection.execute(sql, [email,password]);
			if (results.length == 0) {
				user = null;

			} else {
				user = new User(results[0].id, results[0].username, results[0].email,results[0].password, null, null, null, null);
			}
		} catch (exception) {
			throw new DatabaseException(exception);
		}finally {
			await connection.end();
		}

		return user;
	}
    /**
     * Finds the user by their ID and returns a user object.
     * @param {number} id The user's ID.
     * @returns {user} The user object.
     */
    static async findById(id) {
        const connection = await Model.connect();

        let results;
        let user;
        try {
            const sql = `SELECT * FROM user WHERE id= ?`;
            [results] = await connection.execute(sql, [id]);
            if (results.length != 0) {
                user = new User(results[0].id, results[0].username, results[0].email, results[0].password, results[0].avatar, results[0].created_at, results[0].edited_at, results[0].deleted_at);
            } else {
                user = null;
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return user;
    }
    static async findAll() {
		const connection = await Model.connect();
		let userArray = [];
		
		let results;
		const sql = `SELECT * FROM user`;
		try {
			[results] = await connection.execute(sql);
			if (!results.length){
				userArray=[];
			} else{
				for(var i=0; i<results.length;i++) {
					userArray.push(new User(results[i].id, results[i].username, results[i].email, results[i].password, results[i].avatar, results[i].created_at, results[i].edited_at, results[i].deleted_at));
			}
			}
		} catch {
			console.log("error");
			return null;
		} finally {
			await connection.end();
		}

		return userArray;
	}
    static async findByEmail(email) {
        const connection = await Model.connect();

        let results;
        let user;
        try {
            const sql = `SELECT * FROM user WHERE email= ?`;
            [results] = await connection.execute(sql, [email]);
            if (results.length != 0) {
                user = new User(results[0].id, results[0].username, results[0].email, results[0].password, results[0].avatar, results[0].created_at, results[0].edited_at, results[0].deleted_at);
            } else {
                user = null;
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return user;
    }
    static async findByUsername(username) {
        const connection = await Model.connect();

        let results;
        let user;
        try {
            const sql = `SELECT * FROM user WHERE username= ?`;
            [results] = await connection.execute(sql, [username]);
            if (results.length != 0) {
                user = new User(results[0].id, results[0].username, results[0].email, results[0].password, results[0].avatar, results[0].created_at, results[0].edited_at, results[0].deleted_at);
            } else {
                user = null;
            }
        } catch {
            console.log("error");
            return null;
        } finally {
            await connection.end();
        }

        return user;
    }
    /**
         * Persists the current state of this user object to the database.
         * @returns {boolean} If the operation was successful.
         */
    async save() {
        if (this.username == "") {
			throw new UserException('Cannot update User: Missing username.');
		}
        if (this.email == "") {
			throw new UserException('Cannot update User: Missing email.');
        }
        const connection = await Model.connect();
        let result;

        let saveYesNo;

        

        try {
            if (this.username == "" || this.email == "") {
                saveYesNo = false;
                return saveYesNo;
            }
            const sql = `UPDATE user SET username= ?,email=?, avatar= ?, edited_at= now() WHERE id = ?`;
            [result] = await connection.execute(sql, [this.username,this.email, this.avatar, this.id]);
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
            const sql = `UPDATE user SET deleted_at= now() WHERE id = ?`;
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

module.exports = User;
