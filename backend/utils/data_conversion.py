"""
This handles the conversion between strings coming from frontend and strings and individuals as
being used by genetic_programming.
"""

import json
import pandas as pd

from models.market_logic import days_looker, TRAINING_START, TRAINING_END, DATES
from models.genetic_programming import gp, creator, pset, toolbox

mapping = {
    "Revenue": "revenue",
    "YoY": "yoy",
    "Beat / Miss": "beatmiss",
    "Liabilites": "liabilities",
    "Cash per Share": "cashpershare",
    "Book Value per Share": "bookvaluepershare",
    "Net Debt": "netdebt",
    "EBIT": "ebit",
    "Employees": "employees",
    "Anger": "anger",
    "Neutral": "neutral",
    "Fear": "fear",
    "Happiness": "happiness",
    "Sadness": "sadness",
    "revenue": "revenue",
    "beat / miss": "beatmiss",
    "cash per share": "cashpershare",
    "book value per share": "bookvaluepershare",
    "net debt": "netdebt",
}


def string_to_json(string):
    """
    Converts input to json.
    :param string: input as string.
    :return: string as json.
    """
    json_string = "[" + string[0].lower() + "]"
    # Parsing the JSON string
    try:
        data = json.loads(json_string)
        return data
    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)
        return None


# Define a function to map the string
def map_string(s):
    """
    Defines a function to map strings.
    :param s: String input.
    :return: Mapping between strings.
    """
    return mapping.get(s, s)


def product_json_to_ind_string(product_list):
    """
    Converts a json of products into a string in a pset's structure for a valid individual.
    :param product_list: Product list which is not yet in pset's structure.
    :return: A string for a valid individual.
    """
    and_counter = 0
    method_strings = []
    for product in product_list:
        and_counter += 1
        left = product['left_features']
        right = product['right_features']

        left = [map_string(s) for s in left]
        right = [map_string(s) for s in right]

        comparison = product['comparison']

        comparison_string = ""
        if comparison[0] == ">":
            comparison_string = "comparison_le"
        elif comparison[0] == "<":
            comparison_string = "comparison_ri"

        # emotion feature
        if left[1] == 'emotions':

            # emotion - emotion comparison
            if right[1] == 'emotions':
                method = "emotions_methods(" + "stock_" + left[0] + ", stock_" + right[
                    0] + ", emotion_" + left[
                             2] + ", emotion_" + right[2] + ", year_" + left[3] + ", year_" + right[
                             3] + ", " + comparison_string + ")"
                method_strings.append(method)

        # quartermetrics features
        elif left[1] == "quartermetrics":
            if right[1] == "quartermetrics":
                method = "quarter_methods(" + "stock_" + left[0] + ", stock_" + right[
                    0] + ", quarter_feature_" + left[
                             2] + ", quarter_feature_" + right[2] + ", year_" + left[
                             3] + ", year_" + right[
                             3] + ", " + comparison_string + ")"
                method_strings.append(method)

        elif left[1] == "yearmetrics":
            if right[1] == "yearmetrics":
                method = "year_methods(" + "stock_" + left[0] + ", stock_" + right[
                    0] + ", year_feature_" + left[
                             2] + ", year_feature_" + right[2] + ", year_" + left[3] + ", year_" + \
                         right[
                             3] + ", " + comparison_string + ")"
                method_strings.append(method)

        elif left[1] == "price":
            if right[1] == "price":
                # can be of arbitrary length.

                # value value comparison
                if left[3] == "value itself" and right[3] == "value itself":
                    method = "value_value(" + "stock_" + left[0] + ", stock_" + right[
                        0] + ", price_" + left[
                                 2] + ", price_" + right[2] + ", day_" + left[4] + ", day_" + right[
                                 4] + ", " + comparison_string + ")"
                    method_strings.append(method)

                # MAverage to Value
                if left[3] == "movingaverage" and right[3] == "value itself":
                    method = "average_value(" + "stock_" + left[0] + ", stock_" + right[
                        0] + ", price_" + left[
                                 2] + ", price_" + right[2] + ", day_" + left[4] + ", day_" + left[
                                 5] + ", day_" + right[
                                 4] + ", " + comparison_string + ")"
                    method_strings.append(method)

                # value to MAverage
                if left[3] == "value itself" and right[3] == "movingaverage":
                    method = "value_average(" + "stock_" + left[0] + ", stock_" + right[
                        0] + ", price_" + left[
                                 2] + ", price_" + right[2] + ", day_" + left[4] + ", day_" + right[
                                 4] + ", day_" + right[
                                 5] + ", " + comparison_string + ")"
                    method_strings.append(method)

                # MAverage to MAverage
                if left[3] == "movingaverage" and right[3] == "movingaverage":
                    method = "average_average(" + "stock_" + left[0] + ", stock_" + right[
                        0] + ", price_" + left[
                                 2] + ", price_" + right[2] + ", day_" + left[4] + ", day_" + left[
                                 5] + ", day_" + right[
                                 4] + ", day_" + right[5] + ", " + comparison_string + ")"
                    method_strings.append(method)

                # delta to delta
                if left[3] == "delta" and right[3] == "delta":
                    method = "delta_delta(" + "stock_" + left[0] + ", stock_" + right[
                        0] + ", price_" + left[
                                 2] + ", price_" + right[2] + ", day_" + left[4] + ", day_" + left[
                                 5] + ", day_" + right[
                                 4] + ", day_" + right[5] + ", " + comparison_string + ")"
                    method_strings.append(method)

    method = ""
    if and_counter == 1:
        method += "one"
    elif and_counter == 2:
        method += "two"
    elif and_counter == 3:
        method += "three"
    elif and_counter == 4:
        method += "four"

    method += "_and("
    for sub_method in method_strings:
        method += ", " + sub_method

    method += ")"
    return method


