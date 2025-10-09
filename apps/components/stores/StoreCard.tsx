import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Star, Clock } from "lucide-react";
import Image from "next/image";
import { format } from 'date-fns'
import { IMerchant } from "@/lib/actions/stores";


const StoreCard = ({ store, index = 0 }: { store: IMerchant, index?: number }) => {
    const badge = store.isVerified ? "Verified" : "New"

    return (
        <Link
            href={`/stores/${store.id}`}
            className="group animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                    {store.bannerUrl && <Image
                        src={store.bannerUrl}
                        alt={store.businessName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />}
                    {badge && (
                        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                            {badge}
                        </Badge>
                    )}
                </div>

                <div className="p-5">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {store.businessName}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-warning text-warning" />
                            <span className="font-medium text-foreground">{store.rating?.toFixed(1) || '0.0'}/5</span>
                        </div>
                        {store.deliveryTime && <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(store.deliveryTime), 'HH:mm')}</span>
                        </div>}
                    </div>

                    <div className="text-sm text-muted-foreground">
                        {store.products.length} products available
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default StoreCard;