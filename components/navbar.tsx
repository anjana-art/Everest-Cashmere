'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  HeartIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart-store";
import { Button } from "./ui/button";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState<boolean>(false);
  const [showClothingSubmenu, setShowClothingSubmenu] = useState<boolean>(false);
  const [showClothingTypeSubmenu, setShowClothingTypeSubmenu] = useState<boolean>(false);
  const [showAccessoriesSubmenu, setShowAccessoriesSubmenu] = useState<boolean>(false);
    const [showClothingMenu, setShowClothingMenu] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [openClothing, setOpenClothing] = useState(false);
  const [openAccessories, setOpenAccessories] = useState(false);
  const [openGender, setOpenGender] = useState(false);
  const [openMaterial, setOpenMaterial] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const taglines = [
    'Himalayan Kashmere',
    'Finest Quality Cashmere',
    'Nepalese Luxury Handicrafts',
    'Timeless Elegance & Softness'
  ];

  const { items } = useCartStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
  setIsClient(true);
   }, []);

   // Close mobile menu when route changes
    useEffect(() => {
      const handleRouteChange = () => setMobileOpen(false);
      window.addEventListener('popstate', handleRouteChange);
      return () => window.removeEventListener('popstate', handleRouteChange);
    }, []);


   

        //for brand short description
        useEffect(() => {
          const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
              setTaglineIndex((prev) => (prev + 1) % taglines.length);
              setFade(true);
            }, 500);
          }, 3000);

        return () => clearInterval(interval);
      }, []);

      // Check if user is logged in and admin on mount
      useEffect(() => {
        const checkUserAndAdmin = () => {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              
              const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                const [name, value] = cookie.trim().split('=');
                acc[name] = decodeURIComponent(value);
                return acc;
              }, {} as Record<string, string>);
              
              setIsAdmin(cookies['admin-check'] === 'true');
            } catch (error) {
              localStorage.removeItem('user');
            }
          }
        };

    checkUserAndAdmin();
    window.addEventListener('load', checkUserAndAdmin);
    
    return () => {
      window.removeEventListener('load', checkUserAndAdmin);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu') && !target.closest('.user-profile-button')) {
        setShowUserMenu(false);
      }
      if (!target.closest('.category-menu') && !target.closest('.category-button')) {
        setShowCategoryMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

   // Don't render anything on server for the mobile menu
      if (!isClient) {
        return null;
      }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
    setShowUserMenu(false);
    window.location.href = '/';
  };

  // Close all menus
  const closeAllMenus = () => {
    setShowCategoryMenu(false);
    setShowClothingSubmenu(false);
    setShowClothingTypeSubmenu(false);
    setShowAccessoriesSubmenu(false);
    setShowUserMenu(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-3 sm:px-5 py-1.5 sm:py-2">
        
        {/* Logo Section - LARGER LOGO */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          
          <Link href="/" className="inline-block flex-shrink-0">
            <img
              src="/himkash_favicon.png"
              alt="HIMKASH_logo"
              className="h-16 sm:h-20 md:h-24 w-auto" // Increased logo size
            />
          </Link>

          {/* Tagline - slightly adjusted */}
          <div className="min-w-0 w-24 sm:w-32 md:w-44 flex items-center overflow-hidden">
            <p className={`text-red-950 text-[10px] sm:text-xs md:text-sm 
                          italic text-center leading-tight px-1 w-full
                          transition-opacity duration-500 ease-in-out 
                          ${fade ? 'opacity-100' : 'opacity-0'}`}>
              - {taglines[taglineIndex]}
            </p>
          </div>
        </div>
        
        {/* Desktop Navigation - SMALLER TEXT */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-amber-600 text-red-900 text-sm xl:text-base transition-colors whitespace-nowrap">
            Home
          </Link>
          
          {/* Clothing Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setShowClothingMenu(true)}
            onMouseLeave={() => setShowClothingMenu(false)}
          >
            <button className="flex items-center gap-1 hover:text-amber-600 text-red-900 text-sm xl:text-base transition-colors whitespace-nowrap">
              Clothing
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
              
            {showClothingMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-lg border py-2">
                <Link 
                  href="/clothing" 
                  className="block px-4 py-2 hover:bg-amber-50 text-gray-700 text-sm"
                >
                  All Clothing
                </Link>
                <div className="border-t my-1"></div>
                <div className="px-4 py-1 text-xs text-gray-500 font-medium">Shop by Material</div>
                <Link href="/clothing/cashmere" className="block px-4 py-2 pl-6 hover:bg-amber-50 text-sm">
                  Cashmere
                </Link>
                <Link href="/clothing/cashmere-marino-wool" className="block px-4 py-2 pl-6 hover:bg-amber-50 text-sm">
                  Cashmere + Marino Wool
                </Link>
                <Link href="/clothing/marino-wool" className="block px-4 py-2 pl-6 hover:bg-amber-50 text-sm">
                  Marino Wool
                </Link>
                <div className="border-t my-1"></div>
                <div className="px-4 py-1 text-xs text-gray-500 font-medium">Shop by Gender</div>
                <Link href="/clothing/women" className="block px-4 py-2 pl-6 hover:bg-amber-50 text-sm">
                  Women's
                </Link>
                <Link href="/clothing/men" className="block px-4 py-2 pl-6 hover:bg-amber-50 text-sm">
                  Men's
                </Link>
                <Link href="/clothing/unisex" className="block px-4 py-2 pl-6 hover:bg-amber-50 text-sm">
                  Unisex
                </Link>
              </div>
            )}
          </div>
          
          <Link href={"/checkout"} className="hover:text-amber-600 text-red-900 text-sm xl:text-base transition-colors whitespace-nowrap">Checkout</Link>
          <Link href={"/about"} className="hover:text-amber-600 text-red-900 text-sm xl:text-base transition-colors whitespace-nowrap">About Us</Link>
          <Link href={"/contact"} className="hover:text-amber-600 text-red-900 text-sm xl:text-base transition-colors whitespace-nowrap">Contact Us</Link>
        </div>
        
        {/* Right Side Icons - ADJUSTED SIZES */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
          {/* Admin Dashboard Button (Only for admins) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="relative group hidden lg:flex items-center space-x-1 xl:space-x-2 px-2 xl:px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:from-amber-400 hover:to-amber-300 transition-all duration-300 shadow-md hover:shadow-lg"
              title="Admin Dashboard"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              <span className="font-medium text-xs hidden xl:inline">Dashboard</span>
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link 
            className="relative text-red-900 hover:text-amber-600 transition-colors group p-1" 
            href={'/checkout'}
            title="Shopping Cart"
          >
            <div className="relative text-xl sm:text-2xl">
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-400 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
              Cart ({cartCount} items)
            </span>
          </Link>

          {/* User Profile */}
          <div className="relative">
            {user ? (
              <div className="user-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center space-x-1 hover:text-amber-600 transition-colors user-profile-button group p-1"
                  title="My Account"
                >
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-amber-500 to-red-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md relative">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    {isAdmin && (
                      <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
                        <ShieldCheckIcon className="h-2 w-2" />
                      </span>
                    )}
                  </div>
                  <ChevronDownIcon className={`h-3 w-3 text-red-900 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''} hidden sm:block`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 border border-gray-100 z-50">
                    <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-red-900 to-red-800 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-2 sm:ml-3">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[100px] sm:max-w-[120px]">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-[120px] mt-1">{user.email}</p>
                          {isAdmin && (
                            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 mt-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                              <ShieldCheckIcon className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-red-900" />
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <ShoppingBagIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-red-900" />
                      My Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <HeartIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-red-900" />
                      Wishlist
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 transition-colors border-t border-gray-100 mt-1 pt-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Cog6ToothIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-red-900" />
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login"
                className="flex items-center space-x-1 hover:text-amber-600 transition-colors p-1"
              >
                <UserCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-900" />
                <span className="hidden lg:inline text-red-900 font-medium text-xs xl:text-sm">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant='ghost'
            size="icon"
            className="lg:hidden text-red-900 hover:text-amber-600 hover:bg-amber-50 h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu remains the same */}
      {isClient && mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 pointer-events-none" onClick={() => setMobileOpen(false)}>
          <div 
            className="fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl overflow-y-auto animate-slide-in pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-amber-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-red-900">Menu</h2>
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-amber-50 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-red-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-2">
              <Link 
                href={'/'} 
                className="block py-3.5 px-4 text-red-900 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-all text-base shadow-sm" 
                onClick={() => setMobileOpen(false)}
              >
                🏠 Home
              </Link>
              
              <div className="space-y-1">
                <div className="ml-2 space-y-2 mt-2">
                  <div className="border border-amber-100 rounded-lg overflow-hidden bg-amber-50/30">
                    <button
                      onClick={() => setOpenClothing(!openClothing)}
                      className="w-full flex items-center justify-between p-3.5 text-red-900 font-medium hover:bg-amber-50 transition-colors"
                    >
                      <span>👕 Clothing</span>
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${openClothing ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {openClothing && (
                      <div className="bg-white border-t border-amber-100 p-2 space-y-2">
                        <Link 
                          href="/clothing" 
                          className="block py-2.5 px-3 text-red-800 hover:text-amber-600 hover:bg-amber-100 rounded-md transition-colors text-sm border-l-2 border-transparent hover:border-amber-400"
                          onClick={() => setMobileOpen(false)}
                        >
                          All Clothing
                        </Link>
                        
                        <div className="ml-2 space-y-2">
                          <div className="border border-amber-50 rounded-lg">
                            <button
                              onClick={() => setOpenGender(!openGender)}
                              className="w-full flex items-center justify-between p-2.5 text-red-800 text-sm hover:bg-amber-50 rounded-lg"
                            >
                              <span>By Gender</span>
                              <ChevronRightIcon className={`h-3 w-3 transition-transform ${openGender ? 'rotate-90' : ''}`} />
                            </button>
                            
                            {openGender && (
                              <div className="ml-2 space-y-1 pb-2">
                                <Link 
                                  href="/products?category=CLOTHING&gender=MEN" 
                                  className="block py-2 px-4 text-sm text-red-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  👔 Men's Clothing
                                </Link>
                                <Link 
                                  href="/products?category=CLOTHING&gender=WOMEN" 
                                  className="block py-2 px-4 text-sm text-red-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  👗 Women's Clothing
                                </Link>
                                <Link 
                                  href="/products?category=CLOTHING&gender=UNISEX" 
                                  className="block py-2 px-4 text-sm text-red-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  👤 Unisex Clothing
                                </Link>
                              </div>
                            )}
                          </div>
                          
                          <div className="border border-amber-50 rounded-lg">
                            <button
                              onClick={() => setOpenMaterial(!openMaterial)}
                              className="w-full flex items-center justify-between p-2.5 text-red-800 text-sm hover:bg-amber-50 rounded-lg"
                            >
                              <span>🧵 Material Types</span>
                              <ChevronRightIcon className={`h-3 w-3 transition-transform ${openMaterial ? 'rotate-90' : ''}`} />
                            </button>
                            
                            {openMaterial && (
                              <div className="ml-2 space-y-1 pb-2">
                                <Link 
                                  href="/products?category=CLOTHING&type=CASHMERE" 
                                  className="block py-2 px-4 text-sm text-red-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  🐐 Cashmere
                                </Link>
                                <Link 
                                  href="/products?category=CLOTHING&type=CASHMERE_MARINO_WOOL" 
                                  className="block py-2 px-4 text-sm text-red-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  🧶 Cashmere + Marino Wool
                                </Link>
                                <Link 
                                  href="/products?category=CLOTHING&type=MARINO_WOOL" 
                                  className="block py-2 px-4 text-sm text-red-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  🐑 Marino Wool
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Link 
                href={'/checkout'} 
                className="block py-3.5 px-4 text-red-900 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-all text-base shadow-sm mt-2" 
                onClick={() => setMobileOpen(false)}
              >
                🛒 Checkout
              </Link>
              
              {isAdmin && (
                <Link 
                  href={'/admin'} 
                  className="block py-3.5 px-4 text-red-900 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg border-l-4 border-amber-500 bg-amber-50/50 hover:bg-amber-100 transition-all text-base shadow-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Cog6ToothIcon className="h-5 w-5 text-amber-600" />
                    <span>⚙️ Admin Dashboard</span>
                  </div>
                </Link>
              )}
              
              <Link 
                href={'/about'} 
                className="block py-3.5 px-4 text-red-900 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-all text-base shadow-sm" 
                onClick={() => setMobileOpen(false)}
              >
                📖 About Us
              </Link>
              <Link 
                href={'/contact'} 
                className="block py-3.5 px-4 text-red-900 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-all text-base shadow-sm" 
                onClick={() => setMobileOpen(false)}
              >
                📞 Contact Us
              </Link>
              
              <div className="border-2 border-amber-200 rounded-lg mt-4 bg-amber-50/30 overflow-hidden">
                {user ? (
                  <>
                    <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-900 to-red-800 flex items-center justify-center text-white font-bold text-base shadow-md">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                          {isAdmin && (
                            <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium bg-amber-200 text-amber-800 rounded-full">
                              <ShieldCheckIcon className="h-3 w-3 mr-1" />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-amber-100">
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 py-3 px-4 text-red-900 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <UserIcon className="h-5 w-5 text-red-900" />
                        <span>My Profile</span>
                      </Link>
                      <Link 
                        href="/orders" 
                        className="flex items-center gap-3 py-3 px-4 text-red-900 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <ShoppingBagIcon className="h-5 w-5 text-red-900" />
                        <span>My Orders</span>
                      </Link>
                      <Link 
                        href="/wishlist" 
                        className="flex items-center gap-3 py-3 px-4 text-red-900 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <HeartIcon className="h-5 w-5 text-red-900" />
                        <span>Wishlist</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 py-3 px-4 text-red-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50">
                      <p className="text-sm font-medium text-red-900">Welcome! 👋</p>
                      <p className="text-xs text-gray-600">Sign in to access your account</p>
                    </div>
                    <div className="divide-y divide-amber-100">
                      <Link 
                        href="/login" 
                        className="flex items-center gap-3 py-3 px-4 text-red-900 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <UserCircleIcon className="h-5 w-5 text-red-900" />
                        <span>Login</span>
                      </Link>
                      <Link 
                        href="/signup" 
                        className="flex items-center gap-3 py-3 px-4 text-red-900 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <UserIcon className="h-5 w-5 text-red-900" />
                        <span>Sign Up</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};