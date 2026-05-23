import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICheckInCheckOut {
  dateTime: Date;
  city?: string;
  state?: string;
  country?: string;
  ip?: string;
  lat?: number;
  long?: number;
}

export interface ISession {
  checkIn: ICheckInCheckOut;
  checkOut?: ICheckInCheckOut;
}

export interface IAttendance extends Document {
  user: Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  sessions: ISession[];
  totalHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const CheckInCheckOutSchema = new Schema<ICheckInCheckOut>(
  {
    dateTime: { type: Date, required: true },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    ip: { type: String },
    lat: { type: Number },
    long: { type: Number },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>({
  checkIn: { type: CheckInCheckOutSchema, required : true },
  checkOut: { type: CheckInCheckOutSchema },
});

const AttendanceSchema = new Schema<IAttendance>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
    },
    date: { type: String, required: true },
    sessions: { type: [SessionSchema], default: [] },
    totalHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const AttendanceModel = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
