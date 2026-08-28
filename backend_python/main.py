from fastapi import FastAPI, HTTPException
from database import get_connection
from schemas import ChargeSessionCreate, CustomerCreate, VehicleCreate,ChargingCalculationRequest
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from tariff import (
    obter_info_tarifa,
    calcular_carga_por_energia
)


app = FastAPI(title="GoodWe Charging API")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/api/tariff")
def get_current_tariff():

    agora = datetime.now()

    taxa, proxima_mudanca, nome = obter_info_tarifa(agora)

    return {
        "rate": taxa,
        "name": nome,
        "current_time": agora.isoformat(),
        "next_change": proxima_mudanca.isoformat()
    }

@app.get("/api/test")
def test_connection():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT NOW() AS hora_do_banco")
    resultado = cursor.fetchone()
    cursor.close()
    conn.close()
    return {"message": "Conectado!", "dados": resultado}


@app.post("/api/sessions", status_code=201)
def create_session(session: ChargeSessionCreate):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO charge_sessions
                (customer_id, vehicle_id, station_id, start_battery_pct,
                 end_battery_pct, energy_used_kwh, cost_per_kwh, total_cost,
                 started_at, ended_at, duration_minutes, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                session.customer_id, session.vehicle_id, session.station_id,
                session.start_battery_pct, session.end_battery_pct,
                session.energy_used_kwh, session.cost_per_kwh, session.total_cost,
                session.started_at, session.ended_at,
                session.duration_minutes, session.status
            )
        )
        novo_id = cursor.fetchone()["id"]
        conn.commit()
        return {"session_id": novo_id}

    except Exception as erro:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar sessão: {erro}")

    finally:
        cursor.close()
        conn.close()


@app.post("/api/customers", status_code=201)
def create_customer(customer: CustomerCreate):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO customers (first_name, last_name) VALUES (%s, %s) RETURNING id",
            (customer.first_name, customer.last_name)
        )
        novo_id = cursor.fetchone()["id"]
        conn.commit()
        return {"customer_id": novo_id}

    except Exception as erro:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar cliente: {erro}")

    finally:
        cursor.close()
        conn.close()

@app.post("/api/vehicles", status_code=201)
def create_vehicle(vehicle: VehicleCreate):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO vehicles (customer_id, model, plate, battery_capacity_kwh, max_power_kw) VALUES (%s,%s,%s,%s,%s) RETURNING id",
            (vehicle.customer_id, vehicle.model, vehicle.plate, vehicle.battery_capacity_kwh, vehicle.max_power_kw)

        )
        novo_id = cursor.fetchone()["id"]
        conn.commit()
        return {"vehicle_id": novo_id}
    except Exception as erro:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar veiculo: {erro}")
    
    finally:
        cursor.close()
        conn.close()

@app.get("/api/stations")
def list_stations():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id, code, max_power_kw, status FROM stations WHERE status = 'active'")
        resultados = cursor.fetchall()
        return resultados

    finally:
        cursor.close()
        conn.close()

@app.post("/api/charging/calculate")
def calculate_charging(data: ChargingCalculationRequest):

    resultado = calcular_carga_por_energia(
        data.energy_needed_kwh,
        data.power_kw,
        data.start_time
    )

    return resultado