import { useState } from "react";
import { Link } from "react-router";
import { Sparkles, ArrowRight, RotateCcw, MessageCircle } from "lucide-react";
import { quizQuestions, getQuizResult } from "../data/quiz";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useUser } from "../components/UserContext";
import { generateWhatsAppMessage } from "../data/user";
import { SASelectionModal } from "../components/SASelectionModal";

export function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [showSAModal, setShowSAModal] = useState(false);
  const { selectedSA, profile, cars: carModels } = useUser();

  const handleAnswer = (optionId: string) => {
    const newAnswers = { ...answers, [quizQuestions[currentQ].id]: optionId };
    setAnswers(newAnswers);

    if (currentQ < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
  };

  if (showResult) {
    const resultId = getQuizResult(answers);
    const resultCar = carModels.find((c) => c.id === resultId) || carModels[0];

    const handleContactSA = () => {
      if (!selectedSA) {
        setShowSAModal(true);
        return;
      }

      const msg = generateWhatsAppMessage(profile, {
        modelName: resultCar.name,
        variantName: resultCar.variants[0].name,
        totalPrice: resultCar.startingPrice,
      });
      const waNumber = (selectedSA.whatsapp || selectedSA.phone).replace(
        /[\s\-\+]/g,
        ""
      );
      window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
    };

    return (
      <div className="px-5 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="mb-2">Your Perfect Match!</h1>
        <p className="text-muted-foreground mb-6">
          Based on your answers, we recommend:
        </p>

        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-md">
          <ImageWithFallback
            src={resultCar.image}
            alt={resultCar.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-5">
            <h2 className="text-primary">{resultCar.name}</h2>
            <p className="text-muted-foreground mt-1">{resultCar.tagline}</p>
            <p className="mt-2">
              From RM {resultCar.startingPrice.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            to={`/configurator/${resultCar.id}`}
            className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
          >
            Configure Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to={`/calculator?price=${resultCar.startingPrice}`}
            className="block w-full bg-secondary text-white py-3.5 rounded-xl text-center transition-opacity hover:opacity-90"
          >
            Calculate Loan
          </Link>
          <button
            onClick={handleContactSA}
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
          >
            <MessageCircle className="w-5 h-5" />
            {selectedSA
              ? `Contact ${selectedSA.name}`
              : "Select SA & Contact"}
          </button>
          <button
            onClick={resetQuiz}
            className="flex items-center justify-center gap-2 w-full text-muted-foreground py-3 hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Take Quiz Again
          </button>
        </div>

        <SASelectionModal
          isOpen={showSAModal}
          onClose={() => setShowSAModal(false)}
          onSelect={(sa) => {
            const msg = generateWhatsAppMessage(profile, {
              modelName: resultCar.name,
              variantName: resultCar.variants[0].name,
              totalPrice: resultCar.startingPrice,
            });
            const waNumber = (sa.whatsapp || sa.phone).replace(
              /[\s\-\+]/g,
              ""
            );
            window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
          }}
        />
      </div>
    );
  }

  const question = quizQuestions[currentQ];

  return (
    <div className="px-5 py-6">
      <div className="text-center mb-6">
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
        <h1>Find Your Car Personality</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Question {currentQ + 1} of {quizQuestions.length}
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {quizQuestions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= currentQ ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <h2 className="mb-5">{question.question}</h2>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((opt) => {
          const isSelected = answers[question.id] === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleAnswer(opt.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 scale-[0.98]"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-accent text-foreground"
                  }`}
                >
                  {opt.id.toUpperCase()}
                </span>
                <p>{opt.text}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
