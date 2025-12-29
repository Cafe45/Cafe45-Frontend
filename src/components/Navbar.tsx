'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  const pathname = usePathname();
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">

        {/* VÄNSTER: Logotyp */}
        <Link href="/" className="text-xl font-black tracking-tighter hover:opacity-80 transition-opacity z-20">
          Café 45
        </Link>

        {/* MITTEN: Den nya snygga Navigation Menu */}
        {/* MITTEN: Den nya snygga Navigation Menu */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
          <NavigationMenu>
            <NavigationMenuList>

              <NavigationMenuItem>
                <Link href="/" className={navigationMenuTriggerStyle()}>
                  Hem
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/cakes" className={navigationMenuTriggerStyle()}>
                  Tårta
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/meals" className={navigationMenuTriggerStyle()}>
                  Matlådor
                </Link>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* HÖGER: Kundvagn */}
        <div className="flex items-center gap-6 z-20">
          <Link href="/checkout" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group">
            <ShoppingBag className="w-6 h-6 text-gray-900" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1 animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </nav>
  );
}