import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CouponsPage from "../page";
import { useFetchAdminCoupons } from "@/features/admin/hooks/use-coupon";
import "@testing-library/jest-dom";

jest.mock("@/features/admin/hooks/use-coupon", () => ({
  useFetchAdminCoupons: jest.fn(),
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
