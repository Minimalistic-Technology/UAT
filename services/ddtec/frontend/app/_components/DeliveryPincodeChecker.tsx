"use client";

import { useState, useEffect } from "react";
import {
    MapPin,
    Truck,
    CheckCircle2,
    XCircle,
    Loader2,
    Navigation,
    ShieldCheck,
    Clock,
    Banknote,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Building2,
    RefreshCw
} from "lucide-react";
import api from "@/lib/api";

export interface DeliveryLocationInfo {
    pincode: string;
    city: string;
    state: string;
    district: string;
    region: string;
    tier: string;
    zone: string;
}

export interface DeliveryPartner {
    name: string;
    code: 'BLUEDART' | 'DTDC';
    serviceable: boolean;
    unserviceableReason?: string;
    serviceType: string;
    estimatedDays: string;
    minDays: number;
    maxDays: number;
    estimatedDeliveryDate: string;
    formattedDeliveryDate: string;
    codAvailable: boolean;
    prepaidAvailable: boolean;
    expressAvailable: boolean;
    isPreferred: boolean;
    isCheapest?: boolean;
    isFastest?: boolean;
    estimatedCost?: number;
    message?: string;
}

export interface DeliveryCheckResult {
    success: boolean;
    pincode: string;
    serviceable: boolean;
    location: DeliveryLocationInfo;
    primaryPartner: DeliveryPartner;
    partners: DeliveryPartner[];
    localHub?: {
        available: boolean;
        hubName: string;
        hubCode: string;
        city: string;
        sameDayDelivery: boolean;
    } | null;
    message: string;
}

interface DeliveryPincodeCheckerProps {
    onServiceabilityChange?: (result: DeliveryCheckResult | null) => void;
    compact?: boolean;
    className?: string;
}

