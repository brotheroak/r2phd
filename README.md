# IntentSpec · 의도 구체화 에이전트

GitHub: [brotheroak/r2phd](https://github.com/brotheroak/r2phd)  
[.EXE-THON](https://contests.liner.com/hackathon/exe-thon-2611/) 출품용.

**마케팅 한 줄:** 인간 ↔ AI 소통을 구체화해 간극을 줄입니다. 뜻이 맞으면 일이 풀립니다.

**핵심 무기**는 SQL 생성기가 아니라, 애매한 말을 **선택지로 고르고 잠그는 소통 에이전트**입니다.

## 적용 범위 (메인 3가지)

| 범위 | 경로 | 하는 일 |
| --- | --- | --- |
| 📊 데이터 분석 | `/console/semantic` | 기준 잠금 게이트 → SQL · 결과 점검 · 시맨틱 콘솔 |
| 🔬 연구·조사 | `/clarify/research` | 범위·근거·주장·다음 산출물 |
| 💬 일상 질문 | `/clarify/everyday` | 목적·제약·기준·다음 행동 |

분석 콘솔 안에는 품질 로트가 **기본 예제**입니다. 부가세·급여·연동 등은 콘솔에서 고를 수 있는 **추가 예제**일 뿐, 제품 메인 스토리가 아닙니다.

## 코어 루프

애매한 질문 → 🎯목적 / 🧱제약 / ⚖️기준 / 🧭다음 → 🔒같은 뜻 → (분석이면 SQL·감사)

- 추천은 보이되 **자동 선택하지 않음**
- 잠그기 전에는 반출·확정 불가

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
