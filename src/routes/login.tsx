import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/webli/useAuth";
import { WebliLogo } from "@/components/webli/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in · Webli" },
      { name: "description", content: "Sign in to Webli to track your project and orders." },
    ],
  }),
});

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background p-6">
        <div className="glass rounded-3xl p-10 max-w-md w-full text-center animate-fade-up shadow-elev">
          <img
            src={(user.user_metadata?.avatar_url as string) || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.email ?? "U")}`}
            alt=""
            className="mx-auto h-20 w-20 rounded-full ring-4 ring-primary/20 shadow-elev"
          />
          <h1 className="mt-5 text-2xl font-semibold">
            {(user.user_metadata?.full_name as string) || user.email}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-8 grid gap-2">
            <Button onClick={() => navigate({ to: "/orders" })} className="rounded-full gradient-primary text-primary-foreground">
              Go to my orders <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={async () => {
                await supabase.auth.signOut();
                toast.success("Signed out");
              }}
            >
              Sign out
            </Button>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground mt-2">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function google() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      toast.success("Welcome!");
      navigate({ to: "/orders" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function emailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      navigate({ to: "/orders" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:block overflow-hidden gradient-primary">
        <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_20%_20%,white,transparent)] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(500px_400px_at_80%_80%,white,transparent)] opacity-10" />
        <div className="relative h-full p-14 flex flex-col text-white">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="glass rounded-2xl px-4 py-2">
              <WebliLogo height={26} />
            </div>
          </Link>
          <div className="mt-auto">
            <h2 className="text-4xl font-semibold tracking-tight text-balance">
              Sign in to track your project every step of the way.
            </h2>
            <p className="mt-4 text-white/85 max-w-md">
              See pending, confirmed, completed and cancelled orders — all in one calm dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden mb-8 flex justify-center">
            <WebliLogo height={30} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {mode === "signin"
              ? "Sign in to manage your Webli projects."
              : "Join Webli to book and track your projects."}
          </p>

          <Button
            onClick={google}
            disabled={loading}
            variant="outline"
            className="mt-8 w-full h-12 rounded-full text-base font-medium"
          >
            <GoogleIcon className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-wider">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={emailSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
              </div>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="pl-9" placeholder="you@company.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="pl-9" placeholder="••••••••" required minLength={6} />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-full gradient-primary text-primary-foreground shadow-elev">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            {mode === "signin" ? "New to Webli? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <Link to="/" className="mt-8 block text-center text-xs text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
