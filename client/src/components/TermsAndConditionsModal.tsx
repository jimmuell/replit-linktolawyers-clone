import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import type { EmailTemplate } from "@shared/schema";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSpanish?: boolean;
}

export default function TermsAndConditionsModal({ isOpen, onClose, isSpanish = false }: TermsAndConditionsModalProps) {
  const templateType = isSpanish ? 'terms_and_conditions_spanish' : 'terms_and_conditions';
  
  const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
    queryKey: [`/api/legal-documents/${templateType}`],
    enabled: isOpen, // Only fetch when modal is open
  });

  const template = templates?.[0]; // Get the first (should be only) template of this type
  const content = template?.textContent || template?.htmlContent || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {isSpanish ? "Términos y Condiciones" : "Terms and Conditions"}
          </DialogTitle>
          <DialogDescription>
            {isSpanish 
              ? "Por favor lee cuidadosamente nuestros términos y condiciones completos (18,349 palabras)"
              : "Please carefully read our complete terms and conditions (18,349 words)"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden px-6">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pb-4">
              {isLoading ? (
                <div className="text-center text-gray-500 italic p-8">
                  <p>Loading terms and conditions...</p>
                </div>
              ) : content ? (
                content
              ) : (
                <div className="text-center text-gray-500 italic p-8">
                  <p className="mb-4">
                    {isSpanish 
                      ? "Los términos y condiciones no están disponibles en este momento."
                      : "Terms and conditions are not available at this time."
                    }
                  </p>
                  <p className="text-xs">
                    {isSpanish
                      ? "Por favor, contacte al administrador para obtener más información."
                      : "Please contact the administrator for more information."
                    }
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex justify-end pt-4 pb-6 px-6 border-t flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-6"
          >
            {isSpanish ? "Cerrar" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}