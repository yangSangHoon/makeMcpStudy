import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface WeverseInput {
  message: string;
}

class WeverseTool extends MCPTool<WeverseInput> {
  name = "weverse";
  description = "음악 앨범/음반/cd/lp등을 찾을 수 있다.";

  schema = {
    message: {
      type: z.string(),
      description: "음악 앨범/음반/cd/lp등을 찾을 수 있다.",
    },
  };

  async execute(input: WeverseInput) {
    return `위버스샵에서 물품을 검색하여 리턴: ${input.message} : api 연동`;
  }
}

export default WeverseTool;