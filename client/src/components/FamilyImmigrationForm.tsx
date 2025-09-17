import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FamilyImmigrationFormProps {
  onComplete: (responses: Record<string, any>) => void;
  onBack: () => void;
}

type LocationStatus = 'inside' | 'outside' | '';

interface FormData {
  locationStatus: LocationStatus;
  // Inside US questions
  entryMethod?: string;
  wasInspected?: string;
  legalStatus?: string;
  entryDate?: string;
  visaType?: string;
  hasFamily?: string;
  everMarried?: string;
  // Outside US questions  
  hasUSFamily?: string;
  previousVisa?: string;
  legalHelp?: string;
}

export function FamilyImmigrationForm({ onComplete, onBack }: FamilyImmigrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    locationStatus: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.locationStatus) {
      newErrors.locationStatus = 'Please select whether you are inside or outside the U.S.';
    }

    if (formData.locationStatus === 'inside') {
      if (!formData.entryMethod?.trim()) newErrors.entryMethod = 'This field is required';
      if (!formData.wasInspected) newErrors.wasInspected = 'This field is required';
      if (!formData.legalStatus) newErrors.legalStatus = 'This field is required';
      if (!formData.entryDate?.trim()) newErrors.entryDate = 'This field is required';
      if (!formData.visaType?.trim()) newErrors.visaType = 'This field is required';
      if (!formData.hasFamily) newErrors.hasFamily = 'This field is required';
      if (!formData.everMarried) newErrors.everMarried = 'This field is required';
    }

    if (formData.locationStatus === 'outside') {
      if (!formData.hasUSFamily) newErrors.hasUSFamily = 'This field is required';
      if (!formData.previousVisa?.trim()) newErrors.previousVisa = 'This field is required';
      if (!formData.legalHelp?.trim()) newErrors.legalHelp = 'This field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Family Immigration</h2>
        <p className="text-gray-600 mt-2">Please answer the following questions about your situation</p>
      </div>

      {/* Location Status */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Are you inside the U.S. right now, or outside the U.S.? <span className="text-red-500">*</span>
        </Label>
        <RadioGroup 
          value={formData.locationStatus} 
          onValueChange={(value) => setFormData(prev => ({ 
            ...prev, 
            locationStatus: value as LocationStatus,
            // Clear other fields when switching
            entryMethod: '', wasInspected: '', legalStatus: '', 
            entryDate: '', visaType: '', hasFamily: '', everMarried: '',
            hasUSFamily: '', previousVisa: '', legalHelp: ''
          }))}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inside" id="inside" data-testid="radio-inside" />
            <Label htmlFor="inside">Inside the U.S.</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="outside" id="outside" data-testid="radio-outside" />
            <Label htmlFor="outside">Outside the U.S.</Label>
          </div>
        </RadioGroup>
        {errors.locationStatus && (
          <p className="text-red-500 text-sm">{errors.locationStatus}</p>
        )}
      </div>

      {/* Inside US Questions */}
      {formData.locationStatus === 'inside' && (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900">Since you are inside the U.S.:</h3>
          
          <div className="space-y-2">
            <Label htmlFor="entryMethod">
              How did you come into the U.S.? For example, did you fly on a plane, walk across the border, or something else? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="entryMethod"
              value={formData.entryMethod || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, entryMethod: e.target.value }))}
              className={errors.entryMethod ? 'border-red-500' : ''}
              data-testid="textarea-entry-method"
            />
            {errors.entryMethod && <p className="text-red-500 text-sm">{errors.entryMethod}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">
              When you entered, did a U.S. officer check your passport or papers? (This is called <em>inspection</em> — it means an officer looked at your ID and let you in.) <span className="text-red-500">*</span>
            </Label>
            <RadioGroup 
              value={formData.wasInspected || ''} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, wasInspected: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="inspected-yes" data-testid="radio-inspected-yes" />
                <Label htmlFor="inspected-yes">Yes, an officer checked my papers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="inspected-no" data-testid="radio-inspected-no" />
                <Label htmlFor="inspected-no">No, no officer checked my papers</Label>
              </div>
            </RadioGroup>
            {errors.wasInspected && <p className="text-red-500 text-sm">{errors.wasInspected}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">
              Are you still in legal status, or out of status? (<em>In status</em> means your visa or permit is still good. <em>Out of status</em> means your visa ended, or you stayed longer than allowed.) <span className="text-red-500">*</span>
            </Label>
            <RadioGroup 
              value={formData.legalStatus || ''} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, legalStatus: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-status" id="in-status" data-testid="radio-in-status" />
                <Label htmlFor="in-status">In legal status (my visa/permit is still good)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="out-status" id="out-status" data-testid="radio-out-status" />
                <Label htmlFor="out-status">Out of status (my visa ended or I overstayed)</Label>
              </div>
            </RadioGroup>
            {errors.legalStatus && <p className="text-red-500 text-sm">{errors.legalStatus}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryDate">
              What date did you enter? Please give the date, or your best guess. <span className="text-red-500">*</span>
            </Label>
            <Input
              id="entryDate"
              type="date"
              value={formData.entryDate || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, entryDate: e.target.value }))}
              className={errors.entryDate ? 'border-red-500' : ''}
              data-testid="input-entry-date"
            />
            {errors.entryDate && <p className="text-red-500 text-sm">{errors.entryDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="visaType">
              What kind of visa or entry did you use? Example: tourist, student, work, or no visa. <span className="text-red-500">*</span>
            </Label>
            <Input
              id="visaType"
              value={formData.visaType || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, visaType: e.target.value }))}
              className={errors.visaType ? 'border-red-500' : ''}
              placeholder="e.g., tourist visa, student visa, work visa, no visa"
              data-testid="input-visa-type"
            />
            {errors.visaType && <p className="text-red-500 text-sm">{errors.visaType}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">
              Do you have a close family member who can help you? This means a U.S. citizen or green card holder who is your husband or wife, parent, or child who is 21 or older. <span className="text-red-500">*</span>
            </Label>
            <RadioGroup 
              value={formData.hasFamily || ''} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, hasFamily: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="family-yes" data-testid="radio-family-yes" />
                <Label htmlFor="family-yes">Yes, I have a qualifying family member</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="family-no" data-testid="radio-family-no" />
                <Label htmlFor="family-no">No, I don't have a qualifying family member</Label>
              </div>
            </RadioGroup>
            {errors.hasFamily && <p className="text-red-500 text-sm">{errors.hasFamily}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">
              Have you ever been married before? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup 
              value={formData.everMarried || ''} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, everMarried: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="married-yes" data-testid="radio-married-yes" />
                <Label htmlFor="married-yes">Yes, I have been married</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="married-no" data-testid="radio-married-no" />
                <Label htmlFor="married-no">No, I have never been married</Label>
              </div>
            </RadioGroup>
            {errors.everMarried && <p className="text-red-500 text-sm">{errors.everMarried}</p>}
          </div>
        </div>
      )}

      {/* Outside US Questions */}
      {formData.locationStatus === 'outside' && (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900">Since you are outside the U.S.:</h3>
          
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Do you have a close family member who can help you? This means a U.S. citizen or green card holder who is your husband or wife, parent, or child who is 21 or older. <span className="text-red-500">*</span>
            </Label>
            <RadioGroup 
              value={formData.hasUSFamily || ''} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, hasUSFamily: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="us-family-yes" data-testid="radio-us-family-yes" />
                <Label htmlFor="us-family-yes">Yes, I have a qualifying U.S. family member</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="us-family-no" data-testid="radio-us-family-no" />
                <Label htmlFor="us-family-no">No, I don't have a qualifying U.S. family member</Label>
              </div>
            </RadioGroup>
            {errors.hasUSFamily && <p className="text-red-500 text-sm">{errors.hasUSFamily}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousVisa">
              Have you ever applied for a U.S. visa before? If yes, what happened? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="previousVisa"
              value={formData.previousVisa || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, previousVisa: e.target.value }))}
              className={errors.previousVisa ? 'border-red-500' : ''}
              placeholder="e.g., No, never applied before / Yes, approved in 2020 / Yes, denied in 2019 because..."
              data-testid="textarea-previous-visa"
            />
            {errors.previousVisa && <p className="text-red-500 text-sm">{errors.previousVisa}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalHelp">
              What kind of legal help are you looking for right now? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="legalHelp"
              value={formData.legalHelp || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, legalHelp: e.target.value }))}
              className={errors.legalHelp ? 'border-red-500' : ''}
              placeholder="e.g., Help with family petition / Consular processing guidance / Appeal a denial..."
              data-testid="textarea-legal-help"
            />
            {errors.legalHelp && <p className="text-red-500 text-sm">{errors.legalHelp}</p>}
          </div>
        </div>
      )}

      <div className="flex justify-between space-x-3">
        <Button variant="outline" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!formData.locationStatus}
          data-testid="button-submit"
        >
          Submit Application <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}