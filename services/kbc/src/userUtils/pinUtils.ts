import bcrypt from "bcryptjs";

export const hashPin = async (pin: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pin, salt);
};

export const comparePin = async (enteredPin: string, storedHash: string): Promise<boolean> => {
  return await bcrypt.compare(enteredPin, storedHash);
};

export const isValidPinFormat = (pin: string): boolean => /^\d{4}$/.test(pin);
