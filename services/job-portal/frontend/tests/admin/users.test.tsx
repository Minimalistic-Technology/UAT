import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Page from "@/app/admin-dashboard/users/page";
import { useFetchAllUsers } from "@/features/admin/hooks/use-user";
import "@testing-library/jest-dom";

// Mock the hook
jest.mock("@/features/admin/hooks/use-user", () => ({
  useFetchAllUsers: jest.fn(),
}));

describe("Admin User Management Page", () => {
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => "blob:fake-url");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders loading state initially", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    });

    const { container } = render(<Page />);

    // Check that skeletons are rendered (we check for the skeleton elements or just the table structure)
    expect(screen.queryByTestId("data-table-row")).not.toBeInTheDocument();

    // A skeleton should be present
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state when fetch fails", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<Page />);

    expect(
      screen.getByText("Failed to load user management data."),
    ).toBeInTheDocument();

    // Retry button works
    fireEvent.click(screen.getByText("Retry"));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders users when fetch succeeds", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
            },
            {
              _id: "2",
              firstName: "Jane",
              lastName: "Smith",
              email: "jane@example.com",
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

    // Page title
    expect(screen.getByText("User Management")).toBeInTheDocument();

    // Users are rendered using our mocked UserTableRow
    const userRows = screen.getAllByTestId("data-table-row");
    expect(userRows).toHaveLength(2);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("filters users when search term is entered", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
            },
            {
              _id: "2",
              firstName: "Jane",
              lastName: "Smith",
              email: "jane@example.com",
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

    // Ensure both are present initially
    expect(screen.getAllByTestId("data-table-row")).toHaveLength(2);

    // Search for 'Jane'
    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "Jane" } });

    // Only Jane should be visible
    expect(screen.getAllByTestId("data-table-row")).toHaveLength(1);
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("triggers CSV export when Export CSV is clicked", () => {
    const mockClick = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
              createdAt: "2023-01-01",
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

    const exportBtn = screen.getByText("Export CSV");
    fireEvent.click(exportBtn);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    mockClick.mockRestore();
  });

  it("handles empty results and shows 'No results found.'", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [],
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
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("disables previous and next buttons correctly based on pagination", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
            },
          ],
          pagination: {
            currentPage: 1,
            totalPages: 2,
            hasNextPage: true,
            hasPrevPage: false,
          },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<Page />);

    const prevBtn = screen.getByText("Previous");
    const nextBtn = screen.getByText("Next");

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Clicking next should trigger the hook to be called with page 2 (Wait, hook is mocked so it just re-renders, but the state `page` is internal to the component, it changes to 2 and would re-call `useFetchAllUsers` if not mocked to return the same thing. However, checking if the button is enabled is sufficient for UI tests).
    fireEvent.click(nextBtn);
    // Since useFetchAllUsers is mocked, it will be called with (2, 10)
    expect(useFetchAllUsers).toHaveBeenCalledWith(2, 10);
  });

  it("shows 'No results found.' when search yields no matches", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
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

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "Nonexistent" } });

    expect(screen.queryByTestId("data-table-row")).not.toBeInTheDocument();
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("filters users when searching by email", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
            },
            {
              _id: "2",
              firstName: "Jane",
              lastName: "Smith",
              email: "testme@company.com",
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

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "testme@company.com" } });

    expect(screen.getAllByTestId("data-table-row")).toHaveLength(1);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("performs case-insensitive search", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
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

    const searchInput = screen.getByPlaceholderText("Search users...");
    fireEvent.change(searchInput, { target: { value: "jOhN D" } });

    expect(screen.getAllByTestId("data-table-row")).toHaveLength(1);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("navigates between pages using pagination buttons", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
            },
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

    const nextBtn = screen.getByText("Next");
    fireEvent.click(nextBtn);
    expect(useFetchAllUsers).toHaveBeenCalledWith(2, 10);

    // Re-mock to simulate being on page 2
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "2",
              firstName: "Jane",
              lastName: "Doe",
              email: "jane@example.com",
            },
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

    const prevBtn = screen.getByText("Previous");
    fireEvent.click(prevBtn);
    expect(useFetchAllUsers).toHaveBeenCalledWith(1, 10);
  });

  it("validates CSV content correctly", () => {
    const mockClick = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    // Mock Blob to intercept its content
    const originalBlob = global.Blob;
    let blobContent: any[] = [];
    global.Blob = jest
      .fn()
      .mockImplementation((content: any[], options: any) => {
        blobContent = content;
        return new originalBlob(content, options);
      });

    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
              companyRole: "admin",
              isActive: true,
              createdAt: "2023-01-01T00:00:00.000Z",
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

    const exportBtn = screen.getByText("Export CSV");
    fireEvent.click(exportBtn);

    expect(blobContent.length).toBeGreaterThan(0);
    expect(blobContent[0]).toContain("User,Email,Role,Status,Joined"); // Headers
    expect(blobContent[0]).toContain('"John Doe"');
    expect(blobContent[0]).toContain('"john@example.com"');
    expect(blobContent[0]).toContain('"Admin"');
    expect(blobContent[0]).toContain('"Active"');

    // Restore Blob
    global.Blob = originalBlob;
    mockClick.mockRestore();
  });

  it("handles invalid or incomplete user data gracefully", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            { _id: "1", firstName: "John" }, // Missing lastName and email
            { _id: "2" }, // Missing most fields
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

    const userRows = screen.getAllByTestId("data-table-row");
    expect(userRows).toHaveLength(2);
    expect(userRows[0]).toHaveTextContent("John");
  });

  it("meets basic accessibility standards", () => {
    (useFetchAllUsers as jest.Mock).mockReturnValue({
      data: {
        data: {
          users: [
            {
              _id: "1",
              firstName: "John",
              lastName: "Doe",
              email: "john@example.com",
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

    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Export CSV" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });
});
