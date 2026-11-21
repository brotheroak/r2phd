# IntentSpec · 의도 구체화 에이전트

GitHub: [brotheroak/r2phd](https://github.com/brotheroak/r2phd)  
[.EXE-THON](https://contests.liner.com/hackathon/exe-thon-2611/) 출품용.

**마케팅 한 줄:** 인간 ↔ AI 소통을 구체화해 간극을 줄입니다. 뜻이 맞으면 일이 풀립니다.

**핵심 무기**는 SQL 생성기가 아니라, 애매한 말을 **선택지로 고르고 잠그는 소통 에이전트**입니다.

## 업무 케이스

| 케이스 | 경로 | 하는 일 |
| --- | --- | --- |
| 📊 품질·로트 | `/console/semantic?case=quality` | 실패율·기간·키 잠금 → SQL |
| 🔗 SAP RFC·EAI | `/console/semantic?case=sap` | 연동 메타·스키마·진실 원천 잠금 |
| 🧾 부가세·홈택스 | `/console/semantic?case=vat` | 신고 전 대조 기준 잠금 |
| 💸 급여·원천 | `/console/semantic?case=payroll` | 지급·신고 전 원천 기준 잠금 |
| 🔬 연구·조사 | `/clarify/research` | 범위·근거·주장·다음 산출물 |
| 💬 일상 질문 | `/clarify/everyday` | 목적·제약·기준·다음 행동 |
| 🤝 LLM에게 의도 설명하기 | `/clarify/collab` | 자기 마음대로 실행하기 전에 의도 잠금 |

진입 CTA는 홈 히어로가 아니라 **같은 소통, 여러 케이스** 구역에 둡니다.

## 코어 루프

애매한 질문 → 🎯목적 / 🧱제약 / ⚖️기준 / 🧭다음 → 🔒같은 뜻 → (분석이면 SQL·감사)

- 추천은 보이되 **자동 선택하지 않음**
- 잠그기 전에는 반출·확정·코드 확정 불가
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
