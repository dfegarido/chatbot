from langchain.tools import BaseTool
from math import pi
from typing import Union
import re  # Import regex module

class CircumferenceTool(BaseTool):
    tool: str = "circumference_tool"
    name: str = "Circumference Calculator"
    description: str = "Use this tool when you need to calculate a circumference using the radius of a circle."

    def _run(self, radius: Union[int, float, str]) -> float:
        """Calculate the circumference given the radius."""
        # Remove non-numeric characters (except for decimal points)
        cleaned_radius = re.sub(r"[^\d.]", "", str(radius))

        if len(cleaned_radius) == 0:
            return 0
        # Convert to float
        return float(cleaned_radius) * 2.0 * pi

    def _arun(self, radius: int):
        """Async version of the run method (not implemented)."""
        raise NotImplementedError("This tool does not support async")


if __name__ == "__main__":
    c = CircumferenceTool()
    result = c._run("NaN")
    print(result)
