import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface WantedInput {
  message: string;
}

class WantedTool extends MCPTool<WantedInput> {
  name = "wanted";
  description = "wanted의 채용정보 검색";

  schema = {
    message: {
      type: z.string(),
      description: "각 분야의 채용정보를 검색한다.",
    },
  };

  async execute(input: WantedInput) {
    return `원티드 채용정보 입니다: ${input.message} : api 연동하여 리턴`;
  }
}

export default WantedTool;