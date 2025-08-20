import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList } from "lucide-react";

interface IntakeFormData {
  fullName: string;
  email: string;
  caseTypes: string[];
}

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IntakeFormData) => void;
}

export function IntakeModal({ isOpen, onClose, onSubmit }: IntakeModalProps) {
  const [formData, setFormData] = useState<IntakeFormData>({
    fullName: '',
    email: '',
    caseTypes: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const caseTypeOptions = [
    { id: 'family', label: 'Family Immigration' },
    { id: 'asylum', label: 'Asylum' },
    { id: 'naturalization', label: 'Naturalization / Citizenship' }
  ];

  const handleCaseTypeChange = (caseTypeId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      caseTypes: checked 
        ? [...prev.caseTypes, caseTypeId]
        : prev.caseTypes.filter(id => id !== caseTypeId)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.caseTypes.length === 0) {
      newErrors.caseTypes = 'Please select at least one case type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        caseTypes: []
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form and errors when closing
    setFormData({
      fullName: '',
      email: '',
      caseTypes: []
    });
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-yellow-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Start Your Immigration Intake
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Please provide your basic information to get started
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700 font-medium">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Case Type */}
          <div className="space-y-3">
            <Label className="text-gray-700 font-medium">
              Case Type <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              {caseTypeOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={formData.caseTypes.includes(option.id)}
                    onCheckedChange={(checked) => 
                      handleCaseTypeChange(option.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={option.id} 
                    className="text-gray-700 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.caseTypes && (
              <p className="text-red-500 text-sm">{errors.caseTypes}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-gray-600"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8"
            >
              Start Chat
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}