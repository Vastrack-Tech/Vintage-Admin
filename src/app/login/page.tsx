"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInAction } from "@/lib/actions/authActions";
import { useQueryClient } from "@tanstack/react-query";
import Logo from "@/components/Logo";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setApiError(null);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await signInAction(formData);

    if (!result?.success || !result.session) {
      setApiError(result?.error || "Login failed");
      setLoading(false);
      return;
    }

    // Store token for Axios
    if (typeof window !== "undefined") {
      localStorage.setItem("token", result.session.access_token);
    }

    await queryClient.invalidateQueries({ queryKey: ["user"] });

    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F2]">
      <div className="w-full max-w-md px-6 py-12">
        {/* Header / Toggle */}
        {/* Added mb-4 for spacing and mx-auto to the Logo */}
        <div className="text-center mb-4">
          <Logo className="w-24 md:w-20 mx-auto" />
        </div>

        <div className="text-center mb-10 space-x-4 text-lg">
          <span className="text-black font-bold cursor-default">Admin Log in</span>
        </div>

        {/* Error Banner */}
        {apiError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded text-center">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className="w-full px-4 py-3 rounded-lg border border-[#F4A460] bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F4A460] transition-all"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Enter your Password"
              {...register("password")}
              className="w-full px-4 py-3 rounded-lg border border-[#F4A460] bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F4A460] transition-all"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-black hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
