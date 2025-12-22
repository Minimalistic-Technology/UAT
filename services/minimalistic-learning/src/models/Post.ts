import { Schema, model, Types } from 'mongoose';


const PostSchema = new Schema({
title: { type: String, required: true },
slug: { type: String, required: true, unique: true },
content: { type: String, required: true },
tags: [{ type: String, index: true }],
authorId: { type: Types.ObjectId, ref: 'User', required: true },
published: { type: Boolean, default: false },
createdAt: { type: Date, default: Date.now }
});


PostSchema.index({ title: 'text', content: 'text' });


export default model('Post', PostSchema);