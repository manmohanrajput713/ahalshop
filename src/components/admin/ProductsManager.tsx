"use client";

import { useState } from "react";
import ProductForm from "./ProductForm";
import { Trash2, Plus, Edit, Loader2, Package, X } from "lucide-react";
import Image from "next/image";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";

export default function ProductsManager({ initialProducts }: { initialProducts: any[] }) {
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleSuccess = () => {
    setEditingProduct(null);
    setShowAddForm(false);
  };

  return (
    <>
      {/* Products List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">All Products ({initialProducts.length})</h2>
          </div>
          <button
            onClick={() => { setShowAddForm(true); setEditingProduct(null); }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs tracking-wider uppercase font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Badge</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {initialProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-accent/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                        <Image 
                          src={product.img} 
                          alt={product.alt || product.name} 
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                  <td className="px-6 py-4 text-muted-foreground">{product.price}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      const stock = product.stock ?? 0;
                      if (stock === 0) {
                        return (
                          <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Out of Stock
                          </span>
                        );
                      } else if (stock <= 5) {
                        return (
                          <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 text-xs px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            {stock} left
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 text-xs px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {stock}
                          </span>
                        );
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    {product.badge ? (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                        {product.badge}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-muted-foreground hover:text-foreground p-2 rounded hover:bg-accent transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setProductToDelete(product)}
                        className="text-destructive hover:text-destructive/80 p-2 rounded hover:bg-destructive/10 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No products found. Add one to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Edit / Add Product Modal ─── */}
      {(editingProduct || showAddForm) && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div 
            className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                {editingProduct ? (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Edit className="w-4 h-4 text-primary" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  {editingProduct && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Editing: {editingProduct.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setEditingProduct(null); setShowAddForm(false); }}
                className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <ProductForm
                key={editingProduct ? editingProduct.id : "new"}
                initialData={editingProduct}
                onSuccess={handleSuccess}
                onCancel={() => { setEditingProduct(null); setShowAddForm(false); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 
              className="text-xl font-normal text-foreground mb-3 flex items-center gap-2"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              <Trash2 className="text-destructive" size={20} />
              Delete Product
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <span className="font-medium text-foreground">&quot;{productToDelete.name}&quot;</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs tracking-wider uppercase font-medium text-foreground hover:bg-muted border border-border rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteProduct(productToDelete.id);
                  } finally {
                    setIsDeleting(false);
                    setProductToDelete(null);
                  }
                }}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs tracking-wider uppercase font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
