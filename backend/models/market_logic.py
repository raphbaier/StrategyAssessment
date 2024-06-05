"""
This includes the market logic to be able to apply the mathematics for the investing strategies.
It defines new classes, all representing terminals for the genetic programming input. They need to
be defined explicitly to be all used as DEAP input independent of external libraries.
The functions represent the logic between the terminals as primitives.
The functions might seem very explicitly defined or unnecessary (like classes without public
methods), share common logic and need to do a lot of additional string processing. This is because
we want to explicitly setupown classes and methods for any atomic case that we want to be able to
happen during the genetic algorithm run.
"""
from utils import dataframe_operations
import pandas as pd

TRAINING_START = pd.to_datetime("2020-08-01")
TRAINING_END = pd.to_datetime("2022-08-31")
DATES = pd.date_range(start=TRAINING_START, end=TRAINING_END)

days_looker = dataframe_operations.DaysLooker()


class Stock:
    """
    A stock. This can be any stock that is part of preprocessed_data.csv
    """
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"'{self.name}'"


class Emotion:
    """
    An emotion. Its base value is extracted by speech emotion recognition.
    """
    def __init__(self, emotion):
        self.emotion = emotion

    def __repr__(self):
        return f"'{self.emotion}'"


class Comparison:
    """
    A comparison between two values.
    """
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"'{self.name}'"


class Year:
    """
    The amount of years before the spotlight day.
    """
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"'{self.name}'"


class QuarterFeature:
    """
    The name of a quarterly feature.
    """
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"'{self.name}'"


class YearFeature:
    """
    The name of a yearly feature.
    """

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"'{self.name}'"


class Price:
    """
    A stock price input (high, low, open etc).
    """
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"'{self.name}'"


class Day:
    """
    The amount of days before the spotlight day.
    """

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"'{self.name}'"


class FinalBool:
    """
    The final bool as value of an individual. It is true if the signal shall trigger for a certain
    day, else false.
    """
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"{self.name}"


def __average_lists(lists):
    # Check if lists is empty
    if not lists:
        return []

    # Calculate the sum of each group of elements and then divide by the number of lists
    return [sum(group) / len(group) for group in zip(*lists)]


def __larger_lists(list1, list2):
    return [a > b for a, b in zip(list1, list2)]


def __smaller_lists(list1, list2):
    return [a < b for a, b in zip(list1, list2)]


# Define the functions used during genetic algorithms. They all return one list of booleans
# representing their single day trigger for all days. In the end, those lists are combined to one
# list containing the overall trigger. This is much faster than going through all days and
# calculating the trigger output during runtime.
def emotions_methods(stock1, stock2, emotion1, emotion2, last1, last2, comparison):
    """
    Compares between two emotions. Those could be from different stocks.
    :param stock1: Stock of emotion1, e.g. "Bayer".
    :param stock2: Stock of emotion2.
    :param emotion1: First emotion to compare, e.g. "Anger".
    :param emotion2: Second emotion to compare.
    :param last1: Time from which the first emotion is taken, as quarterly value (the quarter
    relative to the spotlight day).
    :param last2: Time from which the second emotion is taken.
    :param comparison: Comparison between the emotions to trigger a signal.
    :return: A list of booleans which represents a trigger signal for each day.
    """
    # last: 1 -> 30 days, 2 -> 60 days, 3 -> 90 days, 0 -> [30+60+90]

    stock1 = str(stock1).replace("'", "")
    stock2 = str(stock2).replace("'", "")
    emotion1 = str(emotion1).replace("'", "")
    emotion2 = str(emotion2).replace("'", "")
    last1 = str(last1).replace("'", "")
    last2 = str(last2).replace("'", "")

    # generate the two tables
    if str(last1) in ["1", "2", "3"]:
        emotions_list1 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END,
                                                          (int(str(last1)) - 1) * 3,
                                                          str(stock1) + "_" + str(emotion1))
    else:  # it's 0. hence we need to take average
        # Concatenate DataFrames horizontally
        emotions_list11 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 0 * 3,
                                                           stock1 + "_" + emotion1)
        emotions_list12 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 1 * 3,
                                                           stock1 + "_" + emotion1)
        emotions_list13 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 2 * 3,
                                                           stock1 + "_" + emotion1)

        # New DataFrame with the average values
        emotions_list1 = __average_lists([emotions_list11, emotions_list12, emotions_list13])

    if str(last2) in ["1", "2", "3"]:
        emotions_list2 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END,
                                                          (int(str(last2)) - 1) * 3,
                                                          stock2 + "_" + emotion2)
    else:  # it's 0. hence we need to take average
        # Concatenate DataFrames horizontally
        emotions_list21 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 0 * 3,
                                                           stock2 + "_" + emotion2)
        emotions_list22 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 1 * 3,
                                                           stock2 + "_" + emotion2)
        emotions_list23 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 2 * 3,
                                                           stock2 + "_" + emotion2)
        emotions_list2 = __average_lists([emotions_list21, emotions_list22, emotions_list23])

    # Compare and create the list
    if str(comparison).replace("'", "") == ">":
        return __larger_lists(emotions_list1, emotions_list2)
    return __smaller_lists(emotions_list1, emotions_list2)


