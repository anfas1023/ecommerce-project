const constants=require('../constants');

const errorhandler=(err,req,res,next)=>{
    const statuscode=res.statuscode ? res.statuscode:500
    switch (statuscode) {
        case constants.valdationerror:
            res.send("validation error");
            break;
            case constants.forbidden:
                res.send("Forbidden error");
                break;
                case constants.unauthorized:
                    res.send("unauthorized access");
                    break;
                        case constants.not_found:
                        res.send("not found");
                        break;
                            default:
                                console.log("no error are founding");
                                break;
    }
}

module.exports=errorhandler