export const TIERS = {
  basic: {
    name: "Básico",
    price_id: "price_1T9NTnJp4kcxTGHDZmnOEYTi",
    product_id: "prod_U7cj6kt78jW5aQ",
    price: 20,
    features: [
      "Acceso al gimnasio",
      "Clases grupales básicas",
      "Vestuarios y duchas",
      "Horario completo",
    ],
  },
  premium: {
    name: "Premium",
    price_id: "price_1T9NUBJp4kcxTGHDdoN7oL62",
    product_id: "prod_U7cjVtGjwKWx5X",
    price: 40,
    features: [
      "Todo lo del plan Básico",
      "Clases premium (CrossFit, Boxeo, Personal)",
      "Área VIP y sauna",
      "Entrenador personal 1x/semana",
      "Nutricionista incluido",
    ],
  },
} as const;

export type TierKey = keyof typeof TIERS;

export function getTierByProductId(productId: string): TierKey | null {
  for (const [key, tier] of Object.entries(TIERS)) {
    if (tier.product_id === productId) return key as TierKey;
  }
  return null;
}
