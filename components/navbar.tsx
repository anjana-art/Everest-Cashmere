'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline"; //i am using this in mobile menu

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
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="container mx-auto flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
          <Link href="/" className="inline-block flex-shrink-0">
            <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 overflow-hidden rounded-xl">
              <img 
                src="/himkash_red900.png" 
                alt="Everesté Logo" 
                className="h-full w-full object-cover"
              /> 
            </div>
          </Link>
          
          {/* Tagline */}
          <div className="w-28 sm:w-36 md:w-48 min-h-[2.5rem] flex items-center justify-center overflow-hidden">
            <p className={`text-red-950 text-xs md:text-sm italic text-center leading-tight px-1 transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
              - {taglines[taglineIndex]}
            </p>
          </div>
        </div>
        
        {/* Desktop Navigation - hidden on mobile, visible on lg */}
        <div className="hidden lg:flex space-x-4 xl:space-x-6">
          <Link href={"/"} className="hover:text-amber-600 text-red-900 text-base xl:text-lg transition-colors whitespace-nowrap">Home</Link>
          
          {/* Category Dropdown with fancy submenus */}
          <div className="relative category-menu">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCategoryMenu(!showCategoryMenu);
                setShowClothingSubmenu(false);
                setShowClothingTypeSubmenu(false);
                setShowAccessoriesSubmenu(false);
              }}
              className="flex items-center space-x-1 hover:text-amber-600 text-red-900 text-base xl:text-lg transition-colors category-button whitespace-nowrap"
            >
              <span>Products</span>
              <ChevronDownIcon className={`h-3 w-3 xl:h-4 xl:w-4 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Main Category Menu */}
            {showCategoryMenu && (
              <div className="absolute left-0 mt-2 w-56 lg:w-64 rounded-lg shadow-xl bg-white border border-gray-200 z-50">
                <div className="p-3 lg:p-4">
                  {/* Header with close button */}
                  <div className="flex justify-between items-center mb-3 lg:mb-4 pb-2 lg:pb-3 border-b">
                    <h3 className="font-semibold text-red-900 text-sm lg:text-base">Shop by Category</h3>
                    <button
                      onClick={() => setShowCategoryMenu(false)}
                      className="text-red-900 hover:text-amber-600 transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                    </button>
                  </div>
                  
                  {/* All Products */}
                  <Link
                    href="/products"
                    className="flex items-center justify-between px-2 lg:px-3 py-2 lg:py-2.5 mb-1 lg:mb-2 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors group"
                    onClick={closeAllMenus}
                  >
                    <span className="font-medium text-red-900 group-hover:text-amber-600 text-sm lg:text-base">All Products</span>
                    <ChevronDownIcon className="h-3 w-3 lg:h-4 lg:w-4 text-red-900 group-hover:text-amber-600" />
                  </Link>
                  
                  {/* Clothing Category */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowClothingSubmenu(!showClothingSubmenu);
                        setShowAccessoriesSubmenu(false);
                        setShowClothingTypeSubmenu(false);
                      }}
                      className="flex items-center justify-between w-full px-2 lg:px-3 py-2 lg:py-2.5 mb-1 lg:mb-2 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors group"
                    >
                      <span className="font-medium text-red-900 group-hover:text-amber-600 text-sm lg:text-base">Clothing</span>
                      <ChevronDownIcon className={`h-3 w-3 lg:h-4 lg:w-4 text-red-900 group-hover:text-amber-600 transition-transform ${showClothingSubmenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Clothing Submenu */}
                    {showClothingSubmenu && (
                      <div className="absolute left-full top-0 ml-1 w-56 lg:w-64 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
                        <div className="p-2 lg:p-3">
                          <div className="flex justify-between items-center mb-2 pb-2 border-b">
                            <h4 className="font-medium text-red-900 text-sm lg:text-base">Clothing</h4>
                            <button
                              onClick={() => setShowClothingSubmenu(false)}
                              className="text-red-900 hover:text-amber-600 transition-colors"
                            >
                              <XCircleIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                            </button>
                          </div>
                          
                          {/* Clothing Types */}
                          <div className="mb-2 lg:mb-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowClothingTypeSubmenu(!showClothingTypeSubmenu);
                              }}
                              className="flex items-center justify-between w-full px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded transition-colors mb-1"
                            >
                              <span>By Material Type</span>
                              <ChevronDownIcon className={`h-2 w-2 lg:h-3 lg:w-3 transition-transform ${showClothingTypeSubmenu ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showClothingTypeSubmenu && (
                              <div className="ml-2 lg:ml-3 pl-1 lg:pl-2 border-l border-gray-200 mt-1">
                                <Link
                                  href="/products?category=CLOTHING&type=CASHMERE"
                                  className="block px-2 py-1 lg:py-1.5 text-xs text-red-900 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                  onClick={closeAllMenus}
                                >
                                  Cashmere
                                </Link>
                                <Link
                                  href="/products?category=CLOTHING&type=CASHMERE_MARINO_WOOL"
                                  className="block px-2 py-1 lg:py-1.5 text-xs text-red-900 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                  onClick={closeAllMenus}
                                >
                                  Cashmere + Marino Wool
                                </Link>
                                <Link
                                  href="/products?category=CLOTHING&type=MARINO_WOOL"
                                  className="block px-2 py-1 lg:py-1.5 text-xs text-red-900 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                  onClick={closeAllMenus}
                                >
                                  Marino Wool
                                </Link>
                              </div>
                            )}
                          </div>
                          
                          {/* Clothing by Gender */}
                          <div>
                            <p className="text-xs font-medium text-red-900 mb-1">By Gender</p>
                            <Link
                              href="/products?category=CLOTHING&gender=MEN"
                              className="block px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded transition-colors mb-1"
                              onClick={closeAllMenus}
                            >
                              Men's Clothing
                            </Link>
                            <Link
                              href="/products?category=CLOTHING&gender=WOMEN"
                              className="block px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded transition-colors mb-1"
                              onClick={closeAllMenus}
                            >
                              Women's Clothing
                            </Link>
                            <Link
                              href="/products?category=CLOTHING&gender=UNISEX"
                              className="block px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded transition-colors"
                              onClick={closeAllMenus}
                            >
                              Unisex Clothing
                            </Link>
                          </div>
                          
                          {/* All Clothing */}
                          <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-gray-100">
                            <Link
                              href="/products?category=CLOTHING"
                              className="block px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-red-900 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              onClick={closeAllMenus}
                            >
                              All Clothing
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Home Decore */}
                  <Link
                    href="/products?category=HOME_DECORE"
                    className="flex items-center justify-between px-2 lg:px-3 py-2 lg:py-2.5 mb-1 lg:mb-2 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors group"
                    onClick={closeAllMenus}
                  >
                    <span className="font-medium text-red-900 group-hover:text-amber-600 text-sm lg:text-base">Home Decore</span>
                  </Link>
                  
                  {/* Accessories Category */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAccessoriesSubmenu(!showAccessoriesSubmenu);
                        setShowClothingSubmenu(false);
                        setShowClothingTypeSubmenu(false);
                      }}
                      className="flex items-center justify-between w-full px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors group"
                    >
                      <span className="font-medium text-red-900 group-hover:text-amber-600 text-sm lg:text-base">Accessories</span>
                      <ChevronDownIcon className="h-3 w-3 lg:h-4 lg:w-4 text-red-900 group-hover:text-amber-600" />
                    </button>
                    
                    {/* Accessories Submenu */}
                    {showAccessoriesSubmenu && (
                      <div className="absolute left-full top-0 ml-1 w-48 lg:w-56 rounded-lg shadow-lg bg-white border border-gray-200 z-50">
                        <div className="p-2 lg:p-3">
                          <div className="flex justify-between items-center mb-2 pb-2 border-b">
                            <h4 className="font-medium text-red-900 text-sm lg:text-base">Accessories</h4>
                            <button
                              onClick={() => setShowAccessoriesSubmenu(false)}
                              className="text-red-900 hover:text-amber-600 transition-colors"
                            >
                              <XCircleIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                            </button>
                          </div>
                          
                          {/* Accessories by Gender */}
                          <div className="mb-2">
                            <p className="text-xs font-medium text-red-900 mb-1">By Gender</p>
                            <Link
                              href="/products?category=ACCESSORIES&type=MEN"
                              className="block px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded transition-colors mb-1"
                              onClick={closeAllMenus}
                            >
                              Men
                            </Link>
                            <Link
                              href="/products?category=ACCESSORIES&type=WOMEN"
                              className="block px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded transition-colors mb-1"
                              onClick={closeAllMenus}
                            >
                              Women
                            </Link>
                            <Link
                              href="/products?category=ACCESSORIES&type=UNISEX"
                              className="block px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded transition-colors"
                              onClick={closeAllMenus}
                            >
                              Unisex
                            </Link>
                          </div>
                          
                          {/* All Accessories */}
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <Link
                              href="/products?category=ACCESSORIES"
                              className="block px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-red-900 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              onClick={closeAllMenus}
                            >
                              All Accessories
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop Navigation Links */}
          <Link href={"/checkout"} className="hover:text-amber-600 text-red-900 text-base xl:text-lg transition-colors whitespace-nowrap">Checkout</Link>
          <Link href={"/about"} className="hover:text-amber-600 text-red-900 text-base xl:text-lg transition-colors whitespace-nowrap">About Us</Link>
          <Link href={"/contact"} className="hover:text-amber-600 text-red-900 text-base xl:text-lg transition-colors whitespace-nowrap">Contact Us</Link>
        </div>
        
        {/* Right Side Icons */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
          {/* Admin Dashboard Button (Only for admins) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="relative group hidden lg:flex items-center space-x-1 xl:space-x-2 px-2 xl:px-3 py-1 xl:py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:from-amber-400 hover:to-amber-300 transition-all duration-300 shadow-md hover:shadow-lg"
              title="Admin Dashboard"
            >
              <Cog6ToothIcon className="h-4 w-4 xl:h-5 xl:w-5" />
              <span className="font-medium text-xs xl:text-sm hidden xl:inline">Dashboard</span>
              <span className="absolute -top-1 -right-1 flex h-2 w-2 xl:h-3 xl:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 xl:h-3 xl:w-3 bg-green-500"></span>
              </span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link 
            className="relative text-red-900 hover:text-amber-600 transition-colors group p-1" 
            href={'/checkout'}
            title="Shopping Cart"
          >
            <div className="relative">
{/*               <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
 */}            
                     🛒
                      {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-400 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
              Cart ({cartCount} items)
            </span>
          </Link>

          {/* User Profile */}
          <div className="relative">
            {user ? (
              // Logged in - show dropdown menu
              <div className="user-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center space-x-1 lg:space-x-2 hover:text-amber-600 transition-colors user-profile-button group p-1"
                  title="My Account"
                >
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-amber-500 to-red-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md relative">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    {isAdmin && (
                      <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-3 w-3 sm:h-4 sm:w-4 flex items-center justify-center">
                        <ShieldCheckIcon className="h-2 w-2 sm:h-3 sm:w-3" />
                      </span>
                    )}
                  </div>
                  <ChevronDownIcon className={`h-3 w-3 sm:h-4 sm:w-4 text-red-900 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''} hidden sm:block`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 border border-gray-100 z-50">
                    {/* User Info */}
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
                    
                    {/* Menu Items */}
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
                    
                    {/* Admin Dashboard Link in Dropdown */}
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
                    
                    {/* Logout Button */}
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
              // NOT logged in - simple link to login page
              <Link 
                href="/login"
                className="flex items-center space-x-1 lg:space-x-2 hover:text-amber-600 transition-colors p-1"
              >
                <UserCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-900" />
                <span className="hidden lg:inline text-red-900 font-medium text-sm xl:text-base">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant='ghost'
            size="icon"
            className="lg:hidden text-red-900 hover:text-amber-600 hover:bg-amber-50"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" /> : <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>
        </div>
      </div>

     {/* Mobile Menu - Enhanced UX/UI with Sidebar Style */}
{isClient && mobileOpen && (
  <div className="lg:hidden fixed inset-0 z-50 pointer-events-none"onClick={() => setMobileOpen(false)}>
    <div 
      className="fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl overflow-y-auto animate-slide-in pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with close button */}
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
        {/* Main Navigation Links - Bigger Buttons */}
        <Link 
          href={'/'} 
          className="block py-3.5 px-4 text-red-900 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-all text-base shadow-sm" 
          onClick={() => setMobileOpen(false)}
        >
          🏠 Home
        </Link>
        
        {/* Products with dropdown in mobile */}
        <div className="space-y-1">
          <Link 
            href={'/products'} 
            className="block py-3.5 px-4 text-red-900 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-all text-base shadow-sm" 
            onClick={() => setMobileOpen(false)}
          >
            📦 All Products
          </Link>
          
          {/* Mobile Category Links with better hierarchy */}
          <div className="ml-2 space-y-2 mt-2">
            
            {/* Clothing Section with Dropdown */}
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
                    href="/products?category=CLOTHING" 
                    className="block py-2.5 px-3 text-red-800 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors text-sm border-l-2 border-transparent hover:border-amber-400"
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
                    
                    {/* Material Types with dropdown */}
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
            
            {/* Home Decore - Standalone */}
            <Link 
              href="/products?category=HOME_DECORE" 
              className="flex items-center gap-2 py-3.5 px-4 text-red-900 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-100 hover:border-amber-300 transition-all text-sm bg-white"
              onClick={() => setMobileOpen(false)}
            >
              <span>🏠</span> Home Decore
            </Link>
            
            {/* Accessories Section with Dropdown */}
            <div className="border border-amber-100 rounded-lg overflow-hidden bg-amber-50/30">
              <button
                onClick={() => setOpenAccessories(!openAccessories)}
                className="w-full flex items-center justify-between p-3.5 text-red-900 font-medium hover:bg-amber-50 transition-colors"
              >
                <span>👜 Accessories</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${openAccessories ? 'rotate-180' : ''}`} />
              </button>
              
              {openAccessories && (
                <div className="bg-white border-t border-amber-100 p-2 space-y-1">
                  <Link 
                    href="/products?category=ACCESSORIES" 
                    className="block py-2.5 px-3 text-red-800 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors text-sm border-l-2 border-transparent hover:border-amber-400"
                    onClick={() => setMobileOpen(false)}
                  >
                    All Accessories
                  </Link>
                  <Link 
                    href="/products?category=ACCESSORIES&type=MEN" 
                    className="block py-2 px-4 text-sm text-red-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    👔 Men's Accessories
                  </Link>
                  <Link 
                    href="/products?category=ACCESSORIES&type=WOMEN" 
                    className="block py-2 px-4 text-sm text-red-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    💎 Women's Accessories
                  </Link>
                  <Link 
                    href="/products?category=ACCESSORIES&type=UNISEX" 
                    className="block py-2 px-4 text-sm text-red-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    ⌚ Unisex Accessories
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Other Navigation Links - Bigger Buttons */}
        <Link 
          href={'/checkout'} 
          className="block py-3.5 px-4 text-red-900 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-all text-base shadow-sm mt-2" 
          onClick={() => setMobileOpen(false)}
        >
          🛒 Checkout
        </Link>
        
        {/* Admin Dashboard in Mobile Menu */}
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
        
        {/* Mobile User Section with Card Style */}
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