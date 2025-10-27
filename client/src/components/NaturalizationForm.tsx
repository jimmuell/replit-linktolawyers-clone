import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NaturalizationFormProps {
  onComplete: (responses: Record<string, any>) => void;
  onBack: () => void;
}

interface FormData {
  howGotGreenCard: string;
  greenCardStartDate: string;
  tripsOver6Months: string;
  livedHalfTime5Years: string;
  marriageRule3Years: string;
}

export function NaturalizationForm({ onComplete, onBack }: NaturalizationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    howGotGreenCard: '',
    greenCardStartDate: '',
    tripsOver6Months: '',
    livedHalfTime5Years: '',
    marriageRule3Years: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.howGotGreenCard.trim()) {
      newErrors.howGotGreenCard = 'This field is required';
    }
    if (!formData.greenCardStartDate.trim()) {
      newErrors.greenCardStartDate = 'This field is required';
    }
    if (!formData.tripsOver6Months) {
      newErrors.tripsOver6Months = 'This field is required';
    }
    if (!formData.livedHalfTime5Years) {
      newErrors.livedHalfTime5Years = 'This field is required';
    }
    if (!formData.marriageRule3Years) {
      newErrors.marriageRule3Years = 'This field is required';
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
        <h2 className="text-xl font-bold text-gray-900">Naturalization / Citizenship</h2>
        <p className="text-gray-600 mt-2">Please answer the following questions about your naturalization case</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="howGotGreenCard">
            How did you get your green card? (Example: through family, work, marriage, or something else.) <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="howGotGreenCard"
            value={formData.howGotGreenCard}
            onChange={(e) => setFormData(prev => ({ ...prev, howGotGreenCard: e.target.value }))}
            className={errors.howGotGreenCard ? 'border-red-500' : ''}
            placeholder="e.g., Through marriage to U.S. citizen, Family petition by parent, Employment-based..."
            data-testid="textarea-green-card-method"
          />
          {errors.howGotGreenCard && <p className="text-red-500 text-sm">{errors.howGotGreenCard}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="greenCardStartDate">
            What is the start date on your green card? Please share the date printed on your card. <span className="text-red-500">*</span>
          </Label>
          <Input
            id="greenCardStartDate"
            type="date"
            value={formData.greenCardStartDate}
            onChange={(e) => setFormData(prev => ({ ...prev, greenCardStartDate: e.target.value }))}
            className={errors.greenCardStartDate ? 'border-red-500' : ''}
            data-testid="input-green-card-date"
          />
          {errors.greenCardStartDate && <p className="text-red-500 text-sm">{errors.greenCardStartDate}</p>}
          <p className="text-sm text-gray-500">
            This is the "Resident Since" date on your green card, not when you received the physical card.
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">
            Since getting your green card, have you taken any trips outside the U.S. for more than 6 months at one time? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup 
            value={formData.tripsOver6Months} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, tripsOver6Months: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="trips-yes" data-testid="radio-trips-yes" />
              <Label htmlFor="trips-yes">Yes, I have taken trips over 6 months</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="trips-no" data-testid="radio-trips-no" />
              <Label htmlFor="trips-no">No, I have not taken trips over 6 months</Label>
            </div>
          </RadioGroup>
          {errors.tripsOver6Months && <p className="text-red-500 text-sm">{errors.tripsOver6Months}</p>}
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">
            In the last 5 years, have you lived in the U.S. at least half the time? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup 
            value={formData.livedHalfTime5Years} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, livedHalfTime5Years: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="lived-5-yes" data-testid="radio-lived-5-yes" />
              <Label htmlFor="lived-5-yes">Yes, I lived in the U.S. at least half the time</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="lived-5-no" data-testid="radio-lived-5-no" />
              <Label htmlFor="lived-5-no">No, I was outside the U.S. more than half the time</Label>
            </div>
          </RadioGroup>
          {errors.livedHalfTime5Years && <p className="text-red-500 text-sm">{errors.livedHalfTime5Years}</p>}
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">
            If you are applying through marriage on the 3-year rule: In the last 3 years, have you lived in the U.S. at least half the time while married and living with your U.S. citizen spouse? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup 
            value={formData.marriageRule3Years} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, marriageRule3Years: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="marriage-3-yes" data-testid="radio-marriage-3-yes" />
              <Label htmlFor="marriage-3-yes">Yes, this applies to me and I meet the requirements</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="marriage-3-no" data-testid="radio-marriage-3-no" />
              <Label htmlFor="marriage-3-no">No, this does not apply to my situation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unsure" id="marriage-3-unsure" data-testid="radio-marriage-3-unsure" />
              <Label htmlFor="marriage-3-unsure">I'm not sure if this applies to me</Label>
            </div>
          </RadioGroup>
          {errors.marriageRule3Years && <p className="text-red-500 text-sm">{errors.marriageRule3Years}</p>}
          <p className="text-sm text-gray-500">
            The 3-year rule allows you to apply for naturalization after 3 years instead of 5 if you are married to a U.S. citizen and meet certain requirements.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Legal Disclaimer:</strong> The information provided on this website and form does not constitute legal advice. Using this website or completing this form does not create an attorney-client relationship. All information you provide is kept confidential and used to help provide useful pricing information. For advice on your specific immigration situation, please consult a qualified immigration attorney.
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