"use client";

import { useFormStatus } from "react-dom";
import { Plus, Loader2 } from "lucide-react";

export default function FormButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-2 rounded-lg flex items-center justify-center min-w-[120px] text-sm font-medium h-[38px]"
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <>
          <Plus size={16} className="mr-2" /> Add
        </>
      )}
    </button>
  );
}
