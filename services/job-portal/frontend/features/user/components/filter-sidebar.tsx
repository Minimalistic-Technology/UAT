"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useJobFilters } from "@/hooks/use-job-filter";

export function FilterSidebar() {
  const { filters, updateParams } = useJobFilters();

  const toggleArrayFilter = (key: string, value: string) => {
    const currentArray = (filters as any)[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];

    const paramsToUpdate: any = { [key]: newArray };

    if (key === "salaryRanges") {
      let min = Infinity;
      let max = -Infinity;
      if (newArray.length === 0) {
        paramsToUpdate.minSalary = "";
        paramsToUpdate.maxSalary = "";
      } else {
        newArray.forEach((range) => {
          const [rmin, rmax] = range.split("-").map(Number);
          if (rmin < min) min = rmin;
          if (rmax > max) max = rmax;
        });
        paramsToUpdate.minSalary = min * 100000;
        paramsToUpdate.maxSalary = max * 100000;
      }
    }

    if (key === "stipendRanges") {
      let min = Infinity;
      let max = -Infinity;
      const hasUnpaid = newArray.includes("unpaid");
      const ranges = newArray.filter((r) => r !== "unpaid");

      if (newArray.length === 0) {
        paramsToUpdate.minStipend = "";
        paramsToUpdate.maxStipend = "";
        paramsToUpdate.stipendType = "";
      } else {
        if (hasUnpaid) paramsToUpdate.stipendType = "unpaid";
        else paramsToUpdate.stipendType = "";

        if (ranges.length > 0) {
          ranges.forEach((range) => {
            const [rmin, rmax] = range.split("-").map(Number);
            if (rmin < min) min = rmin;
            if (rmax > max) max = rmax;
          });
          paramsToUpdate.minStipend = min * 1000;
          paramsToUpdate.maxStipend = max * 1000;
        } else {
          paramsToUpdate.minStipend = "";
          paramsToUpdate.maxStipend = "";
        }
      }
    }

    updateParams(paramsToUpdate);
  };

  const clearAllFilters = () => {
    updateParams({
      workMode: [],
      experienceRanges: [],
      roleCategory: [],
      companyType: [],
      durationMonths: [],
      salaryRanges: [],
      stipendRanges: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 h-auto cursor-pointer p-0 text-sm font-semibold hover:bg-transparent"
          onClick={clearAllFilters}
        >
          Clear All
        </Button>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[
          "workMode",
          "experience",
          "department",
          "salary",
          "companyType",
          "stipend",
          "duration",
        ]}
        className="w-full"
      >
        <AccordionItem value="workMode">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Work mode
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {[
                { label: "Work from office", value: "work from office" },
                { label: "Hybrid", value: "hybrid" },
                { label: "Remote", value: "remote" },
                {
                  label: "Temporary Work from Home",
                  value: "temporary work from home",
                },
              ].map((item) => (
                <div key={item.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`wm-${item.value}`}
                    checked={filters.workMode.includes(item.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("workMode", item.value)
                    }
                  />
                  <label
                    htmlFor={`wm-${item.value}`}
                    className="cursor-pointer text-sm leading-none font-medium"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Experience
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {[
                { label: "0-2 Years", value: "0-2" },
                { label: "2-4 Years", value: "2-4" },
                { label: "4-6 Years", value: "4-6" },
                { label: "6-8 Years", value: "6-8" },
                { label: "8+ Years", value: "8-20" },
              ].map((item) => (
                <div key={item.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`exp-${item.value}`}
                    checked={filters.experienceRanges?.includes(item.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("experienceRanges", item.value)
                    }
                  />
                  <label
                    htmlFor={`exp-${item.value}`}
                    className="cursor-pointer text-sm leading-none font-medium"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="department">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Department
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {[
                {
                  label: "Engineering - Software",
                  value: "software_development",
                },
                { label: "Sales & Business Dev", value: "sales" },
                { label: "Customer Success", value: "customer_support" },
                { label: "Finance & Accounting", value: "finance" },
              ].map((item) => (
                <div key={item.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`dept-${item.value}`}
                    checked={filters.roleCategory.includes(item.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("roleCategory", item.value)
                    }
                  />
                  <label
                    htmlFor={`dept-${item.value}`}
                    className="cursor-pointer text-sm leading-none font-medium"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="salary">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Salary
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {[
                { label: "0-3 Lakhs", value: "0-3" },
                { label: "3-6 Lakhs", value: "3-6" },
                { label: "6-10 Lakhs", value: "6-10" },
                { label: "10-15 Lakhs", value: "10-15" },
              ].map((item) => (
                <div key={item.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`sal-${item.value}`}
                    checked={filters.salaryRanges.includes(item.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("salaryRanges", item.value)
                    }
                  />
                  <label
                    htmlFor={`sal-${item.value}`}
                    className="cursor-pointer text-sm leading-none font-medium"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="companyType">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Company type
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {[
                { label: "Foreign MNC", value: "foreign mnc" },
                { label: "Corporate", value: "corporate" },
                { label: "Indian MNC", value: "indian mnc" },
                { label: "Startup", value: "startup" },
              ].map((item) => (
                <div key={item.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`ct-${item.value}`}
                    checked={filters.companyType.includes(item.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("companyType", item.value)
                    }
                  />
                  <label
                    htmlFor={`ct-${item.value}`}
                    className="cursor-pointer text-sm leading-none font-medium"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stipend">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Stipend
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {[
                { label: "Unpaid", value: "unpaid" },
                { label: "0-10k", value: "0-10" },
                { label: "10k-20k", value: "10-20" },
                { label: "20k-30k", value: "20-30" },
              ].map((item) => (
                <div key={item.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`stipend-${item.value}`}
                    checked={filters.stipendRanges.includes(item.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("stipendRanges", item.value)
                    }
                  />
                  <label
                    htmlFor={`stipend-${item.value}`}
                    className="cursor-pointer text-sm leading-none font-medium"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="duration">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Duration
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {[
                { label: "1 Month", value: "1" },
                { label: "2 Months", value: "2" },
                { label: "3 Months", value: "3" },
                { label: "6 Months", value: "6" },
              ].map((item) => (
                <div key={item.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`dur-${item.value}`}
                    checked={filters.durationMonths.includes(item.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter("durationMonths", item.value)
                    }
                  />
                  <label
                    htmlFor={`dur-${item.value}`}
                    className="cursor-pointer text-sm leading-none font-medium"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
