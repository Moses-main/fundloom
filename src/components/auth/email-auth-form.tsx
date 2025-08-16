"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { registerUser, loginUser, setAuth, API_BASE_URL, forgotPassword } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface EmailAuthFormProps {
  mode: "login" | "signup";
}

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const navigate = useNavigate();
  const { show: toast } = useToast();

  const form = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(mode === "login" ? loginSchema : signupSchema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "" }
        : { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
    setIsLoading(true);
    try {
      if (mode === "signup") {
        const { name, email, password } = data as SignupFormData;
        const auth = await registerUser({ name, email, password });
        setAuth(auth);
        toast({ type: "success", title: "Account created", description: "Welcome to Fundloom" });
      } else {
        const { email, password } = data as LoginFormData;
        const auth = await loginUser({ email, password });
        setAuth(auth);
        toast({ type: "success", title: "Signed in", description: "Login successful" });
      }
      navigate("/dashboard");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Authentication failed";
      console.error("Authentication error:", error);
      toast({ type: "error", title: "Auth error", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsOAuthLoading(true);
    try {
      // Start Google OAuth via backend (Passport)
      // Backend will redirect back to /auth/callback with token & user
      window.location.href = `${API_BASE_URL}/auth/google`;
    } catch (error) {
      console.error("Google OAuth error:", error);
    } finally {
      setIsOAuthLoading(false);
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-3 mb-4">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
          onClick={handleGoogleAuth}
          disabled={isOAuthLoading}
        >
          <div className="flex items-center justify-center gap-2">
            <FcGoogle className="h-5 w-5" />
            <span>
              {isOAuthLoading
                ? "Connecting..."
                : mode === "login"
                ? "Continue with Google"
                : "Continue with Google"}
            </span>
          </div>
        </Button>
        <div className="flex items-center">
          <div className="h-px bg-border flex-1" />
          <span className="px-3 text-xs text-muted-foreground">or</span>
          <div className="h-px bg-border flex-1" />
        </div>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {mode === "signup" && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Enter your full name"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "signup" && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? "Please wait..."
            : mode === "login"
            ? "Sign In"
            : "Create Account"}
        </Button>

        {mode === "login" && (
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={async () => {
                const email = (form.getValues() as any).email as string;
                if (!email) {
                  toast({ type: "warning", title: "Enter email", description: "Please enter your email above first" });
                  return;
                }
                try {
                  const res = await forgotPassword({ email });
                  if (res?.resetToken) {
                    toast({ type: "info", title: "Reset token generated", description: `Dev token: ${res.resetToken}` });
                  } else {
                    toast({ type: "success", title: "Email sent", description: "Password reset link sent if the email exists" });
                  }
                } catch (e: any) {
                  toast({ type: "error", title: "Reset failed", description: e?.message || "Could not start password reset" });
                }
              }}
            >
              Forgot your password?
            </button>
          </div>
        )}
      </form>
    </Form>
  );
}
