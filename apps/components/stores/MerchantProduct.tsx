import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { IProduct } from "@/lib/actions/stores";


export const MerchantProduct = ({ product, index }: { product: IProduct, index: number }) => {
    const { cartItems, addItem, increaseQuantity, decreaseQuantity } = useCart();

    const cartItem = cartItems.find(item => item.product.id === product.id);
    const quantity = cartItem?.quantity || 0;

    return (
        <Card
            key={product.id}
            className="overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="relative aspect-square overflow-hidden">
                <Image
                    src={product.media.url}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    width={300}
                    height={300}
                    blurDataURL={product.media.blurDataUrl ?? ''}
                />
            </div>

            <div className="p-4">
                <h3 className="font-semibold mb-1 line-clamp-2">{product.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{product.unit}</p>

                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                        ${product.price}
                    </span>

                    {quantity > 0 ? (
                        <div className="flex items-center gap-2 bg-primary rounded-2xl">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 rounded-2xl text-primary-foreground hover:bg-primary-dark hover:text-primary-foreground"
                                onClick={() => decreaseQuantity(product.id)}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-primary-foreground font-medium min-w-[24px] text-center">
                                {quantity}
                            </span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 rounded-2xl text-primary-foreground hover:bg-primary-dark hover:text-primary-foreground"
                                onClick={() => increaseQuantity(product.id)}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-2xl animate-bounce-scale shadow-primary"
                            onClick={() => addItem({
                                product: product,
                                quantity: 1,
                                price: product.price,
                            })}
                            disabled={(product.inventory?.stockQuantity ?? 0) < 1 || (product.inventory?.stockQuantity ?? 0) < quantity}
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}