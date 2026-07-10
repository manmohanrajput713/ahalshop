"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

type Review = {
  id: string | number;
  product_id?: string;
  name: string;
  rating: number;
  comment: string;
  created_at?: string;
  date?: string; // Fallback for UI if created_at is missing
};

export default function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Static fallback reviews
  const staticReviews: Review[] = [
    { id: 'static-1', name: 'Sarah M.', rating: 5, comment: 'Absolutely love this product! My skin feels amazing after just a few days of use.', date: 'Oct 12, 2023' },
    { id: 'static-2', name: 'Priya K.', rating: 4, comment: 'Great quality and fast delivery. Will definitely be buying again.', date: 'Sep 28, 2023' },
    { id: 'static-3', name: 'Jessica T.', rating: 5, comment: 'Highly recommended! The ingredients are natural and it smells wonderful.', date: 'Sep 15, 2023' },
    { id: 'static-4', name: 'Ananya R.', rating: 5, comment: 'Very gentle on the skin. I’ve noticed a visible glow since I started using it.', date: 'Aug 30, 2023' },
  ];

  // Fetch reviews on mount
  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        if (res.ok) {
          const data = await res.json();
          // Merge fetched reviews with static ones
          setReviews([...(data.reviews || []), ...staticReviews]);
        } else {
          setReviews(staticReviews);
        }
      } catch (e) {
        console.error("Failed to load reviews", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, [productId]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="mt-24 max-w-4xl mx-auto">
      <div className="border-b border-border pb-6 mb-10 flex items-center justify-between">
        <h2 
          className="text-3xl font-normal text-foreground"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          Customer Reviews
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={16} 
                className={star <= parseFloat(averageRating) ? "text-accent fill-accent" : "text-border"} 
              />
            ))}
          </div>
          <span className="text-sm font-medium">{averageRating}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-[0.1em]">({reviews.length} Reviews)</span>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {/* Reviews List */}
        <div className="space-y-8">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground italic text-sm">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-border/50 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{review.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : review.date}
                  </span>
                </div>
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={14} 
                      className={star <= review.rating ? "text-accent fill-accent" : "text-border"} 
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
