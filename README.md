# PPT to Photoshop

PowerPoint(`.pptx`) 슬라이드를 Photoshop 문서로 변환하는 Photoshop **UXP 플러그인 패널**입니다.

> 현재 상태: PPTX의 **텍스트 상자를 Photoshop 텍스트 레이어로** 옮깁니다.

### 변환 방식

- 슬라이드마다 같은 크기의 Photoshop 문서를 하나씩 만듭니다(기본 144ppi, 16:9 → 1920×1080).
- 텍스트 상자 하나가 **포인트 텍스트 레이어** 하나가 됩니다. 레이어 이름은 PPT 텍스트 상자 이름을 쓰고, 순서는 PPT에서 겹쳐진 순서를 따릅니다.
- **옮기는 것**: 텍스트 내용, 줄바꿈(Enter, Shift+Enter), 위치(그룹 안 텍스트와 레이아웃에서 위치를 물려받는 자리 표시자 포함)
- **옮기지 않는 것**: PPT의 폰트, 크기, 색상. 모든 텍스트 레이어에 패널에서 고른 폰트와 크기를 적용하고, 색은 검정입니다.
- 자동 줄바꿈으로 넘어간 줄은 PPTX에 저장되지 않아서 한 줄로 이어집니다.
- 이미지, 도형, 표는 아직 옮기지 않습니다.

## 기술 스택

Adobe 공식 문서와 공식 샘플([uxp-photoshop-plugin-samples](https://github.com/AdobeDocs/uxp-photoshop-plugin-samples))을 기준으로 구성했습니다.

| 항목 | 선택 | 근거 |
|---|---|---|
| 호스트 | Photoshop 최신 버전 (`minVersion` 27.0.0) | 공식 Getting Started: 최신 Photoshop과 UXP Developer Tool 사용 |
| Manifest | v5 + `enableSWCSupport` | [Manifest v5](https://developer.adobe.com/photoshop/uxp/2022/guides/uxp_guide/uxp-misc/manifest-v5/), [SWC in UXP](https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-spectrum/swc/) |
| UI | Spectrum Web Components (`@swc-uxp-wrappers/*`, SWC 0.37.0 고정) | UXP 8부터 SWC는 0.37.0으로 고정됨 |
| 언어 | TypeScript 6 + `@types/photoshop` + `@adobe/cc-ext-uxp-types` | 공식 `typescript-webpack-sample` |
| 번들러 | webpack 5 | 공식 SWC 템플릿(`create-swc-uxp-app`)과 샘플 |
| PPTX 파싱 | JSZip + fast-xml-parser | 공식 `jszip-sample` |

- UI 컴포넌트는 Photoshop 안에서 실행되므로 Adobe가 지정한 버전을 그대로 씁니다.
- 빌드 도구(webpack, TypeScript 등)는 PC에서만 실행되므로 최신 안정판을 씁니다.
- TypeScript 7은 ts-loader가 쓰는 컴파일러 API를 제공하지 않아서 6.0을 씁니다.

## 준비물

1. **Photoshop** 최신 버전 (Creative Cloud Desktop에서 설치)
2. **UXP Developer Tool (UDT)** (Creative Cloud Desktop에서 설치)
3. **Node.js 22 이상** (빌드 전용)

## 빌드

```bash
npm install
npm run build      # 프로덕션 빌드 → dist/
npm run watch      # 개발용: 파일이 바뀔 때마다 자동으로 다시 빌드
npm run typecheck  # 타입 검사
npm test           # 테스트 (vitest)
```

PR과 `main` 푸시마다 GitHub Actions(`.github/workflows/ci.yml`)가 타입 검사, 테스트, 빌드를 실행합니다.
빌드된 플러그인은 Actions 실행 결과의 `plugin-dist` 아티팩트로 내려받을 수 있습니다(14일 보관).

## Photoshop에 로드하기 (UDT)

1. Photoshop을 실행하고, UDT의 **Connected apps**에 Photoshop이 표시되는지 확인합니다.
2. UDT에서 **Add Plugin**을 누르고 이 레포 루트의 `manifest.json`을 선택합니다.
3. 플러그인 행의 **••• → More → Advanced**에서 플러그인 폴더를 `dist`로 지정합니다.
4. **••• → Load**를 누르면 Photoshop의 **플러그인** 메뉴에 `PPT to Photoshop` 패널이 나타납니다.
5. (선택) `npm run watch`를 켜 두고 UDT에서 **••• → Watch**를 선택하면 수정 사항이 자동으로 다시 로드됩니다.
   `manifest.json`을 바꿨다면 Unload 후 다시 Load 해야 합니다.

디버깅은 **••• → Debug**를 누르면 열리는 DevTools에서 합니다(콘솔, 브레이크포인트).

## 구조

```
.pptx → [pptx 파서] → 중간 모델(core) → [photoshop 렌더러] → Photoshop 문서
```

디렉토리 구조, 의존 방향, 파일 규칙은 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)에 정리되어 있습니다.

## 참고 사항

- `src/types/uxp-augment.d.ts`: `@adobe/cc-ext-uxp-types`에 `storage.localFileSystem` 선언이 빠져 있어서 보강했습니다.
- `src/photoshop/host/modal.ts`의 `reportProgress` 처리: `@types/photoshop`에 `reportProgress`가 함수가 아닌 `void`로 잘못 선언되어 있어서 감쌌습니다.
- 파일 접근 권한은 `localFileSystem: "request"`입니다. 사용자가 파일 선택창에서 고른 파일만 읽을 수 있습니다.
