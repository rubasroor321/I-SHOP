import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required : true,
    },
    passwordHash: {
        type :String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin :{
        type: Boolean,
        default :false
    },
    street: {
        type : String,
        default:''
    },
    apartment: {
        type : String,
        default :''
    },
    zip:{
        type : String,
        default :''
    },
    country : {
        type : String,
        default :''
    },
    city: {
        type : String,
        default :''
    }
})

userSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

userSchema.set('toJSON',{
    virtuals: true,
})
export default mongoose.model("User", userSchema);
