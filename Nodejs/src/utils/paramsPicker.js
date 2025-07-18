const pick = require("./pick");
module.exports = (request, keys=[])=>{
    return pick(request.params, keys)
}