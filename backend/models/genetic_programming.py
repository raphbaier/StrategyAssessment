"""
This includes the logic for the genetic algorithm. From a starting individuum which consists of
a trading signal, a stock to trade and an action (buy or sell), this generates a new trading signal.
"""
from functools import partial

import numpy
from deap import base, creator, tools, gp, algorithms
from models.market_logic import *

# print buy and sell history
PRICE_DEBUG = False


def get_pset_full():
    """
    Gets the full pset. Needed fortranslating various strings into individuums without having to
    worry about which primitives to use.
    :return: Full pset.
    """
    full_pset = get_pset()
    full_pset.addPrimitive(emotions_methods,
                           [Stock, Stock, Emotion, Emotion, Year, Year, Comparison],
                           bool)
    full_pset.addPrimitive(quarter_methods,
                           [Stock, Stock, QuarterFeature, QuarterFeature, Year, Year, Comparison],
                           bool)
    full_pset.addPrimitive(quarter_methods_sim,
                           [Stock, Stock, QuarterFeature, QuarterFeature, Year, Year, Comparison],
                           bool)
    full_pset.addPrimitive(year_methods,
                           [Stock, Stock, YearFeature, YearFeature, Year, Year, Comparison], bool)
    full_pset.addPrimitive(year_methods_sim,
                           [Stock, Stock, YearFeature, YearFeature, Year, Year, Comparison], bool)
    full_pset.addPrimitive(value_value, [Stock, Stock, Price, Price, Day, Day, Comparison], bool)
    full_pset.addPrimitive(average_value, [Stock, Stock, Price, Price, Day, Day, Day, Comparison],
                           bool)
    full_pset.addPrimitive(value_average, [Stock, Stock, Price, Price, Day, Day, Day, Comparison],
                           bool)
    full_pset.addPrimitive(average_average,
                           [Stock, Stock, Price, Price, Day, Day, Day, Day, Comparison],
                           bool)
    full_pset.addPrimitive(delta_delta,
                           [Stock, Stock, Price, Price, Day, Day, Day, Day, Comparison],
                           bool)

    full_pset.addPrimitive(four_and, [bool, bool, bool, bool], FinalBool)
    full_pset.addPrimitive(three_and, [bool, bool, bool], FinalBool)
    full_pset.addPrimitive(two_and, [bool, bool], FinalBool)
    full_pset.addPrimitive(one_and, [bool], FinalBool)
    return full_pset


def get_pset():
    """
    Gets the pset with the most basic primitives and terminals. This works as the base for every
    individuum and its modifications.
    :return: Basic pset.
    """
    default_pset = gp.PrimitiveSetTyped("MAIN", [], FinalBool)

    emotion_features = ['anger', 'neutral', 'fear', 'happiness', 'sadness']
    years = ["1", "2", "3", "0"]

    quarter_features = ['revenue', 'yoy', 'beatmiss']
    year_features = ['liabilities', 'cashpershare', 'bookvaluepershare', 'netdebt', 'ebit',
                     'employees']
    prices = ['open', 'high', 'low', 'close', 'volume']
    days = [
        "1", "2", "3", "4", "5", "7", "10", "25", "30", "50", "90", "200"
    ]
    for quarter in quarter_features:
        new_function_code = f"""
def quarter_feature_{quarter}():
    return QuarterFeature("{quarter}")
"""
        exec(new_function_code)
        new_func = eval(f"quarter_feature_{quarter}")
        default_pset.addPrimitive(new_func, [], QuarterFeature, name=f"quarter_feature_{quarter}")
        default_pset.addTerminal(QuarterFeature(quarter), QuarterFeature)

    for year_feature in year_features:
        new_function_code = f"""
def year_feature_{year_feature}():
    return YearFeature("{year_feature}")
"""
        exec(new_function_code)
        new_func = eval(f"year_feature_{year_feature}")
        default_pset.addPrimitive(new_func, [], YearFeature, name=f"year_feature_{year_feature}")
        default_pset.addTerminal(YearFeature(year_feature), YearFeature)

    for day in days:
        new_function_code = f"""
def day_{day}():
    return Day("{day}")
"""
        exec(new_function_code)
        new_func = eval(f"day_{day}")
        default_pset.addPrimitive(new_func, [], Day, name=f"day_{day}")
        default_pset.addTerminal(Day(day), Day)

    for price in prices:
        new_function_code = f"""
def price_{price}():
    return Price("{price}")
"""
        exec(new_function_code)
        new_func = eval(f"price_{price}")
        default_pset.addPrimitive(new_func, [], Price, name=f"price_{price}")
        default_pset.addTerminal(Price(price), Price)

    for emotion in emotion_features:
        new_function_code = f"""
def emotion_{emotion}():
    return Emotion("{emotion}")
"""
        exec(new_function_code)
        new_func = eval(f"emotion_{emotion}")
        default_pset.addPrimitive(new_func, [], Emotion, name=f"emotion_{emotion}")
        default_pset.addTerminal(Emotion(emotion), Emotion)

    for year in years:
        new_function_code = f"""
def year_{year}():
    return Year("{year}")
"""
        exec(new_function_code)
        new_func = eval(f"year_{year}")
        default_pset.addPrimitive(new_func, [], Year, name=f"year_{year}")
        default_pset.addTerminal(Year(year), Year)

    def comparison_le():
        return Comparison(">")

    def comparison_ri():
        return Comparison("<")

    default_pset.addTerminal(Comparison(">"), Comparison)
    default_pset.addTerminal(Comparison("<"), Comparison)
    default_pset.addPrimitive(comparison_le, [], Comparison)
    default_pset.addPrimitive(comparison_ri, [], Comparison)
    return default_pset


