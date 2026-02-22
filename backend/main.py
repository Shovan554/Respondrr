import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase_client import supabase
from auth import get_current_user
from health import (
    insert_realtime_data, 
    insert_aggregated_data, 
    fetch_metric,
    upsert_sleep_data
)

app = FastAPI(title="Respondr API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Respondr API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/me")
async def get_me(user=Depends(get_current_user)):
    profile = supabase.table('profiles').select('*').eq('id', user.id).single().execute()
    return {"user": user, "profile": profile.data}

@app.post("/api/data")
async def ingest_health_data(request: Request, user=Depends(get_current_user)):
    try:
        body = await request.json()
        data = body.get("data", {})
        metrics = data.get("metrics", [])
        
        if not metrics:
            return {"success": False, "message": "No metrics found in request"}

        total_inserted = 0
        
        # Realtime vs Aggregated mapping (simplified logic from previous server)
        realtime_metrics = ["heart_rate", "step_count", "active_energy", "respiratory_rate"]
        
        for metric in metrics:
            name = metric.get("name")
            samples = metric.get("data", [])
            units = metric.get("units")
            
            if name in realtime_metrics:
                total_inserted += await insert_realtime_data(user.id, name, samples)
            else:
                total_inserted += await insert_aggregated_data(user.id, name, samples, units)

        return {
            "success": True, 
            "message": f"Successfully ingested {total_inserted} records",
            "inserted": total_inserted
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/api/health/ingest")
async def ingest_from_api(user=Depends(get_current_user)):
    try:
        days_back = int(os.getenv("DAYS_BACK", "7"))
        end = datetime.now()
        start = end - timedelta(days=days_back)
        
        params = {
            "start": start.isoformat(),
            "end": end.isoformat()
        }
        
        # Mapping from endpoint to metric name and type
        metrics_to_fetch = [
            {"endpoint": "/heart-rate", "name": "heart_rate", "type": "realtime", "units": "count/min"},
            {"endpoint": "/steps", "name": "step_count", "type": "realtime", "units": "count"},
            {"endpoint": "/active-energy", "name": "active_energy", "type": "realtime", "units": "kcal"},
            {"endpoint": "/respiratory-rate", "name": "respiratory_rate", "type": "realtime", "units": "count/min"},
            {"endpoint": "/exercise-time", "name": "apple_exercise_time", "type": "aggregated", "units": "min"},
            {"endpoint": "/time-in-daylight", "name": "time_in_daylight", "type": "aggregated", "units": "min"},
            {"endpoint": "/hrv", "name": "heart_rate_variability", "type": "aggregated", "units": "ms"},
            {"endpoint": "/sleep-analysis", "name": "sleep_analysis", "type": "sleep", "units": "hr"}
        ]
        
        total_inserted = 0
        results = []
        
        for m in metrics_to_fetch:
            samples = await fetch_metric(m["endpoint"], params, m["units"])
            if samples:
                if m["type"] == "realtime":
                    inserted = await insert_realtime_data(user.id, m["name"], samples)
                elif m["type"] == "sleep":
                    inserted = await upsert_sleep_data(user.id, samples)
                else:
                    inserted = await insert_aggregated_data(user.id, m["name"], samples, m["units"])
                
                total_inserted += inserted
                results.append({"metric": m["name"], "inserted": inserted})

        return {
            "success": True,
            "message": f"Successfully ingested {total_inserted} records from API",
            "inserted": total_inserted,
            "details": results
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
