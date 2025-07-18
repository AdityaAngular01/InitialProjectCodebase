exports.schemaValidator = (schema)=>{
    return async(request, response, next) => {
        try{
            await schema.validateAsync(request.body);
            next();
        }catch(error){
            response.status(422).json({success: false, message: error.details[0].message });
        }
    }
}