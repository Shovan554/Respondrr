import os
import httpx
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from utils.supabase_client import supabase, supabase_admin

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"
ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"
ELEVENLABS_MODEL_ID = "eleven_multilingual_v2"
ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128"
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER")
CALL_TO_NUMBER = os.getenv("CALL_TO_NUMBER")
SUPABASE_STORAGE_BUCKET = "elevenlabs"


async def generate_audio_with_elevenlabs(patient_name: str, location: str = "University of Rhode Island") -> Optional[bytes]:
    """Generate audio using ElevenLabs API."""
    try:
        print(f"\n[ELEVENLABS] ============================================")
        print(f"[ELEVENLABS] Starting audio generation")
        print(f"[ELEVENLABS] Patient name: {patient_name}")
        print(f"[ELEVENLABS] Location: {location}")
        
        text = f"{patient_name} has been in an emergency in {location} and needs medical attention asap"
        print(f"[ELEVENLABS] Text to synthesize: {text}")
        print(f"[ELEVENLABS] API URL: {ELEVENLABS_API_URL}")
        print(f"[ELEVENLABS] API Key (masked): {ELEVENLABS_API_KEY[:10]}...{ELEVENLABS_API_KEY[-10:]}")
        
        async with httpx.AsyncClient() as client:
            print(f"[ELEVENLABS] Making POST request to ElevenLabs...")
            print(f"[ELEVENLABS] Voice ID: {ELEVENLABS_VOICE_ID}")
            print(f"[ELEVENLABS] Model: {ELEVENLABS_MODEL_ID}")
            print(f"[ELEVENLABS] Output Format: {ELEVENLABS_OUTPUT_FORMAT}")
            response = await client.post(
                f"{ELEVENLABS_API_URL}/text-to-speech/{ELEVENLABS_VOICE_ID}",
                headers={
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "text": text,
                    "model_id": ELEVENLABS_MODEL_ID,
                    "output_format": ELEVENLABS_OUTPUT_FORMAT,
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75
                    }
                },
                timeout=30.0
            )
            
            print(f"[ELEVENLABS] Response status: {response.status_code}")
            
            if response.status_code == 200:
                audio_data = response.content
                print(f"[ELEVENLABS] ✓ Audio generated successfully ({len(audio_data)} bytes)")
                print(f"[ELEVENLABS] ============================================\n")
                return audio_data
            else:
                error_text = response.text[:500]
                print(f"[ELEVENLABS] ❌ Error: {response.status_code}")
                print(f"[ELEVENLABS] Response: {error_text}")
                print(f"[ELEVENLABS] ============================================\n")
                return None
                
    except Exception as e:
        print(f"[ELEVENLABS] ❌ Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        print(f"[ELEVENLABS] ============================================\n")
        return None


async def upload_audio_to_supabase(audio_data: bytes, filename: str) -> Optional[str]:
    """Upload audio file to Supabase storage bucket."""
    try:
        print(f"\n[SUPABASE] ============================================")
        print(f"[SUPABASE] Uploading audio to storage")
        print(f"[SUPABASE] Filename: {filename}")
        print(f"[SUPABASE] Bucket: {SUPABASE_STORAGE_BUCKET}")
        print(f"[SUPABASE] File size: {len(audio_data)} bytes")
        print(f"[SUPABASE] SUPABASE_URL: {os.getenv('SUPABASE_URL', 'NOT SET')}")
        
        print(f"[SUPABASE] Using admin client for upload (better permissions)...")
        response = supabase_admin.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
            path=filename,
            file=audio_data,
            file_options={"content-type": "audio/mpeg"}
        )
        
        print(f"[SUPABASE] Upload response type: {type(response)}")
        print(f"[SUPABASE] Upload response: {response}")
        
        print(f"[SUPABASE] Getting public URL...")
        file_url = supabase_admin.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(filename)
        print(f"[SUPABASE] ✓ File uploaded successfully")
        print(f"[SUPABASE] Public URL: {file_url}")
        print(f"[SUPABASE] ============================================\n")
        
        return file_url
        
    except Exception as e:
        print(f"[SUPABASE] ❌ Exception occurred: {e}")
        print(f"[SUPABASE] Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        print(f"[SUPABASE] Trying alternative approach - checking bucket exists...")
        try:
            print(f"[SUPABASE] Attempting to create bucket if it doesn't exist...")
            supabase_admin.storage.create_bucket(SUPABASE_STORAGE_BUCKET, options={"public": True})
            print(f"[SUPABASE] Bucket created/verified as public")
        except Exception as bucket_e:
            print(f"[SUPABASE] Bucket creation attempt: {bucket_e}")
        print(f"[SUPABASE] ============================================\n")
        return None


async def make_twilio_call(to_number: str, audio_url: str) -> Optional[Dict[str, Any]]:
    """Make a call using Twilio with audio URL."""
    try:
        from twilio.rest import Client
        
        print(f"\n[TWILIO] ============================================")
        print(f"[TWILIO] Initiating phone call")
        print(f"[TWILIO] From number: {TWILIO_FROM_NUMBER}")
        print(f"[TWILIO] To number: {to_number}")
        print(f"[TWILIO] Audio URL: {audio_url}")
        
        account_sid_masked = f"{TWILIO_ACCOUNT_SID[:4]}...{TWILIO_ACCOUNT_SID[-4:]}"
        print(f"[TWILIO] Account SID (masked): {account_sid_masked}")
        
        print(f"[TWILIO] Using Twilio Python SDK...")
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>{audio_url}</Play>
</Response>"""
        print(f"[TWILIO] TwiML created with Supabase audio URL")
        
        print(f"[TWILIO] Making call with inline TwiML...")
        call = client.calls.create(
            twiml=twiml,
            to=to_number,
            from_=TWILIO_FROM_NUMBER
        )
        
        call_sid = call.sid
        status = call.status
        print(f"[TWILIO] ✓ Call initiated successfully")
        print(f"[TWILIO] Call SID: {call_sid}")
        print(f"[TWILIO] Call status: {status}")
        print(f"[TWILIO] Call to: {call.to}")
        print(f"[TWILIO] ============================================\n")
        
        return {
            "success": True,
            "call_sid": call_sid,
            "status": status,
            "to": call.to
        }
                
    except Exception as e:
        print(f"[TWILIO] ❌ Exception occurred: {e}")
        print(f"[TWILIO] Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        print(f"[TWILIO] ============================================\n")
        return None


async def create_automation_call_record(
    emergency_id: str,
    patient_id: str,
    patient_name: str,
    audio_url: str,
    twilio_call_sid: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Create a record of the automated call in the database."""
    try:
        print(f"\n[AUTOMATION_DB] ============================================")
        print(f"[AUTOMATION_DB] Creating automation call record")
        print(f"[AUTOMATION_DB] Emergency ID: {emergency_id}")
        print(f"[AUTOMATION_DB] Patient ID: {patient_id}")
        print(f"[AUTOMATION_DB] Patient name: {patient_name}")
        print(f"[AUTOMATION_DB] Audio URL: {audio_url}")
        print(f"[AUTOMATION_DB] Twilio Call SID: {twilio_call_sid}")
        
        automation_call_data = {
            "emergency_id": emergency_id,
            "patient_id": patient_id,
            "patient_name": patient_name,
            "audio_url": audio_url,
            "twilio_call_sid": twilio_call_sid,
            "status": "initiated",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        print(f"[AUTOMATION_DB] Data to insert: {automation_call_data}")
        print(f"[AUTOMATION_DB] Inserting into table 'automation_calls'...")
        
        response = supabase_admin.table("automation_calls").insert(automation_call_data).execute()
        
        print(f"[AUTOMATION_DB] Response type: {type(response)}")
        print(f"[AUTOMATION_DB] Response data: {response.data}")
        
        if response.data:
            record_id = response.data[0].get("id", "UNKNOWN")
            print(f"[AUTOMATION_DB] ✓ Automation call record created with ID: {record_id}")
            print(f"[AUTOMATION_DB] ============================================\n")
            return response.data[0]
        else:
            print(f"[AUTOMATION_DB] ❌ Failed to create automation call record (no data in response)")
            print(f"[AUTOMATION_DB] ============================================\n")
            return None
            
    except Exception as e:
        print(f"[AUTOMATION_DB] ❌ Exception occurred: {e}")
        print(f"[AUTOMATION_DB] Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        print(f"[AUTOMATION_DB] ============================================\n")
        return None


async def trigger_automation_call(
    emergency_id: str,
    patient_id: str,
    patient_name: str,
    location: str = "University of Rhode Island",
    call_to_number: str = CALL_TO_NUMBER
) -> Optional[Dict[str, Any]]:
    """Main function to orchestrate the entire automation call flow."""
    try:
        print(f"\n\n")
        print(f"{'='*60}")
        print(f"[AUTOMATION_CALL] ========================================")
        print(f"[AUTOMATION_CALL] STARTING AUTOMATION CALL FLOW")
        print(f"[AUTOMATION_CALL] ========================================")
        print(f"{'='*60}")
        print(f"[AUTOMATION_CALL] Emergency ID: {emergency_id}")
        print(f"[AUTOMATION_CALL] Patient ID: {patient_id}")
        print(f"[AUTOMATION_CALL] Patient Name: {patient_name}")
        print(f"[AUTOMATION_CALL] Location: {location}")
        print(f"[AUTOMATION_CALL] Call To Number: {call_to_number}")
        print(f"{'='*60}\n")
        
        print(f"[AUTOMATION_CALL] STEP 1/4: Generating audio with ElevenLabs...")
        audio_data = await generate_audio_with_elevenlabs(patient_name, location)
        if not audio_data:
            print(f"[AUTOMATION_CALL] ❌ FAILED: Could not generate audio")
            return None
        print(f"[AUTOMATION_CALL] ✓ STEP 1 COMPLETE: Audio generated ({len(audio_data)} bytes)\n")
        
        print(f"[AUTOMATION_CALL] STEP 2/4: Uploading audio to Supabase...")
        filename = f"emergency_{emergency_id}_{uuid.uuid4().hex[:8]}.mp3"
        audio_url = await upload_audio_to_supabase(audio_data, filename)
        if not audio_url:
            print(f"[AUTOMATION_CALL] ❌ FAILED: Could not upload to Supabase")
            return None
        print(f"[AUTOMATION_CALL] ✓ STEP 2 COMPLETE: Audio uploaded to {audio_url}\n")
        
        print(f"[AUTOMATION_CALL] STEP 3/4: Making Twilio call...")
        twilio_response = await make_twilio_call(call_to_number, audio_url)
        if not twilio_response:
            print(f"[AUTOMATION_CALL] ❌ FAILED: Could not make Twilio call")
            return None
        call_sid = twilio_response.get("call_sid")
        print(f"[AUTOMATION_CALL] ✓ STEP 3 COMPLETE: Twilio call initiated (SID: {call_sid})\n")
        
        print(f"[AUTOMATION_CALL] STEP 4/4: Creating database record...")
        call_record = await create_automation_call_record(
            emergency_id=emergency_id,
            patient_id=patient_id,
            patient_name=patient_name,
            audio_url=audio_url,
            twilio_call_sid=call_sid
        )
        
        if not call_record:
            print(f"[AUTOMATION_CALL] ❌ FAILED: Could not create database record")
            return None
        
        automation_call_id = call_record.get("id")
        print(f"[AUTOMATION_CALL] ✓ STEP 4 COMPLETE: Database record created (ID: {automation_call_id})\n")
        
        record_id = call_record.get("id", "UNKNOWN")
        
        print(f"{'='*60}")
        print(f"[AUTOMATION_CALL] ✓✓✓ AUTOMATION CALL COMPLETED SUCCESSFULLY ✓✓✓")
        print(f"{'='*60}")
        print(f"[AUTOMATION_CALL] Automation Call ID: {record_id}")
        print(f"[AUTOMATION_CALL] Twilio Call SID: {call_sid}")
        print(f"[AUTOMATION_CALL] Audio URL: {audio_url}")
        print(f"[AUTOMATION_CALL] Status: initiated")
        print(f"{'='*60}\n")
        
        return {
            "success": True,
            "automation_call_id": record_id,
            "call_sid": call_sid,
            "audio_url": audio_url,
            "status": "initiated"
        }
        
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"[AUTOMATION_CALL] ❌ UNEXPECTED ERROR IN AUTOMATION CALL FLOW")
        print(f"[AUTOMATION_CALL] Exception: {e}")
        print(f"[AUTOMATION_CALL] Exception type: {type(e)}")
        print(f"{'='*60}")
        import traceback
        traceback.print_exc()
        print(f"{'='*60}\n")
        return None
