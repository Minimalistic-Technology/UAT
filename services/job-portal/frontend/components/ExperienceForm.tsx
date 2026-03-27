import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface ExperienceFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type Location = {
  country: string;
  state: string;
  city: string;
};

type ExperienceFormData = {
  title: string;
  company: string;
  location: Location;
  startDate: string;
  endDate?: string;
  description?: string;
  currentlyWorking: boolean;
};

const locationData = {
  India: {
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Karnataka: ["Bangalore", "Mysore"],
    Gujarat: ["Ahmedabad", "Surat"],
  },
  USA: {
    California: ["San Francisco", "Los Angeles"],
    Texas: ["Austin", "Dallas"],
  },
};

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    defaultValues: initialData || {
      currentlyWorking: false,
      location: {
        country: "",
        state: "",
        city: "",
      },
    },
  });

  const selectedCountry = watch("location.country");
  const selectedState = watch("location.state");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const currentlyWorking = watch("currentlyWorking");

  const states = selectedCountry
    ? Object.keys(locationData[selectedCountry as keyof typeof locationData])
    : [];

  const cities =
    selectedCountry && selectedState
      ? locationData[selectedCountry as keyof typeof locationData][
          selectedState as keyof (typeof locationData)[keyof typeof locationData]
        ]
      : [];

  useEffect(() => {
    if (currentlyWorking) {
      setValue("endDate", "");
    }
  }, [currentlyWorking, setValue]);

  const experienceDuration = useMemo(() => {
    if (!startDate) return null;

    const start = new Date(startDate);
    const end = currentlyWorking ? new Date() : endDate ? new Date(endDate) : null;

    if (!end) return null;

    const diffMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    let result = "";
    if (years > 0) result += `${years} yr${years > 1 ? "s" : ""} `;
    if (months > 0) result += `${months} mo${months > 1 ? "s" : ""}`;

    return result.trim();
  }, [startDate, endDate, currentlyWorking]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 border p-6 rounded-lg bg-gray-50"
    >
      {/* Job + Company */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          {...register("title", { required: "Title is required" })}
          label="Job Title"
          error={errors.title?.message as string}
        />

        <Input
          {...register("company", { required: "Company is required" })}
          label="Company"
          error={errors.company?.message as string}
        />
      </div>

      {/* Location */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>

          <select
            {...register("location.country", { required: "Country is required" })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Country</option>

            {Object.keys(locationData).map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          {errors.location?.country && (
            <p className="text-sm text-red-500">
              {errors.location.country.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>

          <select
            {...register("location.state", { required: "State is required" })}
            disabled={!selectedCountry}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-200"
          >
            <option value="">Select State</option>

            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {errors.location?.state && (
            <p className="text-sm text-red-500">
              {errors.location.state.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>

          <select
            {...register("location.city", { required: "City is required" })}
            disabled={!selectedState}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-200"
          >
            <option value="">Select City</option>

            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {errors.location?.city && (
            <p className="text-sm text-red-500">
              {errors.location.city.message}
            </p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          {...register("startDate", { required: "Start Date is required" })}
          type="month"
          label="Start Month"
          error={errors.startDate?.message as string}
        />

        <Input
          {...register("endDate")}
          type="month"
          label="End Month"
          disabled={currentlyWorking}
        />
      </div>

      {/* Currently Working */}
      <div className="flex items-center">
        <input
          type="checkbox"
          {...register("currentlyWorking")}
          className="h-4 w-4 text-primary-600 border-gray-300 rounded"
        />

        <label className="ml-2 text-sm text-gray-900">
          I currently work here
        </label>
      </div>

      {/* Duration Display */}
      {experienceDuration && (
        <div className="text-sm text-primary-600 font-medium">
          Experience: {experienceDuration}
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>

        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" loading={isLoading}>
          Save Experience
        </Button>
      </div>
    </form>
  );
};