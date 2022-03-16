class Controller {
    constructor(request, response,session) {
        this.request = request;
        this.response = response;
        this.session = session;
    }
    
    setAction(action) {
        this.action = action;
    }
    getAction() {
        return this.action;
    }
    async doAction() {
        return this.action();
    }
    error() {
        return this.response;
    }
    /*code of teacher
    editModelFields(model, fields) {
		let fieldsEdited = 0;

		fields.forEach((field) => {
			if (Object.keys(this.request.parameters.body).includes(field) && this.request.parameters.body[field].length !== 0) {
				const functionName = `set${field.charAt(0).toUpperCase() + field.slice(1)}`;
				const argument = this.request.parameters.body[field];

				model[functionName](argument);
				fieldsEdited += 1;
			}
		});

		return fieldsEdited;
	}
    */
}

module.exports = Controller;
