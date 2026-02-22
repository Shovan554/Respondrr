from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from utils.supabase_client import supabase_admin
from services.automation_call import trigger_automation_call

router = APIRouter(prefix="/api/automation", tags=["automation"])


@router.post("/call")
async def automation_call(request: Request):
    """Trigger an automated emergency call."""
    try:
        body = await request.json()
        emergency_id = body.get("emergency_id")
        patient_id = body.get("patient_id")
        patient_name = body.get("patient_name")
        location = body.get("location", "University of Rhode Island")
        call_to_number = body.get("call_to_number", "+16056709329")
        
        print(f"[AUTOMATION_ROUTE] Received automation call request")
        print(f"[AUTOMATION_ROUTE] Emergency ID: {emergency_id}")
        print(f"[AUTOMATION_ROUTE] Patient: {patient_name}")
        
        if not emergency_id or not patient_id or not patient_name:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Missing required fields: emergency_id, patient_id, patient_name"}
            )
        
        result = await trigger_automation_call(
            emergency_id=emergency_id,
            patient_id=patient_id,
            patient_name=patient_name,
            location=location,
            call_to_number=call_to_number
        )
        
        if result and result.get("success"):
            return JSONResponse(
                status_code=200,
                content=result
            )
        else:
            return JSONResponse(
                status_code=500,
                content={"success": False, "error": "Failed to initiate automation call"}
            )
            
    except Exception as e:
        print(f"[AUTOMATION_ROUTE] Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )


@router.get("/call/{emergency_id}")
async def get_automation_call_status(emergency_id: str):
    """Get the status of an automation call."""
    try:
        print(f"[AUTOMATION_ROUTE] Getting status for emergency {emergency_id}")
        
        response = supabase_admin.table("automation_calls").select("*").eq("emergency_id", emergency_id).execute()
        
        if response.data and len(response.data) > 0:
            call_record = response.data[0]
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "automation_call_id": call_record.get("id"),
                    "status": call_record.get("status"),
                    "call_sid": call_record.get("twilio_call_sid"),
                    "created_at": call_record.get("created_at")
                }
            )
        else:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "No automation call found for this emergency"}
            )
            
    except Exception as e:
        print(f"[AUTOMATION_ROUTE] Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )
