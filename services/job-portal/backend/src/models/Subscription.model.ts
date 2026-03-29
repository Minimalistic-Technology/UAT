import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  employerId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  orderId?: string; // Link to your payment gateway (Stripe/Razorpay)
  postsRemaining: number;
  totalPostsGranted: number; // To track original limit (useful for analytics)
  startDate: Date;
  expiryDate: Date;
  status: "active" | "expired" | "depleted" | "cancelled";
  lastBilledAt?: Date; // Useful for recurring billing logic
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    employerId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true // Faster lookups when checking user permissions
    },
    planId: { 
      type: Schema.Types.ObjectId, 
      ref: "Plan", 
      required: true 
    },
    orderId: { 
      type: String, 
      sparse: true // Allows multiple nulls but unique values for actual IDs
    },
    postsRemaining: { 
      type: Number, 
      required: true,
      min: [-1, "Posts cannot be less than -1"] 
    },
    totalPostsGranted: { 
      type: Number, 
      required: true 
    },
    startDate: { 
      type: Date, 
      default: Date.now 
    },
    expiryDate: { 
      type: Date, 
      required: true,
      index: true 
    },
    status: {
      type: String,
      enum: ["active", "expired", "depleted", "cancelled"],
      default: "active",
    },
    lastBilledAt: { 
      type: Date 
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
  }
);

/**
 * VIRTUAL: Check if subscription is valid without querying status
 * Usage: if (subscription.isValid) { ... }
 */
subscriptionSchema.virtual("isValid").get(function (this: ISubscription) {
  const now = new Date();
  const isTimeValid = this.expiryDate > now;
  const hasPosts = this.postsRemaining > 0 || this.postsRemaining === -1;
  return isTimeValid && hasPosts && this.status === "active";
});

// Middleware to automatically mark as 'depleted' if posts hit 0
subscriptionSchema.pre("save", function (next) {
  if (this.postsRemaining === 0 && this.status === "active") {
    this.status = "depleted";
  }
  next;
});

export default mongoose.model<ISubscription>("Subscription", subscriptionSchema);