"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ImageUpload from "@/components/ui/image-upload";

// --- HOOKS ---
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

const useGlobalColors = () => {
  return useQuery({
    queryKey: ["global-colors"],
    queryFn: async () => {
      const { data } = await api.get("/admin/colors");
      return data;
    },
  });
};

interface ProductFormProps {
  initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { data: globalColors, isLoading: isColorsLoading } = useGlobalColors();

  // --- CORE STATES ---
  const [images, setImages] = useState<string[]>(initialData?.gallery || []);

  // 1. Selected Colors (Array of global color names)
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // 2. Lengths & Pricing configs (Array of objects)
  const [lengthConfigs, setLengthConfigs] = useState<{ length: string; priceNgn: string; priceUsd: string }[]>([]);

  // 3. Stock Matrix: stockMatrix["18 inches"]["Colour 30"] = "5"
  const [stockMatrix, setStockMatrix] = useState<Record<string, Record<string, string>>>({});

  // 4. Color Images: colorImages["Colour 30"] = "https..."
  const [colorImages, setColorImages] = useState<Record<string, string>>({});

  // Hidden State: Keep track of existing Variant IDs so we don't orphan them on update
  const [variantIdMap, setVariantIdMap] = useState<Record<string, string>>({});

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
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
    },
  });

  // --- 1. INITIALIZE DATA FROM BACKEND (Edit Mode) ---
  useEffect(() => {
    if (initialData?.variants && initialData.variants.length > 0) {
      const colorSet = new Set<string>();
      const lengthMap = new Map<string, { priceNgn: string; priceUsd: string }>();
      const sMatrix: Record<string, Record<string, string>> = {};
      const cImages: Record<string, string> = {};
      const idMap: Record<string, string> = {};

      initialData.variants.forEach((v: any) => {
        const color = v.attributes?.Color;
        const length = v.attributes?.Length;

        if (color) colorSet.add(color);
        if (color && v.image) cImages[color] = v.image;

        if (length) {
          if (!lengthMap.has(length)) {
            lengthMap.set(length, {
              priceNgn: v.priceOverrideNgn !== null ? v.priceOverrideNgn.toString() : "",
              priceUsd: v.priceOverrideUsd !== null ? v.priceOverrideUsd.toString() : "",
            });
          }
          if (!sMatrix[length]) sMatrix[length] = {};
          sMatrix[length][color || "default"] = v.stockQuantity?.toString() || "0";
          idMap[`${length}-${color}`] = v.id; // Store ID for safe updates
        }
      });

      setSelectedColors(Array.from(colorSet));
      setLengthConfigs(Array.from(lengthMap.entries()).map(([length, prices]) => ({ length, ...prices })));
      setStockMatrix(sMatrix);
      setColorImages(cImages);
      setVariantIdMap(idMap);
    }
  }, [initialData]);

  // --- HANDLERS ---
  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const addLength = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (!val) return;

      const lengthName = val.includes('"') || val.includes("inch") ? val : `${val}"`;

      if (!lengthConfigs.find((l) => l.length === lengthName)) {
        setLengthConfigs([...lengthConfigs, { length: lengthName, priceNgn: "", priceUsd: "" }]);
      }
      e.currentTarget.value = "";
    }
  };

  const removeLength = (lengthToRemove: string) => {
    setLengthConfigs((prev) => prev.filter((l) => l.length !== lengthToRemove));
  };

  const updateLengthPrice = (length: string, field: "priceNgn" | "priceUsd", value: string) => {
    setLengthConfigs((prev) =>
      prev.map((l) => (l.length === length ? { ...l, [field]: value } : l))
    );
  };

  const updateStock = (length: string, color: string, value: string) => {
    setStockMatrix((prev) => ({
      ...prev,
      [length]: {
        ...(prev[length] || {}),
        [color]: value,
      },
    }));
  };

  // --- MUTATION (THE COMPILER) ---
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // 1. Build Options array for the Database
      const options = [];
      if (selectedColors.length > 0) options.push({ name: "Color", values: selectedColors });
      if (lengthConfigs.length > 0) options.push({ name: "Length", values: lengthConfigs.map(l => l.length) });

      // 2. Compile Matrix into the 1D Variants Array
      const compiledVariants: any[] = [];
      let totalMatrixStock = 0;

      lengthConfigs.forEach((lConf) => {
        const length = lConf.length;

        selectedColors.forEach((color) => {
          const stockStr = stockMatrix[length]?.[color] || "0";
          const stock = parseInt(stockStr, 10) || 0;
          totalMatrixStock += stock;

          compiledVariants.push({
            id: variantIdMap[`${length}-${color}`], // Retain ID if updating
            name: `${color} / ${length}`,
            stockQuantity: stock,
            attributes: { Color: color, Length: length },
            priceOverrideNgn: lConf.priceNgn !== "" ? parseFloat(lConf.priceNgn) : null,
            priceOverrideUsd: lConf.priceUsd !== "" ? parseFloat(lConf.priceUsd) : null,
            image: colorImages[color] || null,
          });
        });
      });

      // 3. Construct Final Payload
      const payload = {
        ...data,
        priceNgn: parseFloat(data.priceNgn),
        priceUsd: parseFloat(data.priceUsd),
        compareAtPriceNgn: data.compareAtPriceNgn ? parseFloat(data.compareAtPriceNgn) : null,
        compareAtPriceUsd: data.compareAtPriceUsd ? parseFloat(data.compareAtPriceUsd) : null,
        stockQuantity: compiledVariants.length > 0 ? totalMatrixStock : parseFloat(data.stockQuantity || "0"),
        gallery: images,
        isHot: Boolean(data.isHot),
        options: options,
        variants: compiledVariants,
      };

      // 🧹 CRITICAL FIX: Clean the payload so NestJS ValidationPipe accepts it
      delete payload.category;
      delete payload.reviews;
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.averageRating;
      delete payload.totalReviews;

      if (initialData?.id) {
        return api.patch(`/admin/inventory/${initialData.id}`, payload);
      } else {
        return api.post("/admin/inventory", payload);
      }
    },
    onSuccess: () => {
      toast.success(initialData?.id ? "Product updated!" : "Product published!");
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      router.push("/inventory");
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        toast.error(`Validation Error: ${errorMessage[0]}`);
      } else {
        toast.error(errorMessage || "Failed to save product.");
      }
    },
  });

  const onSubmit = (data: any) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }
    mutation.mutate(data);
  };

  // Helper boolean to show matrix
  const showMatrix = selectedColors.length > 0 && lengthConfigs.length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white text-black p-6 md:p-8 rounded-[20px] shadow-sm max-w-7xl mx-auto border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* ================= LEFT COLUMN: IMAGES & BASIC ================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Product Gallery</label>
            <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
              <ImageUpload
                value={images}
                disabled={mutation.isPending}
                onChange={(newUrls) => setImages(newUrls)}
                onRemove={(url) => setImages(images.filter((c) => c !== url))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Base Price (NGN)</label>
            <Input type="number" step="0.01" {...register("priceNgn", { required: true })} className="h-12 border-gray-200 bg-gray-50/50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Base Price (USD)</label>
            <Input type="number" step="0.01" {...register("priceUsd", { required: true })} className="h-12 border-gray-200 bg-gray-50/50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Total Base Stock</label>
            <Input type="number" {...register("stockQuantity")} disabled={showMatrix} className="h-12 border-gray-200 bg-gray-50/50" placeholder="0" />
            {showMatrix && <p className="text-xs text-gray-400">Locked. Calculated automatically from the stock matrix.</p>}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DETAILS & MATRIX ================= */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Product Name</label>
              <Input {...register("title", { required: "Required" })} className="h-12 border-gray-200 bg-gray-50/50" />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message as string}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Category</label>
              <select {...register("categoryId", { required: "Required" })} className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-gray-50/50 outline-none text-sm">
                <option value="">Select...</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-black">Description</label>
            <textarea {...register("description")} className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:border-[#DC8404] bg-gray-50/50 outline-none" />
          </div>

          {/* --- ILLUSION UI: MODULE 1 & 2 --- */}
          <div className="pt-6 border-t border-gray-100 space-y-8">
            <h3 className="font-bold text-xl text-black">Variations & Pricing</h3>

            {/* MODULE 1: GLOBAL COLORS */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-800">1. Available Colors</label>
              <p className="text-xs text-gray-500">Select all colors this product comes in.</p>

              <div className="flex flex-wrap gap-3">
                {isColorsLoading ? <Loader2 className="animate-spin text-gray-400" /> : globalColors?.map((color: any) => {
                  const isSelected = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => toggleColor(color.name)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${isSelected ? "border-[#DC8404] bg-[#DC8404]/5 ring-1 ring-[#DC8404]" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: color.hexCode, backgroundImage: color.imageUrl ? `url(${color.imageUrl})` : 'none', backgroundSize: 'cover' }} />
                      <span className="text-sm font-medium text-gray-700">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MODULE 2: LENGTHS & PRICING */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-800">2. Lengths & Pricing</label>
              <p className="text-xs text-gray-500">Add lengths. If left blank, it uses the Base Price.</p>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Type length and press Enter (e.g. 14, 16)" className="h-10 bg-white max-w-sm" onKeyDown={addLength} />
                </div>

                {lengthConfigs.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {lengthConfigs.map((lConf) => (
                      <div key={lConf.length} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <span className="font-bold text-sm w-20">{lConf.length}</span>
                        <div className="flex-1 flex gap-4">
                          <Input
                            type="number" step="0.01" placeholder="Override NGN"
                            value={lConf.priceNgn} onChange={(e) => updateLengthPrice(lConf.length, "priceNgn", e.target.value)}
                            className="h-9 text-sm"
                          />
                          <Input
                            type="number" step="0.01" placeholder="Override USD"
                            value={lConf.priceUsd} onChange={(e) => updateLengthPrice(lConf.length, "priceUsd", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <button type="button" onClick={() => removeLength(lConf.length)} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* MODULE 3: SPREADSHEET STOCK MATRIX */}
            {showMatrix && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="text-sm font-bold text-gray-800">3. Stock Matrix</label>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="p-3 bg-gray-50 sticky left-0 z-10 border-r border-gray-200">Length</th>
                        {selectedColors.map(color => (
                          <th key={color} className="p-3 text-center min-w-[100px]">{color}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lengthConfigs.map((lConf) => (
                        <tr key={lConf.length} className="bg-white hover:bg-gray-50/50">
                          <td className="p-3 font-bold bg-gray-50 sticky left-0 z-10 border-r border-gray-200">{lConf.length}</td>
                          {selectedColors.map(color => (
                            <td key={color} className="p-2">
                              <Input
                                type="number"
                                placeholder="0"
                                value={stockMatrix[lConf.length]?.[color] || ""}
                                onChange={(e) => updateStock(lConf.length, color, e.target.value)}
                                className="h-9 text-center bg-transparent border-transparent hover:border-gray-200 focus:bg-white transition-colors"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODULE 4: COLOR IMAGES */}
            {selectedColors.length > 0 && (
              <div className="space-y-3 animate-in fade-in">
                <label className="text-sm font-bold text-gray-800">4. Color specific Images (Optional)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedColors.map(color => (
                    <div key={color} className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col items-center text-center space-y-2">
                      <span className="text-xs font-semibold">{color}</span>
                      <div className="w-full">
                        <ImageUpload
                          value={colorImages[color] ? [colorImages[color]] : []}
                          disabled={mutation.isPending}
                          onChange={(url) => setColorImages(prev => ({ ...prev, [color]: url[0] }))}
                          onRemove={() => setColorImages(prev => { const copy = { ...prev }; delete copy[color]; return copy; })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 w-full pt-6 border-t border-gray-100 flex justify-end">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-black hover:bg-gray-800 text-white h-14 px-12 rounded-xl text-lg font-medium w-full md:w-auto shadow-lg shadow-gray-200"
        >
          {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
          {initialData?.id ? "Update Product" : "Publish Product"}
        </Button>
      </div>
    </form>
  );
}