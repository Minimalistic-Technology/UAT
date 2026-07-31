import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouseStock extends Document {
    product: mongoose.Types.ObjectId;
    productName?: string; // Denormalized for faster UI queries
    warehouseName: string; // e.g. "Mumbai Hub", "Delhi Fulfillment"
    zoneAisle: string;     // e.g. "Zone A", "Aisle 12"
    rack: string;          // e.g. "R1", "R2"
    shelfRow: string;      // e.g. "Row 3", "Shelf B"
    quantity: number;
    capacity: number;      // Maximum units this shelf can hold (Blinkit style capacity tracking)
}

const WarehouseStockSchema: Schema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    warehouseName: { type: String, required: true, default: "Main Warehouse" },
    zoneAisle: { type: String, required: true },
    rack: { type: String, required: true },
    shelfRow: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    capacity: { type: Number, required: true, default: 100 }
}, { timestamps: true });

// Prevent duplicate shelf allocations for the exact same product in the exact same micro-location
WarehouseStockSchema.index({ product: 1, warehouseName: 1, zoneAisle: 1, rack: 1, shelfRow: 1 }, { unique: true });

export default mongoose.model<IWarehouseStock>('WarehouseStock', WarehouseStockSchema);
