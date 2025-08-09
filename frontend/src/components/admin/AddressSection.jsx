import { Input } from '../ui/input';
import { MapPin } from 'lucide-react';

function AddressSection({ formData, errors, onChange }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-purple-600" />
        Business Address
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street Address *
        </label>
        <Input
          name="address"
          value={formData.address}
          onChange={onChange}
          placeholder="Enter your business address"
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <Input
            name="city"
            value={formData.city}
            onChange={onChange}
            placeholder="Enter city"
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <Input
            name="state"
            value={formData.state}
            onChange={onChange}
            placeholder="Enter state"
            className={errors.state ? 'border-red-500' : ''}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddressSection;