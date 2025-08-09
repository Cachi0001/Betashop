import { Input } from '../ui/input';
import { Building } from 'lucide-react';

function BusinessInfoSection({ formData, errors, onChange }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Building className="w-5 h-5 text-purple-600" />
        Business Information
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <Input
            name="businessName"
            value={formData.businessName}
            onChange={onChange}
            placeholder="Enter your business name"
            className={errors.businessName ? 'border-red-500' : ''}
          />
          {errors.businessName && (
            <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Owner Name *
          </label>
          <Input
            name="ownerName"
            value={formData.ownerName}
            onChange={onChange}
            placeholder="Enter owner's full name"
            className={errors.ownerName ? 'border-red-500' : ''}
          />
          {errors.ownerName && (
            <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BusinessInfoSection;