def quarter_methods(stock1, stock2, quarter_feature1, quarter_feature2, last1, last2, comparison):
    """
    Compares between two quarterly features. Those could be from different stocks.
    :param stock1: Stock of feature1, e.g. "Bayer".
    :param stock2: Stock of feature2.
    :param quarter_feature1: First feature to compare, e.g. "Revenue".
    :param quarter_feature2: Second feature to compare.
    :param last1: Time from which the first feature is taken, as quarterly value (the quarter
    relative to the spotlight day).
    :param last2: Time from which the second feature is taken.
    :param comparison: Comparison between the features to trigger a signal.
    :return: A list of booleans which represents a trigger signal for each day.
    """
    stock1 = str(stock1).replace("'", "")
    stock2 = str(stock2).replace("'", "")
    feature1 = str(quarter_feature1).replace("'", "")
    feature2 = str(quarter_feature2).replace("'", "")
    last1 = str(last1).replace("'", "")
    last2 = str(last2).replace("'", "")
    # generate the two tables
    if str(last1) in ["1", "2", "3"]:
        features_list1 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END,
                                                          (int(str(last1)) - 1) * 3,
                                                          str(stock1) + "_" + str(feature1))
    else:  # it's 0. hence we need to take average
        # Concatenate DataFrames horizontally
        features_list11 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 0 * 3,
                                                           stock1 + "_" + feature1)
        features_list12 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 1 * 3,
                                                           stock1 + "_" + feature1)
        features_list13 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 2 * 3,
                                                           stock1 + "_" + feature1)

        # New DataFrame with the average values
        features_list1 = __average_lists([features_list11, features_list12, features_list13])

    if str(last2) in ["1", "2", "3"]:
        features_list2 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END,
                                                          (int(str(last2)) - 1) * 3,
                                                          stock2 + "_" + feature2)
    else:  # it's 0. hence we need to take average
        # Concatenate DataFrames horizontally
        features_list21 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 0 * 3,
                                                           stock2 + "_" + feature2)
        features_list22 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 1 * 3,
                                                           stock2 + "_" + feature2)
        features_list23 = days_looker.get_timeframe_months(TRAINING_START, TRAINING_END, 2 * 3,
                                                           stock2 + "_" + feature2)
        features_list2 = __average_lists([features_list21, features_list22, features_list23])

    # Compare and create the list
    if str(comparison).replace("'", "") == ">":
        return __larger_lists(features_list1, features_list2)
    return __smaller_lists(features_list1, features_list2)


def quarter_methods_sim(stock1, stock2, quarter_feature1, quarter_feature2, last1, last2,
                        comparison):
    """
    Compares between two quarterly features. However, the actual features are the same. This
    strengthens the logic that it makes sense to compare between the same features (e.g. compare
    "Revenue" with "Revenue") over stocks while keeping the original pset structure.
    :param stock1: Stock of feature1, e.g. "Bayer".
    :param stock2: Stock of feature2.
    :param quarter_feature1: First feature to compare, e.g. "Revenue".
    :param quarter_feature2: This is not used, but it needs to be there to keep the same structure
    during the genetic algorithm.
    :param last1: Time from which the first feature is taken, as quarterly value (the quarter
    relative to the spotlight day).
    :param last2: Time from which the second feature is taken.
    :param comparison: Comparison between the features to trigger a signal.
    :return: A list of booleans which represents a trigger signal for each day.
    """
    return quarter_methods(stock1, stock2, quarter_feature1, quarter_feature1, last1, last2,
                           comparison)


