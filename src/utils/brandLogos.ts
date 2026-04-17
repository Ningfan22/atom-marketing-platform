import ahrefsLogo from '../assets/account-logos/ahrefs.png'
import githubLogo from '../assets/account-logos/github.png'
import gmailLogo from '../assets/account-logos/gmail.png'
import instagramLogo from '../assets/account-logos/instagram.png'
import linkedinLogo from '../assets/account-logos/linkedin.png'
import metaLogo from '../assets/account-logos/meta.png'
import pinterestLogo from '../assets/account-logos/pinterest.png'
import similarwebLogo from '../assets/account-logos/similarweb.png'
import xLogo from '../assets/account-logos/x.png'
import youtubeLogo from '../assets/account-logos/youtube.png'
import googleAnalyticsLogo from '../assets/resource-logos/google-analytics.svg'
import tableauLogo from '../assets/resource-logos/tableau.svg'

export function getBrandLogo(title: string) {
  const normalizedTitle = title.toLowerCase()

  if (normalizedTitle.includes('tableau')) return tableauLogo
  if (normalizedTitle.includes('google analytics')) return googleAnalyticsLogo
  if (normalizedTitle.includes('similarweb')) return similarwebLogo
  if (
    normalizedTitle.includes('twitter') ||
    normalizedTitle.startsWith('x（') ||
    normalizedTitle.startsWith('x(') ||
    normalizedTitle.startsWith('x ') ||
    normalizedTitle === 'x'
  ) {
    return xLogo
  }
  if (normalizedTitle.includes('ahrefs')) return ahrefsLogo
  if (normalizedTitle.includes('github')) return githubLogo
  if (normalizedTitle.includes('meta')) return metaLogo
  if (normalizedTitle.includes('instagram')) return instagramLogo
  if (normalizedTitle.includes('youtube')) return youtubeLogo
  if (normalizedTitle.includes('linkedin')) return linkedinLogo
  if (normalizedTitle.includes('pinterest')) return pinterestLogo
  if (normalizedTitle.includes('gmail')) return gmailLogo

  return null
}
