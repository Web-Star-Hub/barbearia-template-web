export type PlanEntity = {
    identifier: string;
    displayName: string;
    monthlyPriceInCents: number;
    includedFeatures: string[];
    isActive: boolean;
};
