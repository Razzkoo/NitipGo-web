import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary green - BOLD & HIGH CONTRAST
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-button)] hover:bg-[hsl(var(--primary-hover))] hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-0.5 active:bg-[hsl(var(--primary-active))] active:shadow-[var(--shadow-button-active)] active:translate-y-0 active:scale-[0.98]",
        
        // Destructive red - HIGH CONTRAST
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--shadow-button)] hover:bg-[hsl(var(--destructive-hover))] hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-0.5 active:bg-[hsl(var(--destructive-active))] active:shadow-[var(--shadow-button-active)] active:translate-y-0 active:scale-[0.98]",
        
        // Outline - BOLD BORDER
        outline:
          "border-2 border-primary bg-transparent text-primary font-bold shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-0.5 active:bg-[hsl(var(--primary-active))] active:text-primary-foreground active:translate-y-0 active:scale-[0.98]",
        
        // Secondary - VISIBLE CONTRAST
        secondary:
          "bg-secondary text-secondary-foreground font-bold shadow-sm hover:bg-secondary/70 hover:shadow-md hover:-translate-y-0.5 active:bg-secondary/60 active:translate-y-0 active:scale-[0.98]",
        
        // Ghost - SUBTLE BUT VISIBLE
        ghost: 
          "text-foreground font-semibold hover:bg-primary/15 hover:text-primary hover:-translate-y-0.5 active:bg-primary/25 active:translate-y-0 active:scale-[0.98]",
        
        // Link
        link: 
          "text-primary font-bold underline-offset-4 hover:underline hover:text-[hsl(var(--primary-dark))] active:text-[hsl(var(--primary-active))]",
        
        // Hero variant - VIBRANT ACCENT for main CTAs
        hero: 
          "bg-accent text-accent-foreground shadow-lg shadow-accent/30 hover:bg-[hsl(var(--accent-hover))] hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-1 active:bg-[hsl(var(--accent-active))] active:shadow-md active:translate-y-0 active:scale-[0.98]",
        
        // Soft variant - VISIBLE background
        soft:
          "bg-primary/20 text-primary font-bold hover:bg-primary/30 hover:-translate-y-0.5 active:bg-primary/40 active:translate-y-0 active:scale-[0.98]",
        
        // White variant for dark backgrounds
        white:
          "bg-card text-card-foreground font-bold shadow-md hover:shadow-lg hover:bg-muted hover:-translate-y-0.5 active:bg-muted/80 active:shadow-sm active:translate-y-0 active:scale-[0.98]",
        
        // Success variant - BOLD GREEN
        success:
          "bg-success text-success-foreground shadow-[var(--shadow-button)] hover:bg-[hsl(var(--success-hover))] hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-0.5 active:bg-[hsl(var(--success-active))] active:shadow-[var(--shadow-button-active)] active:translate-y-0 active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
