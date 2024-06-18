import mongoose from "mongoose";


const categorySchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    icon:{
        type: String,
    },
    color: {
        type: String,
    }
    
})

export default mongoose.model("Category", categorySchema);

// export default categorySchema
// exports.Category = mongoose.model("Category", categorySchema);
