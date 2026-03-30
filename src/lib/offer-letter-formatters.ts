export function formatCurrency(value: number) {
  if (!value) {
    return "___________";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  if (!value) {
    return "___________";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "___________";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function filledValue(value: string) {
  return value?.trim() ? value : "___________";
}

export function formatRecordDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
