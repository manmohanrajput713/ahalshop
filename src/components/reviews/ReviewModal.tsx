"use client";

import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productId: string | number;
  productName: string;
};

export default function ReviewModal({ isOpen, onClose, productId, productName }: ReviewModalProps) {
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const name = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "";
          setNewReview(prev => ({ ...prev, name }));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: String(productId),
          name: newReview.name,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setNewReview({ name: "", rating: 5, comment: "" });
        }, 2000);
      } else {
        setError(data.error || "Failed to submit review. You might have already reviewed this product.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border p-6 rounded-xl w-full max-w-md relative shadow-xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-medium text-foreground mb-1 uppercase tracking-[0.1em] text-center" style={{ fontFamily: "var(--font-lora), serif" }}>
          Write a Review
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">for {productName}</p>

        {success ? (
          <div className="bg-green-500/10 text-green-600 p-4 rounded-md text-center text-sm">
            Thank you for your review!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 text-red-600 p-3 rounded-md text-xs">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-muted-foreground mb-1">Your Name</label>
              <input 
                type="text" 
                required
                readOnly
                value={newReview.name}
                className="w-full bg-muted/50 text-muted-foreground border border-border px-4 py-3 text-sm focus:outline-none cursor-not-allowed"
                placeholder="Loading..."
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
                      size={24} 
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
                className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                placeholder="Share your experience..."
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 py-4 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
