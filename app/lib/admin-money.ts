type MoneyParseOptions = {
  required?: boolean;
};

type MoneyParseResult =
  | {
      ok: true;
      value: number;
    }
  | {
      ok: false;
      error: string;
    };

export function parseBrazilianMoneyInput(
  rawValue: string,
  fieldLabel: string,
  options: MoneyParseOptions = {},
): MoneyParseResult {
  const value = rawValue
    .trim()
    .replace(/^R\$\s*/i, "")
    .replace(/\s/g, "");

  if (!value) {
    if (options.required) {
      return {
        ok: false,
        error: `${fieldLabel} e obrigatorio.`,
      };
    }

    return {
      ok: true,
      value: 0,
    };
  }

  if (!/^\d+(?:[.,]\d+)*$/.test(value)) {
    return invalidMoneyResult(fieldLabel);
  }

  const normalized = normalizeMoneySeparators(value);

  if (!normalized || !/^\d+(?:\.\d+)?$/.test(normalized)) {
    return invalidMoneyResult(fieldLabel);
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return invalidMoneyResult(fieldLabel);
  }

  return {
    ok: true,
    value: Number(parsed.toFixed(2)),
  };
}

export function formatBrazilianMoneyInput(
  value: number | string | null | undefined,
) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    return "";
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
}

function normalizeMoneySeparators(value: string) {
  const commaIndex = value.lastIndexOf(",");
  const dotIndex = value.lastIndexOf(".");

  if (commaIndex !== -1 && dotIndex !== -1) {
    const decimalSeparator = commaIndex > dotIndex ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";

    return value
      .split(thousandsSeparator)
      .join("")
      .replace(decimalSeparator, ".");
  }

  if (commaIndex !== -1) {
    const parts = value.split(",");

    if (parts.length !== 2 || parts[1] === "") {
      return "";
    }

    return `${parts[0]}.${parts[1]}`;
  }

  if (dotIndex !== -1) {
    const parts = value.split(".");
    const lastPart = parts[parts.length - 1];

    if (parts.length === 2) {
      const [whole, fraction] = parts;
      return fraction.length === 3 ? `${whole}${fraction}` : `${whole}.${fraction}`;
    }

    if (lastPart.length === 3) {
      return parts.join("");
    }

    if (lastPart.length === 1 || lastPart.length === 2) {
      return `${parts.slice(0, -1).join("")}.${lastPart}`;
    }

    return "";
  }

  return value;
}

function invalidMoneyResult(fieldLabel: string): MoneyParseResult {
  return {
    ok: false,
    error: `${fieldLabel} precisa ser um valor valido. Exemplos: 7,50 ou 12.90.`,
  };
}
