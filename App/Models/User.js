import mongoose from "mongoose";

const Schema = mongoose.Schema({
    namaLengkap: {
        type: String,
        required: true,
    },
    noTelp: {
        type: String,
    },
    email: {
        type: String
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: {
        type: String,
        default: 'user',
    },
    createdAt: {
        type: Date,
        required: true,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        required: true,
        default: new Date()
    },
})

export default mongoose.model('User', Schema);