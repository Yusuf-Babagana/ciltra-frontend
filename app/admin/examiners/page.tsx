"use client";

import { useEffect, useState } from "react";
// FIX: Changed 'api' to 'adminAPI'
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, UserCheck, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ExaminersPage() {
    const [examiners, setExaminers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchExaminers();
    }, []);

    const fetchExaminers = async () => {
        try {
            // We fetch all users and filter for staff/examiners
            const users = await adminAPI.getUsers();
            // Filter logic: Check if they are staff or have an examiner role
            const staffMembers = users.filter((u: any) => u.is_staff || u.role === 'examiner');
            setExaminers(staffMembers);
        } catch (error) {
            console.error("Failed to load examiners", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredExaminers = examiners.filter((ex: any) =>
        ex.email.toLowerCase().includes(search.toLowerCase()) ||
        (ex.first_name + " " + ex.last_name).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Examiner Management</h1>
                    <p className="text-muted-foreground">Manage staff access and grading permissions</p>
                </div>
                {/* You can link to a create page or use a modal here later */}
                <Button disabled>
                    <Plus className="mr-2 h-4 w-4" /> Add Examiner
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Staff List</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search examiners..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredExaminers.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No examiners found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExaminers.map((ex: any) => (
                                    <TableRow key={ex.id}>
                                        <TableCell className="font-medium">
                                            {ex.first_name} {ex.last_name}
                                        </TableCell>
                                        <TableCell>{ex.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {ex.is_superuser ? "Super Admin" : "Examiner"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {ex.is_active ? (
                                                <Badge className="bg-green-600">Active</Badge>
                                            ) : (
                                                <Badge variant="destructive">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                <UserCheck className="h-4 w-4 text-blue-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}