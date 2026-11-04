import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
    productId?: string;
    itemDescription: string;
    hsnCode?: string;
    qty: number;
    price: number;
    amount: number;
}

export interface IPartyDetails {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    taxId?: string;
    logo?: string;
}

export interface IPaymentDetails {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    ifscCode?: string;
    swiftCode?: string;
    routingCode?: string;
    upiId?: string;
}

export interface IInvoice extends Document {
    invoiceNumber: string;
    publicId: string;
    issueDate: Date;
    dueDate?: Date;
    status: 'draft' | 'unpaid' | 'paid' | 'cancelled';
    currency: string;
    sellerDetails: IPartyDetails;
    clientDetails: IPartyDetails;
    items: IInvoiceItem[];
    subtotal: number;
    discount: number;
    discountType: 'fixed' | 'percentage';
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    paymentDetails?: IPaymentDetails;
    notes?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PartyDetailsSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    taxId: { type: String, trim: true, uppercase: true }, // GSTIN / Tax ID
    logo: { type: String, trim: true }
}, { _id: false });

const InvoiceItemSchema = new Schema({
    productId: { type: String, trim: true },
    itemDescription: { type: String, required: true, trim: true },
    hsnCode: { type: String, trim: true },
    qty: { type: Number, required: true, default: 1, min: 1 },
    price: { type: Number, required: true, default: 0, min: 0 },
    amount: { type: Number, required: true, default: 0, min: 0 }
}, { _id: false });

const PaymentDetailsSchema = new Schema({
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    accountName: { type: String, trim: true },
    ifscCode: { type: String, trim: true, uppercase: true },
    swiftCode: { type: String, trim: true, uppercase: true },
    routingCode: { type: String, trim: true },
    upiId: { type: String, trim: true }
}, { _id: false });

const InvoiceSchema: Schema = new Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    publicId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['draft', 'unpaid', 'paid', 'cancelled'],
        default: 'unpaid'
    },
    currency: {
        type: String,
        default: 'INR'
    },
    sellerDetails: {
        type: PartyDetailsSchema,
        required: true
    },
    clientDetails: {
        type: PartyDetailsSchema,
        required: true
    },
    items: {
        type: [InvoiceItemSchema],
        default: []
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    discountType: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'fixed'
    },
    taxRate: {
        type: Number,
        default: 18
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    paymentDetails: {
        type: PaymentDetailsSchema
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

InvoiceSchema.index({ 'clientDetails.name': 'text', invoiceNumber: 'text' });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
