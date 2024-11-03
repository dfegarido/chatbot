from langchain_core.output_parsers import BaseOutputParser

class CustomOutputParser(BaseOutputParser):
    def parse(self, text: str):
        lines = text.strip().split('\n')
        output = {}

        for line in lines:
            if line.startswith("Final Answer:"):
                output['final_answer'] = line.split(':', 1)[1].strip()
            elif line.startswith("Action:"):
                output['action'] = line.split(':', 1)[1].strip()
            # Add other sections as necessary
            elif line.startswith("Observation:"):
                output['observation'] = line.split(':', 1)[1].strip()

        # Ensure that if an action is present, we don't include a final answer
        if 'action' in output:
            output.pop('final_answer', None)  # Remove final answer if an action exists

        return text
