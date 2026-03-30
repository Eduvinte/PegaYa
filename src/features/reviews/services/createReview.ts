import { supabase } from "@/lib/supabase/client";

type CreateReviewInput = {
  reviewedUserId: string;
  rating: number;
  comment: string;
};

export const createReview = async ({ reviewedUserId, rating, comment }: CreateReviewInput) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No hay sesion activa.");
  }

  const { error } = await supabase.from("reviews").insert({
    reviewer_id: user.id,
    reviewed_user_id: reviewedUserId,
    rating,
    comment: comment || null,
  });

  if (error) {
    throw error;
  }
};

export const updateOwnReviewForUser = async ({
  reviewedUserId,
  rating,
  comment,
}: CreateReviewInput) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No hay sesion activa.");
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      rating,
      comment: comment || null,
    })
    .eq("reviewer_id", user.id)
    .eq("reviewed_user_id", reviewedUserId);

  if (error) {
    throw error;
  }
};
