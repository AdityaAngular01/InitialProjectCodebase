const pick = require("./pick");

module.exports = (request)=>{
    const options = pick(request.query, ["page", "limit", "sortBy", "populate", 'select', "depth"]);
    const filter = pick(request.query, ["filter"]);
    return {filter, options};
}