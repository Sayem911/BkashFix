import * as React from "react";
import { toast } from "sonner";

export function useToast() {
  return {
    toast: {
      ...toast,
      success: (message: string) => {
        toast(message, {
          style: { background: '#10B981', color: 'white' }
        });
      },
      error: (message: string) => {
        toast(message, {
          style: { background: '#EF4444', color: 'white' }
        });
      }
    }
  };
}