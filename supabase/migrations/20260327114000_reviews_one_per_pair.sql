-- Prevent duplicate reviews from the same reviewer to the same reviewed user.

with ranked_reviews as (
  select
    ctid,
    row_number() over (
      partition by reviewer_id, reviewed_user_id
      order by created_at desc, id desc
    ) as row_num
  from public.reviews
)
delete from public.reviews r
using ranked_reviews rr
where r.ctid = rr.ctid
  and rr.row_num > 1;

create unique index if not exists idx_reviews_unique_reviewer_reviewed
  on public.reviews(reviewer_id, reviewed_user_id);
