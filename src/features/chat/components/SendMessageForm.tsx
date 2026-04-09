"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/shared/ui";

type SendMessageFormProps = {
  conversationId: string;
  senderId: string;
  placeholder?: string;
};

export const SendMessageForm = ({ conversationId, senderId, placeholder }: SendMessageFormProps) => {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmed,
      });

      if (error) throw error;

      setContent("");
      router.refresh();
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder ?? "Escribe tu mensaje..."}
        className="liquid-focus-ring min-h-[88px] sm:min-h-[96px] rounded-2xl border border-white/15 bg-white/[0.05] px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
      />
      <div className="w-full sm:w-auto">
        <Button type="submit" size="sm" fullWidth disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "Enviando..." : "Enviar mensaje"}
        </Button>
      </div>
    </form>
  );
};
