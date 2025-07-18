const {mongoose} = require("../package");
exports.connectToDatabase = async(mongooseConnection)=>{
    try {
        await mongoose.connect(mongooseConnection.url,  mongooseConnection.options);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
}

exports.disconnectToDatabase = async()=>{
    try {
        await mongoose.connection.close();
        console.log("Database disconnected successfully");
    } catch (error) {
        console.error("Error disconnecting from database:", error);
    }
}