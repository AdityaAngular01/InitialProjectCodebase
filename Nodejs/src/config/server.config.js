const {connectToDatabase, disconnectToDatabase} = require("./db.config")
exports.startServer = async(app, PORT, mongooseConnection)=>{
    await connectToDatabase(mongooseConnection);
    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    });
}

exports.stopServer = async()=>{
    await disconnectToDatabase();
    process.exit(0);
}