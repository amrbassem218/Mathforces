import { Dialog, DialogContent } from "./dialog"
import { Button } from "@/components/ui/button"
import { Divide, MailCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export default function EmailVerificationPopup() {
  const [open, setOpen] = useState(true)
  return (
    <AnimatePresence>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-sm rounded-2xl p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-4"
            >
                <div className="flex justify-center">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                    <MailCheck className="w-6 h-6" />
                </div>
                </div>
                <h2 className="text-xl font-semibold">Check Your Email</h2>
                <p className="text-sm text-muted-foreground">
                A confirmation link was sent to your inbox. Please verify your account to continue.
                </p>
                <Button onClick={() => setOpen(false)} className="w-full">
                Got it
                </Button>
            </motion.div>
            </DialogContent>
        </Dialog>
    </AnimatePresence>
  )
}
