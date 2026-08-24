from pydantic import BaseModel
from datetime import datetime

class ChargeSessionCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    station_id: int
    start_battery_pct: float
    end_battery_pct: float
    energy_used_kwh: float
    cost_per_kwh: float
    total_cost: float
    started_at: datetime
    ended_at: datetime
    duration_minutes: int
    status: str