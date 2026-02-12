import mongoose, { Schema } from 'mongoose';
const companySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Company description is required'],
    },
    logo: String,
    website: String,
    industry: {
        type: String,
        required: true,
    },
    companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    },
    location: {
        address: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    socialLinks: {
        linkedin: String,
        twitter: String,
        facebook: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
export default mongoose.model('Company', companySchema);
