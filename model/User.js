const mongoose=require("mongoose")

const userSchema=mongoose.Schema({
    name: {
        type: String,
        default: null,
    },
    username: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        unique: true,
    },
    // role: { type: String, default: 'user', enum: ['user', 'admin'] },
    password: {
        type: String,
    },

})
const user=mongoose.model("user",userSchema)

module.exports=user;