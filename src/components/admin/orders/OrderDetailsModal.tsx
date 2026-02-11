"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Package, User, Mail, Phone, MapPin, MoreVertical, Edit } from "lucide-react";
import Image from "next/image";
import { useAdminOrder, useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { cn } from "@/lib/utils";
import { StatusModal } from "./StatusModal";
import { useQueryClient } from "@tanstack/react-query";

interface OrderDetailsModalProps {
    orderId: string | null;
    onClose: () => void;
}

export function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
    const queryClient = useQueryClient();
    const { data: order, isLoading } = useAdminOrder(orderId);
    const updateMutation = useUpdateOrderStatus();

    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

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

    const handleStatusUpdate = () => {
        if (!orderId || !pendingStatus) return;

        updateMutation.mutate(
            { id: orderId, status: pendingStatus },
            {
                onSuccess: () => {
                    setPendingStatus(null);
                    // The query invalidation in the hook will automatically 
                    // refresh 'order' data here to show the new status badge
                    queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });

                    // Also refresh the table list so the background updates too
                    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
                }
            }
        );
    };

    // Helper for shipping address (from previous step)
    const shippingAddress = order?.user?.addresses?.find((a: any) => a.isDefault) || order?.user?.addresses?.[0];

    return (
        <>
            <Dialog open={!!orderId} onOpenChange={() => onClose()}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span className="text-gray-900">Order Details</span>

                            {/* RIGHT SIDE: Badge + Action Dropdown */}
                            <div className="flex items-center gap-3">
                                {order && (
                                    <Badge variant="outline" className={cn("capitalize px-3 py-1", getStatusColor(order.status))}>
                                        {order.status}
                                    </Badge>
                                )}

                                {/* ACTIONS DROPDOWN */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 gap-2">
                                            <Edit size={14} /> Update Status
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-white">
                                        <DropdownMenuLabel>Change Status To:</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => setPendingStatus("paid")}>
                                            Mark Paid
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setPendingStatus("shipped")}>
                                            Mark Shipped
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setPendingStatus("delivered")}>
                                            Mark Delivered
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setPendingStatus("cancelled")}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            Cancel Order
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
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

                                <div className="flex flex-col gap-6">

                                    {/* User Details */}
                                    <div className="flex items-start gap-3 border-b border-gray-100 pb-6">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
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

                                    {/* Shipping Address */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#DC8404] shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Shipping Address</p>
                                            {shippingAddress ? (
                                                <div className="text-sm text-gray-500 mt-1 leading-relaxed">
                                                    <p>{shippingAddress.addressLine}</p>
                                                    <p>{shippingAddress.city}, {shippingAddress.state}</p>
                                                    {shippingAddress.postalCode && <p>{shippingAddress.postalCode}</p>}
                                                    <p className="text-xs mt-1 text-gray-400">{shippingAddress.phone}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic mt-1">No address on file</p>
                                            )}
                                        </div>
                                    </div>
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
                                                                <div className="w-12 h-12 relative rounded-md bg-gray-100 border border-gray-200">
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

            {/* CONFIRMATION MODAL */}
            {/* Logic: If pendingStatus is set, show the confirmation modal */}
            {pendingStatus && (
                <StatusModal
                    isOpen={!!pendingStatus}
                    onClose={() => setPendingStatus(null)}
                    onConfirm={handleStatusUpdate}
                    isLoading={updateMutation.isPending}
                    status={pendingStatus}
                />
            )}
        </>
    );
}