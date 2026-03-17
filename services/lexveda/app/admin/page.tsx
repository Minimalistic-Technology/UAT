"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Paperclip } from "lucide-react";

interface RequestSubmission {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  description?: string;
  caseDetails?: string;
  draftType?: string;
  hasAttachments?: boolean;
  type: "consultation" | "drafting";
  date: string;
}

const Admin = () => {
  const [requests, setRequests] = useState<RequestSubmission[]>([]);

  useEffect(() => {
    const savedRequests = JSON.parse(localStorage.getItem("consultation_requests") || "[]");
    // Sort by date descending
    savedRequests.sort((a: RequestSubmission, b: RequestSubmission) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setRequests(savedRequests);
  }, []);

  const clearRequests = () => {
    if (confirm("Are you sure you want to clear all requests?")) {
      localStorage.removeItem("consultation_requests");
      setRequests([]);
    }
  };

  return (
    <div className="min-h-screen bg-primary text-primary-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-serif font-bold text-accent">Admin Dashboard</h1>
            <p className="text-primary-foreground/70 font-sans mt-2">LexVeda Submissions</p>
          </div>
          <Button variant="outline" className="text-accent border-accent hover:bg-accent/10" onClick={clearRequests}>
            Clear All
          </Button>
        </div>

        <Card className="bg-card border-accent/20">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-accent">All Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-center py-10 text-primary-foreground/50 font-sans">No requests found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-accent/20">
                      <TableHead className="text-accent font-sans">Date</TableHead>
                      <TableHead className="text-accent font-sans">Type</TableHead>
                      <TableHead className="text-accent font-sans">User Name</TableHead>
                      <TableHead className="text-accent font-sans">Contact</TableHead>
                      <TableHead className="text-accent font-sans">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id} className="border-accent/10 hover:bg-accent/5">
                        <TableCell className="font-sans text-xs">
                          {format(new Date(request.date), "dd MMM HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={request.type === "consultation" ? "gold" : "outline"} className="capitalize">
                            {request.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-sans font-medium">{request.fullName}</TableCell>
                        <TableCell className="font-sans text-xs space-y-1">
                          <div>{request.mobile}</div>
                          <div className="text-primary-foreground/60">{request.email}</div>
                        </TableCell>
                        <TableCell className="font-sans max-w-xs">
                          {request.type === "consultation" ? (
                            <p className="text-xs truncate" title={request.description}>{request.description}</p>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-accent">{request.draftType?.replace("-", " ")}</p>
                                {request.hasAttachments && <Paperclip className="w-3 h-3 text-accent" />}
                              </div>
                              {request.caseDetails && <p className="text-[10px] truncate opacity-70" title={request.caseDetails}>{request.caseDetails}</p>}
                            </div>
                          )}
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
    </div>
  );
};

export default Admin;
