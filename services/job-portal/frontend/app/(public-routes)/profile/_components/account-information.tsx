import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, KeyRound } from "lucide-react";
import { User } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface AccountInformationProps {
  user: User | undefined;
}

export const AccountInformation = ({ user }: AccountInformationProps) => {
  return (
    <Card className="h-fit border shadow-sm">
      <CardHeader className="bg-muted/20 border-b pb-4">
        <CardTitle className="text-lg font-bold">Account Information</CardTitle>
        <CardDescription>
          General profile details visible to the platform.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-bold tracking-tight">
              First Name
            </label>
            <Input
              value={user?.firstName ?? ""}
              readOnly
              className="bg-muted/40 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-bold tracking-tight">
              Last Name
            </label>
            <Input
              value={user?.lastName ?? ""}
              readOnly
              className="bg-muted/40 font-medium"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-muted-foreground text-sm font-bold tracking-tight">
              Email Address
            </label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                value={user?.email ?? ""}
                readOnly
                className="bg-muted/40 pl-10 font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* <Separator className="my-2" /> */}

        {/* Security Section */}
        {/* <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-lg border p-2.5">
              <KeyRound className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-base font-bold">Security</h4>
              <p className="text-muted-foreground text-sm">
                Update your password to keep your account secure.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5 text-xs font-bold tracking-tight uppercase"
            >
              Update
            </Button>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
};
