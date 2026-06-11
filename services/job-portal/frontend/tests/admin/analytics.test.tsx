import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AnalyticsPage from "@/app/admin-dashboard/analytics/page";
import { useAdminAnalytics } from "@/features/admin/hooks/use-analytics";
import "@testing-library/jest-dom";

// Mock the hook
jest.mock("@/features/admin/hooks/use-analytics", () => ({
  useAdminAnalytics: jest.fn(),
}));

// Mock Recharts to avoid SVG/DOM rendering issues in JSDOM
jest.mock("recharts", () => ({
  Bar: () => null,
  BarChart: () => <div data-testid="bar-chart" />,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Line: () => null,
  LineChart: () => <div data-testid="line-chart" />,
  Area: () => null,
  AreaChart: () => <div data-testid="area-chart" />,
}));

// Mock ChartContainer from UI components since it might have ResizeObserver issues
jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}));

// Mock URL.createObjectURL for the CSV export test
const mockCreateObjectURL = jest.fn();
if (typeof window !== "undefined") {
  window.URL.createObjectURL = mockCreateObjectURL;
}

const mockData = {
  success: true,
  data: {
    summary: {
      totalRevenue: 150500,
      revenueGrowth: 15.5,
      activeUsers: 5200,
      jobListings: 125,
      internshipListings: 48,
      kycPending: 14,
      totalCompanies: 55,
      totalApplications: 1250,
    },
    graphs: {
      revenue: [{ name: "Jan", revenue: 10000 }, { name: "Feb", revenue: 15000 }],
      users: [{ name: "Jan", users: 500 }, { name: "Feb", users: 600 }],
      jobs: [{ name: "Jan", jobs: 10 }, { name: "Feb", jobs: 20 }],
      internships: [{ name: "Jan", internships: 5 }, { name: "Feb", internships: 8 }],
    },
  },
};

describe("Admin Analytics Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReset();
    mockCreateObjectURL.mockReturnValue("blob:http://localhost/mock-uuid");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders loading state initially", () => {
    (useAdminAnalytics as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<AnalyticsPage />);
    
    // Check for loader by finding the animate-spin class or looking for specific div structure
    const loader = container.querySelector(".animate-spin");
    expect(loader).toBeInTheDocument();
  });

  it("renders error state when hook returns an error", () => {
    (useAdminAnalytics as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
    });

    render(<AnalyticsPage />);
    expect(screen.getByText(/Failed to load advanced analytics. Please refresh./i)).toBeInTheDocument();
  });

  it("renders error state when API success is false", () => {
    (useAdminAnalytics as jest.Mock).mockReturnValue({
      data: { success: false, data: null },
      isLoading: false,
      error: null,
    });

    render(<AnalyticsPage />);
    expect(screen.getByText(/Failed to load advanced analytics. Please refresh./i)).toBeInTheDocument();
  });

  it("renders the analytics dashboard correctly when data is successfully fetched", () => {
    (useAdminAnalytics as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<AnalyticsPage />);

    // Check Header and Titles
    expect(screen.getByText("Advanced Intelligence")).toBeInTheDocument();
    
    // Check primary KPIs
    expect(screen.getByText("₹1,50,500")).toBeInTheDocument(); // Format logic might slightly differ by locale, testing basic presence or value
    expect(screen.getByText("5,200")).toBeInTheDocument(); // active users
    
    // Check Growth metric text
    expect(screen.getByText(/15.5% accelerated growth vs last month/i)).toBeInTheDocument();

    // Check secondary KPIs using the StatusCard labels and values
    expect(screen.getByText("Active Jobs")).toBeInTheDocument();
    expect(screen.getByText("125")).toBeInTheDocument();

    expect(screen.getByText("Internships")).toBeInTheDocument();
    expect(screen.getByText("48")).toBeInTheDocument();

    expect(screen.getByText("Companies")).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();

    expect(screen.getByText("Total Apps")).toBeInTheDocument();
    expect(screen.getByText("1,250")).toBeInTheDocument();

    expect(screen.getByText("KYC Tasks")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();

    // Check Graph Headings
    expect(screen.getByText("Revenue Flow")).toBeInTheDocument();
    expect(screen.getByText("User Acquisition")).toBeInTheDocument();
    expect(screen.getByText("Opportunity Market Dynamics")).toBeInTheDocument();

    // Verify mocked charts are rendered
    expect(screen.getAllByTestId("area-chart").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("bar-chart").length).toBeGreaterThan(0);
  });

  it("triggers CSV export when clicking the export button", () => {
    (useAdminAnalytics as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    // Mock HTMLAnchorElement click
    const mockClick = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "a") {
        const anchor = originalCreateElement("a");
        anchor.click = mockClick;
        return anchor;
      }
      return originalCreateElement(tagName);
    });

    // Mock Blob to intercept the constructor
    const originalBlob = global.Blob;
    let blobContent: any[] = [];
    global.Blob = class MockBlob extends originalBlob {
      constructor(content: any[], options?: any) {
        super(content, options);
        blobContent = content;
      }
    } as any;

    render(<AnalyticsPage />);

    const exportButton = screen.getByText("Export Report");
    fireEvent.click(exportButton);

    // Verify Blob was created with the correct data
    expect(blobContent.length).toBeGreaterThan(0);
    const csvString = blobContent[0];
    expect(csvString).toContain("Platform Analytics Report");
    expect(csvString).toContain("Total Revenue (INR),150500");
    expect(csvString).toContain("Active Users,5200");
    
    // Verify object URL creation and anchor click
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    // Restore Blob and createElement
    global.Blob = originalBlob;
    (document.createElement as jest.Mock).mockRestore();
  });
});
