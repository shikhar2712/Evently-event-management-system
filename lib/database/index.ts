import mongoose from 'mongoose';

const MONGODB_URI=process.env.MONGODB_URI;

let cached=mongoose||{conn: null,promise:null};
export const connectToDatabase=async()=>{
    if(cached.connect) return cached.connect;


if(!MONGODB_URI) throw new Error('MONGODB_URI is missing');
cached.Promise =cached.Promise || mongoose.connect(MONGODB_URI,{
    dbName:'evently',
    bufferCommands:false,
})
cached.connect=await cached.Promise
return cached.connection;
}//this file is explained tutorial