pset = get_pset_full()
stocks = ["merck", "bayer", "beiersdorf", "henkel"]

# add only relevant stocks at runtime.
for stock in stocks:
    function_code = f"""
def stock_{stock}():
    return Stock("{stock}")
"""
    exec(function_code)
    func = eval(f"stock_{stock}")
    pset.addPrimitive(func, [], Stock, name=f"stock_{stock}")
    pset.addTerminal(Stock(stock), Stock)

creator.create("FitnessMax", base.Fitness, weights=(1.0,))
creator.create("Individual", gp.PrimitiveTree, fitness=creator.FitnessMax)

toolbox = base.Toolbox()
toolbox.register("expr", gp.genHalfAndHalf, pset=pset, min_=2, max_=2)

toolbox.register("individual", tools.initIterate, creator.Individual, toolbox.expr)
toolbox.register("population", tools.initRepeat, list, toolbox.individual)
toolbox.register("compile", gp.compile, pset=pset)


def evaluate(individual, stock_string, action):
    """
    This evaluates the individual during the genetic algorithm runtime. It iterates over all dates
    between TRAINING_START and TRAINING_END and performs the action. It returns a fitness function
    which reflects the output of 10,000[currency doesn't matter] along with small minor fitness
    adaptions.
    :param individual: A single individual representing a trading signal.
    :param stock_string: The stock which is traded.
    :param action: The action that is triggered by the signal, either buy or sell.
    :return: Fitness value.
    """
    new_func = toolbox.compile(expr=individual)

    prices_today = days_looker.get_timeframe_days(TRAINING_START, TRAINING_END, 0,
                                                  stock_string + "_open")
    true_dates = []
    money = 10000
    stocks_held = 0
    counter = 0

    for date in DATES:
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
                    if PRICE_DEBUG:
                        print(
                            f"Bought {stocks_held} stocks on {date.strftime('%Y-%m-%d')}"
                            f"at price {price_today}, remaining money: {money}")
                if action == "sell":
                    # Sell all stocks
                    money -= 3  # costs order
                    stocks_held = money // price_today
                    money += stocks_held * price_today
                    if PRICE_DEBUG:
                        print(
                            f"Shorted {stocks_held} stocks on {date.strftime('%Y-%m-%d')}"
                            f"at price {price_today}, remaining money: {money}")

        else:
            if stocks_held > 0:
                if action == "buy":
                    # Sell all stocks
                    money -= 3  # selling costs oder
                    money += stocks_held * price_today
                    if PRICE_DEBUG:
                        print(
                            f"Sold {stocks_held} stocks on {date.strftime('%Y-%m-%d')}"
                            f"at price {price_today}, total money: {money}")
                    stocks_held = 0
                if action == "sell":
                    # Sell all stocks
                    money -= 3  # costs oder
                    money -= stocks_held * price_today
                    if PRICE_DEBUG:
                        print(
                            f"Bought back {stocks_held} short positions on"
                            f"{date.strftime('%Y-%m-%d')} at price {price_today},"
                            f"total money: {money}")
                    stocks_held = 0

        counter += 1

    # Check if stocks are still held at the end and sell them
    if stocks_held > 0:
        if action == "buy":
            final_date = DATES[-1]
            final_price = \
                days_looker.get_timeframe_days(DATES[-1], DATES[-1], 0, stock_string + "_open")[0]
            money += stocks_held * final_price
            if PRICE_DEBUG:
                print(
                    f"Sold remaining {stocks_held} {stock_string} stocks on"
                    f"{final_date.strftime('%Y-%m-%d')} at price {final_price},"
                    f"final total money: {money}")
        if action == "sell":
            final_date = DATES[-1]
            final_price = \
                days_looker.get_timeframe_days(DATES[-1], DATES[-1], 0, stock_string + "_open")[0]
            money -= stocks_held * final_price
            if PRICE_DEBUG:
                print(
                    f"Bought back remaining {stocks_held} {stock_string} short positions on"
                    f"{final_date.strftime('%Y-%m-%d')} at price {final_price}, final total"
                    f"money: {money}")

    # has to has at least as many stock_string as functions
    individual_str = str(individual)
    # Mapping from keywords to their counts
    keyword_to_count = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4
    }

    # Default count
    stock_string_counter = 0

    # Check for keyword occurrences and update the count accordingly
    for keyword, count in keyword_to_count.items():
        if keyword in individual_str:
            stock_string_counter = count
            break
    if individual_str.count(stock_string) < stock_string_counter:
        money = 0

    return (money,)


