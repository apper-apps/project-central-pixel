import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className, 
  hover = false,
  children, 
  ...props 
}, ref) => {
return (
    <div
      ref={ref}
      className={cn(
        "bg-gray-800 rounded-lg border border-gray-700 shadow-sm transition-all duration-200",
        hover && "hover:shadow-md hover:scale-[1.02] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;