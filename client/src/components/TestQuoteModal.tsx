import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";

type UserType = "beneficiary" | "petitioner" | null;

interface TestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseTypeSelected: (data: { fullName: string; email: string; caseType: string }) => void;
  language?: 'en' | 'es';
}

const formSchema = z.object({
  fullName: z.string().min(1, "Full Name is required").min(2, "Please enter at least 2 characters").max(100, "Please enter no more than 100 characters"),
  email: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
});

type FormData = z.infer<typeof formSchema>;

const beneficiaryCaseTypes = [
  { value: "new-family-based-green-card-beneficiary", label: 'New - Green Card through a Spouse or Family Member ("Family-Based Green Card") - Beneficiary' },
  { value: "new-removal-of-conditions", label: 'New - Make My 2-Year Conditional Green Card Permanent ("Removal of Conditions")' },
  { value: "citizenship-naturalization-n400", label: 'New - U.S. Citizenship ("Naturalization") - Applying to become a U.S. Citizen' },
  { value: "new-k1-fiance-visa-beneficiary", label: 'New - Fiance(e) Visa ("K-1 visa") - Beneficiary' },
  { value: "final-asylum-flow", label: "New - Asylum or Protection From Persecution" },
  { value: "other", label: "New - Other" },
];

const petitionerCaseTypes = [
  { value: "new-family-based-green-card-petitioner", label: 'New - Green Card through a Spouse or Family Member ("Family-Based Green Card") - Petitioner' },
  { value: "new-removal-of-conditions", label: 'New - Make My 2-Year Conditional Green Card Permanent ("Removal of Conditions")' },
  { value: "citizenship-naturalization-n400", label: 'New - U.S. Citizenship ("Naturalization") - Applying to become a U.S. Citizen' },
  { value: "new-k1-fiance-visa", label: 'New - Fiance(e) Visa ("K-1 visa") - Petitioner' },
  { value: "final-asylum-flow", label: "New - Asylum or Protection From Persecution" },
  { value: "other", label: "New - Other" },
];

export function TestQuoteModal({ isOpen, onClose, onCaseTypeSelected, language = 'en' }: TestQuoteModalProps) {
  const [currentScreen, setCurrentScreen] = useState<"start" | "form" | "userType" | "caseType">("start");
  const [userType, setUserType] = useState<UserType>(null);
  const [selectedCaseType, setSelectedCaseType] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const handleClose = () => {
    setCurrentScreen("start");
    setUserType(null);
    setSelectedCaseType(null);
    setFormData(null);
    form.reset();
    onClose();
  };

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setCurrentScreen("userType");
  };

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setCurrentScreen("caseType");
  };

  const handleCaseTypeSelect = (caseType: string) => {
    setSelectedCaseType(caseType);
    if (formData) {
      onCaseTypeSelected({
        fullName: formData.fullName,
        email: formData.email,
        caseType: caseType
      });
    }
    handleClose();
  };

  const handleBack = () => {
    if (currentScreen === "form") {
      setCurrentScreen("start");
    } else if (currentScreen === "userType") {
      setCurrentScreen("form");
    } else if (currentScreen === "caseType") {
      setCurrentScreen("userType");
      setUserType(null);
    }
  };

  const caseTypes = userType === "beneficiary" ? beneficiaryCaseTypes : petitionerCaseTypes;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {currentScreen !== "start" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mr-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {currentScreen === "start" && <div className="w-20"></div>}
            <DialogTitle className="text-xl flex-1 text-center">
              {currentScreen === "start" && "Get Your Legal Quote"}
              {currentScreen === "form" && "Tell us about yourself"}
              {currentScreen === "userType" && "Who is requesting this quote?"}
              {currentScreen === "caseType" && "Please choose the closest option:"}
            </DialogTitle>
            <div className="w-20"></div>
          </div>
        </DialogHeader>

        {/* Start Screen */}
        {currentScreen === "start" && (
          <div className="py-8 text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Welcome to LinkToLawyers</h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Get personalized attorney pricing for your immigration case in just a few steps.
              </p>
            </div>
            <Button
              onClick={() => setCurrentScreen("form")}
              size="lg"
              className="w-full sm:w-auto px-8"
              data-testid="button-start-flow"
            >
              Start
            </Button>
          </div>
        )}

        {/* Form Screen */}
        {currentScreen === "form" && (
          <div className="py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          data-testid="input-full-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                  data-testid="button-continue-form"
                >
                  {form.formState.isSubmitting ? "Processing..." : "Continue"}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* User Type Selection Screen */}
        {currentScreen === "userType" && (
          <div className="py-6 space-y-4">
            <p className="text-center text-gray-600 mb-6">
              Are you the person being sponsored or the person sponsoring?
            </p>
            <div className="space-y-3">
              <Card
                className={`cursor-pointer hover:border-primary transition-colors ${
                  userType === "beneficiary" ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => handleUserTypeSelect("beneficiary")}
                data-testid="card-beneficiary"
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      userType === "beneficiary"
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                  />
                  <span className="flex-1">
                    I am the person being sponsored and I am filling out this quote request (beneficiary)
                  </span>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer hover:border-primary transition-colors ${
                  userType === "petitioner" ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => handleUserTypeSelect("petitioner")}
                data-testid="card-petitioner"
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      userType === "petitioner"
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                  />
                  <span className="flex-1">
                    I am the person sponsoring and filling out this quote request (petitioner)
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Case Type Selection Screen */}
        {currentScreen === "caseType" && (
          <div className="py-6 space-y-4">
            <p className="text-center text-gray-600 mb-6">
              {userType === "beneficiary" 
                ? "Select your case type (Beneficiary)"
                : "Select your case type (Petitioner)"}
            </p>
            <div className="space-y-3">
              {caseTypes.map((caseType) => (
                <Card
                  key={caseType.value}
                  className={`cursor-pointer hover:border-primary transition-colors ${
                    selectedCaseType === caseType.value ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleCaseTypeSelect(caseType.value)}
                  data-testid={`card-case-type-${caseType.value}`}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        selectedCaseType === caseType.value
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}
                    />
                    <span className="flex-1 text-sm">{caseType.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