def run_gp_with_stock(stock_string, action, starting_individual, function_string):
    """
    This registers further primitives to the pset which are the ones we take into account when
    running the genetic algorithm. It starts the genetic algorithm and returns the best individuum.
    :param stock: The stock which is traded.
    :param action: The action that is triggered by the signal, either buy or sell.
    :param starting_individual: A single individual representing a trading signal. The starting one
    is the input by the frontend.
    :param function_string: The string representation of the frontend input.
    :return: A string of the output individual.
    """
    # Assuming "develop" is the extra input you want to pass
    evaluate_with_extra = partial(evaluate, stock_string=stock_string, action=action)

    toolbox.register("evaluate", evaluate_with_extra)

    toolbox.register("select", tools.selTournament, tournsize=3)
    toolbox.register("mate", gp.cxOnePoint)

    # update pset to only include the correct stocks
    small_pset = get_pset()

    # choose which functions one we actually want at runtime
    if "average" in function_string or "value" in function_string:
        small_pset.addPrimitive(value_value, [Stock, Stock, Price, Price, Day, Day, Comparison],
                                bool)
        small_pset.addPrimitive(average_value,
                                [Stock, Stock, Price, Price, Day, Day, Day, Comparison], bool)
        small_pset.addPrimitive(value_average,
                                [Stock, Stock, Price, Price, Day, Day, Day, Comparison], bool)
        small_pset.addPrimitive(average_average,
                                [Stock, Stock, Price, Price, Day, Day, Day, Day, Comparison], bool)
    if "delta" in function_string:
        small_pset.addPrimitive(delta_delta,
                                [Stock, Stock, Price, Price, Day, Day, Day, Day, Comparison], bool)
    if "emotion" in function_string:
        small_pset.addPrimitive(emotions_methods,
                                [Stock, Stock, Emotion, Emotion, Year, Year, Comparison], bool)
    if "quarter" in function_string:
        small_pset.addPrimitive(quarter_methods_sim,
                                [Stock, Stock, QuarterFeature, QuarterFeature, Year, Year,
                                 Comparison],
                                bool)
    if "year" in function_string:
        small_pset.addPrimitive(year_methods_sim,
                                [Stock, Stock, YearFeature, YearFeature, Year, Year, Comparison],
                                bool)
    if "one" in function_string:
        small_pset.addPrimitive(two_and, [bool, bool], FinalBool)
        small_pset.addPrimitive(one_and, [bool], FinalBool)
    if "two" in function_string:
        small_pset.addPrimitive(three_and, [bool, bool, bool], FinalBool)
        small_pset.addPrimitive(two_and, [bool, bool], FinalBool)
        small_pset.addPrimitive(one_and, [bool], FinalBool)
    if "three" in function_string:
        small_pset.addPrimitive(four_and, [bool, bool, bool, bool], FinalBool)
        small_pset.addPrimitive(three_and, [bool, bool, bool], FinalBool)
        small_pset.addPrimitive(two_and, [bool, bool], FinalBool)
    if "four" in function_string:
        small_pset.addPrimitive(four_and, [bool, bool, bool, bool], FinalBool)
        small_pset.addPrimitive(three_and, [bool, bool, bool], FinalBool)

    current_stocks = ["merck", "bayer", "beiersdorf", "henkel"]
    stocks_to_add = []
    for list_stock in current_stocks:
        if list_stock in function_string:
            stocks_to_add.append(list_stock)
    if stock_string not in stocks_to_add:
        stocks_to_add.append(stock_string)

    # add only relevant stocks at runtime
    for stock_to_add in stocks_to_add:
        new_function_code = f"""
def stock_{stock_to_add}():
    return Stock("{stock_to_add}")
"""
        exec(new_function_code)
        new_func = eval(f"stock_{stock_to_add}")
        small_pset.addPrimitive(new_func, [], Stock, name=f"stock_{stock_to_add}")
        small_pset.addTerminal(Stock(stock_to_add), Stock)

    # value the signal stock more
    small_pset.addTerminal(Stock(stock_string), Stock)
    small_pset.addTerminal(Stock(stock_string), Stock)
    small_pset.addTerminal(Stock(stock_string), Stock)

    toolbox.register("mutate", gp.mutUniform, expr=toolbox.expr, pset=small_pset)

    population = [starting_individual] * 50

    hof = tools.HallOfFame(1)
    stats = tools.Statistics(lambda ind: ind.fitness.values)
    stats.register("avg", numpy.mean)
    stats.register("min", numpy.min)
    stats.register("max", numpy.max)
    algorithms.eaSimple(population, toolbox, 0.2, 0.8, 4, stats=stats,
                        halloffame=hof, verbose=True)

    return str(hof[0])
