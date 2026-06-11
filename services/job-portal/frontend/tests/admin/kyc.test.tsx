import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Page from "@/app/admin-dashboard/kyc/page";
import {
  useGetKycApplications,
  useUpdateKycApplicationStatus,
} from "@/features/admin/hooks/use-kyc";
import "@testing-library/jest-dom";

// Mock the hooks
jest.mock("@/features/admin/hooks/use-kyc", () => ({
  useGetKycApplications: jest.fn(),
  useUpdateKycApplicationStatus: jest.fn(),
}));

// Mock the KycTable to isolate page logic
jest.mock("@/features/admin/components/kyc-application-table", () => {
  return {
    KycTable: function MockKycTable({
      applications,
      isLoading,
      isUpdating,
      onUpdateStatus,
    }: any) {
      return (
        <div data-testid="kyc-table">
          {isLoading && (
            <div data-testid="kyc-loading">Loading applications...</div>
          )}
          {!isLoading && applications.length === 0 && (
            <div data-testid="kyc-empty">No applications found.</div>
          )}
          {!isLoading &&
            applications.map((app: any) => (
              <div key={app._id} data-testid="kyc-row">
                <span>{app.companyName}</span>
                <span>{app.status}</span>
                <button
                  data-testid={`approve-${app._id}`}
                  onClick={() => onUpdateStatus(app._id, "approved")}
                  disabled={isUpdating}
                >
                  Approve
                </button>
                <button
                  data-testid={`reject-${app._id}`}
                  onClick={() =>
                    onUpdateStatus(app._id, "rejected", "Invalid docs")
                  }
                  disabled={isUpdating}
                >
                  Reject
                </button>
              </div>
            ))}
        </div>
      );
    },
  };
});

describe("Admin KYC Management Page", () => {
  const mockRefetch = jest.fn();
  const mockUpdateStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUpdateKycApplicationStatus as jest.Mock).mockReturnValue({
      mutate: mockUpdateStatus,
      isPending: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders loading state initially", () => {
    (useGetKycApplications as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    });

    render(<Page />);

    expect(screen.getByText("Employer KYC Applications")).toBeInTheDocument();
    expect(screen.getByTestId("kyc-table")).toBeInTheDocument();
    expect(screen.getByTestId("kyc-loading")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", () => {
    (useGetKycApplications as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<Page />);

    expect(
      screen.getByText("Failed to load KYC applications."),
    ).toBeInTheDocument();

    // Retry button works
    fireEvent.click(screen.getByText("Retry"));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders KYC applications when fetch succeeds", () => {
    (useGetKycApplications as jest.Mock).mockReturnValue({
      data: {
        data: {
          applications: [
            {
              _id: "1",
              companyName: "Tech Corp",
              status: "pending",
              user: { email: "tech@corp.com" },
            },
            {
              _id: "2",
              companyName: "Design LLC",
              status: "approved",
              user: { email: "design@llc.com" },
            },
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

    render(<Page />);

    const rows = screen.getAllByTestId("kyc-row");
    expect(rows).toHaveLength(2);
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Design LLC")).toBeInTheDocument();
  });

  it("changes status filter and resets page to 1", async () => {
    (useGetKycApplications as jest.Mock).mockReturnValue({
      data: {
        data: {
          applications: [],
          pagination: {
            currentPage: 2,
            totalPages: 5,
            hasNextPage: true,
            hasPrevPage: true,
          },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<Page />);

    // Check initial hook call
    expect(useGetKycApplications).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
    });

    // Open the select dropdown
    const selectTrigger = screen.getByRole("combobox");
    fireEvent.click(selectTrigger);

    // Select "Pending"
    const pendingOption = screen.getByRole("option", { name: "Pending" });
    fireEvent.click(pendingOption);

    // Hook should be called with updated status filter
    expect(useGetKycApplications).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: "pending",
    });
  });

  it("navigates between pages using pagination buttons", () => {
    (useGetKycApplications as jest.Mock).mockReturnValue({
      data: {
        data: {
          applications: [
            { _id: "1", companyName: "Tech Corp", status: "pending" },
          ],
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

    const { rerender } = render(<Page />);

    const prevBtn = screen.getByText("Previous");
    const nextBtn = screen.getByText("Next");

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Click Next
    fireEvent.click(nextBtn);
    expect(useGetKycApplications).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      status: undefined,
    });

    // Mock page 2 response
    (useGetKycApplications as jest.Mock).mockReturnValue({
      data: {
        data: {
          applications: [
            { _id: "2", companyName: "Design LLC", status: "approved" },
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

    rerender(<Page />);

    // Click Previous
    const activePrevBtn = screen.getByText("Previous");
    fireEvent.click(activePrevBtn);

    // Should navigate back to page 1
    expect(useGetKycApplications).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
    });
  });

  it("calls updateStatus when approve/reject actions are triggered", () => {
    (useGetKycApplications as jest.Mock).mockReturnValue({
      data: {
        data: {
          applications: [
            {
              _id: "1",
              companyName: "Tech Corp",
              status: "pending",
              user: { email: "tech@corp.com" },
            },
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

    render(<Page />);

    // Approve
    const approveBtn = screen.getByTestId("approve-1");
    fireEvent.click(approveBtn);
    expect(mockUpdateStatus).toHaveBeenCalledWith({
      applicationId: "1",
      status: "approved",
      note: undefined,
    });

    // Reject
    const rejectBtn = screen.getByTestId("reject-1");
    fireEvent.click(rejectBtn);
    expect(mockUpdateStatus).toHaveBeenCalledWith({
      applicationId: "1",
      status: "rejected",
      note: "Invalid docs",
    });
  });

  it("shows 'No applications found.' when data is empty", () => {
    (useGetKycApplications as jest.Mock).mockReturnValue({
      data: {
        data: {
          applications: [],
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

    render(<Page />);
    expect(screen.getByTestId("kyc-empty")).toBeInTheDocument();
  });

  it("meets basic accessibility standards", () => {
    (useGetKycApplications as jest.Mock).mockReturnValue({
      data: {
        data: {
          applications: [],
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

    render(<Page />);

    expect(screen.getByText("Employer KYC Applications")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });
});
