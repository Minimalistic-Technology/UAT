import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmployerRegisterPage from "@/app/(auth)/employer-register/register-employer-client";
import { useRegisterEmployer } from "@/features/auth/hooks/use-register";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CompanyRole } from "@/types";

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
  useRegisterEmployer: jest.fn(),
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

// Mock Select to avoid Radix UI infinite loop in jsdom
jest.mock("@/components/ui/select", () => ({
  Select: ({ onValueChange, children, disabled }: any) => (
    <select
      data-testid="mock-select"
      disabled={disabled}
      onChange={(e: any) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => (
    <option value="">{placeholder}</option>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
}));

describe("EmployerRegisterPage Component", () => {
  const mockMutate = jest.fn();
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useRegisterEmployer as jest.Mock).mockReturnValue({
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
    fireEvent.change(screen.getByLabelText(/Company Name/i), {
      target: { value: overrides.companyName ?? "Acme Inc." },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: overrides.email ?? "john@acme.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: overrides.password ?? "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm/i), {
      target: { value: overrides.confirmPassword ?? "password123" },
    });

    // Handle Select dropdown for industry if not set to skip
    if (overrides.industry !== "skip" && overrides.industry !== "Other") {
      const select = screen.getByTestId("mock-select");
      fireEvent.change(select, {
        target: { value: overrides.industry ?? "Technology" },
      });
    } else if (overrides.industry === "Other") {
      const select = screen.getByTestId("mock-select");
      fireEvent.change(select, { target: { value: "Other" } });
      // Wait for input to appear and type
      const customIndustryInput = screen.getByPlaceholderText(
        /Please specify your industry/i,
      );
      fireEvent.change(customIndustryInput, {
        target: { value: overrides.customIndustry ?? "Space Tech" },
      });
    }

    // Trigger captcha
    if (overrides.captchaToken !== "skip") {
      fireEvent.click(screen.getByTestId("trigger-captcha"));
    }

    const submitButton = screen.getByRole("button", {
      name: /Register Company/i,
    });
    fireEvent.submit(submitButton.closest("form")!);
  };

  it("renders all form elements correctly", () => {
    render(<EmployerRegisterPage />);

    expect(screen.getByText("Create Employer Account")).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByText("Industry")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register Company/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("turnstile-mock")).toBeInTheDocument();
  });

  describe("Form Validations", () => {
    it("shows validation errors for empty fields on submit", async () => {
      render(<EmployerRegisterPage />);

      const submitButton = screen.getByRole("button", {
        name: /Register Company/i,
      });
      fireEvent.submit(submitButton.closest("form")!);

      await waitFor(() => {
        expect(
          screen.getByText(/First name must be at least 2 characters/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Company name must be at least 2 characters/i),
        ).toBeInTheDocument();
        const passwordErrors = screen.getAllByText(
          /Password must be at least 6 characters/i,
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("shows validation error for password mismatch", async () => {
      render(<EmployerRegisterPage />);

      await fillFormAndSubmit({
        password: "password123",
        confirmPassword: "password456",
      });

      await waitFor(() => {
        expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("shows validation error for missing captcha token", async () => {
      render(<EmployerRegisterPage />);

      await fillFormAndSubmit({ captchaToken: "skip" });

      await waitFor(() => {
        expect(screen.getByText(/Required|Captcha/i)).toBeInTheDocument();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe("Industry Selection", () => {
    it("allows selecting a predefined industry", async () => {
      render(<EmployerRegisterPage />);

      const select = screen.getByTestId("mock-select");
      fireEvent.change(select, { target: { value: "Healthcare" } });

      expect(select).toHaveValue("Healthcare");
      expect(
        screen.queryByPlaceholderText(/Please specify your industry/i),
      ).not.toBeInTheDocument();
    });

    it("shows custom input when 'Other' industry is selected", () => {
      render(<EmployerRegisterPage />);

      const select = screen.getByTestId("mock-select");
      fireEvent.change(select, { target: { value: "Other" } });

      expect(
        screen.getByPlaceholderText(/Please specify your industry/i),
      ).toBeInTheDocument();
    });
  });

  describe("Form Submissions & API Interactions", () => {
    it("calls register mutation with valid inputs and predefined industry", async () => {
      render(<EmployerRegisterPage />);

      await fillFormAndSubmit({ industry: "Technology" });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: "John",
            lastName: "Doe",
            companyName: "Acme Inc.",
            email: "john@acme.com",
            industry: "Technology",
            password: "password123",
            confirmPassword: "password123",
            captchaToken: "mock-captcha-token",
            role: CompanyRole.OWNER,
          }),
          expect.any(Object),
        );
      });
    });

    it("calls register mutation with valid inputs and custom industry", async () => {
      render(<EmployerRegisterPage />);

      await fillFormAndSubmit({
        industry: "Other",
        customIndustry: "Space Tech",
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            industry: "Space Tech",
            companyName: "Acme Inc.",
          }),
          expect.any(Object),
        );
      });
    });

    it("displays success toast and redirects on successful registration", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onSuccess();
      });

      render(<EmployerRegisterPage />);

      await fillFormAndSubmit({ email: "test@acme.com" });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("OTP sent to your email!");
        expect(mockRouter.push).toHaveBeenCalledWith(
          "/verify-otp?email=test%40acme.com",
        );
      });
    });

    it("displays error toast on failed registration", async () => {
      mockMutate.mockImplementation((data, options) => {
        options.onError(new Error("Registration failed"));
      });

      render(<EmployerRegisterPage />);

      await fillFormAndSubmit();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Registration failed");
      });
    });
  });

  describe("Loading States & UI Interactions", () => {
    it("disables inputs and shows loading state during mutation", () => {
      (useRegisterEmployer as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<EmployerRegisterPage />);

      expect(screen.getByLabelText(/First Name/i)).toBeDisabled();
      expect(screen.getByLabelText(/Company Name/i)).toBeDisabled();
      expect(screen.getByLabelText(/Email Address/i)).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /Creating Account.../i }),
      ).toBeDisabled();
    });

    it("toggles password visibility when clicking the eye icon", () => {
      render(<EmployerRegisterPage />);

      const passwordInput = screen.getByLabelText(/^Password/i);
      expect(passwordInput).toHaveAttribute("type", "password");

      const passwordContainer = passwordInput.parentElement;
      const toggleButton = passwordContainer!.querySelector("button");

      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute("type", "text");
    });
  });
});
