import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface WeatherInput {
  message: string;
}

class WeatherTool extends MCPTool<WeatherInput> {
  name = "weather";
  description = "Weather tool description";

  schema = {
    message: {
      type: z.string(),
      description: "Message to process",
    },
  };

  async execute(input: WeatherInput) {
    return `Processed: ${input.message}`;
  }
}

export default WeatherTool;