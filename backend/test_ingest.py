import sys
import os
import traceback

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers.ingest import ingest_video
from models.schemas import IngestRequest

if __name__ == "__main__":
    # Rick Astley - Never Gonna Give You Up (usually has English transcript available)
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    req = IngestRequest(url=url)
    
    print("Testing ingest with URL:", url)
    try:
        res = ingest_video(req)
        print("SUCCESS! Ingest response:", res)
    except Exception as e:
        print("\n--- ERROR DETECTED ---")
        traceback.print_exc()
        print("----------------------\n")
