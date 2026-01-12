// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/header";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<"candidate" | "examiner">("candidate");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // Send data to backend with the selected role
      await authAPI.register({
        ...formData,
        role: role,
        username: formData.email, // Often required by Django AbstractUser
      });

      toast({ title: "Account Created", description: "Registration successful! Please login." });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
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

        <Card className="w-full max-w-lg relative z-10 shadow-xl border-slate-200/60 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join the CILTRA Certification Platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(v) => setRole(v as any)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="candidate">Candidate</TabsTrigger>
                <TabsTrigger value="examiner">Examiner</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    required
                    placeholder="John"
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    required
                    placeholder="Doe"
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  required
                  placeholder="john@example.com"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  required
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  required
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                />
              </div>

              <Button className="w-full mt-4" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}