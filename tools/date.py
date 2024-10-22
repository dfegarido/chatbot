from langchain_core.tools import tool
from datetime import datetime
import pytz

@tool("date_tool", return_direct=True, response_format="content_and_artifact")
def date_tool(format: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Retrieve the current date and time in the Manila timezone.

    Description: Provides date and time formatted by an optional string, useful for time-sensitive tasks.
    Input: Optional format string (e.g., "%Y-%m-%d %H:%M:%S").
    Output: Current date and time in the specified format.
    Example Output: "October 12, 2024 14:30:00" (default is "%Y-%m-%d %H:%M:%S").

    """

    # Define Manila timezone
    manila_tz = pytz.timezone("Asia/Manila")

    # Get the current date and time in Manila timezone
    current_date = datetime.now(manila_tz)

    # Format the date and time according to the provided format string
    formatted_date = current_date.strftime(format)

    return formatted_date
