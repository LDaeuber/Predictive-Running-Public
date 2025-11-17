export interface Run {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  time_hour: number;
  time_month: number;
  time_weekday: number;
  average_pace: number;
  elev_high: number;
  elev_low: number;
  elev_gained: number;
  max_heart_rate: number;
  average_heart_rate: number;
  temperature: number;
  wind_speed: number;
}

export interface SelectedRun {
  distance: number;
  time_hour: number;
  time_month: number;
  time_weekday: number;
  elev_high: number;
  elev_low: number;
}

export interface Prediction {
  prediction: number;
}

export interface RunWithPrediction {
  run: Run;
  prediction: Prediction;
}

export interface SelectedRunWithPrediction {
  run: SelectedRun;
  prediction: Prediction;
}
