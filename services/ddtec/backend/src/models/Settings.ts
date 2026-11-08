import mongoose, { Schema, Document } from "mongoose";

export interface ISellerDetails {
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

export const DEFAULT_SELLER_DETAILS: ISellerDetails = {
    name: "DDTEC Solutions",
    email: "contact@ddtec.in",
    phone: "+91 98765 43210",
    address: "123 Tech Lane, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    zip: "560038",
    country: "India",
    taxId: process.env.COMPANY_GSTIN || "29AABBD1234F1Z5",
    logo: ""
};

export interface ISettings extends Document {
    components: {
        WhatWeOffer: boolean;
        Footer: boolean;
        ShopSection: boolean;
        Hero: boolean;
        WhoWeAre: boolean;
        FeaturedProducts: boolean;
        Contact: boolean;
        Login: boolean;
        [key: string]: boolean;
    };
    onboarding?: {
        mode: 'open' | 'closed' | 'invite_only' | 'admin_approval';
        inviteCode: string;
        closedMessage: string;
    };
    delivery?: {
        freeDeliveryThreshold: number;
        flatDeliveryFee: number;
        isFreeDeliveryEnabled: boolean;
    };
    sellerDetails?: ISellerDetails;
    quotationLogoUrl?: string;
    updatedAt: Date;
}

const SettingsSchema: Schema = new Schema({
    components: {
        WhatWeOffer: { type: Boolean, default: true },
        Footer: { type: Boolean, default: true },
        ShopSection: { type: Boolean, default: true },
        Hero: { type: Boolean, default: true },
        WhoWeAre: { type: Boolean, default: true },
        FeaturedProducts: { type: Boolean, default: true },
        Contact: { type: Boolean, default: true },
        Login: { type: Boolean, default: true },
    },
    onboarding: {
        mode: { type: String, enum: ['open', 'closed', 'invite_only', 'admin_approval'], default: 'open' },
        inviteCode: { type: String, default: 'DDTEC-INVITE-2026' },
        closedMessage: { type: String, default: 'New user onboarding is currently restricted by administrator.' }
    },
    delivery: {
        freeDeliveryThreshold: { type: Number, default: 500 },
        flatDeliveryFee: { type: Number, default: 50 },
        isFreeDeliveryEnabled: { type: Boolean, default: false }
    },
    sellerDetails: {
        name: { type: String, default: DEFAULT_SELLER_DETAILS.name },
        email: { type: String, default: DEFAULT_SELLER_DETAILS.email },
        phone: { type: String, default: DEFAULT_SELLER_DETAILS.phone },
        address: { type: String, default: DEFAULT_SELLER_DETAILS.address },
        city: { type: String, default: DEFAULT_SELLER_DETAILS.city },
        state: { type: String, default: DEFAULT_SELLER_DETAILS.state },
        zip: { type: String, default: DEFAULT_SELLER_DETAILS.zip },
        country: { type: String, default: DEFAULT_SELLER_DETAILS.country },
        taxId: { type: String, default: DEFAULT_SELLER_DETAILS.taxId },
        logo: { type: String, default: "" }
    },
    quotationLogoUrl: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model<ISettings>("Settings", SettingsSchema);
