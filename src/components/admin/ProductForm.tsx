"use client";

import { useActionState } from "react";
import { addProduct, editProduct } from "@/app/admin/(dashboard)/products/actions";

export default function ProductForm({ 
  onSuccess, 
  initialData, 
  onCancel 
}: { 
  onSuccess?: () => void,
  initialData?: any,
  onCancel?: () => void
}) {
  const isEditing = !!initialData;
  
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = isEditing ? await editProduct(formData) : await addProduct(formData);
      if (result.success && onSuccess) {
        onSuccess();
      }
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm border border-red-500/50">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-lg text-sm border border-emerald-500/50">
          Product {isEditing ? "updated" : "added"} successfully!
        </div>
      )}

      {/* Hidden inputs for edit mode */}
      {isEditing && (
        <>
          <input type="hidden" name="id" value={initialData.id} />
          <input type="hidden" name="currentImg" value={initialData.img} />
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
          <input type="text" name="name" defaultValue={initialData?.name} required className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Vitamin C Serum" />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
          <input type="text" name="category" defaultValue={initialData?.category} required className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Face Serum" />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Price</label>
          <input type="text" name="price" defaultValue={initialData?.price} required className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. ₹499" />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Badge (Optional)</label>
          <input type="text" name="badge" defaultValue={initialData?.badge || ""} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Bestseller" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Main Product Image {isEditing && <span className="text-xs text-muted-foreground ml-2">(Leave empty to keep current)</span>}
          </label>
          <input type="file" name="imageFile" accept="image/*" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Extra Carousel Images {isEditing && <span className="text-xs text-muted-foreground ml-2">(Leave empty to keep current)</span>}
          </label>
          <input type="file" name="extraImages" accept="image/*" multiple className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
          {isEditing && initialData?.images && (
            <input type="hidden" name="currentExtraImages" value={JSON.stringify(initialData.images)} />
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Alt Text</label>
          <input type="text" name="alt" defaultValue={initialData?.alt} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Description for image" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
          <textarea name="description" defaultValue={initialData?.description} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Product description" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Size / Weight</label>
          <input type="text" name="size" defaultValue={initialData?.size} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 50 g" />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Suitable For</label>
          <input type="text" name="suitableFor" defaultValue={initialData?.suitable_for} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. All skin types" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Key Ingredients (comma separated)</label>
          <input type="text" name="ingredients" defaultValue={initialData?.ingredients?.join ? initialData.ingredients.join(', ') : initialData?.ingredients} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Neem, Aloe Vera, Sandalwood" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Benefits (comma separated)</label>
          <textarea name="benefits" defaultValue={initialData?.benefits?.join ? initialData.benefits.join(', ') : initialData?.benefits} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Deep cleanses pores, Brightens complexion" rows={3} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">How to Use</label>
          <textarea name="howToUse" defaultValue={initialData?.how_to_use} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Instructions on how to use the product" rows={3} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="w-full bg-muted hover:bg-muted/80 text-foreground font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : (isEditing ? "Update Product" : "Add Product")}
        </button>
      </div>
    </form>
  );
}
