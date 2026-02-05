const mongoose = require('mongoose')

mongoose.set('strictQuery', true);
if (process.env.NODE_ENV === 'production') {
    mongoose.set('autoIndex', false);
}

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 10000,
            family: 4
        });
        console.log("database connected");

    } catch (error) {
        console.log(error.message);

    }
}

module.exports={dbConnect};












