import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ProfileSectionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const ProfileSectionCard = ({
  icon: Icon,
  title,
  description,
  children,
}: ProfileSectionCardProps) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-muted/20 border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Icon className="text-primary h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
