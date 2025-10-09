"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp.email(
          {
            email,
            password,
            name,
            callbackURL: "/",
          },
          {
            onError: (ctx) => {
              setError(ctx.error.message || "Sign up failed");
            },
            onSuccess: () => {
              window.location.href = "/";
            },
          }
        );
        if (error) {
          setError(error.message || "Sign up failed");
        }
      } else {
        const { error } = await signIn.email(
          {
            email,
            password,
            callbackURL: "/",
          },
          {
            onError: (ctx) => {
              setError(ctx.error.message || "Sign in failed");
            },
            onSuccess: () => {
              window.location.href = "/";
            },
          }
        );
        if (error) {
          setError(error.message || "Sign in failed");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🥬</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? "Join Alfacinha" : "Welcome back"}
          </h1>
          <p className="text-gray-600">
            {isSignUp
              ? "Start learning Portuguese today"
              : "Continue your learning journey"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
            {isSignUp && (
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : isSignUp ? "Sign up" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-[#1E3A8A] hover:text-[#1E40AF] font-medium text-sm"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
