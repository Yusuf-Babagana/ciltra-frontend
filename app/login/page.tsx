// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast"; // Ensure you have this or standard alert
import { Loader2 } from "lucide-react";
import { Header } from "@/components/header";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authAPI.login(formData);
      login(data);

      toast({ title: "Success", description: "Logged in successfully." });

      // Redirect based on Role
      switch (data.user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "examiner":
          router.push("/examiner/dashboard"); // You'll need to create this route later
          break;
        default:
          router.push("/student/dashboard"); // Candidates go here
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://scontent-los2-1.xx.fbcdn.net/v/t39.30808-6/505180011_1214676324036208_4156852350019206314_n.jpg?_nc_cat=100&_nc_cb=99be929b-f3b7c874&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEbdWqux3AQI3CUmCp32IJSR1yJARlnLNdHXIkBGWcs10t3_56DSa6WvNiY7XpWnImurHmM3XGNDoIS52MdVx1g&_nc_ohc=tz5COX9Bte8Q7kNvwG0ZK5t&_nc_oc=AdnafrQwkK-fvoSuZhwdlFLrglXdQ0yqaGbv93BB4GJ4M633DNQghqIJczYq3iM6m182qzI14p4ogoAEV4-HYupt&_nc_zt=23&_nc_ht=scontent-los2-1.xx&_nc_gid=_US9hIcVh5d1-7ymG4LfZQ&oh=00_Afrk0Dxn9KV6iORGOaDYBBz_5wadL7xnDqs3jJ_0vTGSOQ&oe=696B028A"
            alt="Background"
            className="w-full h-full object-cover opacity-10" // Low opacity for readability
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-slate-50/90" />
        </div>

        <Card className="w-full max-w-md relative z-10 shadow-xl border-slate-200/60 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ciltra@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <Button className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );

}
