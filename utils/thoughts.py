from random import choice


def random_thoughts():
    """
    Returns a random thought or message to display while waiting for a process to complete.

    The thoughts are designed to be friendly, encouraging, and engaging, and can be used to
    improve the user experience in situations where a delay is unavoidable.

    Returns:
        str: A random thought or message.
    """
    waiting_thoughts = [
        "Hmm, this might take a moment... let's see what we find!",
        "Processing... I hope the results are as good as they sound!",
        "Okay, things are moving along. I'm crossing my virtual fingers! ",
        "Just a little more time... don't worry, I’m on it!",
        "I wonder if I’ve got the right data for you… Let’s find out! ",
        "Thinking... thinking... okay, almost there! ",
        "If only I had a cup of coffee to keep me going while I wait! ",
        "Searching high and low, trying to find the best results for you. ",
        "Hmm... do you think I’ll find something even better this time? ",
        "Okay, deep breaths... let’s make sure everything is in order. ",
        "This might take a minute... but you’re going to love what I find! ",
        "Patience is a virtue... but I get it, I know you’re excited! ",
        "I’m almost there! Just need to double-check a few things.",
        "Success is near... I’m wrapping things up!"
    ]

    return choice(waiting_thoughts)