export default function DeliveryPincodeChecker({
    onServiceabilityChange,
    compact = false,
    className = ""
}: DeliveryPincodeCheckerProps) {
    const [pincode, setPincode] = useState("");
    const [loading, setLoading] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [result, setResult] = useState<DeliveryCheckResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAllPartners, setShowAllPartners] = useState(false);

    const popularCities = [
        { name: "Mumbai", pin: "400001" },
        { name: "Delhi", pin: "110001" },
        { name: "Bengaluru", pin: "560001" },
        { name: "Pune", pin: "411001" },
        { name: "Hyderabad", pin: "500001" },
        { name: "Ahmedabad", pin: "380001" }
    ];

    // Load saved pincode from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("ddtec_user_pincode");
        if (saved && /^[1-9][0-9]{5}$/.test(saved)) {
            setPincode(saved);
            performCheck(saved, false);
        }
    }, []);

    const performCheck = async (pinToCheck: string, saveToStorage: boolean = true) => {
        const cleanPin = pinToCheck.trim();
        if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
            setError("Please enter a valid 6-digit postal PIN code (e.g. 400001)");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const res = await api.get(`/delivery/check-pincode?pincode=${cleanPin}`);
            const data: DeliveryCheckResult = res.data;
            setResult(data);

            if (saveToStorage && data.serviceable) {
                localStorage.setItem("ddtec_user_pincode", cleanPin);
                localStorage.setItem("ddtec_user_city", data.location.city || "");
                localStorage.setItem("ddtec_user_state", data.location.state || "");
            }

            if (onServiceabilityChange) {
                onServiceabilityChange(data);
            }
        } catch (err: any) {
            console.error("Delivery service check error:", err);
            const msg = err.response?.data?.message || "Could not verify serviceability for this PIN code. Please try again.";
            setError(msg);
            setResult(null);
            if (onServiceabilityChange) {
                onServiceabilityChange(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performCheck(pincode);
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setDetectingLocation(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Reverse geocoding via OpenStreetMap Nominatim
                    const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );
                    const geoData = await geoRes.json();
                    const detectedPin = geoData.address?.postcode?.replace(/\D/g, "").slice(0, 6);

                    if (detectedPin && /^[1-9][0-9]{5}$/.test(detectedPin)) {
                        setPincode(detectedPin);
                        await performCheck(detectedPin);
                    } else {
                        setError("Could not automatically resolve PIN code. Please type your 6-digit PIN code.");
                    }
                } catch (geoErr) {
                    console.warn("Reverse geocode error:", geoErr);
                    setError("Could not fetch location details. Please type your 6-digit PIN code manually.");
                } finally {
                    setDetectingLocation(false);
                }
            },
            (err) => {
                console.warn("Geolocation permission error:", err);
                setError("Location permission denied. Please enter your 6-digit PIN code manually.");
                setDetectingLocation(false);
            },
            { timeout: 8000 }
        );
    };

    const handleReset = () => {
        setPincode("");
        setResult(null);
        setError(null);
        localStorage.removeItem("ddtec_user_pincode");
        if (onServiceabilityChange) {
            onServiceabilityChange(null);
        }
    };

    return (
        <div className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-all ${className}`}>
            {/* Title / Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                        <Truck className="size-4.5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            Delivery & Courier Partner Service
                            <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                                Blue Dart &amp; DTDC
                            </span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Check location serviceability, estimated delivery timeline &amp; COD availability
                        </p>
                    </div>
                </div>

                {result && (
                    <button
                        onClick={handleReset}
                        className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                        <RefreshCw className="size-3" /> Change
                    </button>
                )}
            </div>

            {/* Input Form */}
            {!result ? (
                <div className="space-y-3">
                    <form onSubmit={handleFormSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={pincode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setPincode(val);
                                    setError(null);
                                }}
                                placeholder="Enter 6-digit PIN code (e.g. 400001)"
                                className="w-full pl-10 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || pincode.length !== 6}
                            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm"
                        >
                            {loading ? <Loader2 className="size-4 animate-spin" /> : "Check"}
                        </button>
                    </form>

                    {/* Geolocation Button & Popular Pincode Chips */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={detectingLocation}
                            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                            {detectingLocation ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Detecting location...
                                </>
                            ) : (
                                <>
                                    <Navigation className="size-3.5" />
                                    Use my current location
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                            <span className="text-[11px] font-medium text-slate-400">Quick test:</span>
                            {popularCities.map((c) => (
                                <button
                                    key={c.pin}
                                    type="button"
                                    onClick={() => {
                                        setPincode(c.pin);
                                        performCheck(c.pin);
                                    }}
                                    className="px-2 py-0.5 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                            <XCircle className="size-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            ) : (
                /* Serviceability Result Card */
                <div className="space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
                    {result.serviceable ? (
                        <>
                            {/* Serviceable Header */}
                            <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-3">
                                <div className="p-1.5 bg-emerald-600 text-white rounded-lg mt-0.5">
                                    <CheckCircle2 className="size-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between flex-wrap gap-1">
                                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                                            Delivery Available to {result.location.city}, {result.location.state}
                                        </p>
                                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
                                            PIN: {result.pincode}
                                        </span>
                                    </div>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                                        <Clock className="size-3.5" />
                                        Estimated Delivery by <strong className="font-bold">{result.primaryPartner.formattedDeliveryDate}</strong> ({result.primaryPartner.estimatedDays})
                                    </p>
                                </div>
                            </div>

                            {/* Courier Partners Comparison Cards (Blue Dart vs DTDC) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {result.partners.map((partner) => {
                                    const isDeliverable = partner.serviceable;
                                    const isCheapest = partner.isCheapest;
                                    const isBlueDart = partner.code === 'BLUEDART';

                                    return (
                                        <div
                                            key={partner.code}
                                            className={`p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                                isDeliverable
                                                    ? isCheapest
                                                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                                                        : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/70 shadow-xs'
                                                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                                            }`}
                                        >
                                            {/* Badge for Cheaper / Fastest / Not Deliverable */}
                                            {isDeliverable && isCheapest && (
                                                <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-emerald-600 text-white font-extrabold text-[9px] rounded-full uppercase shadow-xs flex items-center gap-1">
                                                    💰 Cheaper Option
                                                </span>
                                            )}
                                            {isDeliverable && partner.isFastest && !isCheapest && (
                                                <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-blue-600 text-white font-extrabold text-[9px] rounded-full uppercase shadow-xs flex items-center gap-1">
                                                    ⚡ Express Priority
                                                </span>
                                            )}
                                            {!isDeliverable && (
                                                <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[9px] rounded-full uppercase shadow-xs">
                                                    ❌ Not Deliverable
                                                </span>
                                            )}

                                            <div>
                                                <div className="flex items-center gap-2.5 mb-1.5">
                                                    <div
                                                        className={`size-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                                            isDeliverable
                                                                ? isBlueDart
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-emerald-600 text-white'
                                                                : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                                                        }`}
                                                    >
                                                        {isBlueDart ? 'BD' : 'DTDC'}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                            {partner.name}
                                                            {isDeliverable && (
                                                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                                    {isDeliverable ? 'Active' : 'Offline'}
                                                                </span>
                                                            )}
                                                        </h5>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            {partner.serviceType}
                                                        </p>
                                                    </div>
                                                </div>

                                                {isDeliverable ? (
                                                    <div className="space-y-1 mt-2">
                                                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                            <Clock className="size-3.5 text-teal-600" />
                                                            <span>ETA: {partner.estimatedDays} ({partner.formattedDeliveryDate})</span>
                                                        </div>
                                                        {partner.estimatedCost && (
                                                            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                                                Est. Base Freight: <span className="text-teal-600 dark:text-teal-400">₹{partner.estimatedCost}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1">
                                                        <XCircle className="size-3.5 shrink-0 mt-0.5" />
                                                        <span>{partner.unserviceableReason || 'Service not available for this PIN code.'}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {isDeliverable && (
                                                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                                                    <span>COD: {partner.codAvailable ? '✓ Yes' : '✗ Prepaid only'}</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Doorstep Delivery</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Informative message if only one partner is deliverable */}
                            {result.partners.filter(p => p.serviceable).length === 1 && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                                    <Sparkles className="size-4 shrink-0 text-amber-600 mt-0.5" />
                                    <span>
                                        <strong>Courier Notice:</strong> Only {result.primaryPartner.name} provides active courier service to PIN {result.pincode}. It has been automatically designated for your delivery.
                                    </span>
                                </div>
                            )}

                            {/* Local Store Hub Tag if serviceable from dark store */}
                            {result.localHub && (
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                                    <Sparkles className="size-4 text-amber-600 shrink-0" />
                                    <span>
                                        <strong>DDTEC Express Dark Store:</strong> Instant dispatch from {result.localHub.hubName} ({result.localHub.city})
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Non-Serviceable Alert */
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                                <XCircle className="size-4.5" />
                                <span>Delivery Unavailable to PIN {result.pincode}</span>
                            </div>
                            <p className="text-xs text-rose-600 dark:text-rose-300">
                                Our delivery partners (Blue Dart and DTDC) currently do not provide active courier service to this postal code. Please try a nearby delivery pincode or contact our support desk.
                            </p>
                            <button
                                onClick={handleReset}
                                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
                            >
                                Try Another PIN Code
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
