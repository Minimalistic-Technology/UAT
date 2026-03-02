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
        LoginSignup: boolean;
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
        LoginSignup: { type: Boolean, default: true },
    }
}, { timestamps: true });

export default mongoose.model<ISettings>("Settings", SettingsSchema);
