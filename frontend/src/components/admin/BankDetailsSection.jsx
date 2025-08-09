import { useState } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CreditCard, AlertCircle, Search } from 'lucide-react';
import { NIGERIAN_BANKS } from '../../utils/constants';

function BankDetailsSection({ formData, errors, onChange, onBankSelect }) {
  const [bankSearch, setBankSearch] = useState('');
  
  const filteredBanks = NIGERIAN_BANKS.filter(bank =>
    bank.name.toLowerCase().includes(bankSearch.toLowerCase())
  );
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-purple-600" />
        Bank Details
      </h3>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Payment Information</p>
            <p className="text-sm text-blue-700">
              Your bank details are required to receive payments. We use Paystack to securely process transfers.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Name *
        </label>
        <Input
          name="accountName"
          value={formData.accountName}
          onChange={onChange}
          placeholder="Enter account holder name"
          className={errors.accountName ? 'border-red-500' : ''}
        />
        {errors.accountName && (
          <p className="text-red-500 text-sm mt-1">{errors.accountName}</p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number *
          </label>
          <Input
            name="accountNumber"
            value={formData.accountNumber}
            onChange={onChange}
            placeholder="10-digit account number"
            maxLength={10}
            className={errors.accountNumber ? 'border-red-500' : ''}
          />
          {errors.accountNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Bank *
            </label>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search banks..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <Select value={formData.bankName} onValueChange={onBankSelect}>
            <SelectTrigger className={errors.bankName ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your bank" />
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              side="bottom" 
              align="start"
              className="max-h-60 overflow-y-auto"
            >
              {filteredBanks.length > 0 ? (
                filteredBanks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">No banks found</div>
              )}
            </SelectContent>
          </Select>
          {errors.bankName && (
            <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BankDetailsSection;