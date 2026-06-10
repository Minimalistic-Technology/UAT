import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Country, State, City } from "country-state-city";

interface LocationSelectorProps {
    city: string;
    state: string;
    country: string;
    onChange: (name: string, value: string) => void;
}

export function LocationSelector({ city, state, country, onChange }: LocationSelectorProps) {
    // Get all countries
    const countries = useMemo(() => Country.getAllCountries(), []);

    // Find currently selected country code
    const activeCountry = useMemo(
        () => countries.find((c) => c.name === country),
        [country, countries]
    );

    // Get states for the selected country
    const states = useMemo(
        () => (activeCountry ? State.getStatesOfCountry(activeCountry.isoCode) : []),
        [activeCountry]
    );

    // Find currently selected state code
    const activeState = useMemo(
        () => states.find((s) => s.name === state),
        [state, states]
    );

    // Get cities for the selected state
    const cities = useMemo(
        () =>
            activeCountry && activeState
                ? City.getCitiesOfState(activeCountry.isoCode, activeState.isoCode)
                : [],
        [activeCountry, activeState]
    );

    // Handlers for cascading dropdowns to reset child values
    const handleCountryChange = (value: string) => {
        onChange("country", value);
        onChange("state", "");
        onChange("city", "");
    };

    const handleStateChange = (value: string) => {
        onChange("state", value);
        onChange("city", "");
    };

    const handleCityChange = (value: string) => {
        onChange("city", value);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* Country Dropdown */}
            <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
                    Country
                </Label>
                <Select value={country} onValueChange={handleCountryChange}>
                    <SelectTrigger className="h-[2.35rem] bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500 rounded-lg text-sm truncate">
                        <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl max-h-60">
                        {countries.map((c) => (
                            <SelectItem key={c.isoCode} value={c.name} className="cursor-pointer">
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* State / Province Dropdown */}
            <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
                    State / Province
                </Label>
                <Select
                    value={state}
                    onValueChange={handleStateChange}
                    disabled={!activeCountry || states.length === 0}
                >
                    <SelectTrigger className="h-[2.35rem] bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500 rounded-lg text-sm truncate disabled:opacity-50">
                        <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl max-h-60">
                        {states.map((s) => (
                            <SelectItem key={s.isoCode} value={s.name} className="cursor-pointer">
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* City Dropdown */}
            <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
                    City
                </Label>
                <Select
                    value={city}
                    onValueChange={handleCityChange}
                    disabled={!activeState || cities.length === 0}
                >
                    <SelectTrigger className="h-[2.35rem] bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500 rounded-lg text-sm truncate disabled:opacity-50">
                        <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl max-h-60">
                        {cities.map((c) => (
                            <SelectItem key={c.name} value={c.name} className="cursor-pointer">
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
