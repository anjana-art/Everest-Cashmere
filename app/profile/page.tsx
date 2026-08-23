// app/profile/page.tsx - Updated with Review Functionality
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Navbar } from "@/components/navbar";
import { 
  UserCircleIcon, EnvelopeIcon, PhoneIcon, 
  HomeIcon, GlobeAltIcon, BuildingOfficeIcon,
  LinkIcon, PencilIcon, CheckIcon, XMarkIcon,
  MapPinIcon, BriefcaseIcon, StarIcon, ChatBubbleLeftRightIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";

// Country data for dropdown
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  {code: 'PT', name: 'Portugal'}
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [eligibleCount, setEligibleCount] = useState(0);
  const router = useRouter();

  // Form state for UserProfile
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    phoneNumber: '',
    country: 'US',
    countryCode: 'US',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    company: '',
    website: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchUserProfile(userData.id);
      fetchEligibleCount(userData.id);
    } catch (err) {
      console.error("Error loading user:", err);
      router.push('/login');
    }
  }, [router]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/user-profile/${userId}`);
      const data = await response.json();
      
      if (data.userProfile) {
        setUserProfile(data.userProfile);
        // Initialize form with profile data
        setFormData({
          firstName: data.userProfile.firstName || '',
          lastName: data.userProfile.lastName || '',
          displayName: data.userProfile.displayName || '',
          phoneNumber: data.userProfile.phoneNumber || '',
          country: data.userProfile.country || 'US',
          countryCode: data.userProfile.countryCode || 'US',
          addressLine1: data.userProfile.addressLine1 || '',
          addressLine2: data.userProfile.addressLine2 || '',
          city: data.userProfile.city || '',
          state: data.userProfile.state || '',
          postalCode: data.userProfile.postalCode || '',
          company: data.userProfile.company || '',
          website: data.userProfile.website || '',
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch eligible products count for review badge
  const fetchEligibleCount = async (userId: string) => {
    try {
      const response = await fetch('/api/reviews/eligible', {
        credentials: 'include',
        headers: {
          'x-user-id': userId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEligibleCount(data.eligible?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching eligible count:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      if (!user) throw new Error("User not found");

      const response = await fetch(`/api/user-profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setUserProfile(data.userProfile);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);

    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        displayName: userProfile.displayName || '',
        phoneNumber: userProfile.phoneNumber || '',
        country: userProfile.country || 'US',
        countryCode: userProfile.countryCode || 'US',
        addressLine1: userProfile.addressLine1 || '',
        addressLine2: userProfile.addressLine2 || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        postalCode: userProfile.postalCode || '',
        company: userProfile.company || '',
        website: userProfile.website || '',
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const getDisplayName = () => {
    if (userProfile?.displayName) return userProfile.displayName;
    if (userProfile?.firstName && userProfile?.lastName) 
      return `${userProfile.firstName} ${userProfile.lastName}`;
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 bg-gradient-to-br from-amber-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gradient-to-br from-amber-50 to-blue-50 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-950 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {getDisplayName().charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{getDisplayName()}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              
              <div>
                {isEditing ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      disabled={isSaving}
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center space-x-1 bg-red-950 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-amber-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* ✅ Quick Actions Row - NEW */}
            <div className="px-6 py-4 bg-amber-50/50 border-b border-amber-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                {/* Orders */}
                <Link
                  href="/orders"
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-amber-200 rounded-lg hover:shadow-md transition group"
                >
                  <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">My Orders</span>
                </Link>

                {/* ✅ Write a Review - With Badge */}
                <Link
                  href="/profile/my-reviews"
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-amber-200 rounded-lg hover:shadow-md transition group relative"
                >
                  <StarIcon className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">Write a Review</span>
                  {eligibleCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {eligibleCount}
                    </span>
                  )}
                </Link>

                {/* ✅ Share Experience */}
                <Link
                  href="/profile/my-experience"
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-amber-200 rounded-lg hover:shadow-md transition group"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Share Experience</span>
                </Link>
              </div>
              {eligibleCount > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  You have {eligibleCount} product{eligibleCount > 1 ? 's' : ''} ready to review!
                </p>
              )}
            </div>

            {/* Profile Form */}
            <div className="p-6">
              <div className="space-y-8">
                {/* Section 1: Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter first name"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">
                          {userProfile?.firstName || "Not set"}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter last name"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">
                          {userProfile?.lastName || "Not set"}
                        </p>
                      )}
                    </div>

                    {/* Display Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="How you want to be displayed"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">
                          {userProfile?.displayName || "Not set"}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+1 234 567 8900"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">
                          {userProfile?.phoneNumber || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Company Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Company Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Company name"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">
                          {userProfile?.company || "Not set"}
                        </p>
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com"
                        />
                      ) : (
                        <div className="flex items-center py-2">
                          {userProfile?.website ? (
                            <a 
                              href={userProfile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <LinkIcon className="h-4 w-4 mr-2" />
                              {userProfile.website}
                            </a>
                          ) : (
                            <p className="text-gray-900">Not set</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Address Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Address Information
                  </h3>
                  
                  {/* Country */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">
                        {countries.find(c => c.code === userProfile?.country)?.name || userProfile?.country || "Not set"}
                      </p>
                    )}
                  </div>

                  {/* Address Line 1 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Street address"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {userProfile?.addressLine1 || "Not set"}
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartment, Suite, Unit (Optional)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Apartment, suite, unit, etc."
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {userProfile?.addressLine2 || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="City"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">
                          {userProfile?.city || "Not set"}
                        </p>
                      )}
                    </div>

                    {/* State/Province */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province/Region
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="State or province"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">
                          {userProfile?.state || "Not specified"}
                        </p>
                      )}
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP/Postal Code
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="12345"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">
                          {userProfile?.postalCode || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* View-Only Display when not editing */}
                {!isEditing && userProfile && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Profile Summary</h4>
                    <div className="space-y-4">
                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-700">
                            <UserCircleIcon className="h-5 w-5 mr-3 text-gray-400" />
                            <span>{getDisplayName()}</span>
                          </div>
                          {userProfile.phoneNumber && (
                            <div className="flex items-center text-gray-700">
                              <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                              <span>{userProfile.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                        
                        {userProfile.company && (
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-700">
                              <BuildingOfficeIcon className="h-5 w-5 mr-3 text-gray-400" />
                              <span>{userProfile.company}</span>
                            </div>
                            {userProfile.website && (
                              <div className="flex items-center text-gray-700">
                                <LinkIcon className="h-5 w-5 mr-3 text-gray-400" />
                                <a 
                                  href={userProfile.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      {(userProfile.addressLine1 || userProfile.city || userProfile.country) && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center text-gray-700 mb-2">
                            <HomeIcon className="h-5 w-5 mr-3 text-gray-400" />
                            <span className="font-medium">Address</span>
                          </div>
                          <div className="ml-8 space-y-1">
                            {userProfile.addressLine1 && <p>{userProfile.addressLine1}</p>}
                            {userProfile.addressLine2 && <p>{userProfile.addressLine2}</p>}
                            <p>
                              {userProfile.city}{userProfile.state ? `, ${userProfile.state}` : ''} {userProfile.postalCode}
                            </p>
                            {userProfile.country && (
                              <p className="flex items-center">
                                <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400" />
                                {countries.find(c => c.code === userProfile.country)?.name || userProfile.country}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}