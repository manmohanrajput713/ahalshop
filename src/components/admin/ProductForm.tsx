"use client";

import { useActionState, useState, useRef } from "react";
import { addProduct, editProduct } from "@/app/admin/(dashboard)/products/actions";
import { ALL_PRODUCTS } from "@/lib/data";
import Image from "next/image";
import { Upload, X, ImagePlus, Replace, Trash2 } from "lucide-react";

export default function ProductForm({ 
  onSuccess, 
  initialData, 
  categories = [],
  onCancel 
}: { 
  onSuccess?: () => void,
  initialData?: any,
  categories?: any[],
  onCancel?: () => void
}) {
  const isEditing = !!initialData;
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const extraImagesInputRef = useRef<HTMLInputElement>(null);

  // Image management state
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    isEditing ? initialData?.img || null : null
  );
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [removeMainImage, setRemoveMainImage] = useState(false);

  // Carousel images: existing URLs we're keeping + new file previews
  // Fallback to static ALL_PRODUCTS data if DB has no images (same logic as product detail page)
  const resolvedImages = (() => {
    if (isEditing) {
      if (initialData?.images && initialData.images.length > 0) return [...initialData.images];
      const staticProduct = ALL_PRODUCTS.find((p: any) => p.id === initialData?.id || p.name === initialData?.name);
      if (staticProduct?.images) return [...staticProduct.images];
    }
    return [];
  })();
  const [keptExtraImages, setKeptExtraImages] = useState<string[]>(resolvedImages);
  const [newExtraFiles, setNewExtraFiles] = useState<File[]>([]);
  const [newExtraPreviews, setNewExtraPreviews] = useState<string[]>([]);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      // Inject our managed image data
      if (isEditing) {
        formData.set("removeMainImage", removeMainImage ? "true" : "false");
        formData.set("keptExtraImages", JSON.stringify(keptExtraImages));
      }

      // Clear the default extraImages and re-add only our tracked files
      formData.delete("extraImages");
      newExtraFiles.forEach(f => formData.append("extraImages", f));

      const result = isEditing ? await editProduct(formData) : await addProduct(formData);
      if (result.success && onSuccess) {
        onSuccess();
      }
      return result;
    },
    null
  );

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setRemoveMainImage(false);
      const url = URL.createObjectURL(file);
      setMainImagePreview(url);
    }
  };

  const handleRemoveMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview(null);
    setRemoveMainImage(true);
    if (mainImageInputRef.current) mainImageInputRef.current.value = "";
  };

  const handleReplaceMainImage = () => {
    mainImageInputRef.current?.click();
  };

  const handleRemoveExtraImage = (index: number) => {
    setKeptExtraImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewExtra = (index: number) => {
    setNewExtraFiles(prev => prev.filter((_, i) => i !== index));
    setNewExtraPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewExtraFiles(prev => [...prev, ...files]);
      const previews = files.map(f => URL.createObjectURL(f));
      setNewExtraPreviews(prev => [...prev, ...previews]);
    }
    if (extraImagesInputRef.current) extraImagesInputRef.current.value = "";
  };

  const inputClass = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";
  const labelClass = "block text-xs font-medium tracking-wide uppercase text-muted-foreground mb-1.5";

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm border border-red-500/30 flex items-center gap-2">
          <span className="shrink-0">⚠</span> {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-lg text-sm border border-emerald-500/30 flex items-center gap-2">
          <span className="shrink-0">✓</span> Product {isEditing ? "updated" : "added"} successfully!
        </div>
      )}

      {/* Hidden inputs */}
      {isEditing && (
        <>
          <input type="hidden" name="id" value={initialData.id} />
          <input type="hidden" name="currentImg" value={initialData.img} />
        </>
      )}

      {/* ─── IMAGES SECTION ─── */}
      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
          <ImagePlus size={14} /> Images
        </h3>

        {/* Main Product Image */}
        <div className="mb-4">
          <label className={labelClass}>Main Product Image</label>
          {mainImagePreview ? (
            <div className="relative group rounded-xl overflow-hidden border border-border bg-card">
              <div className="relative w-full aspect-square max-h-52">
                <Image
                  src={mainImagePreview}
                  alt="Product preview"
                  fill
                  className="object-contain p-3"
                  unoptimized={mainImagePreview.startsWith("blob:")}
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={handleReplaceMainImage}
                  className="bg-white text-gray-800 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <Replace size={13} /> Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveMainImage}
                  className="bg-red-500 text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleReplaceMainImage}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
            >
              <Upload size={24} />
              <span className="text-xs font-medium">Click to upload main image</span>
            </button>
          )}
          <input
            ref={mainImageInputRef}
            type="file"
            name="imageFile"
            accept="image/*"
            onChange={handleMainImageChange}
            className="hidden"
          />
        </div>

        {/* Carousel / Extra Images */}
        <div>
          <label className={labelClass}>
            Gallery Images
            <span className="text-[10px] normal-case tracking-normal font-normal text-muted-foreground/60 ml-1">
              (shown in product carousel)
            </span>
          </label>

          <div className="grid grid-cols-4 gap-2">
            {/* Existing kept images */}
            {keptExtraImages.map((url, i) => (
              <div key={`existing-${i}`} className="relative group rounded-lg overflow-hidden border border-border bg-card aspect-square">
                <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-contain p-1" />
                <button
                  type="button"
                  onClick={() => handleRemoveExtraImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Newly added images */}
            {newExtraPreviews.map((url, i) => (
              <div key={`new-${i}`} className="relative group rounded-lg overflow-hidden border border-dashed border-primary/40 bg-primary/5 aspect-square">
                <Image src={url} alt={`New ${i + 1}`} fill className="object-contain p-1" unoptimized />
                <span className="absolute bottom-1 left-1 text-[8px] bg-primary text-primary-foreground px-1 py-0.5 rounded font-medium">NEW</span>
                <button
                  type="button"
                  onClick={() => handleRemoveNewExtra(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Add more button */}
            <button
              type="button"
              onClick={() => extraImagesInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors cursor-pointer gap-1"
            >
              <ImagePlus size={18} />
              <span className="text-[9px] font-medium">Add</span>
            </button>
          </div>

          <input
            ref={extraImagesInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddExtraImages}
            className="hidden"
          />
        </div>
      </div>

      <hr className="border-border" />

      {/* ─── BASIC INFO SECTION ─── */}
      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">Basic Info</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" name="name" defaultValue={initialData?.name} required className={inputClass} placeholder="e.g. Vitamin C Serum" />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            {categories && categories.length > 0 ? (
              <select name="category" defaultValue={initialData?.category || ""} required className={inputClass}>
                <option value="" disabled>Select a category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            ) : (
              <input type="text" name="category" defaultValue={initialData?.category} required className={inputClass} placeholder="e.g. Face Serum" />
            )}
          </div>
          <div>
            <label className={labelClass}>Price</label>
            <input type="text" name="price" defaultValue={initialData?.price} required className={inputClass} placeholder="e.g. ₹499" />
          </div>
          <div>
            <label className={labelClass}>Badge</label>
            <input type="text" name="badge" defaultValue={initialData?.badge || ""} className={inputClass} placeholder="e.g. Bestseller" />
          </div>
          <div>
            <label className={labelClass}>Stock</label>
            <input type="number" name="stock" min="0" defaultValue={initialData?.stock ?? 0} required className={inputClass} placeholder="e.g. 50" />
          </div>
          <div>
            <label className={labelClass}>Alt Text</label>
            <input type="text" name="alt" defaultValue={initialData?.alt} className={inputClass} placeholder="Image description" />
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* ─── DETAILS SECTION ─── */}
      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">Details</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" defaultValue={initialData?.description} className={inputClass} placeholder="Product description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Size / Weight</label>
              <input type="text" name="size" defaultValue={initialData?.size} className={inputClass} placeholder="e.g. 50 g" />
            </div>
            <div>
              <label className={labelClass}>Suitable For</label>
              <input type="text" name="suitableFor" defaultValue={initialData?.suitable_for} className={inputClass} placeholder="e.g. All skin types" />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* ─── INGREDIENTS & USAGE SECTION ─── */}
      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">Ingredients & Usage</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Key Ingredients <span className="text-[10px] normal-case tracking-normal font-normal text-muted-foreground/60">(comma separated)</span></label>
            <input type="text" name="ingredients" defaultValue={initialData?.ingredients?.join ? initialData.ingredients.join(', ') : initialData?.ingredients} className={inputClass} placeholder="e.g. Neem, Aloe Vera, Sandalwood" />
          </div>
          <div>
            <label className={labelClass}>Benefits <span className="text-[10px] normal-case tracking-normal font-normal text-muted-foreground/60">(comma separated)</span></label>
            <textarea name="benefits" defaultValue={initialData?.benefits?.join ? initialData.benefits.join(', ') : initialData?.benefits} className={inputClass} placeholder="e.g. Deep cleanses pores, Brightens complexion" rows={3} />
          </div>
          <div>
            <label className={labelClass}>How to Use</label>
            <textarea name="howToUse" defaultValue={initialData?.how_to_use} className={inputClass} placeholder="Usage instructions" rows={3} />
          </div>
        </div>
      </div>

      {/* ─── ACTIONS ─── */}
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-card pb-1">
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : (isEditing ? "Update Product" : "Add Product")}
        </button>
      </div>
    </form>
  );
}
