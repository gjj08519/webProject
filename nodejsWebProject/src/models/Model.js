const Database = require('../database/Database');
//const { create } = require('./User');

class Model {
	constructor(id, createdAt, editedAt, deletedAt) {
		this.id = id;
		this.createdAt = createdAt;
		this.editedAt = editedAt;
		this.deletedAt = deletedAt;
	}

	static connect() {
		return Database.connect();
	}

	getId() {
		return this.id;
	}

	getCreatedAt() {
		return this.createdAt;
	}

	getEditedAt() {
		return this.editedAt;
	}

	getDeletedAt() {
		return this.deletedAt;
	}

	setId(id) {
		this.id = id;
		return this;
	}

	setCreatedAt(createdAt) {
		this.createdAt = createdAt;
		return this;
	}

	setEditedAt(editedAt) {
		this.editedAt = editedAt;
		if(editedAt=="")
		this.editedAt=null;
		return this;
	}

	setDeletedAt(deletedAt) {
		this.deletedAt = deletedAt;
		return this;
	}
}

module.exports = Model;
