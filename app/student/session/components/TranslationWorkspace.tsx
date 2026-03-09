"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Type, Info, FileEdit } from "lucide-react"

interface Props {
    sourceText: string;
    brief?: string;
    value: string;
    onChange: (val: string) => void;
}

export default function TranslationWorkspace({ sourceText, brief, value, onChange }: Props) {
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        const words = value.trim().split(/\s+/).filter(w => w.length > 0);
        setWordCount(words.length);
    }, [value]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
            {/* LEFT: SOURCE PANEL */}
            <Card className="flex flex-col border-slate-200 bg-slate-50 overflow-hidden">
                <div className="bg-slate-200 px-4 py-2 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Source Text</span>
                    <Badge variant="outline" className="bg-white">Read Only</Badge>
                </div>
                <CardContent className="flex-1 overflow-y-auto p-6 font-serif text-lg leading-relaxed text-slate-800">
                    {brief && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800 flex gap-2">
                            <Info className="h-4 w-4 shrink-0" />
                            <span><strong>Brief:</strong> {brief}</span>
                        </div>
                    )}
                    {sourceText}
                </CardContent>
            </Card>

            {/* RIGHT: TARGET EDITOR */}
            <Card className="flex flex-col border-indigo-200 shadow-sm overflow-hidden">
                <div className="bg-indigo-600 px-4 py-2 flex justify-between items-center text-white">
                    <span className="text-xs font-bold uppercase tracking-wider">Target Translation</span>
                    <div className="flex items-center gap-2 text-xs">
                        <Type className="h-3 w-3" />
                        <span>{wordCount} words</span>
                    </div>
                </div>
                <CardContent className="flex-1 p-0">
                    <Textarea
                        className="w-full h-full resize-none border-0 focus-visible:ring-0 p-6 font-serif text-lg leading-relaxed"
                        placeholder="Type your translation here..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
