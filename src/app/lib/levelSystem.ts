
export const USER_LEVELS = [
  { name: "Ignition", min: 0, max: 19999, color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200" },
  { name: "Acceleration", min: 20000, max: 39999, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  { name: "Turbo", min: 40000, max: 79999, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  { name: "Apex", min: 80000, max: 159999, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  { name: "Velocity", min: 160000, max: Infinity, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
];

export const SA_LEVELS = [
  { name: "Rookie", min: 0, color: "text-gray-500" },
  { name: "Professional", min: 5, color: "text-blue-500" },
  { name: "Elite", min: 15, color: "text-indigo-600" },
  { name: "Master Advisor", min: 30, color: "text-amber-500" },
  { name: "Iconic Advisor", min: 50, color: "text-red-600" },
];

export function getUserLevel(points: number) {
  return USER_LEVELS.find(l => points >= l.min && points <= l.max) || USER_LEVELS[USER_LEVELS.length - 1];
}

export function getSALevel(salesCount: number) {
  // Simplified to just count for now, can add volume later if data structure supports it
  return SA_LEVELS.slice().reverse().find(l => salesCount >= l.min) || SA_LEVELS[0];
}

export function getNextUserLevel(currentPoints: number) {
  const current = getUserLevel(currentPoints);
  const index = USER_LEVELS.indexOf(current);
  return USER_LEVELS[index + 1] || null;
}
