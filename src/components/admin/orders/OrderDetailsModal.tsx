"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Package, User, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import { useAdminOrder } from "@/hooks/useAdminOrders";
import { cn } from "@/lib/utils";

interface OrderDetailsModalProps {
    orderId: string | null;
    onClose: () => void;
}

export function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
    const { data: order, isLoading } = useAdminOrder(orderId);

    const getItemImage = (item: any) => {
        if (item.variant?.image) return item.variant.image;
        if (item.product?.gallery && item.product.gallery.length > 0) return item.product.gallery[0];
        return "/placeholder.jpg";
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "bg-blue-100 text-blue-700 border-blue-200";
            case "delivered": return "bg-green-100 text-green-700 border-green-200";
            case "cancelled": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
        }
    };

    return (
        <Dialog open={!!orderId} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="text-gray-900">Order Details</span>
                        {order && (
                            <Badge variant="outline" className={cn("capitalize", getStatusColor(order.status))}>
                                {order.status}
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {isLoading || !order ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>Loading order details...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* 1. ORDER INFO HEADER */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div>
                                <p className="text-gray-900 mb-1">Order ID</p>
                                <p className=" text-gray-700 font-medium">{order.id}</p>
                            </div>
                            <div>
                                <p className="text-gray-900 mb-1">Date</p>
                                <p className="font-medium text-gray-700">{format(new Date(order.createdAt), "MMM dd, yyyy")}</p>
                            </div>
                            <div>
                                <p className="text-gray-900 mb-1">Total Amount</p>
                                <p className="font-medium text-[#DC8404]">
                                    {order.currencyPaid === "USD" ? "$" : "₦"}
                                    {Number(order.currencyPaid === "USD" ? order.totalAmountUsd : order.totalAmountNgn).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-900 mb-1">Payment Ref</p>
                                <p className="font-mono text-gray-700 text-xs truncate" title={order.paymentReference || "N/A"}>
                                    {order.paymentReference || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* 2. CUSTOMER INFO */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User size={16} /> Customer Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <Mail size={12} /> {order.user.email}
                                        </p>
                                        {order.user.phone && (
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Phone size={12} /> {order.user.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {/* Add Shipping Address here if you have it in schema */}
                            </div>
                        </div>

                        {/* 3. ORDER ITEMS */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Package size={16} /> Order Items
                            </h3>
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Variant</th>
                                            <th className="p-4 text-center">Qty</th>
                                            <th className="p-4 text-right">Price</th>
                                            <th className="p-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {order.items.map((item: any) => {
                                            const price = Number(order.currencyPaid === "USD" ? item.priceAtPurchaseUsd : item.priceAtPurchaseNgn);
                                            return (
                                                <tr key={item.id}>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                                                <Image
                                                                    src={getItemImage(item)}
                                                                    alt=""
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <span className="font-medium text-gray-900">{item.product.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-500">
                                                        {/* Use stored variantName if available, fallback to relation */}
                                                        {item.variantName || item.variant?.name || "-"}
                                                    </td>
                                                    <td className="p-4 text-center">{item.quantity}</td>
                                                    <td className="p-4 text-right text-gray-500">
                                                        {Number(price).toLocaleString()}
                                                    </td>
                                                    <td className="p-4 text-right font-medium">
                                                        {Number(price * item.quantity).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}