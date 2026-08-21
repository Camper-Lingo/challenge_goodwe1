// src/utils/calculations.ts

import type { ChargeCalculation } from '../types';

export const calculateCharge = (
  currentBattery: number,
  targetBattery: number,
  batteryCapacity: number,
  costPerKwh: number,
  maxPower: number,
  systemLoss: number = 5
): ChargeCalculation => {
  const delta = targetBattery - currentBattery;
  if (delta <= 0) {
    return {
      energyNeeded: 0,
      totalCostRaw: 0,
      totalCostWithLoss: 0,
      estimatedTime: 0,
      powerAvailable: Math.round(maxPower * 0.95),
      systemLoss,
    };
  }

  const energyNeeded = (batteryCapacity * delta) / 100;
  const losses = energyNeeded * (systemLoss / 100);
  const totalEnergy = energyNeeded + losses;
  const totalCost = totalEnergy * costPerKwh;
  const estimatedTime = (totalEnergy / maxPower) * 60; // minutes

  return {
    energyNeeded: Math.round(totalEnergy * 10) / 10,
    totalCostRaw: Math.round(totalCost * 100) / 100,
    totalCostWithLoss: Math.round(totalCost * 100) / 100,
    estimatedTime: Math.max(1, Math.round(estimatedTime)),
    powerAvailable: Math.round(maxPower * 0.95),
    systemLoss,
  };
};
