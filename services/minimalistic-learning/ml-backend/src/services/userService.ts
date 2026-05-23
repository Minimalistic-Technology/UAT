import { prisma } from '../config/db';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';

export type CreateUserPayload = Prisma.UserCreateInput;

export const findByEmail = (email: string) => prisma.user.findFirst({
  where: { email: { equals: email, mode: 'insensitive' } }
});

export const findById = (id: string) => prisma.user.findUnique({
  where: { id }
});

export const createUser = (payload: CreateUserPayload) => prisma.user.create({ data: payload });

export const updatePassword = async (user: User, passwordRaw: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(passwordRaw, salt);
  return prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });
};

export const toPublicUser = (user: User) => ({
  _id: user.id,
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  contactNumber: user.contactNumber,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});
