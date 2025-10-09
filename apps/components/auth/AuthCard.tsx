import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}
export const AuthCard = ({ children, title, description }: AuthCardProps) => {
  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-glow animate-scale-in bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">{title}</CardTitle>
            {description && (
              <CardDescription className="text-center">
                {description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
