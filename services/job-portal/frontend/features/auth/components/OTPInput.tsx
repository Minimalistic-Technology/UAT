import React, { useState, useRef, useEffect } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}) => {
  const [otpArray, setOtpArray] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Sync external value with internal array state
    const newValueArray = value.split("").slice(0, length);
    const newOtpArray = Array(length).fill("");
    newValueArray.forEach((char, index) => {
      newOtpArray[index] = char;
    });
    setOtpArray(newOtpArray);
  }, [value, length]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return;

    // Take the last typed character in case user types fast
    const char = val.slice(-1);

    const newOtpArray = [...otpArray];
    newOtpArray[index] = char;
    setOtpArray(newOtpArray);

    const newValue = newOtpArray.join("");
    onChange(newValue);

    // Auto-focus next input
    if (char !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace auto-focus
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").replace(/\\D/g, "").slice(0, length);
    if (!pasteData) return;

    const newOtpArray = [...otpArray];
    pasteData.split("").forEach((char, index) => {
      if (index < length) newOtpArray[index] = char;
    });
    setOtpArray(newOtpArray);
    onChange(newOtpArray.join(""));

    // Focus on the next empty input or the last one
    const nextEmptyIndex = pasteData.length < length ? pasteData.length : length - 1;
    inputRefs.current[nextEmptyIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2">
      {otpArray.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-bold border rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-400"
        />
      ))}
    </div>
  );
};
