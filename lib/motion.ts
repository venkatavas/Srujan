// The site's one reduced-motion rule. The layout's boot script folds the OS setting and the saved
// choice (localStorage 'ss-motion') into html[data-motion] before first paint; the OS setting is
// also checked here, so the rule still holds on a page without that script or if the OS setting
// changes after load.
export const reducedMotion = () =>
  document.documentElement.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches
