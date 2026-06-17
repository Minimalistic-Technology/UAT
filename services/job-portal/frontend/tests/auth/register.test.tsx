import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterClient from "@/app/(auth)/register/register-client";
import { useRegister } from "@/features/auth/hooks/use-register";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock ResizeObserver for Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/features/auth/hooks/use-register", () => ({
  useRegister: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ priority, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Turnstile
jest.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onSuccess }: any) => {
    return (
      <div data-testid="turnstile-mock">
        <button
          type="button"
          data-testid="trigger-captcha"
          onClick={() => onSuccess("mock-captcha-token")}
        >
          Verify Captcha
        </button>
      </div>
    );
  },
}));

describe("RegisterClient Component", () => {
  const mockMutate = jest.fn();
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useRegister as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const fillFormAndSubmit = async (overrides: Record<string, string> = {}) => {
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: overrides.firstName ?? "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: overrides.lastName ?? "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: overrides.email ?? "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: overrides.phone ?? "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: overrides.password ?? "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: overrides.confirmPassword ?? "password123" },
    });

    // Accept terms
    const termsCheckbox = screen.getByLabelText(
      /I agree to the/i,
    ) as HTMLInputElement;
    if (!termsCheckbox.checked) {
      fireEvent.click(termsCheckbox);
    }

    // Trigger captcha
    if (overrides.captchaToken !== "skip") {
      fireEvent.click(screen.getByTestId("trigger-captcha"));
    }

    const submitButton = screen.getByRole("button", {
      name: /Create Account/i,
    });
    fireEvent.submit(submitButton.closest("form")!);
  };

  it("renders all form elements correctly", () => {
    render(<RegisterClient />);

    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/I agree to the/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Account/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("turnstile-mock")).toBeInTheDocument();
  });

  describe("Form Validations", () => {
    it("shows validation errors for empty fields on submit", async () => {
      render(<RegisterClient />);

      // Don't trigger captcha, submit immediately
      const submitButton = screen.getByRole("button", {
        name: /Create Account/i,
      });
      fireEvent.submit(submitButton.closest("form")!);

      await waitFor(() => {
        expect(
          screen.getByText(/First name must be at least 2 characters/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Last name must be at least 2 characters/i),
        ).toBeInTheDocument();
        const passwordErrors = screen.getAllByText(
          /Password must be at least 6 characters/i,
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("shows validation error for password mismatch", async () => {
      render(<RegisterClient />);

      await fillFormAndSubmit({
        password: "password123",
        confirmPassword: "password456",
        phone: "1234567890",
      });

      await waitFor(() => {
        expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("shows validation error for invalid email format", async () => {
      render(<RegisterClient />);

      await fillFormAndSubmit({ email: "invalid-email", phone: "1234567890" });

      await waitFor(() => {
        expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("shows validation error for missing captcha token", async () => {
      render(<RegisterClient />);

      await fillFormAndSubmit({ captchaToken: "skip", phone: "1234567890" });

      await waitFor(() => {
        // Zod either says "Required" or "Captcha is required" depending on whether it's undefined or ""
        expect(screen.getByText(/Required|Captcha/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe("Form Submissions & API Interactions", () => {
    it("calls register mutation with valid inputs", async () => {
      render(<RegisterClient />);

      await fillFormAndSubmit();

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "1234567890",
            password: "password123",
            confirmPassword: "password123",
            captchaToken: "mock-captcha-token",
          }),
          expect.any(Object),
        );
      });
    });

    it("displays success toast and redirects on successful registration", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onSuccess();
      });

      render(<RegisterClient />);

      await fillFormAndSubmit({ email: "test@example.com" });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("OTP sent to your email!");
        expect(mockRouter.push).toHaveBeenCalledWith(
          "/verify-otp?email=test%40example.com",
        );
      });
    });

    it("displays error toast on failed registration (general error)", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onError(new Error("Email already in use"));
      });

      render(<RegisterClient />);

      await fillFormAndSubmit();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Email already in use");
      });
    });

    it("displays error toast on failed registration (response error)", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onError({
          response: {
            data: {
              message: "Server validation failed",
            },
          },
        });
      });

      render(<RegisterClient />);

      await fillFormAndSubmit();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Server validation failed");
      });
    });
  });

  describe("Loading States & UI Interactions", () => {
    it("disables inputs and shows loading state during mutation", () => {
      (useRegister as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<RegisterClient />);

      expect(screen.getByLabelText(/First Name/i)).toBeDisabled();
      expect(screen.getByLabelText(/Last Name/i)).toBeDisabled();
      expect(screen.getByLabelText(/Email/i)).toBeDisabled();
      expect(screen.getByLabelText(/Phone Number/i)).toBeDisabled();
      expect(screen.getByLabelText(/^Password/i)).toBeDisabled();
      expect(screen.getByLabelText(/Confirm Password/i)).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /Please wait.../i }),
      ).toBeDisabled();
    });

    it("toggles password visibility when clicking the eye icon", () => {
      render(<RegisterClient />);

      const passwordInput = screen.getByLabelText(/^Password/i);
      expect(passwordInput).toHaveAttribute("type", "password");

      // Password toggle is the first button in the form
      const toggleButtons = screen.getAllByRole("button");
      // Find the toggle button inside the password field container
      const passwordContainer = passwordInput.parentElement;
      const toggleButton = passwordContainer!.querySelector("button");

      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute("type", "text");

      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("toggles confirm password visibility when clicking the eye icon", () => {
      render(<RegisterClient />);

      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      const confirmPasswordContainer = confirmPasswordInput.parentElement;
      const toggleButton = confirmPasswordContainer!.querySelector("button");

      fireEvent.click(toggleButton!);
      expect(confirmPasswordInput).toHaveAttribute("type", "text");

      fireEvent.click(toggleButton!);
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });
  });
});
