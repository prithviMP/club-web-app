import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

import { shippingService } from '../../services/shipping/shippingService';


const ShippingForm = ({ onSubmit, initialData = {} }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country || 'India',
  });
  const [errors, setErrors] = useState({});
  const [saveAddress, setSaveAddress] = useState(false); // added saveAddress state
  const [savedAddresses, setSavedAddresses] = useState([]); // added savedAddresses state
  const [selectedAddress, setSelectedAddress] = useState(null); // added selectedAddress state


  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '',
        email: prev.email || user.email || '',
      }));
      shippingService.getSavedAddresses(user.id).then(addresses => setSavedAddresses(addresses));
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) 
      newErrors.phone = 'Phone number should be 10 digits';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.state?.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode?.trim()) newErrors.postalCode = 'Postal code is required';
    else if (!/^\d{6}$/.test(formData.postalCode.replace(/\D/g, ''))) 
      newErrors.postalCode = 'Postal code should be 6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setFormData({
      fullName: address.Fullname,
      address: address.Address,
      state: address.state,
      postalCode: address.pincode,
      phone: address.phone_no,
      city: '', //City is not available in saved addresses
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      if (saveAddress && user?.id) {
        try {
          await shippingService.saveAddress({
            Fullname: formData.fullName,
            Address: formData.address,
            state: formData.state,
            pincode: parseInt(formData.postalCode),
            phone_no: formData.phone,
            user: user.id
            // City is not accepted by the API
          });
        } catch (error) {
          console.error('Error saving address:', error);
        }
      }
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {savedAddresses.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">Saved Addresses</label>
          <div className="space-y-2">
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                onClick={() => handleAddressSelect(address)}
                className={`p-3 rounded-lg cursor-pointer border ${
                  selectedAddress?.id === address.id ? 'border-primary bg-gray-800' : 'border-gray-700'
                }`}
              >
                <p className="font-medium">{address.Fullname}</p>
                <p className="text-sm text-gray-400">{address.Address}</p>
                <p className="text-sm text-gray-400">{address.state} - {address.pincode}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
              errors.fullName ? 'border border-red-500' : 'border border-gray-700'
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
              errors.email ? 'border border-red-500' : 'border border-gray-700'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
            errors.phone ? 'border border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="3"
          className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
            errors.address ? 'border border-red-500' : 'border-border-gray-700'
          }`}
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
              errors.city ? 'border border-red-500' : 'border border-gray-700'
            }`}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-1">
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
              errors.state ? 'border border-red-500' : 'border border-gray-700'
            }`}
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
              errors.postalCode ? 'border border-red-500' : 'border border-gray-700'
            }`}
          />
          {errors.postalCode && (
            <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
          )}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700"
            readOnly
          />
        </div>
      </div>

      {user && (
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="saveAddress"
            checked={saveAddress}
            onChange={(e) => setSaveAddress(e.target.checked)}
            className="h-4 w-4 text-primary rounded border-gray-700 focus:ring-primary bg-gray-800"
          />
          <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-300">
            Save this address for future use
          </label>
        </div>
      )}
      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-primary text-black p-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  );
};

export default ShippingForm;