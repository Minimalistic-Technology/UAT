import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CouponsPage from "@/app/admin-dashboard/coupons/page";
import CreateCouponForm from "@/app/admin-dashboard/coupons/create/page";
import { useFetchAdminCoupons, useCreateCoupon } from "@/features/admin/hooks/use-coupon";
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
  useFetchAdminCoupons: jest.fn(),
  useCreateCoupon: jest.fn(),
}));

jest.mock("@/features/admin/components/coupon-table-row", () => {
  return {
    CouponTableRow: function MockCouponTableRow({ coupon }: any) {
      return (
        <tr data-testid="coupon-row">
          <td>{coupon.code}</td>
          <td>{coupon.value}</td>
          <td>{coupon.status}</td>
        </tr>
      );
    }
  };
});

describe("Admin Coupons Management Page", () => {
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders loading state initially", () => {
    (useFetchAdminCoupons as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    });

    const { container } = render(<CouponsPage />);
    
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state when fetch fails", () => {
    (useFetchAdminCoupons as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<CouponsPage />);
    
    expect(screen.getByText("Failed to load coupons data.")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText("Retry"));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders coupons when fetch succeeds", () => {
    (useFetchAdminCoupons as jest.Mock).mockReturnValue({
      data: {
        data: {
          coupons: [
            { _id: "1", code: "SUMMER50", value: 50, status: "Active" },
            { _id: "2", code: "WINTER20", value: 20, status: "Active" },
          ],
          pagination: { currentPage: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<CouponsPage />);
    
    const rows = screen.getAllByTestId("coupon-row");
    expect(rows).toHaveLength(2);
    expect(screen.getByText("SUMMER50")).toBeInTheDocument();
    expect(screen.getByText("WINTER20")).toBeInTheDocument();
  });

  it("filters coupons based on search term", () => {
    (useFetchAdminCoupons as jest.Mock).mockReturnValue({
      data: {
        data: {
          coupons: [
            { _id: "1", code: "SUMMER50", value: 50, status: "Active" },
            { _id: "2", code: "WINTER20", value: 20, status: "Active" },
          ],
          pagination: { currentPage: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<CouponsPage />);
    
    const searchInput = screen.getByPlaceholderText("Search coupons...");
    fireEvent.change(searchInput, { target: { value: "summer" } }); // lowercase to test case insensitivity
    
    const rows = screen.getAllByTestId("coupon-row");
    expect(rows).toHaveLength(1);
    expect(screen.getByText("SUMMER50")).toBeInTheDocument();
    expect(screen.queryByText("WINTER20")).not.toBeInTheDocument();
  });

  it("navigates between pages using pagination buttons", () => {
    (useFetchAdminCoupons as jest.Mock).mockReturnValue({
      data: {
        data: {
          coupons: [{ _id: "1", code: "SUMMER50", value: 50, status: "Active" }],
          pagination: { currentPage: 1, totalPages: 2, hasNextPage: true, hasPrevPage: false },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    const { rerender } = render(<CouponsPage />);
    
    const prevBtn = screen.getByText("Previous");
    const nextBtn = screen.getByText("Next");

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);
    expect(useFetchAdminCoupons).toHaveBeenCalledWith(2, 10);

    (useFetchAdminCoupons as jest.Mock).mockReturnValue({
      data: {
        data: {
          coupons: [{ _id: "2", code: "WINTER20", value: 20, status: "Active" }],
          pagination: { currentPage: 2, totalPages: 2, hasNextPage: false, hasPrevPage: true },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    
    rerender(<CouponsPage />);
    
    const activePrevBtn = screen.getByText("Previous");
    fireEvent.click(activePrevBtn);
    
    expect(useFetchAdminCoupons).toHaveBeenCalledWith(1, 10);
  });

  it("shows 'No coupons found.' when data is empty", () => {
    (useFetchAdminCoupons as jest.Mock).mockReturnValue({
      data: {
        data: {
          coupons: [],
          pagination: { currentPage: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<CouponsPage />);
    expect(screen.getByText("No coupons found.")).toBeInTheDocument();
  });
});

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
