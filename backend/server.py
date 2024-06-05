"""
This provides the endpoints as used by the frontend
"""
import logging
import re

import pandas as pd
from flask import Flask, request
from flask import jsonify
from flask_cors import CORS

from models import genetic_programming
from utils import dataframe_operations
from utils.data_conversion import string_to_json, mapping, product_json_to_ind_string, \
    string_to_ind, go_through

app = Flask(__name__)
CORS(app)

days_looker = dataframe_operations.DaysLooker()

our_date = pd.to_datetime("2023-08-01")
days_looker.set_date(our_date)

# Set up logging
logging.basicConfig(level=logging.INFO)


def format_number_in_string(text):
    """
    Finds a number in a string and formats it by rounding it to two decimal places and adding
    commas every three digits.

    Parameters:
    text (str): The string containing the number to be formatted.

    Returns:
    str: The string with the formatted number.
    """
    # Find all numbers in the string
    numbers = re.findall(r"[\d]+\.?[\d]*", text)

    # Replace each number in the string with its formatted version
    for num in numbers:
        try:
            formatted_num = "{:,.2f}".format(round(float(num), 2))
            text = text.replace(num, formatted_num, 1)
        except ValueError:
            # If the number is not valid, continue to the next one
            continue

    return text


def convert_number_to_percentage(text):
    """
    Finds numbers in a string and replaces them with the number times 100 followed by a '%'.

    Parameters:
    text (str): The string containing the numbers to be converted.

    Returns:
    str: The string with numbers converted to percentages.
    """
    # Find all numbers in the string
    numbers = re.findall(r"[\d]+\.?[\d]*", text)

    # Replace each number in the string with its percentage equivalent
    for num in numbers:
        try:
            percentage_num = "{:.2f}%".format(float(num) * 100)
            text = text.replace(num, percentage_num, 1)
        except ValueError:
            # If the number is not valid, continue to the next one
            continue

    return text


def map_string_to_category(input_string):
    """
    Maps a given string to its corresponding category.

    Parameters:
    input_string (str): The input string to be mapped.

    Returns:
    str: The corresponding category string.
    """

    return mapping.get(input_string, "Unknown")


@app.route('/')
def hello():
    """
    Test function.
    :return: Test string.
    """
    return 'Start by selecting a company.'


@app.route('/performance/best', methods=['GET'])
def get_next_best():
    """
    Calculates the next best individual for some input individual (in frontend structure).
    It will not be perfect or much better, as we use a low number of generations and use mostly
    only the same methods that were used in the input.

    Returns: Next best individual, the money the strategy would have earned.

    """

    products = request.args.getlist('products')
    action = request.args.get('action')
    stock = request.args.get('stock')

    products_json = string_to_json(products)
    method = product_json_to_ind_string(products_json)
    individual = string_to_ind(method)

    next_best = genetic_programming.run_gp_with_stock(stock.lower(), action.lower(), individual,
                                                      method)

    _, money = go_through(next_best, stock.lower(), action.lower())

    return jsonify(next_best=next_best, money=money)


@app.route('/performance/default', methods=['GET'])
def get_performance():
    """
    Takes a list of products. A product has left_features, right_features and a comparison. Looks
    in date range where it triggered.
    :return: A list of dates where the signal triggered, the money the strategy would have earned.
    """

    products = request.args.getlist('products')

    action = request.args.get('action')
    stock = request.args.get('stock')

    products_json = string_to_json(products)

    method = product_json_to_ind_string(products_json)
    individual = string_to_ind(method)
    true_list, money = go_through(individual, stock.lower(), action.lower())
    return jsonify(day_list=true_list, money=money)


@app.route('/node/feature', methods=['GET'])
def get_node_day():
    """
    Get the feature value for a certain input at exactly one day.
    :return: The feature value.
    """

    # Get arguments from the query string
    features = request.args.get('features', default='', type=str)
    date = request.args.get('date', default='', type=str)  # Get the date
    date = pd.to_datetime(date)

    logging.info(date)
    days_looker.set_date(date)
    features = features.split(",")
    result = "12"

    if features[1] not in ["QuarterMetrics", "YearMetrics", "Emotions"]:
        if features[3] == "Value itself":
            result = "Value itself: " + str(
                days_looker.days_before_lookup(int(features[4]),
                                               features[0].lower() + "_" + features[2].lower()))
        elif features[4] == "":  # unvollstaendig
            result = "Value itself: " + str(
                days_looker.days_before_lookup(int(features[5]),
                                               features[0].lower() + "_" + features[2].lower()))
        elif features[5] == "":  # unvollstaendig
            result = "Value itself: " + str(
                days_looker.days_before_lookup(int(features[4]),
                                               features[0].lower() + "_" + features[2].lower()))
        elif features[3] == "Delta":
            result = "Delta: " + str(
                round(days_looker.delta_within_timeframe(int(features[4]), int(features[5]),
                                                         features[0].lower() + "_" + features[
                                                             2].lower()) * 100, 2)) + "%"
        elif features[3] == "MovingAverage":
            result = "Moving Average: " + str(
                days_looker.average_value_within_timeframe(int(features[4]), int(features[5]),
                                                           features[0].lower() + "_" + features[
                                                               2].lower()))
    elif features[1] == "Emotions" or features[1] == "QuarterMetrics":
        company = str(features[0].lower())
        emotion = str(map_string_to_category(features[2]))
        if features[3] == "0":  # average
            emotion1 = days_looker.get_timeframe_months(date, date, 0 * 3, company + "_" + emotion)[
                0]
            emotion2 = days_looker.get_timeframe_months(date, date, 1 * 3, company + "_" + emotion)[
                0]
            emotion3 = days_looker.get_timeframe_months(date, date, 2 * 3, company + "_" + emotion)[
                0]
            result = features[2] + ": " + str((emotion1 + emotion2 + emotion3) / 3)
        else:
            result = features[2] + ": " + str(
                days_looker.get_timeframe_months(date, date, (int(features[3]) - 1) * 3,
                                                 company + "_" + emotion)[0])
        if features[2] == "YoY":
            result = convert_number_to_percentage(result)
    else:  # year
        company = str(features[0].lower())
        emotion = str(map_string_to_category(features[2]))
        if features[3] == "0":  # average
            emotion1 = days_looker.get_timeframe_years(date, date, 0, company + "_" + emotion)[0]
            emotion2 = days_looker.get_timeframe_years(date, date, 1, company + "_" + emotion)[0]
            emotion3 = days_looker.get_timeframe_years(date, date, 2, company + "_" + emotion)[0]
            result = features[2] + ": " + str((emotion1 + emotion2 + emotion3) / 3)
        else:
            result = features[2] + ": " + str(
                days_looker.get_timeframe_years(date, date, (int(features[3]) - 1),
                                                company + "_" + emotion)[0])

        if features[2] == "YoY":
            result = convert_number_to_percentage(result)

    result = result.replace("nan", "no data")
    return jsonify(result=format_number_in_string(result))


if __name__ == '__main__':
    app.run()
