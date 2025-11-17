from fastapi import APIRouter, HTTPException
from options.activity.controller import get_all_activities_for_gui, predict_selected_run

run_router = APIRouter()

@run_router.get("/athlete/activities/all")
async def get_activities():
    try:
        return await get_all_activities_for_gui()
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    
@run_router.get("/predict_run")
async def get_selected_run_prediction(
    distance: float,
    elev_high: float,
    elev_low: float,
    hour: int,
    month: int,
    weekday: int,
):
    try:
        return predict_selected_run(
            distance=distance,
            elev_high=elev_high,
            elev_low=elev_low,
            hour=hour,
            month=month,
            weekday=weekday,
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))