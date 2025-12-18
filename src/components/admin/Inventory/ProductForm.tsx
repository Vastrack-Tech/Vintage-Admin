"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ImageUpload from "@/components/ui/image-upload"; // 👈 Import the new component

// --- HOOK FOR CATEGORIES ---
const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/admin/inventory/categories");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

interface ProductFormProps {
  initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  // State for gallery URLs (managed by ImageUpload component)
  const [images, setImages] = useState<string[]>(initialData?.gallery || []);

  // --- FORM SETUP ---
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      title: "",
      description: "",
      categoryId: "",
      priceNgn: "",
      priceUsd: "",
      compareAtPriceNgn: "",
      compareAtPriceUsd: "",
      stockQuantity: "",
      isHot: false,
      variants: [],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  // --- MUTATION ---
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        priceNgn: Number(data.priceNgn),
        priceUsd: Number(data.priceUsd),
        compareAtPriceNgn: data.compareAtPriceNgn
          ? Number(data.compareAtPriceNgn)
          : null,
        compareAtPriceUsd: data.compareAtPriceUsd
          ? Number(data.compareAtPriceUsd)
          : null,
        gallery: images, // 👈 Send Cloudinary URLs
        isHot: Boolean(data.isHot),
        variants: data.variants.map((v: any) => ({
          name: v.name,
          stockQuantity: Number(v.stockQuantity),
          attributes: {},
        })),
      };

      if (initialData) {
        return api.patch(`/admin/inventory/${initialData.id}`, payload);
      } else {
        return api.post("/admin/inventory", payload);
      }
    },
    onSuccess: () => {
      toast.success(
        initialData
          ? "Product updated successfully!"
          : "Product created successfully!"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      router.push("/inventory");
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save product.");
    },
  });

  const onSubmit = (data: any) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white text-black p-6 md:p-8 rounded-[20px] shadow-sm max-w-7xl mx-auto border border-gray-100"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT COLUMN: CLOUDINARY IMAGE UPLOAD */}
        <div className="lg:col-span-5 space-y-6">
          <label className="block text-sm font-bold text-black">
            Product Images
          </label>
          <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
            {/* 👇 The new component handles Upload + Preview + Delete 
                 It updates the 'images' state directly with Cloudinary URLs
             */}
            <ImageUpload
              value={images}
              disabled={mutation.isPending}
              onChange={(newUrls) => setImages(newUrls)}
              onRemove={(urlToRemove) =>
                setImages(images.filter((current) => current !== urlToRemove))
              }
            />
            <p className="text-xs text-gray-400 mt-4 text-center">
              Supported formats: JPG, PNG, WEBP. Max size: 5MB.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Product Name</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DC8404] bg-gray-50/50"
              placeholder="e.g. Bone Straight Wig"
            />
            {errors.title && (
              <p className="text-red-500 text-xs">
                {errors.title.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Category</label>
              <div className="relative">
                <select
                  {...register("categoryId", {
                    required: "Category is required",
                  })}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DC8404] bg-gray-50/50 appearance-none cursor-pointer"
                  disabled={isLoadingCategories}
                >
                  <option value="">
                    {isLoadingCategories ? "Loading..." : "Select Category"}
                  </option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-black">
                Unit in Stock (Total)
              </label>
              <input
                type="number"
                {...register("stockQuantity")}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DC8404] bg-gray-50/50"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Description</label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DC8404] resize-none bg-gray-50/50"
              placeholder="Product details..."
            />
          </div>

          {/* HOT TOGGLE */}
          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="isHot"
              {...register("isHot")}
              className="w-5 h-5 accent-[#DC8404] rounded cursor-pointer"
            />
            <label
              htmlFor="isHot"
              className="text-sm font-bold text-black cursor-pointer select-none"
            >
              Mark as Hot Product (Trending)
            </label>
          </div>

          {/* PRICES GRID */}
          <div className="grid grid-cols-2 gap-6 bg-[#FFF8E6]/50 p-6 rounded-2xl border border-[#DC8404]/10">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">
                Selling Price (NGN)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-medium">
                  ₦
                </span>
                <input
                  type="number"
                  {...register("priceNgn", { required: true })}
                  className="w-full h-12 pl-10 pr-4 border border-orange-200/50 rounded-xl focus:outline-none focus:border-[#DC8404] bg-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-black">
                Selling Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-medium">
                  $
                </span>
                <input
                  type="number"
                  {...register("priceUsd", { required: true })}
                  className="w-full h-12 pl-8 pr-4 border border-orange-200/50 rounded-xl focus:outline-none focus:border-[#DC8404] bg-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-black">
                Original Price (NGN)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-medium">
                  ₦
                </span>
                <input
                  type="number"
                  {...register("compareAtPriceNgn")}
                  className="w-full h-12 pl-10 pr-4 border border-orange-200/50 rounded-xl focus:outline-none focus:border-[#DC8404] bg-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-black">
                Original Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-medium">
                  $
                </span>
                <input
                  type="number"
                  {...register("compareAtPriceUsd")}
                  className="w-full h-12 pl-8 pr-4 border border-orange-200/50 rounded-xl focus:outline-none focus:border-[#DC8404] bg-white"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* VARIANTS SECTION */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-black">Product Variants</h3>
              <button
                type="button"
                onClick={() => appendVariant({ name: "", stockQuantity: 0 })}
                className="flex items-center gap-2 text-[#DC8404] font-medium text-sm hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={16} /> Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {variantFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100"
                >
                  <div className="flex-1">
                    <label className="text-xs font-bold text-black mb-1 block">
                      Variant Name
                    </label>
                    <input
                      {...register(`variants.${index}.name` as const, {
                        required: true,
                      })}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-white focus:border-[#DC8404] outline-none"
                      placeholder="e.g. 18 inch"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-bold text-black mb-1 block">
                      Stock
                    </label>
                    <input
                      type="number"
                      {...register(`variants.${index}.stockQuantity` as const)}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-white focus:border-[#DC8404] outline-none"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="h-10 w-10 flex items-center justify-center text-black hover:text-red-500 hover:bg-red-50 rounded-lg mt-5"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 w-full pt-6 border-t border-gray-100 flex justify-end">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-black hover:bg-gray-800 text-white h-14 px-12 rounded-xl text-lg font-medium w-full md:w-auto shadow-lg shadow-gray-200"
        >
          {mutation.isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" /> Saving...
            </div>
          ) : initialData ? (
            "Update Product"
          ) : (
            "Publish Product"
          )}
        </Button>
      </div>
    </form>
  );
}
