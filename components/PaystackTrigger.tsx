"use client"

import { usePaystackPayment } from "react-paystack"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"

interface PaystackTriggerProps {
    email: string
    amount: number
    publicKey: string
    onSuccess: (reference: any) => void
    onClose: () => void
}

export default function PaystackTrigger({ email, amount, publicKey, onSuccess, onClose }: PaystackTriggerProps) {

    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: amount, // Amount is in Kobo (already multiplied by 100 in parent)
        publicKey: publicKey,
    }

    const initializePayment = usePaystackPayment(config)

    return (
        <div className="w-full">
            <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 rounded-md shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                onClick={() => {
                    initializePayment({ onSuccess, onClose })
                }}
            >
                Pay Now & Start
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
                <CreditCard className="w-3 h-3" /> Secured by Paystack
            </div>
        </div>
    )
}