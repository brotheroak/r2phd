# IntentSpec · 의도명세

GitHub: [brotheroak/r2phd](https://github.com/brotheroak/r2phd)  
[.EXE-THON](https://contests.liner.com/hackathon/exe-thon-2611/) 출품용 에이전트.

연구 질문·용어 정의서·데이터 구조를 넣으면 **분석 의도를 구조화**하고, 모호한 점은 연구자에게 확인한 뒤 **명세 · SQL · 검증 항목**을 만들며, 결과 CSV에서 **의도 드리프트**를 감사합니다.

## 왜 만들었나

LLM이 짠 SQL은 종종 “정상 실행”됩니다. 그런데

- 같은 제조번호라도 제품이 다르면 다른 기록이고
- “최근”이 시험일인지 적재일인지에 따라 결과가 갈리며
- 재시험 합격을 실패로 넣으면 실패율이 왜곡됩니다.

IntentSpec은 이 **조용한 실패**를 시연 가능한 파이프라인으로 막습니다.

## Liner API 사용

| API | 역할 |
| --- | --- |
| **Liner Model API** (`liner-gpt-router`, OpenAI 호환) | 개념 연결, 모호함 추출, 명세/SQL 컴파일, 결과 감사 |
| **Liner Scholar Search** | 날짜 기준·식별자 스코프 등 방법론 용어 보강 |

`LINER_API_KEY`가 없으면 **데모 엔진**으로 동일 시나리오가 동작합니다.

## 로컬 실행

```bash
cp .env.example .env.local
# LINER_API_KEY=...  (https://platform.liner.com)

npm install
npm run dev
```

기본 포트: **3847** → http://127.0.0.1:3847

## 시연 순서 (5분)

1. **가상 시나리오 불러오기** — 로트 실패율 드라마
2. **개념 연결 · 모호함 추출** — 날짜/식별자/실패 정의 충돌 확인
3. 권장 옵션으로 **연구자 확인** 후 명세·SQL 생성
4. 샘플 결과 CSV로 **의도 감사** — drift score와 근거 행 확인

데이터는 전부 **가상**입니다 (참가 규정 제5조).

## 스택

Next.js · TypeScript · Tailwind · shadcn/ui · OpenAI SDK → Liner Platform