def year_methods(stock1, stock2, year_feature1, year_feature2, last1, last2, comparison):
    """
    Compares between two yearly features. Those could be from different stocks.
    :param stock1: Stock of feature1, e.g. "Bayer".
    :param stock2: Stock of feature2.
    :param year_feature1: First feature to compare, e.g. "Cash per Share".
    :param year_feature2: Second feature to compare.
    :param last1: Time from which the first feature is taken, as yearly value (the year relative to
    the spotlight day).
    :param last2: Time from which the second feature is taken.
    :param comparison: Comparison between the features to trigger a signal.
    :return: A list of booleans which represents a trigger signal for each day.
    """
    stock1 = str(stock1).replace("'", "")
    stock2 = str(stock2).replace("'", "")
    feature1 = str(year_feature1).replace("'", "")
    feature2 = str(year_feature2).replace("'", "")
    last1 = str(last1).replace("'", "")
    last2 = str(last2).replace("'", "")
    # generate the two tables
    if str(last1) in ["1", "2", "3"]:
        features_list1 = days_looker.get_timeframe_years(TRAINING_START, TRAINING_END,
                                                         (int(str(last1)) - 1),
                                                         str(stock1) + "_" + str(feature1))
    else:  # it's 0. hence we need to take average
        # Concatenate DataFrames horizontally
        features_list11 = days_looker.get_timeframe_years(TRAINING_START, TRAINING_END, 0,
                                                          stock1 + "_" + feature1)
        features_list12 = days_looker.get_timeframe_years(TRAINING_START, TRAINING_END, 1,
                                                          stock1 + "_" + feature1)
        features_list13 = days_looker.get_timeframe_years(TRAINING_START, TRAINING_END, 2,
                                                          stock1 + "_" + feature1)

        # New DataFrame with the average values
        features_list1 = __average_lists([features_list11, features_list12, features_list13])

    if str(last2) in ["1", "2", "3"]:
        features_list2 = days_looker.get_timeframe_years(TRAINING_START, TRAINING_END,
                                                         (int(str(last2)) - 1),
                                                         stock2 + "_" + feature2)
    else:  # it's 0. hence we need to take average
        # Concatenate DataFrames horizontally
        features_list21 = days_looker.get_timeframe_years(TRAINING_START, TRAINING_END, 0,
                                                          stock2 + "_" + feature2)
        features_list22 = days_looker.get_timeframe_years(TRAINING_START, TRAINING_END, 1,
                                                          stock2 + "_" + feature2)
        features_list23 = days_looker.get_timeframe_years(TRAINING_START, TRAINING_END, 2,
                                                          stock2 + "_" + feature2)
        features_list2 = __average_lists([features_list21, features_list22, features_list23])

    # Compare and create the list
    if str(comparison).replace("'", "") == ">":
        return __larger_lists(features_list1, features_list2)
    return __smaller_lists(features_list1, features_list2)


def year_methods_sim(stock1, stock2, year_feature1, year_feature2, last1, last2, comparison):
    """
    Compares between two yearly features. However, the actual features are the same. This
    strengthens the logic that it makes sense to compare between the same features (e.g. compare
    "Cash per Share" with "Cash per Share") over stocks while keeping the original pset
    structure.
    :param stock1: Stock of feature1, e.g. "Bayer".
    :param stock2: Stock of feature2.
    :param year_feature1: First feature to compare, e.g. "Cash per Share".
    :param year_feature2: This is not used, but it needs to be there to keep the same
    structure
    during the genetic algorithm.
    :param last1: Time from which the first feature is taken, as yearly value (the year
    relative to the spotlight day).
    :param last2: Time from which the second feature is taken.
    :param comparison: Comparison between the features to trigger a signal.
    :return: A list of booleans which represents a trigger signal for each day.
    """
    return year_methods(stock1, stock2, year_feature1, year_feature1, last1, last2, comparison)


