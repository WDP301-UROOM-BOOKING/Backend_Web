const {constants} = require('../utils/consts');

const errorHandler = (err, req, res, next) => {
    const statusCode= res.statusCode ? res.statusCode : 500;
    switch(statusCode){
        case constants.VALIDATION_ERROR:
            res.json({title: "Validation Failed", message: err.message, stackTrace: err.stack});
            break;

        case constants.UNAUTHORIZED:
            res.json({title: "UNAUTHORIED", message: err.message, stackTrace: err.stack});
            break;

        case constants.FORBIDDEN:
            res.json({title: "FORBIDEN", message: err.message, stackTrace: err.stack});
            break;

        case constants.NOT_FOUND:
            res.json({title: "Not Found", message: err.message, stackTrace: err.stack});
            break;

        case constants.SERVER_ERROR:
            res.json({title: "SERVER ERROR", message: err.message, stackTrace: err.stack});
            break;

        default:
            console.log("Not error, all good")
            break;
    }
}

module.exports = errorHandler;