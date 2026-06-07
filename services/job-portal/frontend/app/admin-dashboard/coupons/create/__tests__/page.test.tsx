import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateCouponForm from "../page";
import { useCreateCoupon } from "@/features/admin/hooks/use-coupon";
import "@testing-library/jest-dom";

// Polyfill for Radix UI Select testing in JSDOM
if (typeof window !== 'undefined') {
  window.PointerEvent = class PointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;
    constructor(type: string, props: any) {
      super(type, props);
      this.button = props?.button || 0;
      this.ctrlKey = props?.ctrlKey || false;
      this.pointerType = props?.pointerType || 'mouse';
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

jest.mock("@/features/admin/hooks/use-coupon", () => ({
  useCreateCoupon: jest.fn(),
}));

describe("CreateCouponForm", () => {
  const mockCreateCoupon = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCreateCoupon as jest.Mock).mockReturnValue({
      mutate: mockCreateCoupon,
      isPending: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders all form fields properly", () => {
    render(<CreateCouponForm />);
    
    expect(screen.getByRole("heading", { name: "Create New Coupon" })).toBeInTheDocument();
    expect(screen.getByLabelText("Coupon Code")).toBeInTheDocument();
    expect(screen.getByText("Discount Type")).toBeInTheDocument();
    expect(screen.getByLabelText(/Discount Value/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expiry Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Uses/)).toBeInTheDocument();
    expect(screen.getByLabelText("Active Coupon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Coupon" })).toBeInTheDocument();
  });

  it("handles validation errors when required fields are empty", async () => {
    render(<CreateCouponForm />);
    
    const submitBtn = screen.getByRole("button", { name: "Create Coupon" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Coupon code must be at least 3 characters")).toBeInTheDocument();
    });
    
    expect(mockCreateCoupon).not.toHaveBeenCalled();
  });

  it("submits the form with correct data", async () => {
    render(<CreateCouponForm />);
    
    fireEvent.change(screen.getByLabelText("Coupon Code"), { target: { value: "SUMMER50" } });
    fireEvent.change(screen.getByLabelText(/Discount Value/), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText(/Max Uses/), { target: { value: "100" } });

    // Assuming type defaults to 'percentage' and isActive defaults to true
    const submitBtn = screen.getByRole("button", { name: "Create Coupon" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateCoupon).toHaveBeenCalledTimes(1);
    });

    const calledWith = mockCreateCoupon.mock.calls[0][0];
    expect(calledWith).toMatchObject({
      code: "SUMMER50",
      type: "percentage",
      value: 50,
      isActive: true,
      maxUses: 100,
    });
  });



  it("submits undefined for maxUses if empty string is provided", async () => {
    render(<CreateCouponForm />);
    
    fireEvent.change(screen.getByLabelText("Coupon Code"), { target: { value: "UNLIMITED" } });
    fireEvent.change(screen.getByLabelText(/Discount Value/), { target: { value: "10" } });
    
    // Set maxUses to empty string to test setValueAs logic
    fireEvent.change(screen.getByLabelText(/Max Uses/), { target: { value: "" } });

    const submitBtn = screen.getByRole("button", { name: "Create Coupon" });
    fireEvent.click(submitBtn);

    try {
      await waitFor(() => {
        expect(mockCreateCoupon).toHaveBeenCalledTimes(1);
      });
    } catch (e) {
      screen.debug(undefined, 100000);
      throw e;
    }

    const calledWith = mockCreateCoupon.mock.calls[0][0];
    expect(calledWith.maxUses).toBeUndefined();
  });

  it("shows loading state on submit button when isPending is true", () => {
    (useCreateCoupon as jest.Mock).mockReturnValue({
      mutate: mockCreateCoupon,
      isPending: true,
    });

    render(<CreateCouponForm />);
    
    const submitBtn = screen.getByRole("button", { name: /Creating.../i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });
});
