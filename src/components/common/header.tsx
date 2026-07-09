"use client";
import { useEffect, useState } from "react";
import Container from "./container";
import Logo from "./logo";
import { NAV_LINKS } from "@/constants/statics";
import Link from "next/link";
import { useCartStore } from "../../stores/cart/cartStore";
import { cn } from "@/lib/utils";
import UserMenu from "./UserMenu";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import src from "@/images/logo.png";
import SearchModel from "./searchModel";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { items, _hasHydrated } = useCartStore();

  const totalItems = _hasHydrated ? items.length : 0;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }

      if (isMenuOpen) {
        document.addEventListener("keydown", handleEscape);
        // disable scroll
        document.body.style.overflow = "hidden";
      } else {
        // enable scroll
        document.body.style.overflow = "unset";
      }
    };
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  return (
    <>
      {/* Main Header - Hidden when scrolling */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-background/60 backdrop-blur-md supports-backdrop-filter:bg-background/60 font-sans transition-opacity duration-500 ease-in-out",
          isScrolled ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        <Container className="flex h-24 items-center justify-between">
          {/* logo */}
          <Logo />
          {/* navigation */}
          <div className="hidden lg:flex gap-8 items-center">
            {NAV_LINKS.map((item) => (
              <Link
                className="relative text-sm font-semibold text-foreground tracking-wide uppercase hover:text-primary hover-effect group"
                key={item.href}
                href={item.href}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full hover-effect" />
              </Link>
            ))}
          </div>
          {/* icons bar */}
          <div className="flex items-center gap-3">
            <button
              className="hidden md:flex items-center justify-center border border-muted-foreground/30 p-2 rounded-full hover:bg-muted hover:border-primary text-muted-foreground hover:text-primary hover-effect cursor-pointer"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </button>

            <Link href="/cart" aria-label="Shopping Cart">
              <button className="flex items-center gap-1 border border-primary py-2 px-5 rounded-full relative overflow-hidden group hover:border-primary transition-colors cursor-pointer">
                <span className="absolute inset-0 bg-primary -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />

                <div className="relative z-10">
                  <ShoppingCart
                    className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300"
                    fill="#19B3E3"
                  />
                </div>

                <p className="text-xs font-medium text-foreground group-hover:text-primary-foreground transition-colors duration-300 relative z-10">
                  (<span className="font-semibold">{totalItems}</span>{" "}
                  {totalItems === 1 ? "item" : "items"})
                </p>
              </button>
            </Link>

            <div className="hidden md:block">
              <UserMenu />
            </div>
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-foreground transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </Container>
      </header>
      {/* Sticky Scrolled header - Appears when scrolled */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b bg-background/60 backdrop-blur-md supports-backdrop-filter:bg-background/60 font-sans shadow-lg hover-effect",
          isScrolled
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <Container className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          {/* logo */}
          {/* Compact Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 group-hover:scale-110 hover-effect">
              <Image
                src={src}
                alt="Quick food logo"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg text-foreground font-bold tracking-tight">
              Quick <span className="text-primary">Food</span>
            </span>
          </Link>
          {/* navigation */}
          {/* Compact navigation */}
          <div className="hidden lg:flex gap-6 items-center">
            {NAV_LINKS.map((item) => (
              <Link
                className="relative text-sm font-semibold text-foreground hover:text-primary hover-effect uppercase"
                key={item.href}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {/* icons bar */}
          {/* Compact Actions */}
          <div className="flex items-center gap-3">
            <button
              className="hidden md:flex items-center justify-center border border-muted-foreground/30 p-2 rounded-full hover:bg-muted hover:border-primary text-muted-foreground hover:text-primary hover-effect"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
            </button>

            <Link href="/cart" aria-label="Shopping Cart">
              <button className="flex items-center gap-1 border border-primary py-2 px-4 rounded-full relative overflow-hidden group hover:border-primary transition-colors">
                <span className="absolute inset-0 bg-primary -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />

                <div className="relative z-10">
                  <ShoppingCart className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>

                <p className="text-[10px] font-medium text-foreground group-hover:text-primary-foreground transition-colors duration-300 relative z-10">
                  (<span className="font-semibold">{totalItems}</span>)
                </p>
              </button>
            </Link>

            <div className="hidden md:block">
              <UserMenu />
            </div>
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted text-foreground transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </Container>
      </header>
      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden hover-effect"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 z-50 bg-card drop-shadow-2xl hover-effect lg:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <Image
                  src={src}
                  alt="QuickFood Logo"
                  className="object-contain"
                />
              </div>

              <span className="text-xl font-bold text-foreground">
                Quick<span className="text-primary">Food</span>
              </span>
            </div>

            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted text-foreground transition-all"
              aria-label="Close Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Sidebar Navigation */}
          <nav className="flex-1 flex flex-col p-6 space-y-2 overflow-y-auto">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base font-semibold text-foreground hover:text-primary hover:bg-muted px-4 py-3 rounded-lg transition-all uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t space-y-3">
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left text-foreground hover:text-primary hover:bg-muted px-4 py-3 rounded-lg transition-all"
              >
                <Search className="w-5 h-5" />
                <span className="font-semibold">Search</span>
              </button>

              <Link
                href="/cart"
                className="flex items-center gap-3 w-full text-left text-foreground hover:text-primary hover:bg-muted px-4 py-3 rounded-lg transition-all relative"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold">Cart</span>
                {totalItems > 0 && (
                  <span className="ml-auto h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>
            </div>
            {/* User Menu in Sidebar */}
            <div className="pt-4 mt-4 border-t">
              <UserMenu />
            </div>
          </nav>
          {/* Sidebar Footer */}
          <div className="p-6 border-t">
            <Link
              href="/menu"
              className="flex items-center justify-center w-full rounded-full border border-primary/70 px-6 py-3 text-sm font-bold text-primary hover:border-primary relative overflow-hidden group/button uppercase tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="absolute inset-0 bg-primary -translate-x-full group-hover/button:translate-x-0 transition-transform duration-300 ease-out rounded-full"></span>
              <span className="relative z-10 transition-colors duration-300 group-hover/button:text-primary-foreground">
                Order Now
              </span>
            </Link>
          </div>
        </div>
      </div>
      {/* Search Modal */}
      <SearchModel
        isSearchOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Header;
