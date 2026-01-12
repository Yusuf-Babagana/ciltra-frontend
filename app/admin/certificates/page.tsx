"use client";

import { useEffect, useState } from "react";
// FIX 1: Removed 'api' from import. We only need adminAPI.
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Search, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

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
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // FIX 2: Updated to use the existing helper in your library
    const handleDownload = async (url: string, filename: string, id: number) => {
        try {
            setDownloadingId(id);

            // Use the specific download function from your lib/api.ts
            // This returns the Blob directly, so we don't need 'response.data'
            const blob = await adminAPI.downloadCertificate(url);

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
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download certificate. Please try again.");
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
                    <h1 className="text-3xl font-bold">Certificate Inventory</h1>
                    <p className="text-muted-foreground">Manage and verify issued certificates</p>
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
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredCerts.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No certificates found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cert ID</TableHead>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Exam</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Issued Date</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCerts.map((cert: any) => (
                                    <TableRow key={cert.id}>
                                        <TableCell className="font-mono text-xs">{cert.certificate_code}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{cert.candidate_name}</div>
                                            <div className="text-xs text-muted-foreground">{cert.candidate_email}</div>
                                        </TableCell>
                                        <TableCell>{cert.exam_title}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {cert.score}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(cert.issued_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownload(cert.certificate_url, `Certificate_${cert.certificate_code}`, cert.id)}
                                                disabled={downloadingId === cert.id}
                                            >
                                                {downloadingId === cert.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        PDF
                                                    </>
                                                )}
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