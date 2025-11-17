import pandas as pd
from sklearn.model_selection import KFold, cross_val_predict
from sklearn.linear_model import LinearRegression
from sklearn import metrics

def train_model():
    try:
        df = pd.read_csv("prediction_service/app/data/activities.csv")
    except FileNotFoundError:
        print("Error: File Not Found")
        return None, None, None
    except Exception as e:
        print(f"Error Loading file: {e}")
        return None, None, None

    df_runs = df[df['Activity Type'] == 'Laufen'].copy()
    df_runs['Activity ID'] = pd.to_numeric(df_runs['Activity ID'], errors='coerce')
    
    df_runs['Begin Timestamp'] = pd.to_datetime(df_runs['Begin Timestamp (Raw Milliseconds)'], unit='ms')
    df_runs['hours'] = df_runs['Begin Timestamp'].dt.hour
    df_runs['month'] = df_runs['Begin Timestamp'].dt.month
    df_runs['weekday'] = df_runs['Begin Timestamp'].dt.day_of_week

    df_runs['moving_time'] = df_runs['Moving Duration (Raw Seconds)']
    df_runs['distance'] = df_runs['Distance'].str.replace(' Kilometer', '').str.replace(',', '.').astype(float) * 1000
    df_runs['average_pace'] = (df_runs['distance'] / df_runs['moving_time']).replace([float('inf'), -float('inf')], 0.0).fillna(0.0)

    df_runs['total_elevation_gain'] = df_runs['Elevation Gain'].str.replace(' Meter', '').astype(float)
    df_runs['elev_high'] = df_runs['Max. Elevation'].str.replace(' Meter', '').astype(float)
    df_runs['elev_low'] = df_runs['Min. Elevation'].str.replace(' Meter', '').astype(float)

    df_runs['max_heart_rate'] = pd.to_numeric(df_runs['Max. Heart Rate (bpm)'], errors='coerce')
    df_runs['average_heart_rate'] = pd.to_numeric(df_runs['Average Heart Rate (bpm)'], errors='coerce')
    df_runs['temperature'] = pd.to_numeric(df_runs['Temperature (Raw)'], errors='coerce')
    df_runs['wind_speed'] = pd.to_numeric(df_runs['Wind Speed (Raw)'], errors='coerce')

    df_runs['name'] = df_runs['Activity Name']
    df_runs['id'] = df_runs['Activity ID']
    
    target_cols = ['moving_time']

    complex_feature_cols = [
        'distance',
        'total_elevation_gain',
        'elev_high',
        'hours',
        'month',
        'weekday',
        'max_heart_rate',
        'average_heart_rate',
        'temperature',
        'wind_speed'
    ]
    
    simple_feature_cols = [
        'distance',
        'total_elevation_gain', 
        'elev_high',
        'elev_low',
        'hours',
        'month',
        'weekday'
    ]

    model_cols_to_clean = list(set(target_cols + complex_feature_cols + simple_feature_cols))  
    gui_cols_to_keep = ['Activity ID', 'Activity Name', 'average_pace']
    all_cols_to_keep = list(set(model_cols_to_clean + gui_cols_to_keep))
    
    df_with_all_data = df_runs[all_cols_to_keep].copy()
    df_clean = df_with_all_data.dropna(subset=model_cols_to_clean).copy()

    MAX_REALISTIC_SECONDS = 5 * 3600
    df_clean = df_clean[df_clean['moving_time'] < MAX_REALISTIC_SECONDS].copy()

    Y = df_clean[target_cols]
    
    # prediction model for historic runs in frontend, featuring heart rate and co
    X_complex = df_clean[complex_feature_cols]
    
    model_complex_cv = LinearRegression()
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    try:
        predictions_cv = cross_val_predict(model_complex_cv, X_complex, Y.values.ravel(), cv=cv)
        df_clean['honest_prediction'] = predictions_cv
        mae = metrics.mean_absolute_error(Y, predictions_cv)
        print(f"Modell-Genauigkeit (Komplex, MAE): {mae:.2f} Sekunden")
    except Exception:
        df_clean['honest_prediction'] = 0.0
        
    # prediction model for selected run in frontend (no heart rate data and co)
    X_simple = df_clean[simple_feature_cols]
    final_model_simple = LinearRegression()
    final_model_simple.fit(X_simple, Y)

    return final_model_simple, simple_feature_cols, df_clean

def predict_run(model, feature_cols, distance: float, elev_gained: float, elev_high: float, elev_low: float, hours: int, month: int, weekday: int) -> float:
    new_run_data = [[
        distance, 
        elev_gained, 
        elev_high, 
        elev_low, 
        hours, 
        month, 
        weekday,
    ]] 
    
    new_run_df = pd.DataFrame(new_run_data, columns=feature_cols)
    prediction_array = model.predict(new_run_df)
    predicted_time_sec = prediction_array[0][0]
    return predicted_time_sec
