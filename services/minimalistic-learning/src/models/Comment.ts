import { Schema, model, Types } from 'mongoose';


const CommentSchema = new Schema({
postId: { type: Types.ObjectId, ref: 'Post', required: true, index: true },
authorId: { type: Types.ObjectId, ref: 'User', required: true },
content: { type: String, required: true },
createdAt: { type: Date, default: Date.now }
});


export default model('Comment', CommentSchema);