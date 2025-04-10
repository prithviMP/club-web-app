
import React, { useState, useEffect } from 'react';
import { shippingService } from '../../services/shipping/shippingService';
import toast from 'react-hot-toast';

const SavedAddresses = ({ userId }) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    state: '',
    postalCode: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const savedAddresses = await shippingService.getSavedAddresses(userId);
      setAddresses(savedAddresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.postalCode.trim()) errors.postalCode = 'Postal code is required';
    if (!/^\d+$/.test(formData.postalCode)) errors.postalCode = 'Postal code must be numeric';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!/^\d{10}$/.test(formData.phone)) errors.phone = 'Phone number must be 10 digits';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = (address) => {
    setCurrentAddress(address);
    setFormData({
      fullName: address.Fullname,
      address: address.Address,
      state: address.state,
      postalCode: address.pincode.toString(),
      phone: address.phone_no
    });
    setIsEditing(true);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const addressData = {
        Fullname: formData.fullName,
        Address: formData.address,
        state: formData.state,
        pincode: parseInt(formData.postalCode),
        phone_no: formData.phone,
        user: userId
      };

      if (currentAddress) {
        // Update existing address
        await shippingService.updateAddress(currentAddress.id, addressData);
        toast.success('Address updated successfully');
      } else {
        // Add new address
        await shippingService.saveAddress(addressData);
        toast.success('Address saved successfully');
      }
      
      fetchAddresses();
      setIsEditing(false);
      setCurrentAddress(null);
      setFormData({
        fullName: '',
        address: '',
        state: '',
        postalCode: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.message || 'Error saving address');
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await shippingService.deleteAddress(addressId);
        toast.success('Address deleted successfully');
        fetchAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentAddress(null);
    setFormData({
      fullName: '',
      address: '',
      state: '',
      postalCode: '',
      phone: ''
    });
    setFormErrors({});
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Saved Addresses</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary text-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            Add New Address
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
          <h3 className="text-lg font-medium mb-4">{currentAddress ? 'Edit Address' : 'Add New Address'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
                  formErrors.fullName ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {formErrors.fullName && (
                <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
                  formErrors.phone ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
                formErrors.address ? 'border-red-500' : 'border-gray-700'
              }`}
              rows="3"
            />
            {formErrors.address && (
              <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
                  formErrors.state ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {formErrors.state && (
                <p className="mt-1 text-sm text-red-500">{formErrors.state}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300 mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                className={`bg-gray-800 text-white rounded-md w-full p-2.5 ${
                  formErrors.postalCode ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {formErrors.postalCode && (
                <p className="mt-1 text-sm text-red-500">{formErrors.postalCode}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              {currentAddress ? 'Update' : 'Save'} Address
            </button>
          </div>
        </form>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-white">{address.Fullname}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-primary hover:text-primary-dark text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-400">{address.Address}</p>
              <p className="text-gray-400">{address.state} - {address.pincode}</p>
              <p className="text-gray-400">Phone: {address.phone_no}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
          <p className="text-gray-400">You don't have any saved addresses yet.</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-primary text-black px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            Add Your First Address
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;
