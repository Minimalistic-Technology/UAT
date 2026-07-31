import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TeamManagementPage from "@/app/employer-dashboard/team/page";
import AddTeamMemberPage from "@/app/employer-dashboard/team/add/page";
import UpdateTeamMemberPage from "@/app/employer-dashboard/team/update/[id]/page";
import {
  useGetAllEmployees,
  useDeleteEmployee,
  useCreateEmployee,
  useGetEmployeeById,
  useUpdateEmployee,
} from "@/features/employer/hooks/use-company";
import { useRouter, useParams } from "next/navigation";

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("@/features/employer/hooks/use-company", () => ({
  useGetAllEmployees: jest.fn(),
  useDeleteEmployee: jest.fn(),
  useCreateEmployee: jest.fn(),
  useGetEmployeeById: jest.fn(),
  useUpdateEmployee: jest.fn(),
}));

describe("Team Management Test Suite", () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  describe("Team List Page", () => {
    const mockDeleteMutate = jest.fn();

    beforeEach(() => {
      (useDeleteEmployee as jest.Mock).mockReturnValue({
        mutate: mockDeleteMutate,
        isPending: false,
      });
    });

    it("renders loading skeleton correctly", () => {
      (useGetAllEmployees as jest.Mock).mockReturnValue({
        isLoading: true,
      });

      const { container } = render(<TeamManagementPage />);
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("renders error state correctly", () => {
      (useGetAllEmployees as jest.Mock).mockReturnValue({
        isLoading: false,
        isError: true,
        error: { response: { data: { message: "Server error" } } },
      });

      render(<TeamManagementPage />);
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });

    it("renders empty state correctly", () => {
      (useGetAllEmployees as jest.Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: { data: { members: [] } },
      });

      render(<TeamManagementPage />);
      expect(screen.getByText("No team members")).toBeInTheDocument();
      expect(screen.getByText("Add New Employee")).toBeInTheDocument();
    });

    it("renders employee list correctly", () => {
      const mockEmployees = [
        {
          _id: "emp-1",
          user: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            avatar: "",
          },
          role: "manager",
          isActive: true,
        },
        {
          _id: "emp-2",
          user: {
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            avatar: "",
          },
          role: "employee",
          isActive: false,
        },
      ];

      (useGetAllEmployees as jest.Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: { data: { members: mockEmployees } },
      });

      render(<TeamManagementPage />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Inactive")).toBeInTheDocument();
    });

    it("navigates to add employee page", () => {
      (useGetAllEmployees as jest.Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: { data: { members: [] } },
      });

      render(<TeamManagementPage />);

      const addButton = screen.getByText("Add New Employee");
      fireEvent.click(addButton);

      expect(mockRouterPush).toHaveBeenCalledWith(
        "/employer-dashboard/team/add",
      );
    });

    it("navigates to update employee page", () => {
      const mockEmployees = [
        {
          _id: "emp-1",
          user: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            avatar: "",
          },
          role: "manager",
          isActive: true,
        },
      ];

      (useGetAllEmployees as jest.Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: { data: { members: mockEmployees } },
      });

      render(<TeamManagementPage />);

      // Hover to trigger tooltip logic if needed, but we can just click the update button directly
      // In Tooltip components from radix, it might require extra care, but buttons are usually accessible
      const updateButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector(".lucide-pencil"));
      fireEvent.click(updateButtons[0]);

      expect(mockRouterPush).toHaveBeenCalledWith(
        "/employer-dashboard/team/update/emp-1",
      );
    });

    it("handles delete employee workflow", () => {
      const mockEmployees = [
        {
          _id: "emp-1",
          user: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            avatar: "",
          },
          role: "manager",
          isActive: true,
        },
      ];

      (useGetAllEmployees as jest.Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: { data: { members: mockEmployees } },
      });

      render(<TeamManagementPage />);

      // Find delete button
      const deleteButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector(".lucide-trash-2"));
      fireEvent.click(deleteButtons[0]);

      // Confirm dialog should appear
      const confirmButton = screen.getByText("Confirm");
      const cancelButton = screen.getByText("Cancel");

      expect(confirmButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();

      // Click cancel
      fireEvent.click(cancelButton);
      expect(screen.queryByText("Confirm")).not.toBeInTheDocument();

      // Click delete again and confirm
      fireEvent.click(
        screen
          .getAllByRole("button")
          .filter((btn) => btn.querySelector(".lucide-trash-2"))[0],
      );
      fireEvent.click(screen.getByText("Confirm"));

      expect(mockDeleteMutate).toHaveBeenCalledWith(
        "emp-1",
        expect.any(Object),
      );
    });
  });

  describe("Add Team Member Page", () => {
    const mockCreateMutate = jest.fn();

    beforeEach(() => {
      (useCreateEmployee as jest.Mock).mockReturnValue({
        mutate: mockCreateMutate,
        isPending: false,
      });
    });

    it("renders the add member form", () => {
      render(<AddTeamMemberPage />);
      expect(screen.getByText("Add Team Member")).toBeInTheDocument();
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Temporary Password")).toBeInTheDocument();
    });

    it("shows validation errors on empty submission", async () => {
      render(<AddTeamMemberPage />);

      const submitButton = screen.getByRole("button", { name: "Add Member" });
      fireEvent.submit(submitButton.closest("form")!);

      await waitFor(() => {
        expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Password must be at least 6 characters/i),
        ).toBeInTheDocument();
      });

      expect(mockCreateMutate).not.toHaveBeenCalled();
    });

    it("submits the form successfully", async () => {
      render(<AddTeamMemberPage />);

      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Alice" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "Smith" },
      });
      fireEvent.change(screen.getByLabelText("Email Address"), {
        target: { value: "alice@example.com" },
      });
      fireEvent.change(screen.getByLabelText("Temporary Password"), {
        target: { value: "password123" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Member" });
      fireEvent.submit(submitButton.closest("form")!);

      await waitFor(() => {
        expect(mockCreateMutate).toHaveBeenCalledWith({
          firstName: "Alice",
          lastName: "Smith",
          email: "alice@example.com",
          password: "password123",
        });
      });
    });

    it("toggles password visibility", () => {
      render(<AddTeamMemberPage />);

      const passwordInput = screen.getByLabelText("Temporary Password");
      expect(passwordInput).toHaveAttribute("type", "password");

      const passwordContainer = passwordInput.parentElement;
      const toggleButton = passwordContainer!.querySelector("button");

      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute("type", "text");
    });
  });

  describe("Update Team Member Page", () => {
    const mockUpdateMutate = jest.fn();
    const mockMemberId = "emp-123";

    beforeEach(() => {
      (useParams as jest.Mock).mockReturnValue({ id: mockMemberId });
      (useUpdateEmployee as jest.Mock).mockReturnValue({
        mutate: mockUpdateMutate,
        isPending: false,
      });
    });

    it("renders loading state correctly", () => {
      (useGetEmployeeById as jest.Mock).mockReturnValue({
        isLoading: true,
      });

      render(<UpdateTeamMemberPage />);
      expect(screen.queryByText("Update Team Member")).not.toBeInTheDocument();
    });

    it("renders error state correctly", () => {
      (useGetEmployeeById as jest.Mock).mockReturnValue({
        isLoading: false,
        isError: true,
      });

      render(<UpdateTeamMemberPage />);
      expect(
        screen.getByText("Failed to load member details."),
      ).toBeInTheDocument();
    });

    it("renders form with pre-filled data", () => {
      const mockMember = {
        user: { firstName: "Bob", lastName: "Jones", email: "bob@example.com" },
        isActive: true,
      };

      (useGetEmployeeById as jest.Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: { data: { member: mockMember } },
      });

      render(<UpdateTeamMemberPage />);

      expect(screen.getByLabelText("First Name")).toHaveValue("Bob");
      expect(screen.getByLabelText("Last Name")).toHaveValue("Jones");
      expect(screen.getByLabelText("Email Address")).toHaveValue(
        "bob@example.com",
      );
      expect(screen.getByLabelText("Email Address")).toBeDisabled();

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeChecked();
    });

    it("shows validation errors for empty fields on submit", async () => {
      const mockMember = {
        user: { firstName: "Bob", lastName: "Jones", email: "bob@example.com" },
        isActive: true,
      };

      (useGetEmployeeById as jest.Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: { data: { member: mockMember } },
      });

      render(<UpdateTeamMemberPage />);

      // Clear fields
      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "" },
      });
      fireEvent.change(screen.getByLabelText("Last Name"), {
        target: { value: "" },
      });

      const submitButton = screen.getByRole("button", { name: "Save Changes" });
      fireEvent.submit(submitButton.closest("form")!);

      await waitFor(() => {
        expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
      });

      expect(mockUpdateMutate).not.toHaveBeenCalled();
    });

    it("submits the updated form successfully", async () => {
      const mockMember = {
        user: { firstName: "Bob", lastName: "Jones", email: "bob@example.com" },
        isActive: true,
      };

      (useGetEmployeeById as jest.Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: { data: { member: mockMember } },
      });

      render(<UpdateTeamMemberPage />);

      fireEvent.change(screen.getByLabelText("First Name"), {
        target: { value: "Bobby" },
      });

      const switchEl = screen.getByRole("switch");
      fireEvent.click(switchEl);

      const submitButton = screen.getByRole("button", { name: "Save Changes" });
      fireEvent.submit(submitButton.closest("form")!);

      await waitFor(() => {
        expect(mockUpdateMutate).toHaveBeenCalledWith({
          id: mockMemberId,
          data: {
            firstName: "Bobby",
            lastName: "Jones",
            isActive: false,
          },
        });
      });
    });
  });
});
