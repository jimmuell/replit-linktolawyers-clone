import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface IntakeModalSpanishProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (data: any) => void;
}

export default function IntakeModalSpanish({ isOpen, onClose, onStartChat }: IntakeModalSpanishProps) {
  const [formData, setFormData] = useState({
    fullName: 'Jim Mueller',
    email: 'jimmuell@aol.com',
    phoneNumber: '9203625555',
    city: 'Oshkosh',
    state: 'WI',
    caseTypes: ['family-immigration'] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch case types for dropdown - using Spanish labels
  const { data: caseTypesData } = useQuery({
    queryKey: ['/api/case-types'],
    retry: false,
  });

  const caseTypes = (caseTypesData as any)?.data || [];

  // Convert database case types to options for the form (Spanish labels)
  const caseTypeOptions = caseTypes.map((caseType: any) => ({
    id: caseType.value,
    label: caseType.labelEs || caseType.label
  }));

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
      newErrors.fullName = 'El nombre completo es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'La dirección de correo electrónico es requerida';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Por favor, ingrese una dirección de correo electrónico válida';
    }
    
    if (formData.caseTypes.length === 0) {
      newErrors.caseTypes = 'Por favor, seleccione al menos un tipo de caso';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Create intake message in Spanish format
    const location = [formData.city, formData.state].filter(Boolean).join(', ');
    const caseTypeLabels = formData.caseTypes.map(id => {
      const option = caseTypeOptions.find((opt: { id: string; label: string }) => opt.id === id);
      return option?.label || id;
    }).join(', ');

    const intakeMessage = `Hola, mi nombre es ${formData.fullName} y mi correo electrónico es ${formData.email}${
      formData.phoneNumber ? `, mi número de teléfono es ${formData.phoneNumber}` : ''
    }${location ? `, estoy ubicado en ${location}` : ''}. Necesito ayuda con ${caseTypeLabels}.`;

    onStartChat({
      ...formData,
      intakeMessage,
      language: 'es'
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      city: '',
      state: '',
      caseTypes: []
    });
    setErrors({});
    onClose();
  };

  const handlePrefill = () => {
    setFormData({
      fullName: 'Jim Mueller',
      email: 'jimmuell@aol.com',
      phoneNumber: '9203625555',
      city: 'Oshkosh',
      state: 'WI',
      caseTypes: ['family-immigration']
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-yellow-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 text-center">
            Inicia Tu Chat del Asistente de Inmigración
          </DialogTitle>
          <p className="text-gray-600 mt-2 text-center text-sm">
            Por favor proporciona tu información básica para comenzar
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prefill Button */}
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrefill}
              className="text-sm"
            >
              Rellenar Formulario (Prueba)
            </Button>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700 font-medium">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Ingresa tu nombre completo"
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
              Dirección de Correo Electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Ingresa tu dirección de correo electrónico"
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
              Número de Teléfono <span className="text-gray-500">(opcional)</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Ingresa tu número de teléfono"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              Ubicación
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  id="city"
                  type="text"
                  placeholder="Ciudad"
                  value={formData.city || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  id="state"
                  type="text"
                  placeholder="Estado"
                  value={formData.state || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Case Type */}
          <div className="space-y-3">
            <Label className="text-gray-700 font-medium">
              Tipo de Caso <span className="text-red-500">*</span>
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

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Atrás
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
            >
              Iniciar Chat
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}