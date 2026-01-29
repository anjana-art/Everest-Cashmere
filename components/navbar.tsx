/* 'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import {ShoppingCartIcon, Bars3Icon, XMarkIcon} from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart-store";
import { Button } from "./ui/button";

export const Navbar = ()=>{
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);
    const {items} = useCartStore();
    const cartCount = items.reduce((acc, item)=>acc + item.quantity, 0);

    useEffect(()=>{
      const handelResize = () =>{
        if(window.innerWidth >= 768){
            setMobileOpen(false);
        }
      }
        window.addEventListener("resize", handelResize);
        return ()=> window.removeEventListener("resize", handelResize);
    },[])

    return(
    <nav className="sticky top-0 z-50 bg-amber-100 shadow">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
            
            <Link href={"/"} className="hover:text-red-600 text-red-800 text-2xl ">Everesté</Link>
            <p>- pure cashmere from the heighest peaks to the finest wardrobes.</p>
            
            <div className="hidden md:flex space-x-6">
                <Link href={"/"} className="hover:text-blue-600 text-blue-950 text-xl">Home</Link>
                <Link href={"/products"} className="hover:text-blue-600 text-blue-950 text-xl">Products</Link>
                <Link href={"/checkout"}  className="hover:text-blue-600 text-blue-950 text-xl">Checkout</Link>
                <Link href={"/about"}  className="hover:text-blue-600 text-blue-950 text-xl">About Us</Link>
                <Link href={"/contact"}  className="hover:text-blue-600 text-blue-950 text-xl">Contact Us</Link>


            </div>
            
            <div className="flex items-center space-x-4">
               <Link className="relative" href={'/checkout'}>
                  <ShoppingCartIcon className="h-6 w-6"/>
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {cartCount}
                    </span>
                    }
               </Link>
               <Button  variant='ghost' className="md:hidden" onClick={()=> setMobileOpen((prev)=> !prev)}>{mobileOpen ? <XMarkIcon className="h-6 w-6"/> : <Bars3Icon className="h-6 w-6"/>}</Button>
            </div>
            
        </div>

        { mobileOpen && 
                <nav>
                    <ul>
                        <li><Link href={'/'}>Home</Link></li>
                        <li><Link href={'/products'}>Products</Link></li>
                        <li><Link href={'/cart'}>Cart</Link></li>
                        <li><Link href={'/about'}>About Us</Link></li>

                    </ul>
                </nav>
        }
    </nav>
    )


} */

'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
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
  Cog6ToothIcon, // Admin icon
  ShieldCheckIcon // Alternative admin icon
} from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart-store";
import { Button } from "./ui/button";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { items } = useCartStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Check if user is logged in and admin on mount
  useEffect(() => {
    const checkUserAndAdmin = () => {
      // Check for user in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Check for admin cookie
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
    
    // Also check on page load/refresh
    window.addEventListener('load', checkUserAndAdmin);
    
    return () => {
      window.removeEventListener('load', checkUserAndAdmin);
    };
  }, []);

  // Function to check admin status
  const checkAdminStatus = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);
    
    return cookies['admin-check'] === 'true';
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu') && !target.closest('.user-profile-button')) {
        setShowUserMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
    setShowUserMenu(false);
    window.location.href = '/'; // Redirect to home page
  };

  return (
    <nav className="sticky top-0 z-50 bg-amber-100 shadow">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <Link href={"/"} className="hover:text-red-600 text-red-800 text-2xl font-bold">
            Everesté
          </Link>
          <p className="hidden lg:inline text-blue-950 text-sm italic max-w-xs">
            - pure cashmere from the highest peaks to the finest wardrobes.
          </p>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link href={"/"} className="hover:text-blue-600 text-blue-950 text-lg transition-colors">Home</Link>
          <Link href={"/products"} className="hover:text-blue-600 text-blue-950 text-lg transition-colors">Products</Link>
          <Link href={"/checkout"} className="hover:text-blue-600 text-blue-950 text-lg transition-colors">Checkout</Link>
          <Link href={"/about"} className="hover:text-blue-600 text-blue-950 text-lg transition-colors">About Us</Link>
          <Link href={"/contact"} className="hover:text-blue-600 text-blue-950 text-lg transition-colors">Contact Us</Link>
        </div>
        
        {/* Right Side Icons */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Admin Dashboard Button (Only for admins) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="relative group hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
              title="Admin Dashboard"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              <span className="font-medium text-sm">Dashboard</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link 
            className="relative hover:text-blue-600 transition-colors group" 
            href={'/checkout'}
            title="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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
                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors user-profile-button group"
                  title="My Account"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md relative">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    {isAdmin && (
                      <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        <ShieldCheckIcon className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 border border-gray-100 z-50">
                    <div className="py-2" role="menu">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                            {isAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <ShoppingBagIcon className="h-4 w-4 mr-3 text-gray-400" />
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <HeartIcon className="h-4 w-4 mr-3 text-gray-400" />
                        Wishlist
                      </Link>
                      
                      {/* Admin Dashboard Link in Dropdown */}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-3 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-colors border-t border-gray-100 mt-1 pt-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3 text-purple-500" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      {/* Logout Button */}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // NOT logged in - simple link to login page
              <Link 
                href="/login"
                className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
              >
                <UserCircleIcon className="h-7 w-7" />
                <span className="hidden md:inline text-blue-950 font-medium">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant='ghost'
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-1">
            <Link 
              href={'/'} 
              className="block py-3 px-3 text-blue-950 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link 
              href={'/products'} 
              className="block py-3 px-3 text-blue-950 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
              onClick={() => setMobileOpen(false)}
            >
              Products
            </Link>
            <Link 
              href={'/checkout'} 
              className="block py-3 px-3 text-blue-950 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
              onClick={() => setMobileOpen(false)}
            >
              Checkout
            </Link>
            
            {/* Admin Dashboard in Mobile Menu */}
            {isAdmin && (
              <Link 
                href={'/admin'} 
                className="block py-3 px-3 text-purple-700 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors border-l-4 border-purple-500"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center">
                  <Cog6ToothIcon className="h-5 w-5 mr-3" />
                  <span className="font-medium">Admin Dashboard</span>
                </div>
              </Link>
            )}
            
            <Link 
              href={'/about'} 
              className="block py-3 px-3 text-blue-950 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
              onClick={() => setMobileOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href={'/contact'} 
              className="block py-3 px-3 text-blue-950 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
              onClick={() => setMobileOpen(false)}
            >
              Contact Us
            </Link>
            
            {/* Mobile User Section */}
            <div className="border-t border-gray-200 mt-2 pt-3">
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link 
                    href="/profile" 
                    className="block py-3 px-3 text-blue-950 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/orders" 
                    className="block py-3 px-3 text-blue-950 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="block py-3 px-3 text-purple-700 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className="flex items-center">
                        <Cog6ToothIcon className="h-5 w-5 mr-3" />
                        Admin Dashboard
                      </div>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="w-full text-left py-3 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Simple links to login and signup pages */}
                  <Link 
                    href="/login" 
                    className="block py-3 px-3 text-blue-950 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block py-3 px-3 text-blue-950 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};