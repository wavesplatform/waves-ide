import mongoose from 'mongoose';

export interface ISharedFileDocument extends mongoose.Document {
    hash: string
    type: string
    content: string
}

const sharedFileSchema = new mongoose.Schema({
    hash: {type: String, unique: true},
    type: {type: String, enum: ['js', 'ride']},
    content: {type: String, unique: true}
});

export const SharedFile = mongoose.model<ISharedFileDocument>('SharedFile', sharedFileSchema);
