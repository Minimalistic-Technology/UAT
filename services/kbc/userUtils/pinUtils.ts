/**
 * Generates a 4-digit PIN based on current date and pinConfig
 * pinConfig is an array of 4 elements, each can be:
 * - null: use current day/month logic
 * - 0-9: use hardcoded digit
 * 
 * Default logic (all nulls): [DD][MM]
 * Example with config [null, 9, null, null] on 22-04: 2904
 */
export const generatePin = (pinConfig: (number | null)[]): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');  // DD
  const month = String(now.getMonth() + 1).padStart(2, '0');  // MM (0-indexed, so +1)

  // Default date-month array: [D1, D2, M1, M2]
  const dateDigits = [
    parseInt(day[0]),
    parseInt(day[1]),
    parseInt(month[0]),
    parseInt(month[1])
  ];

  // Apply pinConfig: use hardcoded digit if not null, otherwise use date digit
  const pin = pinConfig.map((configDigit, index) => {
    return configDigit !== null ? configDigit : dateDigits[index];
  }).join('');

  return pin;
};

export const isValidPinFormat = (pin: string): boolean => /^\d{4}$/.test(pin);

export const isValidPinConfig = (config: any): config is (number | null)[] => {
  if (!Array.isArray(config) || config.length !== 4) return false;
  return config.every(item => item === null || (typeof item === 'number' && item >= 0 && item <= 9));
};
