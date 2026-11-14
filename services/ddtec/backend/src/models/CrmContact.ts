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
    street: { type: String, trim: true, maxlength: 150 },
    city: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    country: { type: String, trim: true, maxlength: 80 }
}, { _id: false });

const CrmContactSchema: Schema = new Schema({
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    emails: { type: [CrmContactEmailSchema], default: [] },
    phones: { type: [CrmContactPhoneSchema], default: [] },
    company: { type: String, trim: true, maxlength: 100, index: true },
    jobTitle: { type: String, trim: true, maxlength: 80 },
    address: { type: CrmContactAddressSchema, default: {} },
    productInterest: { type: [String], default: [], index: true },
    tags: { type: [String], default: [] },
    birthday: { type: Date },
    photo: { type: String, trim: true },
    source: { type: String, enum: ['manual', 'vcf_import', 'csv_import'], default: 'manual' },
    note: { type: String, maxlength: 2000 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

CrmContactSchema.index({ firstName: 'text', lastName: 'text', company: 'text' });

export default mongoose.model<ICrmContact>('CrmContact', CrmContactSchema);