def value_value(stock1, stock2, price1, price2, days1, days2, comparison):
    """
    Compares between stock price values. Here, actual price (or volume) values are meant without
    further processing.
    :param stock1: Stock of price1, e.g. "Bayer".
    :param stock2: Stock of price2.
    :param price1: First value to compare, e.g. "Open".
    :param price2: Second value to compare.
    :param days1: Time from which the first price is taken, as days prior to the spotlight day.
    :param days2: Time from which the second price is taken.
    :param comparison: Comparison between the prices to trigger a signal.
    :return: A list of booleans which represents a trigger signal for each day.
    """
    stock1 = str(stock1).replace("'", "")
    stock2 = str(stock2).replace("'", "")
    price1 = str(price1).replace("'", "")
    price2 = str(price2).replace("'", "")
    days1 = str(days1).replace("'", "")
    days2 = str(days2).replace("'", "")

    left_timeframe = days_looker.get_timeframe_days(TRAINING_START, TRAINING_END, int(days1),
                                                    stock1 + "_" + price1)
    right_timeframe = days_looker.get_timeframe_days(TRAINING_START, TRAINING_END, int(days2),
                                                     stock2 + "_" + price2)
    if str(comparison).replace("'", "") == ">":
        return __larger_lists(left_timeframe, right_timeframe)
    return __smaller_lists(left_timeframe, right_timeframe)


def average_value(stock1, stock2, price1, price2, days11, days12, days2, comparison):
    """
    Compares between average stock price and a pure stock price value.
    The first price is looked up by using two day values. The average is then calculated from all
    dates between the two day values.
    :param stock1: Stock of price1, e.g. "Bayer".
    :param stock2: Stock of price2.
    :param price1: First value to compare, e.g. "Open".
    :param price2: Second value to compare.
    :param days11: Start time from which the average for the first price is taken, as days prior to
    the spotlight day.
    :param days12: End time from which the average for the first price is taken, as days prior to
    the spotlight day.
    :param days2: Time from which the second price is taken.
    :param comparison: Comparison between the prices to trigger a signal.
    :return: A list of booleans which represents a trigger signal for each day.
    """
    stock1 = str(stock1).replace("'", "")
    stock2 = str(stock2).replace("'", "")
    price1 = str(price1).replace("'", "")
    price2 = str(price2).replace("'", "")
    days11 = str(days11).replace("'", "")
    days12 = str(days12).replace("'", "")
    days2 = str(days2).replace("'", "")

    left_timeframe = days_looker.get_moving_average_days(TRAINING_START, TRAINING_END, int(days11),
                                                         int(days12),
                                                         stock1 + "_" + price1)
    right_timeframe = days_looker.get_timeframe_days(TRAINING_START, TRAINING_END, int(days2),
                                                     stock2 + "_" + price2)
    if str(comparison).replace("'", "") == ">":
        return __larger_lists(left_timeframe, right_timeframe)
    return __smaller_lists(left_timeframe, right_timeframe)


def value_average(stock1, stock2, price1, price2, days1, days21, days22, comparison):
    """
    Compares between pure stock price and an average stock price value.
    This is similar to the previous function, however is needed to be able to represent the exact
    user input during genetic algorithm runtime.
    :param stock1: Stock of price1, e.g. "Bayer".
    :param stock2: Stock of price2.
    :param price1: First value to compare, e.g. "Open".
    :param price2: Second value to compare.
    :param days1: Time from which the first price is taken.
    :param days21: Start time from which the average for the second price is taken, as days prior to
    the spotlight day.
    :param days22: End time from which the average for the second price is taken, as days prior to
    the spotlight day.
    :param comparison: Comparison between the prices to trigger a signal.
    :return: A list of booleans which represents a trigger signal for each day.
    """
    stock1 = str(stock1).replace("'", "")
    stock2 = str(stock2).replace("'", "")
    price1 = str(price1).replace("'", "")
    price2 = str(price2).replace("'", "")
    days1 = str(days1).replace("'", "")
    days21 = str(days21).replace("'", "")
    days22 = str(days22).replace("'", "")
    left_timeframe = days_looker.get_timeframe_days(TRAINING_START, TRAINING_END, int(days1),
                                                    stock1 + "_" + price1)
    right_timeframe = days_looker.get_moving_average_days(TRAINING_START, TRAINING_END, int(days21),
                                                          int(days22),
                                                          stock2 + "_" + price2)
    if str(comparison).replace("'", "") == ">":
        return __larger_lists(left_timeframe, right_timeframe)
    return __smaller_lists(left_timeframe, right_timeframe)


