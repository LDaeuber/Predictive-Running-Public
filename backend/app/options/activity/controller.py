from typing import List

from prediction_service.app.analysis.run_analysis import train_model, predict_run
from .models import Run, Prediction, RunWithPrediction, SelectedRun, SelectedRunWithPrediction 

model, feature_cols, df_clean_data = train_model()

if model is None:
    print("WARNING: Model couldn't load")
    
import traceback

async def get_all_activities_for_gui() -> List[RunWithPrediction]:
    runs_with_predictions: List[RunWithPrediction] = []
    
    if model is None or df_clean_data is None:
        print("Fehler: Modell oder Daten sind nicht geladen.")
        raise Exception("Modell oder Daten sind nicht geladen")

    try:
        for _, row in df_clean_data.iterrows():
            
            run_data = Run(
                id=int(row.get('Activity ID', 0)),
                name=str(row.get('Activity Name', '')),
                distance=float(row.get('distance', 0.0)),
                moving_time=int(row.get('moving_time', 0)),
                time_hour=int(row.get('hours', 0)),
                time_month=int(row.get('month', 0)),
                time_weekday=int(row.get('weekday', 0)),
                average_pace=float(row.get('average_pace', 0.0)),
                elev_high=float(row.get('elev_high', 0.0)),
                elev_low=float(row.get('elev_low', 0.0)),
                elev_gained=float(row.get('total_elevation_gain', 0.0)),
                max_heart_rate=float(row.get('max_heart_rate', 0.0)),
                average_heart_rate=float(row.get('average_heart_rate', 0.0)),
                temperature=float(row.get('temperature', 0.0)),
                wind_speed=float(row.get('wind_speed', 0.0))
            )

            predicted_time_sec = float(row['honest_prediction'])

            prediction_data = Prediction(prediction=predicted_time_sec)

            runs_with_predictions.append(RunWithPrediction(
                run=run_data,
                prediction=prediction_data
            ))

        return runs_with_predictions

    except Exception as e:
        print(f"Fehler beim Erstellen der Vorhersage-Liste: {e}")
        traceback.print_exc()
        raise e
    
def predict_selected_run(distance: float, elev_high: float, elev_low: float, hour:int, month: int, weekday:int) -> SelectedRunWithPrediction:
    prediction = Prediction(
        prediction=predict_run(
            model, 
            feature_cols=feature_cols, 
            distance=distance, 
            elev_gained=(elev_high - elev_low),
            elev_high=elev_high, 
            elev_low=elev_low,
            hours=hour,
            month=month,
            weekday=weekday,
        )
    )
    
    run = SelectedRun(
        distance=distance,
        time_hour=hour,
        time_month=month,
        time_weekday=weekday,
        elev_high=elev_high,
        elev_low=elev_low,
    )
    
    selected_run_with_prediction = SelectedRunWithPrediction(
        run=run,
        prediction=prediction
    )
    
    return selected_run_with_prediction
