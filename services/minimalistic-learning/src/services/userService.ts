import User, { IUser, UserDocument } from '../models/User';

export type CreateUserPayload = Omit<IUser, 'createdAt' | 'updatedAt'>;

export const findByEmail = (email: string) => User.findOne({ email });

export const findById = (id: string) => User.findById(id);

export const createUser = (payload: CreateUserPayload) => User.create(payload);

export const updatePassword = async (user: UserDocument, password: string) => {
  user.password = password;
  return user.save();
};

export const toPublicUser = (user: UserDocument) => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  contactNumber: user.contactNumber,
  email: user.email,
  createdAt: user.createdAt
});


