// // ===============================
// // src/components/ui/Card.tsx
// // ===============================

// import React from "react";

// interface CardProps {
//   children: React.ReactNode;
//   className?: string;
//   hover?: boolean;
// }

// export const Card: React.FC<CardProps> = ({
//   children,
//   className = "",
//   hover = false,
// }) => {
//   return (
//     <div
//       className={`bg-white rounded-lg shadow-md border border-gray-200 ${
//         hover ? "hover:shadow-lg transition-shadow" : ""
//       } ${className}`}
//     >
//       {children}
//     </div>
//   );
// };

// export const CardHeader: React.FC<{
//   children: React.ReactNode;
//   className?: string;
// }> = ({ children, className = "" }) => (
//   <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
//     {children}
//   </div>
// );

// export const CardContent: React.FC<{
//   children: React.ReactNode;
//   className?: string;
// }> = ({ children, className = "" }) => (
//   <div className={`px-6 py-4 ${className}`}>{children}</div>
// );

// export const CardFooter: React.FC<{
//   children: React.ReactNode;
//   className?: string;
// }> = ({ children, className = "" }) => (
//   <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
//     {children}
//   </div>
// );

import * as React from "react";

import { cn } from "../lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
