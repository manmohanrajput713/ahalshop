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
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reviews on mount
  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch (e) {
        console.error("Failed to load reviews", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name: newReview.name,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Prepend new review
        setReviews([data.review, ...reviews]);
        setNewReview({ name: "", rating: 5, comment: "" });
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Write Review Form */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-6 uppercase tracking-[0.1em] text-sm">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-muted-foreground mb-1">Your Name</label>
              <input 
                type="text" 
                required
                value={newReview.name}
                onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                className="w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-muted-foreground mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({...newReview, rating: star})}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      size={20} 
                      className={star <= newReview.rating ? "text-accent fill-accent" : "text-muted"} 
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-muted-foreground mb-1">Your Review</label>
              <textarea 
                required
                rows={4}
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                className="w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                placeholder="Share your experience..."
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 py-4 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-8">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground italic text-sm">No reviews yet. Be the first to review!</p>
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
