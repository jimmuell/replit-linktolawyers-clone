import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSpanish?: boolean;
}

export default function TermsAndConditionsModal({ isOpen, onClose, isSpanish = false }: TermsAndConditionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isSpanish ? "Términos y Condiciones" : "Terms and Conditions"}
          </DialogTitle>
          <DialogDescription>
            {isSpanish 
              ? "Por favor lee cuidadosamente nuestros términos y condiciones"
              : "Please carefully read our terms and conditions"
            }
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            {isSpanish ? (
              <div className="space-y-4">
                <p className="text-center text-gray-500 italic">
                  [El contenido de los términos y condiciones en español se proporcionará aquí]
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-gray-500 italic">
                  [Terms and conditions content will be provided here]
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4 border-t">
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