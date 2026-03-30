"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { createReview, updateOwnReviewForUser } from "@/features/reviews/services/createReview";
import { Button } from "@/shared/ui";

type CreateReviewFormProps = {
  reviewedUserId: string;
  hasExistingReview?: boolean;
  defaultRating?: number;
  defaultComment?: string;
};

export const CreateReviewForm = ({
  reviewedUserId,
  hasExistingReview = false,
  defaultRating = 5,
  defaultComment = "",
}: CreateReviewFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = event.currentTarget;

    const formData = new FormData(form);
    const ratingValue = Number(String(formData.get("rating") ?? "5"));
    const comment = String(formData.get("comment") ?? "").trim();

    if (Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      toast.error("La nota debe ser entre 1 y 5.");
      setLoading(false);
      return;
    }

    try {
      if (hasExistingReview) {
        await updateOwnReviewForUser({
          reviewedUserId,
          rating: ratingValue,
          comment,
        });
        toast.success("Review actualizado.");
      } else {
        await createReview({
          reviewedUserId,
          rating: ratingValue,
          comment,
        });
        toast.success("Review enviado.");
      }
      form.reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(hasExistingReview ? "No se pudo actualizar el review." : "No se pudo enviar el review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="review-rating" className="text-xs uppercase tracking-[0.12em] text-muted">
          Calificacion
        </label>
        <select
          id="review-rating"
          name="rating"
          defaultValue={String(defaultRating)}
          className="liquid-focus-ring liquid-glass w-full rounded-xl px-3 py-2 text-sm text-foreground outline-none"
        >
          <option value="5" className="bg-[#08212a]">
            5 - Excelente
          </option>
          <option value="4" className="bg-[#08212a]">
            4 - Muy bueno
          </option>
          <option value="3" className="bg-[#08212a]">
            3 - Bueno
          </option>
          <option value="2" className="bg-[#08212a]">
            2 - Regular
          </option>
          <option value="1" className="bg-[#08212a]">
            1 - Deficiente
          </option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-comment" className="text-xs uppercase tracking-[0.12em] text-muted">
          Comentario
        </label>
        <textarea
          id="review-comment"
          name="comment"
          rows={3}
          defaultValue={defaultComment}
          placeholder="Describe brevemente la experiencia con el postulante."
          className="liquid-focus-ring liquid-glass w-full rounded-xl px-3 py-2 text-sm text-foreground outline-none"
        />
      </div>

      <Button type="submit" size="sm" loading={loading}>
        {hasExistingReview ? "Actualizar review" : "Enviar review"}
      </Button>
    </form>
  );
};
