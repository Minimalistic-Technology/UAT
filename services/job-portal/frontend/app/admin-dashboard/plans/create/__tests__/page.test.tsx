import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatePlanForm from "../page";
import { useCreatePlan } from "@/features/admin/hooks/use-plan";
import "@testing-library/jest-dom";

// Polyfill for Radix UI Select testing in JSDOM
if (typeof window !== "undefined") {
  window.PointerEvent = class PointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;
    constructor(type: string, props: any) {
      super(type, props);
      this.button = props?.button || 0;
      this.ctrlKey = props?.ctrlKey || false;
      this.pointerType = props?.pointerType || "mouse";
    }
  } as any;
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.releasePointerCapture = jest.fn();
  window.HTMLElement.prototype.setPointerCapture = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

jest.mock("@/features/admin/hooks/use-plan", () => ({
  useCreatePlan: jest.fn(),
}));

// Provide a mock router just in case
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("CreatePlanForm", () => {
  const mockCreatePlan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCreatePlan as jest.Mock).mockReturnValue({
      mutate: mockCreatePlan,
      isPending: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders all form fields properly", () => {
    render(<CreatePlanForm />);

    expect(
      screen.getByRole("heading", { name: "Create New Plan" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Plan Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Display Order")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Plan Expiry Period (In Days)"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Post Visibility/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Post Limit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Team Member Limit/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Active Plan")).toBeInTheDocument();
    expect(screen.getByLabelText("Featured Plan")).toBeInTheDocument();
    expect(screen.getByLabelText("Default Plan")).toBeInTheDocument();
    expect(screen.getByLabelText("Allow Resume Downloads")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Plan" }),
    ).toBeInTheDocument();
  });

  it("handles validation errors when required fields are empty", async () => {
    render(<CreatePlanForm />);

    const submitBtn = screen.getByRole("button", { name: "Create Plan" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Plan name is required")).toBeInTheDocument();
    });

    expect(mockCreatePlan).not.toHaveBeenCalled();
  });

  it("submits the form with correct data", async () => {
    render(<CreatePlanForm />);

    // Fill required text/number inputs
    fireEvent.change(screen.getByLabelText("Plan Name"), {
      target: { value: "Enterprise Plan" },
    });
    fireEvent.change(screen.getByLabelText("Price"), {
      target: { value: "5000" },
    });
    fireEvent.change(screen.getByLabelText("Display Order"), {
      target: { value: "1" },
    });

    // Add a feature
    const addFeatureBtn = screen.getByRole("button", { name: /Add Feature/i });
    fireEvent.click(addFeatureBtn);

    // Wait for the feature input to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Feature 1")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Feature 1"), {
      target: { value: "Unlimited Job Posts" },
    });

    // Click submit
    const submitBtn = screen.getByRole("button", { name: "Create Plan" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreatePlan).toHaveBeenCalledTimes(1);
    });

    const calledWith = mockCreatePlan.mock.calls[0][0];
    expect(calledWith).toMatchObject({
      name: "Enterprise Plan",
      price: 5000,
      currency: "INR",
      durationDays: 30, // default
      postValidityDays: 30, // default
      jobPostLimit: -1, // default
      teamMemberLimit: -1, // default
      features: ["Unlimited Job Posts"],
      isFeatured: false,
      isDefault: false,
      displayOrder: 1,
      isActive: true, // default
      allowResumeDownload: false, // default
    });
  });

  it("appends and removes features dynamically", async () => {
    render(<CreatePlanForm />);

    const addFeatureBtn = screen.getByRole("button", { name: /Add Feature/i });

    // Add first feature
    fireEvent.click(addFeatureBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Feature 1")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("Feature 1"), {
      target: { value: "F1" },
    });

    // Add second feature
    fireEvent.click(addFeatureBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Feature 2")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("Feature 2"), {
      target: { value: "F2" },
    });

    // Add third feature
    fireEvent.click(addFeatureBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Feature 3")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("Feature 3"), {
      target: { value: "F3" },
    });

    expect(screen.getAllByPlaceholderText(/Feature \d/)).toHaveLength(3);

    const trashButtons = document.querySelectorAll(
      ".text-destructive.hover\\:bg-destructive\\/10",
    );
    // Click the second trash button (which removes F2)
    fireEvent.click(trashButtons[1]);

    await waitFor(() => {
      const remainingInputs = screen.getAllByPlaceholderText(/Feature \d/);
      expect(remainingInputs).toHaveLength(2);
      expect(remainingInputs[0]).toHaveValue("F1");
      expect(remainingInputs[1]).toHaveValue("F3");
    });
  });

  it("shows loading state on submit button when isPending is true", () => {
    (useCreatePlan as jest.Mock).mockReturnValue({
      mutate: mockCreatePlan,
      isPending: true,
    });

    render(<CreatePlanForm />);

    const submitBtn = screen.getByRole("button", { name: /Creating.../i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it("filters out empty features before submitting", async () => {
    render(<CreatePlanForm />);

    fireEvent.change(screen.getByLabelText("Plan Name"), {
      target: { value: "Test Plan" },
    });
    fireEvent.change(screen.getByLabelText("Price"), {
      target: { value: "100" },
    });

    const addFeatureBtn = screen.getByRole("button", { name: /Add Feature/i });

    // Add first valid feature
    fireEvent.click(addFeatureBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Feature 1")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("Feature 1"), {
      target: { value: "Valid feature 1" },
    });

    // Add empty feature (type first to allow adding the next, then clear)
    fireEvent.click(addFeatureBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Feature 2")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("Feature 2"), {
      target: { value: "To be cleared" },
    });

    // Add another valid feature
    fireEvent.click(addFeatureBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Feature 3")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText("Feature 3"), {
      target: { value: "Valid feature 2" },
    });

    // Clear Feature 2
    fireEvent.change(screen.getByPlaceholderText("Feature 2"), {
      target: { value: "" },
    });

    const submitBtn = screen.getByRole("button", { name: "Create Plan" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreatePlan).toHaveBeenCalledTimes(1);
    });

    const calledWith = mockCreatePlan.mock.calls[0][0];
    expect(calledWith.features).toEqual(["Valid feature 1", "Valid feature 2"]);
  });
});
