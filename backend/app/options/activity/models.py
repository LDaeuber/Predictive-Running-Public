from pydantic import BaseModel

class Run(BaseModel):
    id: int
    name: str
    distance: float
    moving_time: float
    time_hour: int
    time_month: int
    time_weekday: int
    average_pace: float
    elev_high: float
    elev_low: float
    elev_gained: float
    max_heart_rate: float
    average_heart_rate: float
    temperature: float
    wind_speed: float
    
class SelectedRun(BaseModel):
    distance: float
    time_hour: int
    time_month: int
    time_weekday: int
    elev_high: float
    elev_low: float
    
class Prediction(BaseModel):
    prediction: float
    
class RunWithPrediction(BaseModel):
    run: Run
    prediction: Prediction
    
class SelectedRunWithPrediction(BaseModel):
    run: SelectedRun
    prediction: Prediction