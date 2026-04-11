"use client";

import { useState } from "react";
import axios from "axios";
import { Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DriveFile } from "@/features/drive/types";
import { generateCSVString } from "@/lib/generate-csv";
import { toast } from "sonner";
import { useSendCSVFile } from "../hooks/use-get-files";

export function ShareEmailDialog({
  files,
  folderName,
}: {
  files: DriveFile[];
  folderName: string;
}) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: sendEmail, isPending } = useSendCSVFile();

  const handleShare = async () => {
    setIsSending(true);

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!files || files.length === 0) {
      toast.error("There are no files in this folder to share");
      return;
    }

    const csvContent = generateCSVString(files);
    const safeFolderName = folderName.replace(/\s+/g, "_") || "drive";
    const fileName = `${safeFolderName}_export.csv`;

    sendEmail(
      { email, fileName, csvContent },
      {
        onSuccess: () => {
          setIsOpen(false);
          setEmail("");
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="h-4 w-4" />
            Share via Email
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File List</DialogTitle>
          <DialogDescription>
            This will send a CSV export of "{folderName}" to the recipient.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-4">
          <Input
            placeholder="colleague@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleShare()}
          />
          <Button onClick={handleShare} disabled={isSending || !email}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
