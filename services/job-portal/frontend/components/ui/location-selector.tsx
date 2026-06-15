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
import { Asterisk } from "lucide-react";

interface LocationSelectorProps {
    city: string;
    state: string;
    country: string;
    onChange: (name: string, value: string) => void;
    isRequired?: boolean;
}

export function LocationSelector({ city, state, country, onChange, isRequired = true }: LocationSelectorProps) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Country Dropdown */}
            <div className="grid gap-2">
                <Label className="flex items-center gap-1">
                    Country {isRequired && <Asterisk className="text-destructive size-3" />}
                </Label>
                <Select value={country} onValueChange={handleCountryChange}>
                    <SelectTrigger className="truncate">
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
            <div className="grid gap-2">
                <Label className="flex items-center gap-1">
                    State / Province {isRequired && <Asterisk className="text-destructive size-3" />}
                </Label>
                <Select
                    value={state}
                    onValueChange={handleStateChange}
                    disabled={!activeCountry || states.length === 0}
                >
                    <SelectTrigger className="truncate">
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
            <div className="grid gap-2">
                <Label className="flex items-center gap-1">
                    City {isRequired && <Asterisk className="text-destructive size-3" />}
                </Label>
                <Select
                    value={city}
                    onValueChange={handleCityChange}
                    disabled={!activeState || cities.length === 0}
                >
                    <SelectTrigger className="truncate">
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
