import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AsylumFormProps {
  onComplete: (responses: Record<string, any>) => void;
  onBack: () => void;
}

interface FormData {
  entryMethod: string;
  entryDate: string;
  afraidToReturn: string;
  reasonAfraid: string;
  inRemovalProceedings: string;
}

export function AsylumForm({ onComplete, onBack }: AsylumFormProps) {
  const [formData, setFormData] = useState<FormData>({
    entryMethod: '',
    entryDate: '',
    afraidToReturn: '',
    reasonAfraid: '',
    inRemovalProceedings: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.entryMethod.trim()) {
      newErrors.entryMethod = 'This field is required';
    }
    if (!formData.entryDate.trim()) {
      newErrors.entryDate = 'This field is required';
    }
    if (!formData.afraidToReturn) {
      newErrors.afraidToReturn = 'This field is required';
    }
    if (formData.afraidToReturn === 'yes' && !formData.reasonAfraid.trim()) {
      newErrors.reasonAfraid = 'Please explain why you feel afraid';
    }
    if (!formData.inRemovalProceedings) {
      newErrors.inRemovalProceedings = 'This field is required';
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
        <h2 className="text-xl font-bold text-gray-900">Asylum Application</h2>
        <p className="text-gray-600 mt-2">Please answer the following questions about your asylum case</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="entryMethod">
            How did you come into the U.S.? (By plane, border crossing, etc.) <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="entryMethod"
            value={formData.entryMethod}
            onChange={(e) => setFormData(prev => ({ ...prev, entryMethod: e.target.value }))}
            className={errors.entryMethod ? 'border-red-500' : ''}
            placeholder="Please describe how you entered the United States..."
            data-testid="textarea-entry-method"
          />
          {errors.entryMethod && <p className="text-red-500 text-sm">{errors.entryMethod}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="entryDate">
            What date did you enter? Please give the date or your best guess. <span className="text-red-500">*</span>
          </Label>
          <Input
            id="entryDate"
            type="date"
            value={formData.entryDate}
            onChange={(e) => setFormData(prev => ({ ...prev, entryDate: e.target.value }))}
            className={errors.entryDate ? 'border-red-500' : ''}
            data-testid="input-entry-date"
          />
          {errors.entryDate && <p className="text-red-500 text-sm">{errors.entryDate}</p>}
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">
            Do you feel afraid to go back to your home country? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup 
            value={formData.afraidToReturn} 
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              afraidToReturn: value,
              reasonAfraid: value === 'no' ? '' : prev.reasonAfraid // Clear reason if selecting 'no'
            }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="afraid-yes" data-testid="radio-afraid-yes" />
              <Label htmlFor="afraid-yes">Yes, I feel afraid to return</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="afraid-no" data-testid="radio-afraid-no" />
              <Label htmlFor="afraid-no">No, I do not feel afraid to return</Label>
            </div>
          </RadioGroup>
          {errors.afraidToReturn && <p className="text-red-500 text-sm">{errors.afraidToReturn}</p>}
        </div>

        {formData.afraidToReturn === 'yes' && (
          <div className="space-y-2">
            <Label htmlFor="reasonAfraid">
              If yes, can you tell me why? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reasonAfraid"
              value={formData.reasonAfraid}
              onChange={(e) => setFormData(prev => ({ ...prev, reasonAfraid: e.target.value }))}
              className={errors.reasonAfraid ? 'border-red-500' : ''}
              placeholder="Please explain why you feel afraid to return to your home country..."
              rows={4}
              data-testid="textarea-reason-afraid"
            />
            {errors.reasonAfraid && <p className="text-red-500 text-sm">{errors.reasonAfraid}</p>}
            <p className="text-sm text-gray-500">
              You can share as much or as little detail as you feel comfortable with at this time.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-base font-medium">
            Has the U.S. government sent you to immigration court or removal (deportation) proceedings? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup 
            value={formData.inRemovalProceedings} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, inRemovalProceedings: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="removal-yes" data-testid="radio-removal-yes" />
              <Label htmlFor="removal-yes">Yes, I am in removal proceedings</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="removal-no" data-testid="radio-removal-no" />
              <Label htmlFor="removal-no">No, I am not in removal proceedings</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unsure" id="removal-unsure" data-testid="radio-removal-unsure" />
              <Label htmlFor="removal-unsure">I'm not sure</Label>
            </div>
          </RadioGroup>
          {errors.inRemovalProceedings && <p className="text-red-500 text-sm">{errors.inRemovalProceedings}</p>}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Legal Disclaimer:</strong> This AI assistant provides general information only and does not constitute legal advice. For specific legal matters, please consult with a qualified immigration attorney.
          </p>
        </div>
      </div>

      <div className="flex justify-between space-x-3">
        <Button variant="outline" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handleSubmit} data-testid="button-submit">
          Submit Application <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}