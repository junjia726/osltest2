import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useUser } from "./UserContext";
import { generateWhatsAppMessage } from "../data/user";
import { SASelectionModal } from "./SASelectionModal";

interface WhatsAppFABProps {
  configData?: {
    modelName: string;
    variantName: string;
    colorName?: string;
    accessories?: string[];
    totalPrice?: number;
  };
}

export function WhatsAppFAB({ configData }: WhatsAppFABProps) {
  const { selectedSA, profile } = useUser();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (!selectedSA) {
      setShowModal(true);
      return;
    }

    const msg = generateWhatsAppMessage(profile, configData);
    const waNumber = (selectedSA.whatsapp || selectedSA.phone).replace(
      /[\s\-\+]/g,
      ""
    );
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        aria-label="Contact via WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
      <SASelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={(sa) => {
          // After selecting, open WhatsApp
          const msg = generateWhatsAppMessage(profile, configData);
          const waNumber = (sa.whatsapp || sa.phone).replace(
            /[\s\-\+]/g,
            ""
          );
          window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
        }}
      />
    </>
  );
}
