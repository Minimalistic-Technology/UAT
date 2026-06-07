import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PlanTableRow } from "../plan-table-row";
import { useDeletePlan, useUpdatePlan } from "@/features/admin/hooks/use-plan";
import { Table, TableBody } from "@/components/ui/table";
import "@testing-library/jest-dom";

// Polyfill for Radix UI (Select, Dialog, AlertDialog) in JSDOM
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

jest.mock("@/features/admin/hooks/use-plan", () => ({
  useDeletePlan: jest.fn(),
  useUpdatePlan: jest.fn(),
}));

const mockPlan = {
  _id: "plan-123",
  name: "Pro Plan",
  price: 100,
  currency: "USD",
  durationDays: 30,
  jobPostLimit: 10,
  teamMemberLimit: 5,
  postValidityDays: 15,
  isActive: true,
  isFeatured: false,
  isDefault: false,
  displayOrder: 1,
  allowResumeDownload: true,
  features: ["Feature 1"],
  createdAt: "2026-06-07T10:00:00Z",
  updatedAt: "2026-06-07T10:00:00Z",
};

describe("PlanTableRow (Edit and Delete)", () => {
  const mockDeletePlan = jest.fn();
  const mockUpdatePlan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDeletePlan as jest.Mock).mockReturnValue({
      mutate: mockDeletePlan,
      isPending: false,
    });
    (useUpdatePlan as jest.Mock).mockReturnValue({
      mutate: mockUpdatePlan,
      isPending: false,
    });
  });

  const renderComponent = (plan = mockPlan) => {
    return render(
      <Table>
        <TableBody>
          <PlanTableRow plan={plan as any} />
        </TableBody>
      </Table>
    );
  };

  it("renders plan data correctly", () => {
    renderComponent();
    expect(screen.getByText("Pro Plan")).toBeInTheDocument();
    expect(screen.getByText("USD 100")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("opens delete confirmation dialog and triggers delete mutation", async () => {
    renderComponent();
    
    // Find delete button by the Trash2 icon container
    // It's the second button (first is edit)
    const deleteBtn = screen.getAllByRole("button")[1];
    fireEvent.click(deleteBtn);

    // Dialog appears
    expect(screen.getByText("Are you absolutely sure?")).toBeInTheDocument();
    
    const confirmBtn = screen.getByRole("button", { name: "Delete Plan" });
    fireEvent.click(confirmBtn);

    expect(mockDeletePlan).toHaveBeenCalledWith("plan-123");
  });

  it("cancels deletion when cancel is clicked", async () => {
    renderComponent();
    
    const deleteBtn = screen.getAllByRole("button")[1];
    fireEvent.click(deleteBtn);

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText("Are you absolutely sure?")).not.toBeInTheDocument();
    });
    expect(mockDeletePlan).not.toHaveBeenCalled();
  });

  it("opens edit dialog and displays plan data", async () => {
    renderComponent();
    
    // Edit button
    const editBtn = screen.getAllByRole("button")[0];
    fireEvent.click(editBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit Plan")).toBeInTheDocument();

    // Verify fields are populated
    await waitFor(() => {
      expect(screen.getByLabelText("Plan Name")).toHaveValue("Pro Plan");
    });
    expect(screen.getByLabelText("Price")).toHaveValue(100);
    expect(screen.getByLabelText(/Job Post Visibility/i)).toHaveValue(15);
  });

  it("submits updated plan data", async () => {
    renderComponent();
    
    const editBtn = screen.getAllByRole("button")[0];
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByLabelText("Plan Name")).toHaveValue("Pro Plan");
    });

    // Change plan name
    fireEvent.change(screen.getByLabelText("Plan Name"), { target: { value: "Pro Plan Updated" } });
    
    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdatePlan).toHaveBeenCalledTimes(1);
    });

    const calledWith = mockUpdatePlan.mock.calls[0];
    expect(calledWith[0].id).toBe("plan-123");
    expect(calledWith[0].data.name).toBe("Pro Plan Updated");
  });
});
