from langchain_core.tools import tool
from datetime import datetime
import pytz

@tool("date_tool", return_direct=True, response_format="content_and_artifact")
def date_tool(format: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Current Date and Time Tool

    Retrieve the current date and time in Manila timezone with this tool!

    Description:
    This tool provides the current date and time formatted according to the specified format string, adjusted for the Manila timezone. It's ideal for tasks that require date verification, logging, or any time-sensitive operations.

    Input:
    An optional format string (e.g., "%Y-%m-%d %H:%M:%S", "%B %d, %Y %I:%M %p") to specify the desired date and time format.

    Output:
    The current date and time formatted as per the input specification.

    Example Output:
    "October 12, 2024 14:30:00"

    Note: If no format is provided, the default format is "%Y-%m-%d %H:%M:%S".
    """

    # Define Manila timezone
    manila_tz = pytz.timezone("Asia/Manila")

    # Get the current date and time in Manila timezone
    current_date = datetime.now(manila_tz)

    # Format the date and time according to the provided format string
    formatted_date = current_date.strftime(format)

    return formatted_date
