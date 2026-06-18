import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordClient from "@/app/(auth)/reset-password/[id]/reset-password-client";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/features/auth/hooks/use-reset-password", () => ({
  useResetPassword: jest.fn(),
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

describe("ResetPasswordClient Component", () => {
  const mockMutate = jest.fn();
  const mockRouter = { push: jest.fn() };
  const mockToken = "mock-reset-token";

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useResetPassword as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const fillFormAndSubmit = async (overrides: Record<string, string> = {}) => {
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: overrides.password ?? "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: overrides.confirmPassword ?? "newpassword123" },
    });

    const submitButton = screen.getByRole("button", {
      name: /Reset Password/i,
    });
    fireEvent.submit(submitButton.closest("form")!);
  };

  it("renders all form elements correctly", () => {
    render(<ResetPasswordClient token={mockToken} />);

    const resetPasswordTexts = screen.getAllByText("Reset Password");
    expect(resetPasswordTexts.length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reset Password/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to Login/i }),
    ).toBeInTheDocument();
  });

  describe("Form Validations", () => {
    it("shows validation errors for empty fields on submit", async () => {
      render(<ResetPasswordClient token={mockToken} />);

      const submitButton = screen.getByRole("button", {
        name: /Reset Password/i,
      });
      fireEvent.submit(submitButton.closest("form")!);

      await waitFor(() => {
        const passwordErrors = screen.getAllByText(
          /Password must be at least 6 characters/i,
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("shows validation error for password mismatch", async () => {
      render(<ResetPasswordClient token={mockToken} />);

      await fillFormAndSubmit({
        password: "password123",
        confirmPassword: "password456",
      });

      await waitFor(() => {
        expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe("Form Submissions & API Interactions", () => {
    it("calls reset password mutation with valid inputs", async () => {
      render(<ResetPasswordClient token={mockToken} />);

      await fillFormAndSubmit();

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            password: "newpassword123",
            confirmPassword: "newpassword123",
          }),
          expect.any(Object),
        );
      });

      expect(useResetPassword).toHaveBeenCalledWith(mockToken);
    });

    it("displays success toast and redirects on successful reset", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onSuccess();
      });

      render(<ResetPasswordClient token={mockToken} />);

      await fillFormAndSubmit();

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Password reset successfully! Please login with your new password.",
        );
        expect(mockRouter.push).toHaveBeenCalledWith("/login");
      });
    });

    it("displays error toast on failed reset", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onError(new Error("Token expired"));
      });

      render(<ResetPasswordClient token={mockToken} />);

      await fillFormAndSubmit();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Token expired");
      });
    });

    it("displays validation error from response correctly", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onError({
          message: "Validation failed",
          errors: [{ message: "Invalid password format" }],
        });
      });

      render(<ResetPasswordClient token={mockToken} />);

      await fillFormAndSubmit();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid password format");
      });
    });
  });

  describe("Loading States & UI Interactions", () => {
    it("disables inputs and shows loading state during mutation", () => {
      (useResetPassword as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<ResetPasswordClient token={mockToken} />);

      expect(screen.getByLabelText(/^New Password/i)).toBeDisabled();
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /Resetting.../i }),
      ).toBeDisabled();
    });

    it("toggles password visibility when clicking the eye icon", () => {
      render(<ResetPasswordClient token={mockToken} />);

      const passwordInput = screen.getByLabelText(/^New Password/i);
      expect(passwordInput).toHaveAttribute("type", "password");

      const passwordContainer = passwordInput.parentElement;
      const toggleButton = passwordContainer!.querySelector("button");

      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute("type", "text");
    });
  });
});
