// src/services/apiClient.ts

const API_URL = 'http://localhost:8000';

export interface ApiStation {
  id: number;
  code: string;
  max_power_kw: number;
  status: string;
}

export const createCustomer = async (
  firstName: string,
  lastName: string
): Promise<{ customer_id: number }> => {
  const response = await fetch(`${API_URL}/api/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ first_name: firstName, last_name: lastName }),
  });
  if (!response.ok) throw new Error('Falha ao criar cliente');
  return response.json();
};

export const createVehicle = async (vehicle: {
  customer_id: number;
  model: string;
  plate: string;
  battery_capacity_kwh: number;
  max_power_kw: number;
}): Promise<{ vehicle_id: number }> => {
  const response = await fetch(`${API_URL}/api/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle),
  });
  if (!response.ok) throw new Error('Falha ao criar veículo');
  return response.json();
};

export const getStations = async (): Promise<ApiStation[]> => {
  const response = await fetch(`${API_URL}/api/stations`);
  if (!response.ok) throw new Error('Falha ao buscar estações');
  return response.json();
};

export const saveChargeSession = async (session: {
  customer_id: number;
  vehicle_id: number;
  station_id: number;
  start_battery_pct: number;
  end_battery_pct: number;
  energy_used_kwh: number;
  cost_per_kwh: number;
  total_cost: number;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  status: string;
}): Promise<{ session_id: number }> => {
  const response = await fetch(`${API_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });
  if (!response.ok) throw new Error('Falha ao salvar sessão');
  return response.json();
};

