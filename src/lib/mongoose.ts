import mongoose from 'mongoose';

let isConnected = false; // track the connection

export const connectToDatabase = async () => {
    //ensures values passed to the model constructor that were not specified in the schema do not get saved to the db
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URI) return console.log('No MongoDB URI found');

    if (isConnected) return console.log('Already connected to database');

    //connect to db if not already connected
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('Connected to database');
    } catch (error) {
        console.log(error);
    }
}