import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MyApplicationsPage from "@/app/user-dashboard/applications/page";
import ViewApplicationPage from "@/app/user-dashboard/applications/[applicationId]/page";
import {
  useGetMyApplications,
  useGetApplicationById,
} from "@/features/user/hooks/use-job-application";
import { useParams, useRouter } from "next/navigation";
import "@testing-library/jest-dom";

// Mock hooks
jest.mock("@/features/user/hooks/use-job-application", () => ({
  useGetMyApplications: jest.fn(),
  useGetApplicationById: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock ResizeObserver for any UI components that might need it
if (typeof window !== "undefined") {
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
}

// Mock window.confirm
const mockConfirm = jest.spyOn(window, "confirm");

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

const mockApplicationsData = {
  data: {
    applications: [
      {
        _id: "app1",
        listing: {
          title: "Frontend Developer",
          employmentType: "full_time",
          location: { city: "New York" },
          workMode: "remote",
          company: { name: "Tech Corp" },
        },
        status: "pending",
        createdAt: "2023-01-01T10:00:00.000Z",
      },
      {
        _id: "app2",
        listing: {
          title: "Backend Engineer",
          employmentType: "part_time",
          location: { city: "San Francisco" },
          workMode: "onsite",
          company: { name: "Startup Inc" },
        },
        status: "accepted",
        createdAt: "2023-01-02T10:00:00.000Z",
      },
    ],
    pagination: {
      currentPage: 1,
      totalPages: 2,
      totalItems: 2,
    },
  },
};

const mockSingleApplicationData = {
  data: {
    _id: "app1",
    listing: {
      title: "Frontend Developer",
      employmentType: "full_time",
      location: { city: "New York" },
      company: { name: "Tech Corp" },
    },
    listingType: "full_time",
    status: "pending",
    createdAt: "2023-01-01T10:00:00.000Z",
    resume: "https://example.com/resume.pdf",
    interviewDate: "2023-01-15T10:00:00.000Z",
    statusHistory: [
      {
        status: "pending",
        changedAt: "2023-01-01T10:00:00.000Z",
        note: "Application submitted",
      },
    ],
  },
};

describe("Applications Pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe("MyApplicationsPage", () => {
    it("renders loading skeleton initially", () => {
      (useGetMyApplications as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      const { container } = render(<MyApplicationsPage />);
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("renders error state and retry button", () => {
      const mockRefetch = jest.fn();
      (useGetMyApplications as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      });

      render(<MyApplicationsPage />);
      expect(
        screen.getByText("Failed to load applications"),
      ).toBeInTheDocument();

      const retryBtn = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryBtn);
      expect(mockRefetch).toHaveBeenCalled();
    });

    it("renders empty state when no applications", () => {
      (useGetMyApplications as jest.Mock).mockReturnValue({
        data: {
          data: {
            applications: [],
            pagination: { totalItems: 0, totalPages: 0 },
          },
        },
        isLoading: false,
        isError: false,
      });

      render(<MyApplicationsPage />);
      expect(screen.getByText("No applications found.")).toBeInTheDocument();
    });

    it("renders applications list correctly", () => {
      (useGetMyApplications as jest.Mock).mockReturnValue({
        data: mockApplicationsData,
        isLoading: false,
        isError: false,
      });

      render(<MyApplicationsPage />);
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
      expect(screen.getByText("Tech Corp")).toBeInTheDocument();
      expect(screen.getByText("Remote")).toBeInTheDocument();
      expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
      expect(screen.getByText("Startup Inc")).toBeInTheDocument();
    });

    it("handles pagination clicks", () => {
      (useGetMyApplications as jest.Mock).mockReturnValue({
        data: mockApplicationsData,
        isLoading: false,
        isError: false,
      });

      render(<MyApplicationsPage />);

      const nextBtn = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextBtn);

      // Ensure component re-renders without error on Next click
      expect(nextBtn).toBeInTheDocument();
    });
  });

  describe("ViewApplicationPage", () => {
    beforeEach(() => {
      (useParams as jest.Mock).mockReturnValue({ applicationId: "app1" });
    });

    it("renders loading skeleton initially", () => {
      (useGetApplicationById as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      render(<ViewApplicationPage />);
      expect(screen.queryByText("Back")).not.toBeInTheDocument();
    });

    it("renders error state when not found", () => {
      (useGetApplicationById as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      render(<ViewApplicationPage />);
      expect(screen.getByText("Application Not Found")).toBeInTheDocument();

      const backBtn = screen.getByRole("button", {
        name: /back to applications/i,
      });
      fireEvent.click(backBtn);
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/user-dashboard/applications",
      );
    });

    it("renders application details correctly", () => {
      (useGetApplicationById as jest.Mock).mockReturnValue({
        data: mockSingleApplicationData,
        isLoading: false,
        isError: false,
      });

      render(<ViewApplicationPage />);
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
      expect(screen.getByText("Tech Corp")).toBeInTheDocument();
      expect(screen.getByText(/interview scheduled:/i)).toBeInTheDocument();
      expect(screen.getByText("Application Timeline")).toBeInTheDocument();
    });

    it("handles back button click", () => {
      (useGetApplicationById as jest.Mock).mockReturnValue({
        data: mockSingleApplicationData,
        isLoading: false,
        isError: false,
      });

      render(<ViewApplicationPage />);
      const backBtn = screen.getByRole("button", { name: /back/i });
      fireEvent.click(backBtn);
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });
});
