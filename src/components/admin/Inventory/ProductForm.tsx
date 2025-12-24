"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ImageUpload from "@/components/ui/image-upload";

// --- CATEGORIES HOOK ---
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

  const [images, setImages] = useState<string[]>(initialData?.gallery || []);

  // Specific State for Hair Logic
  const [colors, setColors] = useState<string[]>([]);
  const [lengths, setLengths] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
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
    replace: replaceVariants,
  } = useFieldArray({ control, name: "variants" });

  // --- 1. INITIALIZE DATA (Edit Mode) ---
  useEffect(() => {
    if (initialData?.options) {
      const colorOpt = initialData.options.find((o: any) => o.name === "Color");
      const lengthOpt = initialData.options.find((o: any) => o.name === "Length");
      if (colorOpt) setColors(colorOpt.values);
      if (lengthOpt) setLengths(lengthOpt.values);
    }
  }, [initialData]);

  // --- 2. AUTO-GENERATE VARIANTS MATRIX ---
  useEffect(() => {
    // If we have no colors or lengths, don't generate (or clear)
    if (colors.length === 0 && lengths.length === 0) {
      // Don't clear if it's initial load to prevent wiping existing data
      // We rely on user action (adding/removing colors/lengths) to trigger this mostly.
      return;
    }

    const currentVariants = watch("variants") || [];
    const newVariants: any[] = [];

    // If only colors exist (e.g. "Red", "Blue")
    if (colors.length > 0 && lengths.length === 0) {
      colors.forEach((color) => {
        newVariants.push(createVariantObject(color, { Color: color }, currentVariants));
      });
    }
    // If only lengths exist (e.g. "14", "16")
    else if (lengths.length > 0 && colors.length === 0) {
      lengths.forEach((len) => {
        newVariants.push(createVariantObject(`${len}"`, { Length: len }, currentVariants));
      });
    }
    // If BOTH exist (Matrix)
    else {
      colors.forEach((color) => {
        lengths.forEach((len) => {
          const name = `${color} / ${len}"`;
          const attributes = { Color: color, Length: len };
          newVariants.push(createVariantObject(name, attributes, currentVariants));
        });
      });
    }

    // Only update if count changed or strictly needed to avoid infinite loops
    // (Simple check: if we generated something different than what we have)
    if (newVariants.length > 0) {
      replaceVariants(newVariants);
    }
  }, [colors, lengths]); // Dependencies: Only run when Colors or Lengths array changes

  // Helper to preserve existing data (Stock, Price) when regenerating
  const createVariantObject = (name: string, attributes: any, currentList: any[]) => {
    // Try to find if this variant existed before (by name or attributes)
    const existing = currentList.find((v) =>
      JSON.stringify(v.attributes) === JSON.stringify(attributes)
    );

    return {
      name,
      attributes,
      stockQuantity: existing?.stockQuantity ?? 0,
      priceOverrideNgn: existing?.priceOverrideNgn ?? "",
      priceOverrideUsd: existing?.priceOverrideUsd ?? "",
      image: existing?.image ?? "",
    };
  };

  // --- HANDLERS FOR TAG INPUTS ---
  const addTag = (type: "color" | "length", value: string) => {
    if (!value.trim()) return;
    if (type === "color" && !colors.includes(value)) setColors([...colors, value]);
    if (type === "length" && !lengths.includes(value)) setLengths([...lengths, value]);
  };

  const removeTag = (type: "color" | "length", value: string) => {
    if (type === "color") setColors(colors.filter((c) => c !== value));
    if (type === "length") setLengths(lengths.filter((l) => l !== value));
  };

  // --- MUTATION ---
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Prepare Options Structure
      const options = [];
      if (colors.length > 0) options.push({ name: "Color", values: colors });
      if (lengths.length > 0) options.push({ name: "Length", values: lengths });

      const payload = {
        ...data,
        priceNgn: Number(data.priceNgn),
        priceUsd: Number(data.priceUsd),
        compareAtPriceNgn: data.compareAtPriceNgn ? Number(data.compareAtPriceNgn) : null,
        compareAtPriceUsd: data.compareAtPriceUsd ? Number(data.compareAtPriceUsd) : null,
        stockQuantity: Number(data.stockQuantity),
        gallery: images,
        isHot: Boolean(data.isHot),
        options: options, // 👈 Save the structure so we can edit later
        variants: data.variants.map((v: any) => ({
          name: v.name,
          stockQuantity: Number(v.stockQuantity),
          attributes: v.attributes,
          priceOverrideNgn: v.priceOverrideNgn ? Number(v.priceOverrideNgn) : null,
          priceOverrideUsd: v.priceOverrideUsd ? Number(v.priceOverrideUsd) : null,
          image: v.image || null,
        })),
      };

      // Clean up utility fields if present
      delete payload.category;
      delete payload.reviews;

      if (initialData) {
        return api.patch(`/admin/inventory/${initialData.id}`, payload);
      } else {
        return api.post("/admin/inventory", payload);
      }
    },
    onSuccess: () => {
      toast.success(initialData ? "Product updated!" : "Product published!");
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      router.push("/inventory");
    },
    onError: (err: any) => {
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

        {/* LEFT COLUMN: IMAGES */}
        <div className="lg:col-span-5 space-y-6">
          <label className="block text-sm font-bold text-black">Product Gallery</label>
          <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
            <ImageUpload
              value={images}
              disabled={mutation.isPending}
              onChange={(newUrls) => setImages(newUrls)}
              onRemove={(url) => setImages(images.filter((c) => c !== url))}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="lg:col-span-7 space-y-6">
          {/* Basic Info */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Product Name</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:border-[#DC8404] bg-gray-50/50"
              placeholder="e.g. Bone Straight Wig"
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Category</label>
              <select
                {...register("categoryId", { required: "Required" })}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:border-[#DC8404] bg-gray-50/50"
              >
                <option value="">Select...</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Total Stock</label>
              <input
                type="number"
                {...register("stockQuantity")}
                disabled={variantFields.length > 0}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:border-[#DC8404] bg-gray-50/50"
                placeholder="Total sum of variants"
              />
              {variantFields.length > 0 && (
                <p className="text-xs text-gray-400">Calculated automatically from variants.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Description</label>
            <textarea
              {...register("description")}
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:border-[#DC8404] bg-gray-50/50"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-6 bg-[#FFF8E6]/50 p-6 rounded-2xl border border-[#DC8404]/10">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Base Price (NGN)</label>
              <input
                type="number"
                {...register("priceNgn", { required: true })}
                className="w-full h-12 px-4 border border-orange-200/50 rounded-xl focus:border-[#DC8404] bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Base Price (USD)</label>
              <input
                type="number"
                {...register("priceUsd", { required: true })}
                className="w-full h-12 px-4 border border-orange-200/50 rounded-xl focus:border-[#DC8404] bg-white"
              />
            </div>
          </div>

          {/* --- HAIR ATTRIBUTES SECTION --- */}
          <div className="pt-6 border-t border-gray-100 space-y-6">
            <h3 className="font-bold text-lg text-black">Product Variants</h3>

            {/* 1. COLORS INPUT */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">1. Available Colors</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {colors.map((c) => (
                  <span key={c} className="bg-black text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    {c}
                    <button type="button" onClick={() => removeTag("color", c)}><X size={12} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="Type color and press Enter (e.g. Natural, Red)"
                  className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag("color", e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>

            {/* 2. LENGTHS INPUT */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">2. Available Lengths</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {lengths.map((l) => (
                  <span key={l} className="bg-gray-200 text-black px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    {l}&quot;
                    <button type="button" onClick={() => removeTag("length", l)}><X size={12} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="Type length and press Enter (e.g. 14, 16)"
                  className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag("length", e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* --- VARIANTS TABLE --- */}
          {variantFields.length > 0 && (
            <div className="pt-4">
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-3 w-1/3">Variant</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Price (NGN)</th>
                      <th className="p-3">Price (USD)</th>
                      <th className="p-3">Image</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {variantFields.map((field, index) => (
                      <tr key={field.id} className="bg-white">
                        <td className="p-3 font-medium text-black">
                          {watch(`variants.${index}.name`)}
                        </td>
                        <td className="p-3">
                          <input
                            {...register(`variants.${index}.stockQuantity` as const)}
                            type="number"
                            className="w-20 h-8 px-2 border border-gray-200 rounded bg-white focus:border-[#DC8404] outline-none text-xs"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            {...register(`variants.${index}.priceOverrideNgn` as const)}
                            placeholder="Override"
                            type="number"
                            className="w-24 h-8 px-2 border border-gray-200 rounded bg-gray-50 focus:bg-white text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            {...register(`variants.${index}.priceOverrideUsd` as const)}
                            placeholder="Override"
                            type="number"
                            className="w-24 h-8 px-2 border border-gray-200 rounded bg-gray-50 focus:bg-white text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            {...register(`variants.${index}.image` as const)}
                            className="w-32 h-8 px-2 border border-gray-200 rounded bg-gray-50 text-xs"
                          >
                            <option value="">Default Img</option>
                            {images.map((img, i) => (
                              <option key={i} value={img}>Image {i + 1}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 w-full pt-6 border-t border-gray-100 flex justify-end">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-black hover:bg-gray-800 text-white h-14 px-12 rounded-xl text-lg font-medium w-full md:w-auto shadow-lg shadow-gray-200"
        >
          {mutation.isPending ? <Loader2 className="animate-spin" /> : initialData ? "Update Product" : "Publish Product"}
        </Button>
      </div>
    </form>
  );
}