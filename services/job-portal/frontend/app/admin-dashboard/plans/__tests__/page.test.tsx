import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PlansPage from "../page";
import { useFetchAdminPlans } from "@/features/admin/hooks/use-plan";
import "@testing-library/jest-dom";

// Mock hooks
jest.mock("@/features/admin/hooks/use-plan", () => ({
  useFetchAdminPlans: jest.fn(),
}));

// Mock PlanTableRow to isolate page logic
jest.mock("@/features/admin/components/plan-table-row", () => {
  return {
    PlanTableRow: function MockPlanTableRow({ plan }: any) {
      return (
        <tr data-testid="plan-row">
          <td>{plan.name}</td>
          <td>{plan.price}</td>
          <td>{plan.status}</td>
        </tr>
      );
    },
  };
});

describe("Admin Plans Management Page", () => {
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders loading state initially (skeletons)", () => {
    (useFetchAdminPlans as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    });

    const { container } = render(<PlansPage />);

    // Check for skeletons instead of text
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state when fetch fails", () => {
    (useFetchAdminPlans as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<PlansPage />);

    expect(screen.getByText("Failed to load plans data.")).toBeInTheDocument();

    // Retry button works
    fireEvent.click(screen.getByText("Retry"));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders plans when fetch succeeds", () => {
    (useFetchAdminPlans as jest.Mock).mockReturnValue({
      data: {
        data: {
          plans: [
            { _id: "1", name: "Basic Plan", price: 0, status: "Active" },
            { _id: "2", name: "Premium Plan", price: 100, status: "Active" },
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<PlansPage />);

    const rows = screen.getAllByTestId("plan-row");
    expect(rows).toHaveLength(2);
    expect(screen.getByText("Basic Plan")).toBeInTheDocument();
    expect(screen.getByText("Premium Plan")).toBeInTheDocument();
  });

  it("filters plans based on search term", () => {
    (useFetchAdminPlans as jest.Mock).mockReturnValue({
      data: {
        data: {
          plans: [
            { _id: "1", name: "Basic Plan", price: 0, status: "Active" },
            { _id: "2", name: "Premium Plan", price: 100, status: "Active" },
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<PlansPage />);

    const searchInput = screen.getByPlaceholderText("Search plans...");
    fireEvent.change(searchInput, { target: { value: "Premium" } });

    // After search, only "Premium Plan" should be rendered
    const rows = screen.getAllByTestId("plan-row");
    expect(rows).toHaveLength(1);
    expect(screen.getByText("Premium Plan")).toBeInTheDocument();
    expect(screen.queryByText("Basic Plan")).not.toBeInTheDocument();
  });

  it("navigates between pages using pagination buttons", () => {
    (useFetchAdminPlans as jest.Mock).mockReturnValue({
      data: {
        data: {
          plans: [{ _id: "1", name: "Basic Plan", price: 0, status: "Active" }],
          pagination: {
            currentPage: 1,
            totalPages: 3,
            hasNextPage: true,
            hasPrevPage: false,
          },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    const { rerender } = render(<PlansPage />);

    const prevBtn = screen.getByText("Previous");
    const nextBtn = screen.getByText("Next");

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Click Next
    fireEvent.click(nextBtn);
    expect(useFetchAdminPlans).toHaveBeenCalledWith(2, 10);

    // Mock page 2 response
    (useFetchAdminPlans as jest.Mock).mockReturnValue({
      data: {
        data: {
          plans: [
            { _id: "2", name: "Premium Plan", price: 100, status: "Active" },
          ],
          pagination: {
            currentPage: 2,
            totalPages: 3,
            hasNextPage: true,
            hasPrevPage: true,
          },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    rerender(<PlansPage />);

    // Click Previous
    const activePrevBtn = screen.getByText("Previous");
    fireEvent.click(activePrevBtn);

    // Should navigate back to page 1
    expect(useFetchAdminPlans).toHaveBeenCalledWith(1, 10);
  });

  it("shows 'No plans found.' when data is empty", () => {
    (useFetchAdminPlans as jest.Mock).mockReturnValue({
      data: {
        data: {
          plans: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<PlansPage />);
    expect(screen.getByText("No plans found.")).toBeInTheDocument();
  });
});
