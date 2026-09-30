# CLAUDE.md

PowerPoint(.pptx) 슬라이드를 Photoshop 문서로 변환하는 Photoshop UXP 플러그인 패널입니다.

## 반드시 지킬 것

작업 전에 `docs/ARCHITECTURE.md`를 읽고 구조와 규칙을 따르세요. 핵심만 요약하면 다음과 같습니다.

- 흐름: `pptx`(파서) → `core`(중간 모델) → `photoshop`(렌더러). UI는 `ui`에 둡니다.
- 의존 방향: `core`와 `shared`는 아무것도 import하지 않습니다. `pptx`는 `uxp`와 `photoshop`을 import하지 않습니다.
- 다른 모듈은 별칭 + `index.ts`로만 접근합니다(`from "@pptx"`). 내부 파일을 직접 import하지 않습니다.
- 1파일 1책임, 파일당 약 150줄 이내, 파일 이름은 kebab-case.
- 중간 모델의 단위는 pt입니다. EMU는 `pptx` 밖으로 내보내지 않습니다.
- XML은 순서를 보존하는 `XmlElement` 트리(`pptx/xml/`)와 그 헬퍼로만 읽습니다.
- 경로 별칭을 바꿀 때는 `path-aliases.js`와 `tsconfig.json`의 `paths`를 함께 수정합니다.

## 명령어

```bash
npm run build      # 프로덕션 빌드 → dist/
npm run watch      # 개발 빌드 (자동 재빌드)
npm run typecheck  # 타입 검사
npm test           # vitest (core, pptx)
```

커밋 전에 `npm run typecheck && npm test && npm run build`가 모두 통과해야 합니다.

## 환경 메모

- Adobe 공식 샘플을 기준으로 구성: Manifest v5, Spectrum Web Components(`@swc-uxp-wrappers/*`, SWC 0.37.0 고정), webpack.
- TypeScript는 6.x를 씁니다. 7은 ts-loader가 쓰는 컴파일러 API를 제공하지 않습니다.
- SWC 컴포넌트는 `@swc-uxp-wrappers/<name>/sp-<name>.js`로 import합니다(`src/ui/spectrum.ts`).
- Photoshop과 UXP 타입 정의에 빠진 부분은 `src/types/`와 `src/photoshop/host/`에서 보강합니다.
- webpack은 HTML을 기본으로 압축(속성 따옴표 제거)하기 때문에, `index.html`은 `info: { minimized: true }`로 원본 그대로 복사합니다.
- UXP에서 `<title>`은 패널에 표시되므로 `index.html`에 넣지 않습니다.
