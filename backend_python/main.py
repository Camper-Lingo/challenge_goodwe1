from fastapi import FastAPI, HTTPException
from database import get_connection
from schemas import ChargeSessionCreate

app = FastAPI(title="GoodWe Charging API")

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


@app.get("/api/customers/{customer_id}/history")
def get_customer_history(customer_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT
                cs.id AS session_id,
                c.first_name, c.last_name,
                v.model, v.plate,
                cs.energy_used_kwh, cs.total_cost, cs.duration_minutes,
                s.code AS station_code, cs.started_at, cs.status
            FROM charge_sessions cs
            JOIN customers c ON c.id = cs.customer_id
            JOIN vehicles v  ON v.id = cs.vehicle_id
            JOIN stations s  ON s.id = cs.station_id
            WHERE cs.customer_id = %s
            ORDER BY cs.started_at DESC
            """,
            (customer_id,)
        )
        resultados = cursor.fetchall()
        return resultados

    except Exception as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar histórico: {erro}")

    finally:
        cursor.close()
        conn.close()