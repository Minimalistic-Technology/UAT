import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginClient from "@/app/(auth)/login/login-client";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useSession, signIn } from "next-auth/react";
import { useRedirectAsPerRole } from "@/hooks/use-redirect";
import { toast } from "sonner";
import { getValidationErrorMessage } from "@/lib/validation-error";

// Mock ResizeObserver for Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock dependencies
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

jest.mock("@/features/auth/hooks/use-login", () => ({
  useLogin: jest.fn(),
}));

jest.mock("@/hooks/use-redirect", () => ({
  useRedirectAsPerRole: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/validation-error", () => ({
  getValidationErrorMessage: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ priority, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("LoginClient Component", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    (useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("renders all form elements correctly", () => {
    render(<LoginClient />);
    
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByText(/Enter your email to sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Remember me/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In with Email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Forgot password\?/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign up/i })).toBeInTheDocument();
  });

  describe("Form Validations", () => {
    it("shows validation errors for empty fields on submit", async () => {
      render(<LoginClient />);
      
      fireEvent.click(screen.getByRole("button", { name: /Sign In with Email/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
      });
      
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("shows validation error for invalid email format", async () => {
      render(<LoginClient />);
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password123" } });
      
      fireEvent.submit(emailInput.closest("form")!);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      });
      expect(screen.queryByText(/Password must be at least 6 characters/i)).not.toBeInTheDocument();
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("shows validation error for password less than 6 characters", async () => {
      render(<LoginClient />);
      
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "12345" } });
      
      fireEvent.click(screen.getByRole("button", { name: /Sign In with Email/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
      });
      expect(screen.queryByText(/Invalid email address/i)).not.toBeInTheDocument();
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("removes validation error after fixing the input", async () => {
      render(<LoginClient />);
      
      fireEvent.click(screen.getByRole("button", { name: /Sign In with Email/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password123" } });
      fireEvent.click(screen.getByRole("button", { name: /Sign In with Email/i }));

      await waitFor(() => {
        expect(screen.queryByText(/Invalid email address/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submissions & API Interactions", () => {
    it("calls login mutation with valid inputs", async () => {
      render(<LoginClient />);
      
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password123" } });
      
      fireEvent.click(screen.getByRole("button", { name: /Sign In with Email/i }));
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          { email: "test@example.com", password: "password123" },
          expect.any(Object)
        );
      });
    });

    it("displays success toast on successful login", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onSuccess();
      });

      render(<LoginClient />);
      
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password123" } });
      fireEvent.click(screen.getByRole("button", { name: /Sign In with Email/i }));
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Login successful!");
      });
    });

    it("displays error toast on failed login (general error)", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onError(new Error("Invalid credentials"));
      });

      render(<LoginClient />);
      
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password123" } });
      fireEvent.click(screen.getByRole("button", { name: /Sign In with Email/i }));
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
      });
    });

    it("displays validation error toast on failed login (Validation failed)", async () => {
      const mockValidationError = new Error("Validation failed");
      mockMutate.mockImplementation((data, options) => {
        options.onError(mockValidationError);
      });

      (getValidationErrorMessage as jest.Mock).mockReturnValue("Email is not registered");

      render(<LoginClient />);
      
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password123" } });
      fireEvent.click(screen.getByRole("button", { name: /Sign In with Email/i }));
      
      await waitFor(() => {
        expect(getValidationErrorMessage).toHaveBeenCalledWith(mockValidationError);
        expect(toast.error).toHaveBeenCalledWith("Email is not registered");
      });
    });

    it("handles Google login click", async () => {
      render(<LoginClient />);
      
      fireEvent.click(screen.getByRole("button", { name: /Google/i }));
      
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("google");
      });
    });

    it("shows error toast if Google login fails", async () => {
      (signIn as jest.Mock).mockRejectedValueOnce(new Error("Google login failed"));
      
      render(<LoginClient />);
      
      fireEvent.click(screen.getByRole("button", { name: /Google/i }));
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Google login failed");
      });
    });
  });

  describe("Loading States & UI Interactions", () => {
    it("disables inputs and shows loading state during login mutation", () => {
      (useLogin as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<LoginClient />);
      
      expect(screen.getByLabelText(/Email Address/i)).toBeDisabled();
      expect(screen.getByLabelText(/^Password$/i)).toBeDisabled();
      expect(screen.getByLabelText(/Remember me/i)).toBeDisabled();
      expect(screen.getByRole("button", { name: /Signing in.../i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /Google/i })).toBeDisabled();
    });

    it("disables inputs when auth status is loading", () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<LoginClient />);
      
      expect(screen.getByLabelText(/Email Address/i)).toBeDisabled();
      expect(screen.getByLabelText(/^Password$/i)).toBeDisabled();
      expect(screen.getByLabelText(/Remember me/i)).toBeDisabled();
      expect(screen.getByRole("button", { name: /Sign In with Email/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /Google/i })).toBeDisabled();
    });

    it("toggles password visibility when clicking the eye icon", () => {
      render(<LoginClient />);
      
      const passwordInput = screen.getByLabelText(/^Password$/i);
      expect(passwordInput).toHaveAttribute("type", "password");
      
      const toggleButton = screen.getAllByRole("button")[0]; 
      
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");
      
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });
});
