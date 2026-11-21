# IntentSpec · 의도 구체화 에이전트

GitHub: [brotheroak/r2phd](https://github.com/brotheroak/r2phd)  
[.EXE-THON](https://contests.liner.com/hackathon/exe-thon-2611/) 출품용.

**마케팅 한 줄:** 인간 ↔ AI 소통을 구체화해 간극을 줄입니다. 뜻이 맞으면 일이 풀립니다.

**핵심 무기**는 SQL 생성기가 아니라, 애매한 말을 **선택지로 고르고 잠그는 소통 에이전트**입니다.

## 케이스 카테고리 (랜딩 6개)

| 카테고리 | 케이스 | 경로 |
| --- | --- | --- |
| 사람 ↔ AI | LLM에게 의도 설명하기 | `/clarify/collab` |
| 사람 ↔ AI | 일상 질문 | `/clarify/everyday` |
| 조사 · 분석 | 연구 · 조사 | `/clarify/research` |
| 조사 · 분석 | 데이터 정의 맞추기 | `/console/semantic?case=quality` |
| 운영 · 연동 | 시스템 연동 | `/console/semantic?case=sap` |
| 운영 · 연동 | 재무 · 세무 대조 | `/console/semantic?case=vat` |

**IntentSpec 콘솔**(`/console/semantic`)은 케이스 카드와 별도 진입입니다. 상단·케이스 구역에 **콘솔 접속** 버튼이 있습니다.

부가세·급여 등 세부 시나리오는 콘솔 안에서 고릅니다.

## 코어 루프

애매한 질문 → 🎯목적 / 🧱제약 / ⚖️기준 / 🧭다음 → 🔒같은 뜻 → (분석이면 SQL·감사)

- 추천은 보이되 **자동 선택하지 않음**
- 잠그기 전에는 반출·확정·실행 금지
- 콘솔 Agent가 “자기 마음대로 / 의도”를 감지하면 의도 설명 케이스로 보냄

## Liner API

| API | 역할 |
| --- | --- |
| Model (`liner-gpt-router`) | analyze / confirm / audit / clarify / console-chat |
| Scholar Search | 분석 모호 용어 보강 |

`LINER_API_KEY`가 없으면 데모 엔진으로 동일 시나리오가 동작합니다.

## 로컬 실행

```bash
cp .env.example .env.local
npm install
npm run dev
```

포트 **3847** → http://127.0.0.1:3847

데이터는 전부 **가상**입니다 (참가 규정 제5조).
