import { MerchantType } from "@prisma/client";
import { Pill, ShoppingBag, Store } from "lucide-react";



export const MerchantUtils = {
     colors: (merchantType: MerchantType) => {
          switch (merchantType) {
               case MerchantType.GROCERY:
                    return 'bg-green-300';
               case MerchantType.FOOD:
                    return 'bg-orange-200';
               case MerchantType.PHARMACY:
               return 'bg-cyan-300';
          }
     },

     icons: (merchantType: MerchantType) => {
          switch (merchantType) {
               case MerchantType.GROCERY:
                    return ShoppingBag;
               case MerchantType.FOOD:
                    return Store;
               case MerchantType.PHARMACY:
               return Pill;
          }
     },

     gradients: (merchantType: MerchantType) => {
          switch (merchantType) {
               case MerchantType.GROCERY:
                    return 'from-green-100 via-green-200 to-green-500';
               case MerchantType.FOOD:
                    return 'from-orange-100 via-orange-200 to-orange-500';
               case MerchantType.PHARMACY:
               return 'from-cyan-100 via-cyan-200 to-cyan-500';
          }
     },
}