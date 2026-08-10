import mongoose, { Schema, Document } from "mongoose";

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
        Signup: boolean;
        [key: string]: boolean;
    };
    onboarding?: {
        mode: 'open' | 'closed' | 'invite_only' | 'admin_approval';
        inviteCode: string;
        closedMessage: string;
    };
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
        Signup: { type: Boolean, default: true },
    },
    onboarding: {
        mode: { type: String, enum: ['open', 'closed', 'invite_only', 'admin_approval'], default: 'open' },
        inviteCode: { type: String, default: 'DDTEC-INVITE-2026' },
        closedMessage: { type: String, default: 'New user onboarding is currently restricted by administrator.' }
    }
}, { timestamps: true });

export default mongoose.model<ISettings>("Settings", SettingsSchema);