def string_to_ind(command):
    """
    Converts a valid string into one of pset's valid individuals.
    :param command: A string representing a signal.
    :return: A valid individual.
    """
    expr_tree = gp.PrimitiveTree.from_string(command, pset)
    individual = creator.Individual(expr_tree)
    return individual


def go_through(individual, stock_string, action):
    """
    Test function to go through dates and calculate trading details.
    :param individual: valid individual.
    :param stock_string: Stock string as part of the strategy.
    :param action: Action as part of the strategy.
    :return: Output of invested money (according to the strategy) and the days for a triggering
    signal.
    """
    new_func = toolbox.compile(expr=individual)
    prices_today = days_looker.get_timeframe_days(TRAINING_START, TRAINING_END, 0, stock_string +
                                                  "_open")

    start_date = pd.to_datetime("2020-08-01")
    end_date = pd.to_datetime("2022-08-31")

    dates = pd.date_range(start=start_date, end=end_date)

    true_dates = []

    money = 10000
    stocks_held = 0

    counter = 0

    for date in dates:
        days_looker.set_date(date)

        price_today = prices_today[counter]

        if new_func[counter]:
            true_dates.append(date.strftime('%Y%m%d'))
            if stocks_held == 0 and money > price_today:
                if action == "buy":
                    # Buy as many stocks as possible
                    money -= 3  # buying costs order
                    stocks_held = money // price_today
                    money -= stocks_held * price_today

                if action == "sell":
                    # Buy as many stocks as possible
                    money -= 3  # costs order
                    stocks_held = money // price_today
                    money += stocks_held * price_today
        else:
            if stocks_held > 0:
                if action == "buy":
                    # Sell all stocks
                    money -= 3  # selling costs oder
                    money += stocks_held * price_today
                    stocks_held = 0

                if action == "sell":
                    # Sell all stocks
                    money -= 3  # costs oder
                    money -= stocks_held * price_today
                    stocks_held = 0

        counter += 1

    # Check if stocks are still held at the end and sell them
    if stocks_held > 0:
        if action == "buy":
            final_price = days_looker.get_timeframe_days(DATES[-1], DATES[-1], 0, stock_string +
                                                         "_open")[
                0]
            money += stocks_held * final_price
        if action == "sell":
            final_price = days_looker.get_timeframe_days(DATES[-1], DATES[-1], 0, stock_string +
                                                         "_open")[
                0]
            money -= stocks_held * final_price

    return true_dates, money
