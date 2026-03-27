"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { BookOpen, User, Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import {
  validateEmail,
  validatePassword,
  validateContactNumber,
  validateName,
} from "../../lib/validation";
import { useAuth } from "../../context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    contactNumber?: string;
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const firstNameValidation = validateName(formData.firstName, "First name");
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.error;
    }

    const lastNameValidation = validateName(formData.lastName, "Last name");
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.error;
    }

    const contactValidation = validateContactNumber(formData.contactNumber);
    if (!contactValidation.isValid) {
      newErrors.contactNumber = contactValidation.error;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed. Please try again.");
        return;
      }

      toast.success("Account created! Logging you in...");

      // Auto-login after signup
      const loginRes = await fetch(`${API_BASE}/api/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        if (loginData.tokens?.accessToken) {
          localStorage.setItem("access_token", loginData.tokens.accessToken);
        }
        if (loginData.tokens?.refreshToken) {
          localStorage.setItem("refresh_token", loginData.tokens.refreshToken);
        }
        if (loginData.user) {
          setUser({
            id: loginData.user.id,
            email: loginData.user.email,
            firstName: loginData.user.firstName,
            lastName: loginData.user.lastName,
            contactNumber: loginData.user.contactNumber,
            role: loginData.user.role,
          });
        }
        router.push("/");
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-50 dark:bg-slate-900 px-4 pt-32 pb-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        
        <div className="flex flex-col items-center justify-center mb-5">
          <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create an account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Join us to start learning today</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">First name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm transition-colors ${
                    errors.firstName ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                  } focus:outline-none focus:ring-2 text-slate-900 dark:text-white`}
                  placeholder="John"
                />
              </div>
              {errors.firstName && <p className="text-[10px] text-red-500 mt-0.5">{errors.firstName}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Last name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm transition-colors ${
                    errors.lastName ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                  } focus:outline-none focus:ring-2 text-slate-900 dark:text-white`}
                  placeholder="Doe"
                />
              </div>
              {errors.lastName && <p className="text-[10px] text-red-500 mt-0.5">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <input
                name="contactNumber"
                type="tel"
                required
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm transition-colors ${
                  errors.contactNumber ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                } focus:outline-none focus:ring-2 text-slate-900 dark:text-white`}
                placeholder="+1 234 567 8900"
              />
            </div>
            {errors.contactNumber && <p className="text-[10px] text-red-500 mt-0.5">{errors.contactNumber}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm transition-colors ${
                  errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                } focus:outline-none focus:ring-2 text-slate-900 dark:text-white`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-8 pr-9 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm transition-colors ${
                  errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                } focus:outline-none focus:ring-2 text-slate-900 dark:text-white`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Min 8 chars, 1 uppercase, 1 number, 1 special.
            </p>
            {errors.password && <p className="text-[10px] text-red-500 mt-0.5">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-2 px-4 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
