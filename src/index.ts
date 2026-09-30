// Spectrum Web Components: components come from the UXP-compatible
// `@swc-uxp-wrappers/*` packages; theme is consumed directly (it has no wrapper).
import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/src/themes.js";
import "@swc-uxp-wrappers/button/sp-button.js";
import "@swc-uxp-wrappers/divider/sp-divider.js";

import "./styles.css";
import { initPanel } from "./ui/panel";

initPanel();
