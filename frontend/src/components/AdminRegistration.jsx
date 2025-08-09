import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { authToast, errorToast } from '../utils/toast';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ArrowRight, Sparkles } from 'lucide-react';
import BusinessInfoSection from './admin/BusinessInfoSection';
import ContactInfoSection from './admin/ContactInfoSection';
import SecuritySection from './admin/SecuritySection';
import AddressSection from './admin/AddressSection';
import BankDetailsSection from './admin/BankDetailsSection';
import RegistrationSuccess from './admin/RegistrationSuccess';
import { NIGERIAN_BANKS } from '../utils/constants';
import { validateRegistrationForm } from '../utils/validation';

function AdminRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '', ownerName: '', email: '', phone: '', password: '',
    confirmPassword: '', address: '', city: '', state: '', accountName: '',
    accountNumber: '', bankName: '', bankCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBankSelect = (value) => {
    const selectedBank = NIGERIAN_BANKS.find(bank => bank.name === value);
    setFormData(prev => ({ ...prev, bankName: value, bankCode: selectedBank?.code || '' }));
    if (errors.bankName) setErrors(prev => ({ ...prev, bankName: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegistrationForm(formData);
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);

    setIsSubmitting(true);
    try {
      const registrationData = {
        email: formData.email, password: formData.password, full_name: formData.ownerName,
        phone: formData.phone, business_name: formData.businessName, business_type: 'retail',
        address: { street: formData.address, city: formData.city, state: formData.state, country: 'Nigeria' },
        bank_details: { account_name: formData.accountName, account_number: formData.accountNumber, 
          bank_name: formData.bankName, bank_code: formData.bankCode }
      };
      
      const response = await authService.registerAdmin(registrationData);
      
      console.log('✅ ADMIN REGISTRATION - Success, showing toast');
      authToast.registerSuccess();

      // Store the token and admin data
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
      }

      setIsSuccess(true);
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      console.log('❌ ADMIN REGISTRATION - Error, showing toast:', errorMessage);
      authToast.registerError(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) return <RegistrationSuccess />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
            <Sparkles className="w-4 h-4 mr-2" />Admin Registration
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Seller Network</span>
          </h1>
        </div>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader><CardTitle className="text-2xl text-center">Create Admin Account</CardTitle></CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <BusinessInfoSection formData={formData} errors={errors} onChange={handleInputChange} />
              <Separator />
              <ContactInfoSection formData={formData} errors={errors} onChange={handleInputChange} />
              <Separator />
              <SecuritySection formData={formData} errors={errors} onChange={handleInputChange} />
              <Separator />
              <AddressSection formData={formData} errors={errors} onChange={handleInputChange} />
              <Separator />
              <BankDetailsSection formData={formData} errors={errors} onChange={handleInputChange} onBankSelect={handleBankSelect} />
              {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12">
                {isSubmitting ? 'Creating Account...' : 'Create Admin Account'}<ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminRegistration;