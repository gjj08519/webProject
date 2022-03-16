class Request {
    constructor(requestMethod = "GET", controllerName = "", parameters = {},cookie='') {
        this.requestMethod = requestMethod;
        this.controllerName = this.parseModelName(controllerName);
        this.parameters = this.parseParameters(parameters, controllerName);
        this.cookies=cookie;
    }

    parseModelName(controllerName) {
        return controllerName.split('/')[1] || '';
    }

    parseParameters(parameters, controllerName) {
    let params = {};
    // set body
    params.body = parameters;
    // parse id 
    //const id = controllerName.split("/")[2];
    const data = controllerName.split("/").slice(2);
    params.header = data.length ? data : [];

    return params;
    }

    getRequestMethod() {
        return this.requestMethod;
    }

    getControllerName() {
        return this.controllerName;

    }
    getParameters() {
        return this.parameters;
    }
    getCookies() {
        return this.cookies;
    }
}

module.exports = Request;
