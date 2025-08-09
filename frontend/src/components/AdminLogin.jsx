import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await authService.login(formData);
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to dashboard...",
        variant: "success",
      });
      
      // Store the token and admin data
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
      }
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
            <Sparkles className="w-4 h-4 mr-2" />Admin Login
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your admin account</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />Email Address
                </label>
                <Input
                  type="email" name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="Enter your email" className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                    onChange={handleInputChange} placeholder="Enter your password"
                    className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Button type="button" variant="ghost" size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminLogin;