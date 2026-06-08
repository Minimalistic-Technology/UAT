import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordClient from "@/app/(auth)/forgot-password/forgot-password-client";
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password";
import { toast } from "sonner";

// Mock dependencies
jest.mock("@/features/auth/hooks/use-forgot-password", () => ({
  useForgotPassword: jest.fn(),
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

describe("ForgotPasswordClient Component", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useForgotPassword as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const fillFormAndSubmit = async (email: string) => {
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: email } });
    const submitButton = screen.getByRole("button", { name: /Send Reset Link/i });
    fireEvent.submit(submitButton.closest("form")!);
  };

  it("renders all form elements correctly", () => {
    render(<ForgotPasswordClient />);

    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send Reset Link/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Login/i })).toBeInTheDocument();
  });

  describe("Form Validations", () => {
    it("shows validation error for empty email on submit", async () => {
      render(<ForgotPasswordClient />);

      const submitButton = screen.getByRole("button", { name: /Send Reset Link/i });
      fireEvent.submit(submitButton.closest("form")!);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("shows validation error for invalid email format", async () => {
      render(<ForgotPasswordClient />);

      await fillFormAndSubmit("invalid-email");

      await waitFor(() => {
        expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe("Form Submissions & API Interactions", () => {
    it("calls forgot password mutation with valid email", async () => {
      render(<ForgotPasswordClient />);

      await fillFormAndSubmit("john@example.com");

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "john@example.com",
          }),
          expect.any(Object)
        );
      });
    });

    it("displays success toast on successful request", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onSuccess();
      });

      render(<ForgotPasswordClient />);

      await fillFormAndSubmit("john@example.com");

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Password reset link sent to your email!");
      });
    });

    it("displays error toast on failed request", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onError(new Error("User not found"));
      });

      render(<ForgotPasswordClient />);

      await fillFormAndSubmit("john@example.com");

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("User not found");
      });
    });

    it("displays validation error from response correctly", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onError({
          message: "Validation failed",
          errors: [{ message: "Email not verified" }],
        });
      });

      render(<ForgotPasswordClient />);

      await fillFormAndSubmit("john@example.com");

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Email not verified");
      });
    });
  });

  describe("Loading States", () => {
    it("disables input and shows loading state during mutation", () => {
      (useForgotPassword as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<ForgotPasswordClient />);

      expect(screen.getByLabelText(/Email Address/i)).toBeDisabled();
      expect(screen.getByRole("button", { name: /Sending.../i })).toBeDisabled();
    });
  });
});
