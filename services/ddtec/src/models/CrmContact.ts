import mongoose, { Schema, Document } from 'mongoose';

export interface ICrmContactEmail {
    label: 'work' | 'personal' | 'other';
    value: string;
}

export interface ICrmContactPhone {
    label: 'mobile' | 'work' | 'home' | 'other';
    value: string;
}

export interface ICrmContactAddress {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

export interface ICrmContact extends Document {
    firstName: string;
    lastName?: string;
    emails: ICrmContactEmail[];
    phones: ICrmContactPhone[];
    company?: string;
    jobTitle?: string;
    address?: ICrmContactAddress;
    productInterest: string[];
    tags: string[];
    birthday?: Date;
    photo?: string;
    source: 'manual' | 'vcf_import' | 'csv_import';
    note?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CrmContactEmailSchema = new Schema<ICrmContactEmail>({
    label: { type: String, enum: ['work', 'personal', 'other'], default: 'work' },
    value: { type: String, required: true, trim: true, lowercase: true }
}, { _id: false });

const CrmContactPhoneSchema = new Schema<ICrmContactPhone>({
    label: { type: String, enum: ['mobile', 'work', 'home', 'other'], default: 'mobile' },
    value: { type: String, required: true, trim: true }
}, { _id: false });

const CrmContactAddressSchema = new Schema<ICrmContactAddress>({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String }
}, { _id: false });

const CrmContactSchema: Schema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    emails: { type: [CrmContactEmailSchema], default: [] },
    phones: { type: [CrmContactPhoneSchema], default: [] },
    company: { type: String, trim: true, index: true },
    jobTitle: { type: String, trim: true },
    address: { type: CrmContactAddressSchema, default: {} },
    productInterest: { type: [String], default: [], index: true },
    tags: { type: [String], default: [] },
    birthday: { type: Date },
    photo: { type: String },
    source: { type: String, enum: ['manual', 'vcf_import', 'csv_import'], default: 'manual' },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

CrmContactSchema.index({ firstName: 'text', lastName: 'text', company: 'text' });

export default mongoose.model<ICrmContact>('CrmContact', CrmContactSchema);
