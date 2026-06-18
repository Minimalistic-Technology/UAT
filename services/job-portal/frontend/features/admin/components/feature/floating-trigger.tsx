import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface FloatingTriggerProps {
  onClick: () => void;
}

export function FloatingTrigger({ onClick }: FloatingTriggerProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed right-6 bottom-6 z-50 flex size-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl transition-colors hover:bg-indigo-700 lg:right-10 lg:bottom-10"
    >
      <Sparkles className="size-6" />
    </motion.button>
  );
}
