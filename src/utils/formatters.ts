// utils/formatters.ts

export const formatAmount = (amount: number): string => {
  return "$" + (amount / 1000).toFixed(1) + "K";
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString();
};

export const getDaysLeft = (deadline: number): number => {
  const days = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

export const getProgressPercentage = (
  raised: number,
  target: number
): number => {
  return Math.min((raised / target) * 100, 100);
};
