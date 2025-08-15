import { useState } from 'react';
import { Star, Users, Globe, Heart, Mail, Phone, MapPin, Send, Building, Calendar, TrendingUp, Handshake } from 'lucide-react';
import { useLanguage } from '../contexts/language';
import { contactService, type ContactFormData } from '../services/ContactService';
import { toast } from 'sonner';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSiteInfo, useLocalizedSiteDescription } from '../hooks/useSettings';
import { useMetaDescription, useSocialMetaTags } from '../hooks/useMetaDescription';

export default function About() {
  const { t } = useLanguage();
  const { siteDescription, siteName } = useSiteInfo();
  const { localizedDescription } = useLocalizedSiteDescription();
  usePageTitle(t('about.title'));
  useMetaDescription(localizedDescription);
  useSocialMetaTags(
    `${t('about.title')} - ${siteName || 'BiuBiuStar'}`,
    localizedDescription
  );
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Validation functions
  const validatePhone = (phone: string): boolean => {
    // Support multiple regions: China, Hong Kong, Taiwan, Vietnam
    const phoneRegex = /^(\+86|\+852|\+886|\+84)?[\s-]?1[3-9]\d{9}$|^(\+852)?[\s-]?[5-9]\d{7}$|^(\+886)?[\s-]?09\d{8}$|^(\+84)?[\s-]?0[3-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.email || !formData.category) {
      toast.error(t('about.contactForm.validation.required'));
      return;
    }

    // Validate phone format
    if (!validatePhone(formData.phone)) {
      toast.error(t('about.contactForm.validation.invalidPhone'));
      return;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      toast.error(t('about.contactForm.validation.invalidEmail'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for API submission
      // 创建category到中文文本的映射，避免提交翻译键
      const categoryTextMap: { [key: string]: string } = {
        'live-ecommerce': '直播电商合作',
        'short-video': '短视频制作',
        'business-cooperation': '商务合作',
        'influencer-cooperation': '网红合作',
        'technical-consulting': '技术咨询',
        'product-inquiry': '产品咨询',
        'media-cooperation': '媒体合作',
        'other': '其他咨询'
      };
      
      const categoryText = categoryTextMap[formData.category] || formData.category;
      
      const contactData: ContactFormData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `${categoryText} - ${formData.company || formData.name}`,
        message: `公司: ${formData.company || '未提供'}\n\n${formData.message}`
      };

      // Submit to API
      await contactService.submitContactForm(contactData);
      
      toast.success(t('about.contactForm.success'));
      // Reset form
      setFormData({
        name: '',
        company: '',
        phone: '',
        email: '',
        category: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error(error instanceof Error ? error.message : t('about.contactForm.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: t('about.team.members.sarah.role'),
      bio: t('about.team.members.sarah.bio'),
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20woman%20CEO%20executive%20portrait&image_size=square',
      expertise: [t('about.team.members.sarah.expertise.0'), t('about.team.members.sarah.expertise.1'), t('about.team.members.sarah.expertise.2')]
    },
    {
      name: 'Michael Wang',
      role: t('about.team.members.michael.role'),
      bio: t('about.team.members.michael.bio'),
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20man%20CTO%20engineer%20portrait&image_size=square',
      expertise: [t('about.team.members.michael.expertise.0'), t('about.team.members.michael.expertise.1'), t('about.team.members.michael.expertise.2')]
    },
    {
      name: 'Anna Nguyen',
      role: t('about.team.members.anna.role'),
      bio: t('about.team.members.anna.bio'),
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20vietnamese%20woman%20designer%20creative%20portrait&image_size=square',
      expertise: [t('about.team.members.anna.expertise.0'), t('about.team.members.anna.expertise.1'), t('about.team.members.anna.expertise.2')]
    },
    {
      name: 'David Park',
      role: t('about.team.members.david.role'),
      bio: t('about.team.members.david.bio'),
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20korean%20man%20operations%20manager%20portrait&image_size=square',
      expertise: [t('about.team.members.david.expertise.0'), t('about.team.members.david.expertise.1'), t('about.team.members.david.expertise.2')]
    }
  ];

  const stats = [
    { label: t('about.stats.users'), value: '50,000+', icon: Users },
    { label: t('about.stats.communities'), value: '100+', icon: Globe },
    { label: t('about.stats.interactions'), value: '10,000+', icon: Heart },
    { label: t('about.stats.satisfaction'), value: '98%', icon: Star }
  ];

  const values = [
    {
      title: 'connect',
      description: t('about.values.connect.description'),
      icon: Globe
    },
    {
      title: 'sharing',
      description: t('about.values.sharing.description'),
      icon: Heart
    },
    {
      title: 'innovation',
      description: t('about.values.innovation.description'),
      icon: Star
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-purple-800/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-6">
            {t('about.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            {localizedDescription || t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Company Introduction Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.company.title')}</h2>
            <p className="text-xl text-gray-600">{t('about.company.subtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Company Profile */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('about.company.profile.title')}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('about.company.profile.description')}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t('about.company.profile.expansion')}
              </p>
            </div>

            {/* Company Overview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('about.company.overview.title')}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('about.company.overview.business')}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t('about.company.overview.project')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.timeline.title')}</h2>
            <p className="text-xl text-gray-600">{t('about.timeline.subtitle')}</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-purple-500 to-purple-600"></div>
            
            <div className="space-y-8">
              {[
                { period: '2023.10', events: ['market', 'research'] },
                { period: '2023.11', events: ['location', 'registration', 'recruitment'] },
                { period: '2023.12', events: ['trial', 'testing'] },
                { period: '2024.01', events: ['bigo', 'opening', 'network', 'china'] },
                { period: '2024.02', events: ['award', 'scale', 'annual'] },
                { period: '2024.05', events: ['newbie', 'quarterly'] },
                { period: '2024.06', events: ['tiktok', 'visit'] },
                { period: '2024.07', events: ['tiktokAward'] },
                { period: '2024.11', events: ['douyinAward'] },
                { period: '2024.12', events: ['excellence', 'carnival'] }
              ].map((item, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  {/* Timeline Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  {/* Content Card */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{item.period}</h3>
                      </div>
                      <ul className="space-y-2">
                        {item.events.map((event, eventIndex) => (
                          <li key={eventIndex} className="text-gray-600 text-sm leading-relaxed flex items-start">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {t(`about.timeline.events.${item.period.replace('.', '')}.${event}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.performance.title')}</h2>
            <p className="text-xl text-gray-600">{t('about.performance.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { period: 'q1q2', value: '30万', description: 'q1q2Description', color: 'from-blue-500 to-blue-600' },
              { period: 'q3', value: '60万', description: 'q3Description', color: 'from-green-500 to-green-600' },
              { period: 'q4', value: '150万', description: 'q4Description', color: 'from-purple-500 to-purple-600' }
            ].map((item, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 text-center">
                <div className={`bg-gradient-to-r ${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t(`about.performance.periods.${item.period}`)}</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
                  {item.value}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {t(`about.performance.${item.description}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}


      {/* Partners Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.partners.title')}</h2>
            <p className="text-xl text-gray-600">{t('about.partners.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { description: 'tiktok', logo: '/images/partners/tiktok.png' },
              { description: 'tongcheng', logo: '/images/partners/tongcheng.png' },
              { description: 'bluefocus', logo: '/images/partners/lanseguangbiao.png' },
              { description: 'delsk', logo: '/images/partners/delsk.png' },
              { description: 'azgo', logo: '/images/partners/azgo.png' },
              { description: 'elong', logo: '/images/partners/yilong.png' }
            ].map((partner, index) => (
              <div key={index} className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 text-center h-32 flex flex-col justify-center items-center hover:scale-105">
                  <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                    <img 
                      src={partner.logo} 
                      alt="Partner Logo"
                      className="max-w-full max-h-full object-contain filter hover:brightness-110 transition-all duration-300"
                      onError={(e) => {
                        // Fallback to Building icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg items-center justify-center hidden">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs text-gray-600 text-center">
                    {t(`about.partners.descriptions.${partner.description}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Team Section */}


      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.contactForm.title')}</h2>
            <p className="text-xl text-gray-600">{t('about.contactForm.subtitle')}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-purple-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('about.contactForm.form.category')}
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">{t('about.contactForm.form.categoryPlaceholder')}</option>
                  <option value="live-ecommerce">{t('about.contactForm.categories.liveEcommerce')}</option>
                  <option value="short-video">{t('about.contactForm.categories.shortVideo')}</option>
                  <option value="business-cooperation">{t('about.contactForm.categories.businessCooperation')}</option>
                  <option value="influencer-cooperation">{t('about.contactForm.categories.influencerCooperation')}</option>
                  <option value="technical-consulting">{t('about.contactForm.categories.technicalConsulting')}</option>
                  <option value="product-inquiry">{t('about.contactForm.categories.productInquiry')}</option>
                  <option value="media-cooperation">{t('about.contactForm.categories.mediaCooperation')}</option>
                  <option value="other">{t('about.contactForm.categories.other')}</option>
                </select>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('about.contactForm.form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('about.contactForm.form.company')}
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('about.contactForm.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('about.contactForm.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('about.contactForm.form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t('about.contactForm.form.messagePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                ></textarea>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('about.contactForm.form.sending')}
                    </div>
                  ) : (
                    t('about.contactForm.form.submit')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}