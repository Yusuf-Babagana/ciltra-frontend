"use client";

import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Search, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Using toast for better feedback

export default function CertificateInventory() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await adminAPI.getCertificates();
                setCertificates(data);
            } catch (error) {
                console.error("Failed to load certificates", error);
                toast.error("Failed to load certificate list.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDownload = async (sessionId: string, filename: string, id: number) => {
        try {
            setDownloadingId(id);

            // Fetch the PDF Blob from the backend
            // Note: The backend expects the Session ID, not the file URL
            const blob = await adminAPI.downloadCertificate(sessionId);

            // Create a hidden link to trigger the browser download
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `${filename}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Cleanup memory
            window.URL.revokeObjectURL(downloadUrl);
            toast.success("Download started.");
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Failed to download certificate.");
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredCerts = certificates.filter((cert: any) =>
        cert.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
        cert.certificate_code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Certificate Inventory</h1>
                    <p className="text-muted-foreground">Manage and verify issued certificates across the platform.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-green-600" />
                            Issued Certificates
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search name or ID..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredCerts.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed rounded-lg">
                            <FileCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No certificates found</h3>
                            <p className="text-slate-500">Issued certificates will appear here once students pass exams.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cert ID</TableHead>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Exam</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Issued Date</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCerts.map((cert: any) => (
                                        <TableRow key={cert.id}>
                                            <TableCell className="font-mono text-xs font-medium text-slate-600">
                                                {cert.certificate_code}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{cert.candidate_name}</div>
                                                <div className="text-xs text-muted-foreground">{cert.candidate_email}</div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={cert.exam_title}>
                                                {cert.exam_title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                                    {cert.score}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(cert.issued_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleDownload(
                                                        String(cert.session_id), // Pass session_id, not URL
                                                        `Certificate_${cert.certificate_code}`,
                                                        cert.id
                                                    )}
                                                    disabled={downloadingId === cert.id}
                                                >
                                                    {downloadingId === cert.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Download className="h-4 w-4 text-slate-500 hover:text-indigo-600" />
                                                    )}
                                                    <span className="sr-only">Download</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}