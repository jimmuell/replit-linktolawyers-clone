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
              <div className="space-y-6">
                <div className="text-center border-b pb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Terms of Service</h2>
                  <p className="text-gray-600 mt-1">Published on: 2024-08-25</p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Link To Lawyers: Terms of Use with Binding Arbitration and Waiver of the Right to a Jury Trial</h3>
                  <p className="mb-4">
                    <strong>WELCOME!</strong> Thank you for visiting the Website of LinkToLawyers ("LTL" or "Company") containing among other things our: Privacy Policy, Terms of Use Policy and Binding Arbitration with Waiver of Right to a Jury Trial Policy. These three provisions are an integral and key part of LTL Website. Our Terms of Use and our Privacy Policy provide information about the services that we offer, general information, certain important resources, and allow you to contact us. The Binding Arbitration provision provides the sole method for a resolution of disputes in the unlikely case any should occur. NOTE: the Binding Arbitration includes a Waiver of the Right to Jury Trial. These Policies govern your use of our websites. Please read all provisions as they set forth the rules and terms of using the LTL Website.
                  </p>
                  <p className="mb-4">
                    We are not lawyers or a law firm but rather a marketing company that assist specific lawyers, law firms and others to obtain potential case leads. LTL runs media advertisements in the United States with the goal of providing personal injury victims an opportunity to learn about various lawyers and law firms that are actively involved in Personal Injury Law Practice in their area. This allows claimants the chance to compare firms and then select the lawyers/law firm they may want to represent them. By its very nature, this is an Interstate Commerce matter and Viewer acknowledges that this Website evidences business transactions involving Interstate Commerce. Since LTL and Viewers of this Website agree to resolve any dispute through binding arbitration, the Federal Arbitration Act (FAA), 9 USC §1 et seq., shall govern the interpretation, enforcement of such proceedings; See paragraph 25 below.
                  </p>
                  <p className="mb-4">
                    Therefore, any dispute arising out of the services rendered and the use of this Website shall be decided by Binding Arbitration; See Paragraph 25 below. Also, <strong>THE PARTIES WAIVE THE RIGHT OF JURY TRIAL; AND FURTHER WAIVE ANY RIGHT THAT IT MAY HAVE TO ASSERT THE DEFENSE OF FORUM NON-CONVENIENS.</strong>
                  </p>
                  <p className="mb-4">
                    Many Viewers of this Website aka potential Claimants, may employ lawyers, law firms and others after using our Website. However, such law firms are separate and independent from us with their own Websites, agreements and terms. As we are not related entities, you will have to review their sites and agreements to understand their Policies and Terms. In the normal course of business, most Viewers/claimants will quickly be given the names of law firms from which they may choose to employ as their attorney. As a consequence, LTL will have only a small amount of personal data obtained from potential Claimants and all or most of that data will promptly be made available to those law firms. That data will not be considered Confidential as to those law firms, LTL, call centers or other entities involved in this process. More detailed information can be found in our Privacy Policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">TERMS OF USE FOR LinkToLawyers</h3>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">INTRODUCTION</h4>
                    <p>Thank you for visiting the website of LinkToLawyers ("LTL" or "Company"). We operate as a Limited Liability Company. We are not lawyers or a law firm but rather a marketing company that assist specific lawyers, law firms and others to obtain potential case leads. All references to "websites" or "Site" include Company websites that post a link to our Terms of Use and our Privacy Policy, including this website, other Company owned and/or operated websites but not sites of third parties even if referenced in our Site. Our Terms of Use and our Privacy Policy provide information about the services that we offer, general information, certain resources, and allow you to contact us. Also, this Terms of Use and our Privacy Policy governs your use of our websites as noted below.</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">1. BINDING EFFECT</h4>
                    <p>By using the Internet site located at www.LinkToLawyers.com (the "Site") and any services provided in connection with the Site (the "Service"), you agree to abide by these Terms of Use as they may be amended by LTL from time to time in its sole discretion. LTL will post a notice on the Site any time these Terms of Use have been changed or otherwise updated. It is your responsibility to review both these Terms of Use (and Privacy Policy noted below) periodically, and if at any time you find these Terms of Use and/or our Privacy Policy unacceptable, you must immediately leave the Site and cease all use of the Service and the Site. <strong>YOU AGREE THAT BY USING THE SERVICE YOU REPRESENT THAT YOU ARE AT LEAST 18 YEARS OLD AND THAT YOU ARE LEGALLY ABLE TO ENTER INTO THIS AGREEMENT.</strong> You also agree to be bound by the Terms of Use and the Privacy Policy. This is a binding agreement as if it were a written contract.</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">2. PRIVACY POLICY</h4>
                    <p>LTL respects your privacy and generally permits you to control the treatment of your personal information that is provided to us as part of your case data. A complete statement of Company's current privacy policy can be found by clicking here. Company's privacy policy is expressly incorporated into this Agreement by this reference.</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">3. LEGAL SERVICES ADVERTISEMENT</h4>
                    <div className="pl-4">
                      <p className="mb-2"><strong>A.</strong> This is an Advertisement for legal services. The hiring of a lawyer is an important decision that should not be based solely upon advertisements. No representation is made that the quality of legal services to be performed is greater than the quality of legal services performed by other lawyers. Do not use this site as a substitute for seeking your own legal advice or making your own investigation of facts. Again, this is an advertisement. Information from this website or data provided to the sites is not subject to the attorney-client privileged (we are not attorneys) and does not constitute legal advice. The transfer of such data to a law firm does not create an attorney-client relationship with such a firm which will only happen when a Retainer Agreement is signed by you with a law firm. Any initial information provided to LinkToLawyers is done so voluntarily and will not be considered nor treated as confidential.</p>
                      
                      <p className="mb-2"><strong>B.</strong> No Guarantee as to the accuracy of data given. Fees, recovery totals and all other firm details have been provided by each law firm on their own accord. LTL does not guarantee the accuracy of any information provided but believes it to be accurate. All fees listed are represented as contingency fees, although clients may still be responsible for payment or reimbursement of costs and expenses, such as court filing fees, deposition costs, etc. Attorney Reimbursements vary between law firms and will be detailed and outlined in any contracts you sign with a particular firm. Note that the calculation of Law Firm reimbursements may be done in different ways so you should ask any counsel that you select to first explain their method of calculation and ask them to answer any other questions you might have before you enter into a written contract with such Law Firm. Also, such Law Firm data may change from time to time and while we may attempt to update such information no assurance can be made that the Website is up to date when you view it.</p>
                      
                      <p><strong>C.</strong> LTL assumes no liability for services provided by Law Firm obtained from our services. LinkToLawyers assumes no liability for any advice given to you by a law firm or for any actions taken by a lawyer that you may retain through this advertisement. In no case is there a: warranty, guarantee or prediction of outcome of your claim made by LTL.</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">4. HONEST USE AND OPENING ACCOUNTS</h4>
                    <p>You may not attempt to gain unauthorized access to any portion or feature of the Site, or any other systems or networks connected to the Site or to any of the services offered on or through the Site, by hacking, password "mining" or any other illegitimate means.</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">5. USE OF SOFTWARE</h4>
                    <p>LTL may make certain software available to you from the Site but is not required to do so. If it becomes available and you download software from the Site, the software, including all files and images contained in or generated by the software, and accompanying data (collectively, "Software") are deemed to be licensed to you by Company, for your personal, noncommercial, home use only. LTL does not transfer to you either the title or the intellectual property rights to the Software, and LTL retains full and complete title to the Software as well as all intellectual property rights therein. You may not sell, redistribute, or reproduce the Software, nor may you decompile, reverse-engineer, disassemble, or otherwise convert the Software to a human-perceivable form. All logos and names are owned by LTL or its licensors and you may not copy or use them in any manner without prior written approval.</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">6. USER CONTENT</h4>
                    <p className="mb-2">The following paragraph only applies to content that is not part of the case or injury data that you may otherwise provide to our Website. Case or injury data you provide is governed by our Privacy Policy. You grant Company a license to use the materials you publicly post to the Site or Service. By posting, downloading, displaying, performing, transmitting, or otherwise distributing information or other content ("User Content") to the Site or Service, you are granting Company, its affiliates, officers, directors, employees, consultants, agents, and representatives a license to use User Content in connection with the operation of the Internet business of Company.</p>
                    <p>You grant to LTL the non-exclusive, unrestricted, unconditional, unlimited, worldwide, irrevocable, perpetual, and cost-free right and license to use, copy, record, distribute, reproduce, disclose, sell, re-sell, sublicense (through multiple levels), display, publicly perform, transmit, publish, broadcast, translate, make derivative works of, and otherwise use and exploit in any manner whatsoever, all or any portion of your User-Generated Content (and derivative works thereof), for any purpose whatsoever in all formats, on or through any means or medium now known or hereafter developed.</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">7. YOU AGREE NOT TO RELY ON INFORMATION CONTAINED ON THE WEBSITES</h4>
                    <p className="mb-2">The information provided on the websites is general in nature and does not apply to any particular factual, legal, medical, financial, insurance, or other situation. As such, you should not rely on any information on our websites, but rather you should seek professional advice as you determine appropriate. In particular, you should consult personally and directly with:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>An attorney to understand what your legal rights may be in any particular situation</li>
                      <li>Appropriate medical, health, counseling, or other professionals for any medical, health, counseling, or other similar advice</li>
                      <li>Appropriate insurance or financial professionals for advice related to insurance or any financial matters</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">LinkToLawyers</p>
                      <p>Legal Department</p>
                      <p>5900 Balcones Drive Suite 100</p>
                      <p>Austin, TX 78731</p>
                      <p>Email: info@LinkToLawyers.com</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">12. NO WARRANTIES</h4>
                    <p><strong>COMPANY HEREBY DISCLAIMS ALL WARRANTIES. COMPANY IS MAKING THE SITE AVAILABLE "AS IS" WITHOUT WARRANTY OF ANY KIND.</strong> YOU ASSUME THE RISK OF ANY AND ALL DAMAGE OR LOSS FROM USE OF, OR INABILITY TO USE, THE SITE OR THE SERVICE. TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMPANY EXPRESSLY DISCLAIMS ANY AND ALL WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE SITE.</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">13. LIMITED LIABILITY</h4>
                    <p>LTL'S LIABILITY TO YOU IS LIMITED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL COMPANY BE LIABLE FOR DAMAGES OF ANY KIND (INCLUDING, BUT NOT LIMITED TO: SPECIAL, INCIDENTAL, CONSEQUENTIAL DAMAGES, LOST PROFITS, OR LOST DATA, REGARDLESS OF THE FORESEEABILITY OF THOSE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SITE OR ANY OTHER MATERIALS OR SERVICES PROVIDED TO YOU BY COMPANY.</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-4 border-t">
                  <p>This document contains excerpts from the complete Terms of Service. For the full terms and conditions, please visit our website or contact us directly.</p>
                </div>
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