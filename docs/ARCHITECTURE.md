# 아키텍처

## 1. 전체 흐름

```
.pptx ──▶ [pptx 파서] ──▶ 중간 모델 (core) ──▶ [photoshop 렌더러] ──▶ Photoshop 문서/레이어
                                 ▲
                        [ui 패널]이 흐름을 조작
```

- **중간 모델(`core`)**: PPT에도 Photoshop에도 속하지 않는 순수 데이터 구조입니다.
- **파서(`pptx`)**: PPTX XML을 중간 모델로 바꿉니다. Photoshop과 UXP를 모르기 때문에 Node에서 테스트할 수 있어요.
- **렌더러(`photoshop`)**: 중간 모델을 Photoshop 문서와 레이어로 만듭니다. PPTX XML 구조를 모릅니다.

## 2. 디렉토리 구조

```
src/
├── main.ts                   진입점. 패널을 마운트하는 일만 함
├── index.html                패널 마크업 (webpack이 dist/로 복사)
│
├── core/                     중간 모델
│   ├── model/                presentation, slide, elements/(text, image, shape, group ...)
│   ├── geometry.ts           크기, 위치, 회전
│   ├── units.ts              pt ↔ px
│   └── index.ts
│
├── pptx/                     PPTX → 중간 모델
│   ├── package/              ZIP 읽기, 관계(rels), 파트 경로 처리
│   ├── xml/                  XML 파서(요소 순서 보존), XmlElement 헬퍼
│   ├── parts/                presentation, slide 파트 읽기, 자리 표시자 위치 상속(layout → master)
│   ├── elements/             sp(도형), pic(그림), grpSp(그룹), txBody(텍스트) → 중간 모델 요소
│   ├── styles/               테마 색상, 폰트, 서식 상속 처리
│   ├── units.ts              EMU ↔ pt (EMU는 OOXML 전용 단위라 여기 둠)
│   ├── errors.ts
│   ├── parse-pptx.ts         파서 전체 흐름
│   └── index.ts
│
├── photoshop/                중간 모델 → Photoshop
│   ├── host/                 executeAsModal, batchPlay 래퍼
│   ├── descriptors/          batchPlay 명령 객체 생성기
│   ├── document/             문서 생성
│   ├── fonts/                설치된 폰트 목록, 기본 폰트 선택
│   ├── layers/               text, image, shape, group 레이어 생성
│   ├── render-options.ts
│   ├── render-presentation.ts  렌더러 전체 흐름
│   └── index.ts
│
├── platform/                 UXP API 래퍼 (파일 선택 등)
├── ui/                       패널 화면
│   ├── state/                패널 상태 저장소
│   ├── actions/              사용자 동작 처리 (파일 열기, 변환)
│   ├── components/           화면 조각별 렌더 함수
│   ├── panel.ts              화면 조립
│   └── index.ts
├── shared/                   공용 유틸 (에러 처리 등)
└── types/                    외부 타입 정의 보강 (.d.ts)

tests/                        src와 같은 구조 (예: src/pptx/package/part-path.ts → tests/pptx/package/part-path.test.ts)
└── helpers/                  테스트용 PPTX 생성 도구 등
```

위 목록에는 아직 만들지 않은 폴더도 있어요(`pptx/elements`, `photoshop/layers` 등). 기능을 추가할 때 이 위치에 만듭니다.

## 3. 규칙

### 3.1 의존 방향

| 모듈 | import 가능한 모듈 |
|---|---|
| `core` | 없음 |
| `shared` | 없음 |
| `pptx` | `core`, `shared` |
| `photoshop` | `core`, `shared`, 호스트 모듈 `photoshop` |
| `platform` | `shared`, 호스트 모듈 `uxp` |
| `ui` | `core`, `shared`, `pptx`, `photoshop`, `platform` |
| `main.ts` | `ui` |

- `pptx`는 `uxp`, `photoshop`을 절대 import하지 않습니다. Node 테스트가 가능해야 하기 때문이에요.
- `photoshop` 렌더러는 PPTX XML이나 EMU 단위를 다루지 않습니다.

### 3.2 모듈 경계

- 다른 모듈은 **`index.ts`로만** 접근합니다. 예) `import { parsePptx } from "@pptx"`
- 다른 모듈의 내부 파일을 직접 import하지 않습니다. 예) `@pptx/package/zip` ❌
- 같은 모듈 안에서는 상대 경로(`./`, `../`)를 씁니다.
- `index.ts`에는 외부에 공개할 것만 re-export합니다.

### 3.3 경로 별칭

`@core`, `@pptx`, `@photoshop`, `@platform`, `@ui`, `@shared`

별칭은 두 곳에 정의되어 있으니, 추가하거나 바꿀 때는 **둘 다** 수정하세요.
- `path-aliases.js` (webpack, vitest가 사용)
- `tsconfig.json`의 `paths`

### 3.4 파일

- **1파일 1책임.** 파일 하나는 대략 150줄 이내로 유지하고, 넘으면 역할별로 나눕니다.
- 파일 이름은 **kebab-case**를 씁니다. 예) `text-layer.ts`, `part-path.ts`
- 요소 종류가 추가될 때(예: 표)는 각 계층에 같은 이름으로 파일을 추가합니다.
  - `core/model/elements/table.ts`
  - `pptx/elements/table.ts`
  - `photoshop/layers/table.ts`

### 3.5 단위

| 위치 | 단위 |
|---|---|
| PPTX XML | EMU (1pt = 12,700 EMU) |
| 중간 모델 (`core`) | **pt** |
| Photoshop 렌더링 | px (`ptToPx(pt, ppi)`로 변환) |

EMU는 `pptx` 밖으로 나가지 않습니다.

### 3.6 XML 읽기

- 슬라이드 XML은 **요소 순서가 의미를 가집니다**. 도형 순서는 겹침 순서이고, 텍스트의 `<a:r>`와 `<a:br>` 순서는 줄바꿈 위치예요.
- 그래서 `pptx/xml/parser.ts`는 순서를 보존하는 `XmlElement` 트리를 반환합니다. XML은 항상 이 트리와 `findChild`, `findPath`, `getAttr` 같은 헬퍼로 읽습니다.

### 3.7 테스트

- `core`와 `pptx`는 기능을 추가할 때 테스트도 함께 작성합니다(vitest, Node에서 실행).
- 테스트용 PPTX는 `tests/helpers/`의 생성 도구로 코드에서 만듭니다.
- 공개 API는 별칭으로 테스트하고(`from "@pptx"`), 내부 파일은 상대 경로로 import해서 테스트합니다(`from "../../../src/pptx/package/part-path"`). 3.2의 모듈 경계 규칙은 `src/` 안에서만 적용됩니다.
- `photoshop`, `platform`, `ui`는 Photoshop 안에서만 동작하므로 UXP Developer Tool로 직접 확인합니다.
  - 예외: Photoshop이나 UXP를 import하지 않는 순수 함수(예: `ui/state/selection.ts`)는 Node에서 테스트합니다.
