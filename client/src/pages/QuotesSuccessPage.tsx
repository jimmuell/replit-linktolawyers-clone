import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Mail, Phone, Clock } from 'lucide-react';

export default function QuotesSuccessPage() {
  const [match, params] = useRoute('/quotes/:requestNumber/success');
  const [location, setLocation] = useLocation();
  const requestNumber = params?.requestNumber;

  const handleBackToHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attorneys Successfully Notified!</h1>
          <p className="text-lg text-gray-600">
            Your selected attorneys have been notified about your case and will contact you soon.
          </p>
        </div>

        {/* Request Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Request Details</span>
            </CardTitle>
            <CardDescription>
              Your legal request number for reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Legal Request Number</p>
              <p className="text-2xl font-bold text-gray-900">{requestNumber?.toUpperCase()}</p>
              <p className="text-sm text-gray-500 mt-2">
                Save this number to track your request status
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
            <CardDescription>
              Here's what you can expect in the coming days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email Confirmations</h4>
                <p className="text-sm text-gray-600">
                  You'll receive email confirmations shortly. Check your spam folder if you don't see them in your inbox.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Attorney Contact</h4>
                <p className="text-sm text-gray-600">
                  Your selected attorneys will contact you directly within 24-48 hours to discuss your case details and provide personalized quotes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Initial Consultations</h4>
                <p className="text-sm text-gray-600">
                  Schedule consultations with attorneys to discuss your case strategy, fees, and expected timeline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Check Your Spam Folder:</strong> Email notifications may end up in your spam or junk folder. Please check there if you don't receive emails within 15 minutes.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Multiple Quotes:</strong> You'll receive individual quotes from each selected attorney. Compare their fees, experience, and approach before making your decision.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>No Obligation:</strong> Receiving quotes doesn't obligate you to hire any attorney. Take your time to review all options.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center">
          <Button 
            onClick={handleBackToHome} 
            className="bg-black hover:bg-gray-800 text-white px-8 py-3"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}