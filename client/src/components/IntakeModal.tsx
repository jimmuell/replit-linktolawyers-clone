import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface IntakeFormData {
  fullName: string;
  email: string;
  caseTypes: string[];
  phoneNumber?: string;
  city?: string;
  state?: string;
}

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IntakeFormData) => void;
}

export function IntakeModal({ isOpen, onClose, onSubmit }: IntakeModalProps) {
  const [location] = useLocation();
  const isSpanish = location.startsWith('/es');

  // Fetch case types from API
  const { data: caseTypesData, isLoading: caseTypesLoading } = useQuery({
    queryKey: ['/api/case-types'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const allCaseTypes = (caseTypesData as any)?.data || [];

  const [formData, setFormData] = useState<IntakeFormData>({
    fullName: '',
    email: '',
    caseTypes: [],
    phoneNumber: '',
    city: '',
    state: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Convert database case types to options for the form
  const caseTypeOptions = allCaseTypes.map((caseType: any) => ({
    id: caseType.value,
    label: isSpanish && caseType.labelEs ? caseType.labelEs : caseType.label
  }));

  const labels = isSpanish ? {
    title: 'Formulario de Admisión',
    subtitle: 'Cuéntanos sobre tu caso legal',
    fullName: 'Nombre Completo',
    email: 'Correo Electrónico',
    phoneNumber: 'Número de Teléfono',
    city: 'Ciudad',
    state: 'Estado',
    caseType: 'Tipo de Caso',
    continueButton: 'Continuar al Chat',
    cancelButton: 'Cancelar',
    selectAtLeastOne: 'Por favor selecciona al menos un tipo de caso',
    fullNameRequired: 'El nombre completo es requerido',
    emailRequired: 'La dirección de correo electrónico es requerida',
    emailInvalid: 'Por favor ingresa una dirección de correo válida',
    optional: '(opcional)',
    fullNamePlaceholder: 'Ingresa tu nombre completo',
    emailPlaceholder: 'Ingresa tu correo electrónico',
    phonePlaceholder: 'Ingresa tu número de teléfono'
  } : {
    title: 'Intake Form',
    subtitle: 'Tell us about your legal case',
    fullName: 'Full Name',
    email: 'Email Address',
    phoneNumber: 'Phone Number',
    city: 'City',
    state: 'State',
    caseType: 'Case Type',
    continueButton: 'Continue to Chat',
    cancelButton: 'Cancel',
    selectAtLeastOne: 'Please select at least one case type',
    fullNameRequired: 'Full name is required',
    emailRequired: 'Email address is required',
    emailInvalid: 'Please enter a valid email address',
    optional: '(optional)',
    fullNamePlaceholder: 'Enter your full name',
    emailPlaceholder: 'Enter your email address',
    phonePlaceholder: 'Enter your phone number'
  };

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
      newErrors.fullName = labels.fullNameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = labels.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = labels.emailInvalid;
    }

    if (formData.caseTypes.length === 0) {
      newErrors.caseTypes = labels.selectAtLeastOne;
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
        caseTypes: [],
        phoneNumber: '',
        city: '',
        state: ''
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
      caseTypes: [],
      phoneNumber: '',
      city: '',
      state: ''
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
          <DialogTitle className="text-xl font-bold text-gray-900 text-center">
            {labels.title}
          </DialogTitle>
          <p className="text-gray-600 mt-2 text-center text-sm">
            {labels.subtitle}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700 font-medium">
              {labels.fullName} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder={labels.fullNamePlaceholder}
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
              {labels.email} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={labels.emailPlaceholder}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
              {labels.phoneNumber} <span className="text-gray-500">{labels.optional}</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder={labels.phonePlaceholder}
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              {isSpanish ? 'Ubicación' : 'Location'}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  id="city"
                  type="text"
                  placeholder={labels.city}
                  value={formData.city || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  id="state"
                  type="text"
                  placeholder={labels.state}
                  value={formData.state || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Case Type */}
          <div className="space-y-3">
            <Label className="text-gray-700 font-medium">
              {labels.caseType} <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              {caseTypeOptions.map((option: { id: string; label: string }) => (
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
              {labels.cancelButton}
            </Button>
            <Button
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8"
            >
              {labels.continueButton}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}