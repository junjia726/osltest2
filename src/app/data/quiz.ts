export interface QuizQuestion {
  id: number;
  question: string;
  options: { id: string; text: string; points: Record<string, number> }[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your typical weekend plan?",
    options: [
      { id: "a", text: "Road trip with friends", points: { myvi: 3, ativa: 2 } },
      { id: "b", text: "Family outing", points: { alza: 3, aruz: 2 } },
      { id: "c", text: "City cafe hopping", points: { axia: 3, bezza: 2 } },
      { id: "d", text: "Nature hiking adventure", points: { aruz: 3, ativa: 2 } },
    ],
  },
  {
    id: 2,
    question: "What matters most to you in a car?",
    options: [
      { id: "a", text: "Fuel efficiency", points: { axia: 3, "alza-hybrid": 3 } },
      { id: "b", text: "Spacious interior", points: { alza: 3, aruz: 2 } },
      { id: "c", text: "Stylish design", points: { myvi: 3, ativa: 2 } },
      { id: "d", text: "Affordable price", points: { axia: 3, bezza: 2 } },
    ],
  },
  {
    id: 3,
    question: "How many passengers do you usually carry?",
    options: [
      { id: "a", text: "Just me", points: { axia: 3, myvi: 2 } },
      { id: "b", text: "Me + 1 partner", points: { bezza: 3, myvi: 2 } },
      { id: "c", text: "Small family (3-4)", points: { myvi: 3, ativa: 2 } },
      { id: "d", text: "Big family (5+)", points: { alza: 3, aruz: 3 } },
    ],
  },
  {
    id: 4,
    question: "Your dream driving environment?",
    options: [
      { id: "a", text: "Busy city streets", points: { axia: 3, myvi: 2 } },
      { id: "b", text: "Highway cruising", points: { bezza: 3, "alza-hybrid": 2 } },
      { id: "c", text: "Mountain roads", points: { aruz: 3, ativa: 2 } },
      { id: "d", text: "Mix of everything", points: { myvi: 2, ativa: 2, alza: 1 } },
    ],
  },
  {
    id: 5,
    question: "What's your budget range?",
    options: [
      { id: "a", text: "Under RM 40K", points: { axia: 3, bezza: 3 } },
      { id: "b", text: "RM 40K - 60K", points: { myvi: 3, bezza: 2 } },
      { id: "c", text: "RM 60K - 80K", points: { alza: 3, ativa: 3, aruz: 2 } },
      { id: "d", text: "RM 80K+", points: { "alza-hybrid": 3, aruz: 2 } },
    ],
  },
];

export function getQuizResult(answers: Record<number, string>): string {
  const scores: Record<string, number> = {};

  Object.entries(answers).forEach(([questionId, optionId]) => {
    const question = quizQuestions.find((q) => q.id === Number(questionId));
    if (question) {
      const option = question.options.find((o) => o.id === optionId);
      if (option) {
        Object.entries(option.points).forEach(([carId, points]) => {
          scores[carId] = (scores[carId] || 0) + points;
        });
      }
    }
  });

  let maxScore = 0;
  let result = "myvi";
  Object.entries(scores).forEach(([carId, score]) => {
    if (score > maxScore) {
      maxScore = score;
      result = carId;
    }
  });

  return result;
}
