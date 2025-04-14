import { MCPTool } from "mcp-framework"; // 가상의 프레임워크 import
import { z } from "zod";
import { OpenAIEmbeddings, OpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // 수정: langchain/text_splitters/recursive_character -> langchain/text_splitter
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents"; // Document 타입 import 추가

// .env 파일에서 환경 변수 로드 (OPENAI_API_KEY)
import * as dotenv from 'dotenv';
dotenv.config();

interface WantedInput {
  message: string; // 사용자 질문 (예: "프론트엔드 개발자 채용 정보 알려줘")
}

class WantedTool extends MCPTool<WantedInput> {
  name = "wanted_rag_search"; // 이름 변경 추천 (RAG임을 명시)
  description = "로컬 문서 기반으로 원티드 관련 질문에 답변합니다."; // 설명 수정 (실제 기능 반영)

schema = {
    message: {
      type: z.string(),
      description: "Message to process",
    },
  };

  // 도구 실행 로직
  async execute(input: WantedInput): Promise<string> { // 반환 타입을 명시적으로 Promise<string>으로 지정
    console.log("RAG 실행 시작, 입력:", input.message);

    try {
      // 1. 문서 로드
      const loader = new TextLoader("../data/wanted.txt"); // 로컬 파일 경로 확인 필요
      const docs = await loader.load();

      // 2. 문서 분할
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs: Document[] = await splitter.splitDocuments(docs); // 타입 명시

      // 3. 임베딩 및 벡터 저장소 생성
      const embeddings = new OpenAIEmbeddings(); // OPENAI_API_KEY 환경변수 필요
      const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

      // 4. Retriever 생성
      const retriever = vectorStore.asRetriever();

      // 5. 언어 모델 초기화
      const model = new OpenAI({ // temperature 등 설정 가능
          temperature: 0.1
      });

      // 6. 프롬프트 템플릿 생성 (Context와 Input 명시)
      const prompt = ChatPromptTemplate.fromTemplate(`다음 문맥(context)을 사용하여 질문(input)에 답하십시오:

Context:
{context}

Question: {input}`);

      // 7. 문서 결합 체인 생성 (Stuffing 방식)
      const combineDocsChain = await createStuffDocumentsChain({
          llm: model,
          prompt: prompt,
      });

      // 8. 검색 체인 생성 (Retrieval Chain)
      const retrievalChain = await createRetrievalChain({
          retriever: retriever,
          combineDocsChain: combineDocsChain,
      });

      // 9. 질문하기 및 결과 얻기
      // createRetrievalChain은 기본적으로 입력 키로 'input'을 사용합니다.
      const response = await retrievalChain.invoke({ input: input.message });

      // 10. 결과 반환 (answer 키 확인 및 fallback 제공)
      if (response && response.answer) {
          return response.answer;
      } else {
          console.warn("RAG 응답에서 'answer' 키를 찾을 수 없습니다.");
          return "정보를 찾을 수 없습니다. 문서를 확인하거나 질문을 다시 시도해주세요.";
      }

    } catch (error: any) { // 에러 타입 명시
      console.error("RAG 실행 중 오류 발생:", error);
      return `오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`;
    }
  }
}

export default WantedTool;