'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/lib/store';
import { getProfileChangePassword } from '@/lib/Actions/authActions';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

interface ChangePasswordFormProps {
  onClose: () => void;
  preventAutoClose: boolean;
  setPreventAutoClose: (value: boolean) => void;
  showChangePasswordModal: boolean;
}

export default function ChangePasswordForm({ 
  onClose, 
  preventAutoClose, 
  setPreventAutoClose, 
  showChangePasswordModal 
}: ChangePasswordFormProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call change password API
      const result = await dispatch(getProfileChangePassword({
        CurrentPassword: formData.currentPassword,
        NewPassword: formData.newPassword
      })) as any;

      // Check for HttpResponse structure
      // Legacy APIs may return StatusCode: true instead of 200
      if (result?.HttpResponse) {
        const statusCode = result.HttpResponse.StatusCode;
        const message = result.HttpResponse.Message;
        const isOk =
          statusCode === 200 || statusCode === 201 || statusCode === true;
        
        if (isOk) {
          // Show success toast
          toast.success(
            message && message !== 'Success'
              ? message
              : 'Password changed successfully',
          );
          
          // Reset form
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          
          // Close modal
          onClose();
        } else {
          // Show error message from HttpResponse
          toast.error(message || 'Failed to change password');
          setErrors({ submit: message || 'Failed to change password. Please try again.' });
        }
      } else if (result?.error) {
        // Fallback error handling
        toast.error(result.error);
        setErrors({ submit: result.error });
      } else {
        // Success without HttpResponse structure
        toast.success('Password changed successfully');
        
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Close modal
        onClose();
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password. Please try again.';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">


      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div className="space-y-2 mb-3">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              className={`pr-10 h-[44px] ${errors.currentPassword ? 'border-red-500' : ''}`}
              placeholder="Enter your current password"
              disabled={isSubmitting}
              
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-500">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2 mt-6">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`pr-10 h-[44px] ${errors.newPassword ? 'border-red-500' : ''}`}
              placeholder="Enter your new password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {(() => {
            const password = formData.newPassword || '';
            const hasMinLength = password.length >= 8;
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

            return (
              password && (
                <div className="mt-2 space-y-1">
                  <div className={`text-xs flex items-center gap-2 ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    8 characters minimum
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One uppercase letter
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One lowercase letter
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One number
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One special character
                  </div>
                </div>
              )
            );
          })()}
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`pr-10 h-[44px] ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Confirm your new password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {(() => {
            const password = formData.confirmPassword || '';
            const hasMinLength = password.length >= 8;
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

            return (
              password && (
                <div className="mt-2 space-y-1">
                  <div className={`text-xs flex items-center gap-2 ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    8 characters minimum
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One uppercase letter
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One lowercase letter
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One number
                  </div>
                  <div className={`text-xs flex items-center gap-2 ${hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    One special character
                  </div>
                </div>
              )
            );
          })()}
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:flex-1 bg-violet-700 hover:bg-violet-800 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Changing Password...' : 'Change Password'}
          </Button>
        </div>
      </form>
    </div>
  );
}
