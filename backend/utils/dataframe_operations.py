"""
This handles the data look up between logic and preprocessed data.
"""

import numpy as np
import pandas as pd

# Replace 'file_path' with the path to your CSV file
FILE_PATH = 'merged_normalized_datefilled_lower.csv'

# Read data from CSV file
df = pd.read_csv(FILE_PATH)

# Convert the first column to datetime format
df[df.columns[0]] = pd.to_datetime(df[df.columns[0]])

table_features = ["anger", "neutral", "fear", "happiness", "sadness",
                  "revenue", "yoy", "beatMiss", "liabilities",
                  "cashpershare", "bookvaluepershare", "netdebt",
                  "ebit", "employees"
                  ]


class DaysLooker:
    """
    This class performs various lookups in the preprocessed data. As we process the whole output as
    lists over all training dates, the spotlight date might be not needed anymore in the future.
    The data is organized into lists that represent a timeline of days. For each day listed, there
    is a corresponding feature value. This value indicates the measurement or status of a specific
    attribute at a specific point in time prior to the day it's associated with.
    """
    def __init__(self):
        self.spotlight_date = pd.to_datetime("2018-01-01")

    def set_date(self, new_date):
        """
        Re-sets the Spotlight Date which serves as the "today" date for backtesting lookups.
        :param new_date: New Spotlight Date.
        :return:
        """
        self.spotlight_date = new_date

    def _filter_df_within_timeframe(self, days_before_a, days_before_b):
        # Calculate the date range
        start_day = min(days_before_a, days_before_b)
        end_day = max(days_before_a, days_before_b)
        start_date = self.spotlight_date - pd.Timedelta(days=start_day)
        end_date = self.spotlight_date - pd.Timedelta(days=end_day)
        # Filter the DataFrame for the date range
        mask = (df['date'] >= end_date) & (df['date'] <= start_date)
        return df.loc[mask]

    @staticmethod
    def get_timeframe_days(start_date, end_date, days_before, feature):
        """
        Gets a timeframe between certain days and returns the feature values for the timeframe.
        :param start_date: The start date for the timeframe.
        :param end_date: The end date for the timeframe
        :param days_before: The delta to apply to both dates in days.
        :param feature: The feature for which information is needed.
        :return: A daily list of features.
        """
        # return timeframe for startdate-a to enddate-b
        start_date = start_date - pd.Timedelta(days=days_before)
        end_date = end_date - pd.Timedelta(days=days_before)

        # Filter the DataFrame in normal order
        feature_list = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
        return feature_list[feature].tolist()

    @staticmethod
    def get_moving_average_days(start_date, end_date, days_before1, days_before2, feature):
        """
        Gets the moving average for a certain feature with its dates.
        :param start_date: Start date for the daily list.
        :param end_date: End date for the daily list.
        :param days_before1: Days before as start day for the average.
        :param days_before2: Days before as end day for the average.
        :param feature:  The feature for which information is needed.
        :return: A daily list of features.
        """
        max_value = max(days_before1, days_before2)
        min_value = min(days_before1, days_before2)
        start_date = start_date - pd.Timedelta(days=max_value)
        end_date = end_date - pd.Timedelta(days=min_value)

        feature_list = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
        feature_list = feature_list[feature].tolist()

        averages = []
        for i in range(len(feature_list) - max_value + min_value):
            subset = feature_list[i:i + max_value - min_value + 1]
            average = sum(subset) / len(subset)
            averages.append(average)
        return averages

    @staticmethod
    def get_moving_delta(start_dat, end_dat, days_before1, days_before2, feature):
        """
        Gets the moving delta for a certain feature with its dates.
        :param start_dat: Start date for the daily list.
        :param end_dat: End date for the daily list.
        :param days_before1: Days before as start day for the delta.
        :param days_before2: Days before as end day for the delta.
        :param feature: The feature for which information is needed.
        :return: A daily list of features.
        """
        deltas = []

        max_value = max(days_before1, days_before2)
        min_value = min(days_before1, days_before2)
        start_date = start_dat - pd.Timedelta(days=max_value)
        end_date = end_dat - pd.Timedelta(days=min_value)

        feature_list = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
        feature_list = feature_list[feature].tolist()

        for i in range(len(feature_list) - max_value + min_value):
            subset = feature_list[i:i + max_value - min_value + 1]
            if max_value != days_before1:
                if subset[-1] == 0:
                    delta = 1
                else:
                    delta = (subset[0] - subset[-1]) / subset[-1]
            else:
                if subset[0] == 0:
                    delta = 1
                else:
                    delta = (subset[-1] - subset[0]) / subset[0]
            deltas.append(delta)
        return deltas

    @staticmethod
    def get_timeframe_months(start_dat, end_dat, months_before, feature):
        """
        Gets the timeframe for a monthly feature.
        :param start_dat: Start date for the daily list.
        :param end_dat: End date for the daily list.
        :param months_before: The months before a day for which the feature is needed.
        :param feature: The feature for which information is needed.
        :return: A daily list of features.
        """
        # return timeframe for startdate-a to enddate-b
        start_date = start_dat - pd.Timedelta(days=months_before * 30)
        end_date = end_dat - pd.Timedelta(days=months_before * 30)
        # Filter the DataFrame in normal order
        feature_list = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
        return feature_list[feature].tolist()

    @staticmethod
    def get_timeframe_years(start_dat, end_dat, years_before, feature):
        """
        Gets the timeframe for a yearly feature.
        :param start_dat: Start date for the daily list.
        :param end_dat: End date for the daily list.
        :param years_before: The years before a day for which the feature is needed.
        :param feature: The feature for which information is needed.
        :return: A daily list of features.
        """
        start_date = start_dat - pd.Timedelta(days=years_before * 365)
        end_date = end_dat - pd.Timedelta(days=years_before * 365)
        feature_list = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
        return feature_list[feature].tolist()

    def delta_within_timeframe(self, days_before_a, days_before_b, column_name):
        """
        Gets the delta for a certain feature.
        :param days_before_a: The days value before as first value for the delta.
        :param days_before_b: The days value before as second value for the delta.
        :param column_name: The column for which information is needed.
        :return: A daily list of features.
        """
        column_name = column_name.replace("'", "")
        # Get the values for the start and end of the timeframe
        value_b = self.days_before_lookup(days_before_a, column_name)
        value_a = self.days_before_lookup(days_before_b, column_name)

        # Return the delta between the two values as a percentage of the second value
        if value_a is not None and value_b is not None and value_b != 0:
            return (value_a - value_b) / value_b
        return 0

    def average_value_within_timeframe(self, days_before_a, days_before_b, column_name):
        """
        Gets the average value for a certain feature.
        :param days_before_a: The days value before as start day for the average.
        :param days_before_b: The days value before as end day for the average.
        :param column_name: The column for which information is needed.
        :return: A daily list of features.
        """
        column_name = column_name.replace("'", "")
        filtered_df = self._filter_df_within_timeframe(days_before_a, days_before_b)
        if column_name in filtered_df.columns:
            return filtered_df[column_name].mean()
        return 0

    def days_before_lookup(self, days_before, column_name):
        """
        Gets the value for a daily feature.
        :param days_before: The amount of days before the spotlight date.
        :param column_name: The column for which information is needed.
        :return: A daily list of features.
        """

        column_name = column_name.replace("'", "")
        if days_before < 0 or days_before > 200:
            return 100000
        if np.isnan(days_before):
            days_before = 0
        date_to_look = self.spotlight_date - pd.Timedelta(days=days_before)

        row = df[df['date'] == date_to_look]
        counter = 0
        while row.empty and counter < 8:
            days_before += 1
            date_to_look = self.spotlight_date - pd.Timedelta(days=days_before)
            row = df[df['date'] == date_to_look]
            counter += 1
        if not row.empty and column_name in df.columns:
            found_value = row.iloc[0][column_name]
            if pd.isna(found_value):
                earlier_rows = df[df['date'] < date_to_look]
                valid_index = earlier_rows[column_name].last_valid_index()
                if pd.notna(valid_index):
                    found_value = df.at[valid_index, column_name]
            return found_value
        return 0  # or some default value
