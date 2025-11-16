import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  
  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
    companyName: "",
  });
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });
      toast({
        title: "Login successful",
        description: "Welcome back to SafetySync.ai",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignUpLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      
      toast({
        title: "Account created successfully",
        description: "Welcome to SafetySync.ai!",
      });
      
      setIsSignUpOpen(false);
      setLocation("/dashboard");
      window.location.reload(); // Reload to initialize auth
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSignUpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-lg bg-gradient-to-tr from-indigo-500/80 via-sky-500/80 to-emerald-400/80 shadow-md shadow-sky-500/40 mb-4" />
          <h1 className="text-3xl font-semibold">SafetySync.ai</h1>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            Sign in to your account
          </p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="your.email@company.com or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary/50 border-white/10"
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary/50 border-white/10"
                data-testid="input-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/30 hover-elevate active-elevate-2 disabled:opacity-50"
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Log in"}
            </button>

            <div className="text-center">
              <a
                href="#forgot-password"
                className="text-sm text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
                data-testid="link-forgot-password"
              >
                Forgot password?
              </a>
            </div>
          </form>
        </GlassCard>

        <p className="mt-6 text-center text-xs text-[color:var(--text-muted)]">
          Don't have an account?{" "}
          <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
            <DialogTrigger asChild>
              <button className="text-[color:var(--text)] hover:underline" data-testid="link-create-account">
                Create an account
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 max-w-md">
              <DialogHeader>
                <DialogTitle>Create your account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username (optional)</Label>
                  <Input
                    id="signup-username"
                    placeholder="johndoe"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                    className="bg-secondary/50 border-white/10"
                    data-testid="input-signup-username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                    className="bg-secondary/50 border-white/10"
                    data-testid="input-signup-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                    className="bg-secondary/50 border-white/10"
                    data-testid="input-signup-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-company">Company Name *</Label>
                  <Input
                    id="signup-company"
                    placeholder="ACME Construction"
                    value={signUpData.companyName}
                    onChange={(e) => setSignUpData({ ...signUpData, companyName: e.target.value })}
                    required
                    className="bg-secondary/50 border-white/10"
                    data-testid="input-signup-company"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSignUpLoading}
                  data-testid="button-signup-submit"
                >
                  {isSignUpLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </p>
      </div>
    </div>
  );
}
