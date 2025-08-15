import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Globe, Heart } from 'lucide-react'
import { useLanguage } from '../contexts/language/LanguageContext'
import { useSiteInfo } from '../hooks/useSettings'

const Footer: React.FC = () => {
  const { t } = useLanguage()
  const { siteName, siteDescription, contactEmail, siteLogo } = useSiteInfo()
  
  // 获取当前年份
  const currentYear = new Date().getFullYear()
  
  // 截取站点描述的前100个字符作为简短描述
  const shortDescription = siteDescription 
    ? siteDescription.length > 100 
      ? siteDescription.substring(0, 97) + '...'
      : siteDescription
    : t('footer.defaultDescription')

  const footerLinks = [
    {
      title: t('footer.quickLinks.title'),
      links: [
        { label: t('nav.home'), path: '/' },
        { label: t('nav.trending'), path: '/trending' },
        { label: t('nav.activities'), path: '/activities' },
        { label: t('nav.about'), path: '/about' }
      ]
    }
  ]

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* 站点信息 */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              {siteLogo && (
                <img 
                  src={siteLogo} 
                  alt={siteName}
                  className="h-8 w-8 mr-3"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {siteName || 'BiuBiuStar'}
              </h3>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              {shortDescription}
            </p>
            <div className="flex items-center space-x-4">
              {contactEmail && (
                <a 
                  href={`mailto:${contactEmail}`}
                  className="flex items-center text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  <span className="text-sm">{contactEmail}</span>
                </a>
              )}
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-purple-300">
              {t('footer.quickLinks.title')}
            </h4>
            <ul className="space-y-2">
              {footerLinks[0].links.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-purple-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 联系信息 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-purple-300">
              {t('footer.contact.title')}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 text-sm">
                <Globe className="w-4 h-4 mr-2 text-purple-400" />
                <span>www.biubiustar.com</span>
              </div>
              {contactEmail && (
                <div className="flex items-center text-gray-300 text-sm">
                  <Mail className="w-4 h-4 mr-2 text-purple-400" />
                  <span>{contactEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 分割线 */}
        <hr className="border-gray-700 my-8" />

        {/* 版权信息 */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} {siteName || 'BiuBiuStar'}. {t('footer.copyright.allRightsReserved')}
          </p>
          
          <div className="flex items-center text-gray-400 text-sm">
            <span>{t('footer.copyright.madeWith')}</span>
            <Heart className="w-4 h-4 mx-2 text-red-500" />
            <span>{t('footer.copyright.poweredBy')} React & TypeScript</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