def average_average(stock1, stock2, price1, price2, days11, days12, days21, days22, comparison):
    """
    Compares between an average stock price and an average stock price value.
    :param stock1: Stock of price1, e.g. "Bayer".
    :param stock2: Stock of price2.
    :param price1: First value to compare, e.g. "Open".
    :param price2: Second value to compare.
    :param days11: Start time from which the average for the first price is taken, as days prior to
    the spotlight day.
    :param days12: End time from which the average for the first price is taken, as days prior to
    the spotlight day.
    :param days21: Start time from which the average for the second price is taken, as days prior to
    the spotlight day.
    :param days22: End time from which the average for the second price is taken, as days prior to
    the spotlight day.
    :param comparison: Comparison between the prices to trigger a signal.
    :return: A list of booleans which represents a trigger signal for each day.
    """
    stock1 = str(stock1).replace("'", "")
    stock2 = str(stock2).replace("'", "")
    price1 = str(price1).replace("'", "")
    price2 = str(price2).replace("'", "")
    days11 = str(days11).replace("'", "")
    days12 = str(days12).replace("'", "")
    days21 = str(days21).replace("'", "")
    days22 = str(days22).replace("'", "")
    left_timeframe = days_looker.get_moving_average_days(TRAINING_START, TRAINING_END, int(days11),
                                                         int(days12),
                                                         stock1 + "_" + price1)
    right_timeframe = days_looker.get_moving_average_days(TRAINING_START, TRAINING_END, int(days21),
                                                          int(days22),
                                                          stock2 + "_" + price2)
    if str(comparison).replace("'", "") == ">":
        return __larger_lists(left_timeframe, right_timeframe)
    return __smaller_lists(left_timeframe, right_timeframe)


def delta_delta(stock1, stock2, price1, price2, days11, days12, days21, days22, comparison):
    """
    Compares between a delta of a stock price and delta of a stock price.
    The delta is looked up by using two day values. The delta is then calculated as a relative grow
    between the first and the second day.
    :param stock1: Stock of price1, e.g. "Bayer".
    :param stock2: Stock of price2.
    :param price1: First value to compare, e.g. "Open".
    :param price2: Second value to compare.
    :param days11: First date for the delta of price1.
    :param days12: Second date for the delta of price1.
    :param days21: First date for the delta of price2.
    :param days22: Second date for the delta of price2.
    :param comparison: Comparison between the prices to trigger a signal.
    :return: A list of booleans which represents a trigger signal for each day.
    """
    stock1 = str(stock1).replace("'", "")
    stock2 = str(stock2).replace("'", "")
    price1 = str(price1).replace("'", "")
    price2 = str(price2).replace("'", "")
    days11 = str(days11).replace("'", "")
    days12 = str(days12).replace("'", "")
    days21 = str(days21).replace("'", "")
    days22 = str(days22).replace("'", "")
    left_timeframe = days_looker.get_moving_delta(TRAINING_START, TRAINING_END, int(days11),
                                                  int(days12),
                                                  stock1 + "_" + price1)
    right_timeframe = days_looker.get_moving_delta(TRAINING_START, TRAINING_END, int(days21),
                                                   int(days22),
                                                   stock2 + "_" + price2)
    if str(comparison).replace("'", "") == ">":
        return __larger_lists(left_timeframe, right_timeframe)
    return __smaller_lists(left_timeframe, right_timeframe)


def and_list(lists):
    """
    Generates a new bool list which represents the elementwise and of multiple lists.
    :param lists: The boolean lists from which a new list is generated.
    :return: The new boolean list.
    """
    # Check if lists is empty
    if not lists:
        return []

    # Use zip to group elements of the same index together
    # Then use all to check if all elements in each group are True
    return [all(group) for group in zip(*lists)]


def two_and(in1, in2):
    """
    Generates a new bool list which represents the elementwise and of two lists.
    :param in1: The first list.
    :param in2: The second list.
    :return: The new boolean list.
    """
    return and_list([in1, in2])


def one_and(in1):
    """
    Generates a bool list which represents the input list. This is needed due to the nature of
    DEAP (individual trees need to be able to modify their height in some instances).
    :param in1: input list.
    :return: output list.
    """
    return in1


def three_and(in1, in2, in3):
    """
    Generates a new bool list which represents the elementwise and of three lists.
    :param in1: The first list.
    :param in2: The second list.
    :param in3: The third list.
    :return: The new boolean list.
    """
    return and_list([in1, in2, in3])


def four_and(in1, in2, in3, in4):
    """
    Generates a new bool list which represents the elementwise and of three lists.
    :param in1: The first list.
    :param in2: The second list.
    :param in3: The third list.
    :param in4: The fourth list.
    :return: The new boolean list.
    """
    return and_list([in1, in2, in3, in4])
