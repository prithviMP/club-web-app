
import React, { useState, useEffect } from 'react';
import { shippingService } from '../../services/shipping/shippingService';

const SavedAddresses = ({ userId }) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: ''
  });

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      const savedAddresses = await shippingService.getSavedAddresses(userId);
      setAddresses(savedAddresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (address) => {
    setCurrentAddress(address);
    setFormData({
      fullName: address.Fullname,
      address: address.Address,
      state: address.state,
      postalCode: address.pincode.toString(),
      phone: address.phone_no,
      city: address.city || ''
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const addressData = {
        Fullname: formData.fullName,
        Address: formData.address,
        state: formData.state,
        pincode: parseInt(formData.postalCode),
        phone_no: formData.phone,
        city: formData.city,
        user: userId
      };

      if (currentAddress) {
        // Update existing address
        await shippingService.updateAddress(currentAddress.id, addressData);
      } else {
        // Add new address
        await shippingService.saveAddress(addressData);
      }
      
      fetchAddresses();
      setIsEditing(false);
      setCurrentAddress(null);
      setFormData({
        fullName: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleDelete = async (addressId) => {
    try {
      await shippingService.deleteAddress(addressId);
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading addresses...</div>;
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700"
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700"
              required
            />
          </div>
          <textarea
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700"
            rows="3"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700"
              required
            />
            <input
              type="text"
              placeholder="State"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              className="bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700"
              required
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={formData.postalCode}
              onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
              className="bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setCurrentAddress(null);
              }}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{address.Fullname}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-primary hover:text-primary-dark"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-400">{address.Address}</p>
              <p className="text-gray-400">{address.city}, {address.state} - {address.pincode}</p>
              <p className="text-gray-400">Phone: {address.phone_no}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;
