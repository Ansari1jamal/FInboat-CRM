export const getResultIcon = (type) => {
  switch (type) {
    case "lead":
      return "👤";

    case "application":
      return "📄";

    case "loan":
      return "💰";

    default:
      return "🔍";
  }
};

export const getResultTypeLabel = (type) => {
  switch (type) {
    case "lead":
      return "Lead";

    case "application":
      return "Application";

    case "loan":
      return "Loan";

    default:
      return "Result";
  }
};