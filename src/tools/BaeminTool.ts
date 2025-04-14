import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface WeverseInput {
  message: string;
}

class WeverseTool extends MCPTool<WeverseInput> {
  name = "baemin";
  description = "배달 음식 주문을 할수있다.";

  schema = {
    message: {
      type: z.string(),
      description: "배달 음식 주문을 할수있다.",
    },
  };

  async execute(input: WeverseInput) {
    return `배민에서 음식을 주문하였습니다: ${input.message} : post api 연동`;
  }
}

export default WeverseTool;