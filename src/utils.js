export function getBaseUrlPath() {
  if (window.location.pathname.includes('/colorado-nonprofits')) {
    return '/colorado-nonprofits';
  }
  return '';
}