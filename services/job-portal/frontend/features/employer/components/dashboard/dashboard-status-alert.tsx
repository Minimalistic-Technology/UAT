import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardAlertConfig } from "../../config/dashboard.config";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface DashboardStatusAlertProps {
  config: DashboardAlertConfig;
  kycRejectionReason?: string;
}

export const DashboardStatusAlert: React.FC<DashboardStatusAlertProps> = ({
  config,
  kycRejectionReason,
}) => {
  const {
    icon: Icon,
    title,
    description,
    actionLabel,
    actionLink,
    variant,
    showRejectionReason,
  } = config;

  let containerClass = "";
  let iconContainerClass = "";
  let iconClass = "";
  let titleClass = "";
  let descClass = "";
  let buttonClass = "";
  let buttonVariant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link" = "default";

  switch (variant) {
    case "warning":
      containerClass = "border-amber-500/30 bg-amber-500/10 shadow-sm";
      iconContainerClass = "bg-amber-500/20 text-amber-500";
      iconClass = "size-5";
      titleClass = "text-amber-700 dark:text-amber-500";
      descClass = "text-amber-700/80 dark:text-amber-500/80";
      buttonClass =
        "bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600";
      break;
    case "destructive":
      containerClass = "border-destructive/30 bg-destructive/10 shadow-sm";
      iconContainerClass = "bg-destructive/20 text-destructive";
      iconClass = "size-5";
      titleClass = "text-destructive";
      descClass = "text-destructive/80";
      buttonClass = "shadow-destructive/20";
      buttonVariant = "destructive";
      break;
    case "secondary":
      containerClass = "border-secondary/30 bg-secondary/10 shadow-sm";
      iconContainerClass = "bg-secondary/20 text-secondary";
      iconClass = "size-5 animate-spin";
      titleClass = "text-secondary";
      descClass = "text-secondary/80";
      buttonClass = "";
      buttonVariant = "secondary";
      break;
    default:
      containerClass = "border-primary/30 bg-primary/10 shadow-sm";
      iconContainerClass = "bg-primary/20 text-primary";
      iconClass = "size-5";
      titleClass = "text-primary";
      descClass = "text-primary/80";
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
      className="overflow-hidden"
    >
      <div
        className={`flex flex-col gap-4 rounded-xl border p-4 sm:p-5 ${containerClass}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-start gap-4">
            <div className={`rounded-full p-2 ${iconContainerClass}`}>
              <Icon className={iconClass} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className={`text-sm font-bold sm:text-base ${titleClass}`}>
                {title}
              </h3>
              <p className={`text-xs sm:text-sm ${descClass}`}>{description}</p>
            </div>
          </div>
          {actionLabel && actionLink && (
            <Button
              size="sm"
              variant={buttonVariant}
              asChild
              className={`ml-4 shrink-0 rounded-lg font-bold shadow-lg ${buttonClass}`}
            >
              <Link href={actionLink}>
                {actionLabel}
                {variant !== "destructive" && (
                  <ChevronRight className="ml-1 h-3 w-3" />
                )}
              </Link>
            </Button>
          )}
        </div>

        {showRejectionReason && kycRejectionReason && (
          <div className="bg-destructive/5 border-destructive/10 ml-14 rounded-lg border p-3">
            <span className="text-destructive mb-1 block text-xs font-bold tracking-wider uppercase">
              Feedback
            </span>
            <span className="text-destructive/90 text-sm font-medium">
              {kycRejectionReason}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
