"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2, X, Plus, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// Define structure for Color Object
interface ColorOption {
  name: string;
  hex: string;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();

  const [images, setImages] = useState<string[]>(initialData?.gallery || []);

  // --- CHANGED: Colors is now an array of objects {name, hex} ---
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [lengths, setLengths] = useState<string[]>([]);

  // State for the Color Picker Inputs
  const [tempColorName, setTempColorName] = useState("");
  const [tempColorHex, setTempColorHex] = useState("#000000");
  const [isColorPopoverOpen, setIsColorPopoverOpen] = useState(false);

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

  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control,
    name: "variants",
  });

  // --- 1. INITIALIZE DATA (Edit Mode) ---
  useEffect(() => {
    if (initialData?.options) {
      // Logic for Colors: Handle legacy strings or new objects
      const colorOpt = initialData.options.find((o: any) => o.name === "Color");
      if (colorOpt) {
        // Check if values are strings or objects and normalize
        const normalizedColors = colorOpt.values.map((val: any) => {
          if (typeof val === "string") return { name: val, hex: "#000000" }; // Fallback for old data
          return val;
        });
        setColors(normalizedColors);
      }

      const lengthOpt = initialData.options.find((o: any) => o.name === "Length");
      if (lengthOpt) setLengths(lengthOpt.values);
    }
  }, [initialData]);

  // --- 2. AUTO-GENERATE VARIANTS MATRIX ---
  useEffect(() => {
    if (colors.length === 0 && lengths.length === 0) return;

    const currentVariants = watch("variants") || [];
    const newVariants: any[] = [];

    if (colors.length > 0 && lengths.length === 0) {
      colors.forEach((color) => {
        newVariants.push(
          createVariantObject(color.name, { Color: color.name }, currentVariants)
        );
      });
    } else if (lengths.length > 0 && colors.length === 0) {
      lengths.forEach((len) => {
        newVariants.push(
          createVariantObject(`${len}"`, { Length: len }, currentVariants)
        );
      });
    } else {
      colors.forEach((color) => {
        lengths.forEach((len) => {
          const name = `${color.name} / ${len}"`;
          const attributes = { Color: color.name, Length: len };
          newVariants.push(createVariantObject(name, attributes, currentVariants));
        });
      });
    }

    if (newVariants.length > 0) {
      replaceVariants(newVariants);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, lengths]);

  const createVariantObject = (
    name: string,
    attributes: any,
    currentList: any[]
  ) => {
    const existing = currentList.find(
      (v) => JSON.stringify(v.attributes) === JSON.stringify(attributes)
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

  // --- HANDLERS ---

  const addColor = () => {
    if (!tempColorName.trim()) return;
    // Prevent duplicates
    if (!colors.some((c) => c.name.toLowerCase() === tempColorName.toLowerCase())) {
      setColors([...colors, { name: tempColorName, hex: tempColorHex }]);
    }
    setTempColorName("");
    setTempColorHex("#000000");
    setIsColorPopoverOpen(false);
  };

  const removeColor = (nameToRemove: string) => {
    setColors(colors.filter((c) => c.name !== nameToRemove));
  };

  const addLength = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val && !lengths.includes(val)) {
        setLengths([...lengths, val]);
      }
      e.currentTarget.value = "";
    }
  };

  const removeLength = (val: string) => {
    setLengths(lengths.filter((l) => l !== val));
  };

  // --- MUTATION ---
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const options = [];
      // Pass the full color object {name, hex} to backend
      if (colors.length > 0) options.push({ name: "Color", values: colors });
      if (lengths.length > 0) options.push({ name: "Length", values: lengths });

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
        stockQuantity: Number(data.stockQuantity),
        gallery: images,
        isHot: Boolean(data.isHot),
        options: options,
        variants: data.variants.map((v: any) => ({
          name: v.name,
          stockQuantity: Number(v.stockQuantity),
          attributes: v.attributes,
          priceOverrideNgn: v.priceOverrideNgn
            ? Number(v.priceOverrideNgn)
            : null,
          priceOverrideUsd: v.priceOverrideUsd
            ? Number(v.priceOverrideUsd)
            : null,
          image: v.image || null,
        })),
      };

      // Clean fields
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
          <label className="block text-sm font-bold text-black">
            Product Gallery
          </label>
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
            <Input
              {...register("title", { required: "Title is required" })}
              className="h-12 border-gray-200 bg-gray-50/50"
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
              <select
                {...register("categoryId", { required: "Required" })}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:border-[#DC8404] bg-gray-50/50 outline-none text-sm"
              >
                <option value="">Select...</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Total Stock</label>
              <Input
                type="number"
                {...register("stockQuantity")}
                disabled={variantFields.length > 0}
                className="h-12 border-gray-200 bg-gray-50/50"
                placeholder="Total sum of variants"
              />
              {variantFields.length > 0 && (
                <p className="text-xs text-gray-400">
                  Calculated automatically from variants.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Description</label>
            <textarea
              {...register("description")}
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:border-[#DC8404] bg-gray-50/50 outline-none"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-6 bg-[#FFF8E6]/50 p-6 rounded-2xl border border-[#DC8404]/10">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">
                Base Price (NGN)
              </label>
              <Input
                type="number"
                {...register("priceNgn", { required: true })}
                className="h-12 border-orange-200/50 bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">
                Base Price (USD)
              </label>
              <Input
                type="number"
                {...register("priceUsd", { required: true })}
                className="h-12 border-orange-200/50 bg-white"
              />
            </div>
          </div>

          {/* --- HAIR ATTRIBUTES SECTION --- */}
          <div className="pt-6 border-t border-gray-100 space-y-6">
            <h3 className="font-bold text-lg text-black">Product Variants</h3>

            {/* 1. COLORS INPUT (UPDATED WITH POPOVER) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase">
                1. Available Colors
              </label>

              {/* Active Color Chips */}
              <div className="flex flex-wrap gap-2">
                {colors.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-gray-100 border border-gray-200"
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs font-medium">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(c.name)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* Add Color Popover */}
                <Popover open={isColorPopoverOpen} onOpenChange={setIsColorPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-dashed text-xs text-gray-500"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Color
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Add New Color</h4>
                      <div className="space-y-2">
                        <Label className="text-xs">Color Name</Label>
                        <Input
                          placeholder="e.g. Natural Black"
                          value={tempColorName}
                          onChange={(e) => setTempColorName(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Pick Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={tempColorHex}
                            onChange={(e) => setTempColorHex(e.target.value)}
                            className="w-10 h-8 p-1 cursor-pointer"
                          />
                          <span className="text-xs text-gray-500">{tempColorHex}</span>
                        </div>
                      </div>
                      <Button onClick={addColor} size="sm" className="w-full bg-black text-white h-8 text-xs">
                        Add Color
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 2. LENGTHS INPUT (EXISTING LOGIC) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                2. Available Lengths
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {lengths.map((l) => (
                  <span
                    key={l}
                    className="bg-gray-200 text-black px-3 py-1 rounded-full text-xs flex items-center gap-2"
                  >
                    {l}&quot;
                    <button type="button" onClick={() => removeLength(l)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type length and press Enter (e.g. 14, 16)"
                  className="h-10 border-gray-200"
                  onKeyDown={addLength}
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
                          <Input
                            {...register(
                              `variants.${index}.stockQuantity` as const
                            )}
                            type="number"
                            className="w-20 h-8 px-2 bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            {...register(
                              `variants.${index}.priceOverrideNgn` as const
                            )}
                            type="number"
                            className="w-24 h-8 px-2 bg-gray-50 focus:bg-white"
                            placeholder="Override"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            {...register(
                              `variants.${index}.priceOverrideUsd` as const
                            )}
                            type="number"
                            className="w-24 h-8 px-2 bg-gray-50 focus:bg-white"
                            placeholder="Override"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            {...register(`variants.${index}.image` as const)}
                            className="w-32 h-8 px-2 border border-gray-200 rounded bg-gray-50 text-xs"
                          >
                            <option value="">Default Img</option>
                            {images.map((img, i) => (
                              <option key={i} value={img}>
                                Image {i + 1}
                              </option>
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
          {mutation.isPending ? (
            <Loader2 className="animate-spin" />
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