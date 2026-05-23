import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string | React.ReactNode
  className?: string
  iconClassName?: string
  isPrimary?: boolean
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  iconClassName,
  isPrimary = false,
}: StatCardProps) {
  return (
    <Card className={cn(
      isPrimary && "bg-indigo-50/50 border-indigo-100", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(
          "text-sm font-medium",
          isPrimary ? "text-indigo-900" : "text-foreground"
        )}>
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-4 w-4", 
          isPrimary ? "text-indigo-600" : "text-muted-foreground",
          iconClassName
        )} />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          isPrimary && "text-indigo-900"
        )}>
          {value}
        </div>
        {description && (
          <div className={cn(
            "text-xs mt-1",
            isPrimary ? "text-indigo-600" : "text-muted-foreground"
          )}>
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  )
}