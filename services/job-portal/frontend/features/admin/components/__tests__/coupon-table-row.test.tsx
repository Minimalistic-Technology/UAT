import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CouponTableRow } from "../coupon-table-row";
import { useDeleteCoupon, useUpdateCoupon } from "@/features/admin/hooks/use-coupon";
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

jest.mock("@/features/admin/hooks/use-coupon", () => ({
  useDeleteCoupon: jest.fn(),
  useUpdateCoupon: jest.fn(),
}));

const mockCoupon = {
  _id: "coupon-123",
  code: "SUMMER50",
  type: "percentage",
  value: 50,
  maxUses: 100,
  isActive: true,
  expiryDate: "2026-12-31T23:59:59.000Z",
  createdAt: "2026-06-07T10:00:00Z",
  updatedAt: "2026-06-07T10:00:00Z",
};

describe("CouponTableRow (Edit and Delete)", () => {
  const mockDeleteCoupon = jest.fn();
  const mockUpdateCoupon = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDeleteCoupon as jest.Mock).mockReturnValue({
      mutate: mockDeleteCoupon,
      isPending: false,
    });
    (useUpdateCoupon as jest.Mock).mockReturnValue({
      mutate: mockUpdateCoupon,
      isPending: false,
    });
  });

  const renderComponent = (coupon = mockCoupon) => {
    return render(
      <Table>
        <TableBody>
          <CouponTableRow coupon={coupon as any} />
        </TableBody>
      </Table>
    );
  };

  it("renders coupon data correctly", () => {
    renderComponent();
    expect(screen.getByText("SUMMER50")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("opens delete confirmation dialog and triggers delete mutation", async () => {
    renderComponent();
    
    // Find delete button
    const deleteBtn = screen.getAllByRole("button")[1];
    fireEvent.click(deleteBtn);

    // Dialog appears
    expect(screen.getByText("Are you absolutely sure?")).toBeInTheDocument();
    
    const confirmBtn = screen.getByRole("button", { name: "Delete Coupon" });
    fireEvent.click(confirmBtn);

    expect(mockDeleteCoupon).toHaveBeenCalledWith("coupon-123");
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
    expect(mockDeleteCoupon).not.toHaveBeenCalled();
  });

  it("opens edit dialog and displays coupon data", async () => {
    renderComponent();
    
    // Edit button
    const editBtn = screen.getAllByRole("button")[0];
    fireEvent.click(editBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit Coupon")).toBeInTheDocument();

    // Verify fields are populated
    await waitFor(() => {
      expect(screen.getByLabelText("Coupon Code")).toHaveValue("SUMMER50");
    });
    expect(screen.getByLabelText(/Discount Value/)).toHaveValue(50);
  });

  it("submits updated coupon data", async () => {
    renderComponent();
    
    const editBtn = screen.getAllByRole("button")[0];
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByLabelText("Coupon Code")).toHaveValue("SUMMER50");
    });

    // Change coupon code
    fireEvent.change(screen.getByLabelText("Coupon Code"), { target: { value: "WINTER50" } });
    
    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateCoupon).toHaveBeenCalledTimes(1);
    });

    const calledWith = mockUpdateCoupon.mock.calls[0];
    expect(calledWith[0].id).toBe("coupon-123");
    expect(calledWith[0].data.code).toBe("WINTER50");
  });
});
