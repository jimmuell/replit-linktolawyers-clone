import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import type { EmailTemplate } from "@shared/schema";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSpanish?: boolean;
}

export default function PrivacyPolicyModal({ isOpen, onClose, isSpanish = false }: PrivacyPolicyModalProps) {
  const templateType = isSpanish ? 'privacy_policy_spanish' : 'privacy_policy';
  
  const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
    queryKey: [`/api/email-templates/type/${templateType}`],
    enabled: isOpen, // Only fetch when modal is open
  });

  const template = templates?.[0]; // Get the first (should be only) template of this type
  const content = template?.textContent || template?.htmlContent || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {isSpanish ? "Política de Privacidad" : "Privacy Policy"}
          </DialogTitle>
          <DialogDescription>
            {isSpanish 
              ? "Por favor lee cuidadosamente nuestra política de privacidad"
              : "Please carefully read our privacy policy"
            }
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {isLoading ? (
              <div className="text-center text-gray-500 italic p-8">
                <p>Loading privacy policy...</p>
              </div>
            ) : content ? (
              content
            ) : (
              <div className="text-center text-gray-500 italic p-8">
                <p className="mb-4">
                  {isSpanish 
                    ? "La política de privacidad no está disponible en este momento."
                    : "Privacy policy is not available at this time."
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
        
        <div className="flex justify-end pt-4 border-t flex-shrink-0">
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