"use client";

import { useState } from "react";
import { useGlobalColors, useAddGlobalColor, useDeleteGlobalColor } from "@/hooks/useColours";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import ImageUpload from "@/components/ui/image-upload";

export default function ColorManagerPage() {
    const { data: colors, isLoading } = useGlobalColors();
    const { mutate: addColor, isPending: isAdding } = useAddGlobalColor();
    const { mutate: deleteColor, isPending: isDeleting } = useDeleteGlobalColor();

    const [name, setName] = useState("");
    const [hexCode, setHexCode] = useState("#000000");
    const [images, setImages] = useState<string[]>([]);

    const handleAddColor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        addColor(
            { name, hexCode, imageUrl: images[0] || undefined },
            {
                onSuccess: () => {
                    setName("");
                    setHexCode("#000000");
                    setImages([]);
                },
            }
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/inventory"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Global Color Palette</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Add New Color Form */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Add New Color</h2>

                        <form onSubmit={handleAddColor} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700">Color Name</Label>
                                <Input
                                    placeholder="e.g. Colour 30, Burgundy"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-gray-50 text-gray-600"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700">Hex Code (Fallback)</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="color"
                                        value={hexCode}
                                        onChange={(e) => setHexCode(e.target.value)}
                                        className="w-12 h-10 p-1 cursor-pointer bg-white"
                                    />
                                    <Input
                                        type="text"
                                        value={hexCode}
                                        onChange={(e) => setHexCode(e.target.value)}
                                        className="flex-1 bg-gray-50 font-mono text-sm uppercase"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700">Swatch Image (Optional)</Label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Upload a small reference image of this hair color.
                                </p>
                                <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                                    <ImageUpload
                                        value={images}
                                        disabled={isAdding}
                                        onChange={(newUrls) => setImages([newUrls[0]])} // Keep only 1 image
                                        onRemove={() => setImages([])}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isAdding || !name}
                                className="w-full bg-[#DC8404] hover:bg-[#b86e03] text-white h-12 rounded-xl"
                            >
                                {isAdding ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-5 w-5" />}
                                Add to Palette
                            </Button>
                        </form>
                    </div>
                </div>

                {/* RIGHT: Existing Colors Grid */}
                <div className="lg:col-span-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Active Colors ({colors?.length || 0})</h2>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
                            </div>
                        ) : colors?.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                No global colors defined yet. Add your first color on the left!
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {colors?.map((color: any) => (
                                    <div
                                        key={color.id}
                                        className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Swatch Display */}
                                            <div
                                                className="w-10 h-10 rounded-full border border-gray-200 shadow-inner overflow-hidden flex-shrink-0 bg-cover bg-center"
                                                style={{
                                                    backgroundColor: color.hexCode,
                                                    backgroundImage: color.imageUrl ? `url(${color.imageUrl})` : 'none'
                                                }}
                                            />
                                            <span className="font-semibold text-sm text-gray-800 line-clamp-1 truncate pr-2">
                                                {color.name}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => deleteColor(color.id)}
                                            disabled={isDeleting}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                            title="Delete Color"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}