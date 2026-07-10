"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Trash2, Star, RefreshCw } from "lucide-react";

type Review = {
  id: number;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare size={28} /> Product Reviews
          </h1>
          <p className="text-muted-foreground mt-1">Manage and moderate customer reviews.</p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product ID</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                      {review.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="bg-secondary px-2 py-1 rounded text-xs">
                        {review.product_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-semibold text-amber-600 mr-1">{review.rating}</span>
                        <Star size={14} className="fill-amber-500 text-amber-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/80 max-w-md truncate">
                      {review.comment}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
