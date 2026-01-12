"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ExaminerManagement() {
    const [examiners, setExaminers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
    });

    const fetchExaminers = async () => {
        try {
            const { data } = await api.get("/admin/examiners/");
            setExaminers(data);
        } catch (error) {
            console.error("Failed to load examiners", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExaminers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/admin/examiners/", formData);
            alert("Examiner Created Successfully!");
            setShowModal(false);
            fetchExaminers(); // Refresh list
        } catch (error) {
            alert("Failed to create examiner. Check console.");
            console.error(error);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Examiner Management</h1>

                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            + Add New Examiner
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Examiner</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="First Name"
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    required
                                />
                                <Input
                                    placeholder="Last Name"
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    required
                                />
                            </div>
                            <Input
                                type="email"
                                placeholder="Email Address"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Set Password"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <Button type="submit" className="w-full">Create Account</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? <p>Loading...</p> : examiners.length === 0 ? (
                    <p>No examiners found.</p>
                ) : (
                    examiners.map((user: any) => (
                        <Card key={user.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {user.first_name} {user.last_name}
                                </CardTitle>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Staff</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{user.email}</div>
                                <p className="text-xs text-muted-foreground">
                                    Role: Examiner
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}