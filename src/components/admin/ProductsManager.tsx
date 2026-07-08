"use client";

import { useState } from "react";
import ProductForm from "./ProductForm";
import { Trash2, Plus, Edit } from "lucide-react";
import Image from "next/image";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";

export default function ProductsManager({ initialProducts }: { initialProducts: any[] }) {
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleSuccess = () => {
    setEditingProduct(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Add/Edit Product Form */}
      <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6 h-fit sticky top-8">
        <div className="flex items-center gap-2 mb-6">
          {editingProduct ? (
            <Edit className="w-5 h-5 text-primary" />
          ) : (
            <Plus className="w-5 h-5 text-primary" />
          )}
          <h2 className="text-xl font-semibold text-foreground">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>
        </div>
        
        {/* We use key to force re-mount when editingProduct changes, clearing old state */}
        <ProductForm 
          key={editingProduct ? editingProduct.id : "new"} 
          initialData={editingProduct} 
          onSuccess={handleSuccess}
          onCancel={handleCancelEdit}
        />
      </div>

      {/* Products List */}
      <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden h-fit">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">All Products ({initialProducts.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
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
                      <form action={async () => {
                        await deleteProduct(product.id);
                      }}>
                        <button 
                          type="submit"
                          className="text-destructive hover:text-destructive/80 p-2 rounded hover:bg-destructive/10 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {initialProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No products found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
