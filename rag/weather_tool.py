import openmeteo_requests

import requests_cache
import pandas as pd
from retry_requests import retry



class CustomWeatherTool:

    def __init__(self):
        super().__init__()
        # Setup the Open-Meteo API client with cache and retry on error
        cache_session = requests_cache.CachedSession('.cache', expire_after = 36000)
        retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
        self.openmeteo = openmeteo_requests.Client(session = retry_session)
        self.result_data = self.calling_api()

    def calling_api(self):
        # Make sure all required weather variables are listed here
        # The order of variables in hourly or daily is important to assign them correctly below
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": 14.3595,
            "longitude": 121.0473,
            "current": ["temperature_2m", "is_day", "rain", "wind_speed_10m", "wind_direction_10m"],
            "daily": ["temperature_2m_max", "temperature_2m_min", "rain_sum"],
            "timezone": "Asia/Singapore"
        }
        responses = self.openmeteo.weather_api(url, params=params)

        # Process first location. Add a for-loop for multiple locations or weather models
        return responses[0]


    def result(self):
        response = self.result_data
        # Current values. The order of variables needs to be the same as requested.
        current = response.Current()
        current_temperature_2m = current.Variables(0).Value()
        current_is_day = current.Variables(1).Value()
        current_rain = current.Variables(2).Value()
        current_wind_speed_10m = current.Variables(3).Value()
        current_wind_direction_10m = current.Variables(4).Value()

        current_data = {
            "current_time ": current.Time(),
            "current_temperature_2m": current_temperature_2m,
            "current_is_day": current_is_day,
            "current_rain": current_rain,
            "current_wind_speed_10m": current_wind_speed_10m,
            "current_wind_direction_10m": current_wind_direction_10m
        }

        # Process daily data. The order of variables needs to be the same as requested.
        daily = response.Daily()
        daily_temperature_2m_max = daily.Variables(0).ValuesAsNumpy()
        daily_temperature_2m_min = daily.Variables(1).ValuesAsNumpy()
        daily_rain_sum = daily.Variables(2).ValuesAsNumpy()

        daily_data = {"date": pd.date_range(
            start = pd.to_datetime(daily.Time(), unit = "s", utc = True),
            end = pd.to_datetime(daily.TimeEnd(), unit = "s", utc = True),
            freq = pd.Timedelta(seconds = daily.Interval()),
            inclusive = "left"
        )}
        daily_data["temperature_2m_max"] = daily_temperature_2m_max
        daily_data["temperature_2m_min"] = daily_temperature_2m_min
        daily_data["rain_sum"] = daily_rain_sum

        daily_dataframe = pd.DataFrame(data = daily_data)
        daily_data = daily_dataframe.to_json(orient='records')
        result = {
            "current_data": current_data,
            "daily_data": daily_data
        }
        return result


if __name__ == "__main__":
    C = CustomWeatherTool()
    print(C.result())