import { useState, useEffect, useRef } from 'react';
import { Star, Users, Globe, Heart, Building, Calendar, TrendingUp, Search, Trophy, Award, MapPin, UserPlus, Play, Zap, Target, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage } from '../contexts/language';
import { contactService, type ContactFormData } from '../services/ContactService';
import { toast } from 'sonner';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSiteInfo, useLocalizedSiteDescription } from '../hooks/useSettings';
import { useMetaDescription, useSocialMetaTags } from '../hooks/useMetaDescription';

export default function About() {
  const { t } = useLanguage();
  const { siteName } = useSiteInfo();
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown]);

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
        'live-ecommerce': t('about.contactForm.categories.liveEcommerce'),
        'short-video': t('about.contactForm.categories.shortVideo'),
        'business-cooperation': t('about.contactForm.categories.businessCooperation'),
        'influencer-cooperation': t('about.contactForm.categories.influencerCooperation'),
        'technical-consulting': t('about.contactForm.categories.technicalConsulting'),
        'product-inquiry': t('about.contactForm.categories.productInquiry'),
        'media-cooperation': t('about.contactForm.categories.mediaCooperation'),
        'other': t('about.contactForm.categories.other')
      };
      
      const categoryText = categoryTextMap[formData.category] || formData.category;
      
      const contactData: ContactFormData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `${categoryText} - ${formData.company || formData.name}`,
        message: `${t('about.contactForm.form.company')}: ${formData.company || t('about.contactForm.form.companyNotProvided')}\n\n${formData.message}`
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

  // AnimatedNumber组件 - 实现数字递增动画
  const AnimatedNumberDisplay = ({ targetValue }: { targetValue: number }) => {
    const [currentValue, setCurrentValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1 }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, [isVisible]);

    useEffect(() => {
      if (!isVisible) return;

      const duration = 2000; // 2秒动画
      const steps = 60; // 60帧
      const stepValue = targetValue / steps;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        // easeOut缓动效果
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        const newValue = Math.round(targetValue * easeOutProgress);
        
        setCurrentValue(newValue);

        if (currentStep >= steps) {
          setCurrentValue(targetValue);
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }, [isVisible, targetValue]);

    return <span ref={elementRef}>{currentValue}</span>;
  };

  // AnimatedNumber组件占位符
  const AnimatedNumber = () => null;

  // Avoid unused variable warnings
  void teamMembers; void stats; void values;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 text-white overflow-hidden min-h-[50vh] flex items-center justify-center pt-16">
        {/* 动态背景效果 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-purple-800/90"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed">
              {localizedDescription || t('about.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Company Introduction Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.company.title')}</h2>
            <p className="text-xl text-gray-600">{t('about.company.subtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Company Profile */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100 hover:-translate-y-2 hover:shadow-2xl hover:border-purple-200 transition-all duration-500">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-500">
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
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100 hover:-translate-y-2 hover:shadow-2xl hover:border-purple-200 transition-all duration-500">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-500">
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
      <section className="py-16 bg-gradient-to-br from-purple-50/30 via-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.timeline.title')}</h2>
            <p className="text-xl text-gray-600">{t('about.timeline.subtitle')}</p>
          </div>

          <div className="relative">
            {/* Enhanced Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-1 bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600 rounded-full shadow-lg"></div>
            
            <div className="space-y-12">
              {[
                { 
                  period: '2023.10', 
                  events: ['market', 'research'], 
                  icon: Search, 
                  color: 'from-purple-400 to-purple-500',
                  bgColor: 'from-purple-50 to-purple-100',
                  milestone: 'startup',
                  progress: 10
                },
                { 
                  period: '2023.11', 
                  events: ['location', 'registration', 'recruitment'], 
                  icon: MapPin, 
                  color: 'from-purple-500 to-purple-600',
                  bgColor: 'from-purple-50 to-purple-100',
                  milestone: 'preparation',
                  progress: 20
                },
                { 
                  period: '2023.12', 
                  events: ['trial', 'testing'], 
                  icon: Play, 
                  color: 'from-purple-500 to-purple-600',
                  bgColor: 'from-purple-50 to-purple-100',
                  milestone: 'trial',
                  progress: 30
                },
                { 
                  period: '2024.01', 
                  events: ['bigo', 'opening', 'network', 'china'], 
                  icon: Zap, 
                  color: 'from-purple-500 to-purple-600',
                  bgColor: 'from-purple-50 to-purple-100',
                  milestone: 'launch',
                  progress: 45
                },
                { 
                  period: '2024.02', 
                  events: ['award', 'scale', 'annual'], 
                  icon: Award, 
                  color: 'from-purple-600 to-purple-700',
                  bgColor: 'from-purple-50 to-purple-100',
                  milestone: 'firstAward',
                  progress: 55
                },
                { 
                  period: '2024.05', 
                  events: ['newbie', 'quarterly'], 
                  icon: UserPlus, 
                  color: 'from-purple-600 to-purple-700',
                  bgColor: 'from-purple-50 to-purple-100',
                  milestone: 'expansion',
                  progress: 65
                },
                { 
                  period: '2024.06', 
                  events: ['tiktok', 'visit'], 
                  icon: Target, 
                  color: 'from-purple-600 to-purple-700',
                  bgColor: 'from-purple-50 to-purple-100',
                  milestone: 'partnership',
                  progress: 75
                },
                { 
                  period: '2024.07', 
                  events: ['tiktokAward'], 
                  icon: Trophy, 
                  color: 'from-purple-700 to-purple-800',
                  bgColor: 'from-purple-50 to-purple-100',
                  milestone: 'tiktokAward',
                  progress: 85
                },
                { 
                  period: '2024.11', 
                  events: ['douyinAward'], 
                  icon: Trophy, 
                  color: 'from-purple-700 to-purple-800',
                  bgColor: 'from-purple-50 to-purple-100',
                  milestone: 'douyinAward',
                  progress: 95
                },
                { 
                  period: '2024.12', 
                  events: ['excellence', 'carnival'], 
                  icon: Sparkles, 
                  color: 'from-purple-800 to-purple-900',
                  bgColor: 'from-purple-50 to-purple-100',
                  milestone: 'excellence',
                  progress: 100
                }
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'} group`}>
                    {/* Enhanced Timeline Node */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                      <div className={`w-6 h-6 bg-gradient-to-r ${item.color} rounded-full border-4 border-white shadow-xl group-hover:scale-125 transition-all duration-500 flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>

                    </div>
                    
                    {/* Enhanced Content Card */}
                    <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                      <div className="group/card bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-2xl hover:-translate-y-3 hover:border-purple-200 transition-all duration-500 transform hover:scale-105 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5 group-hover/card:opacity-10 transition-opacity duration-500">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
                        </div>
                        
                        {/* Header with Icon and Milestone */}
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div className={`bg-gradient-to-r ${item.color} w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover/card:scale-110 group-hover/card:rotate-6 transition-all duration-500 shadow-lg`}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div ref={categoryDropdownRef}>
                                <h3 className="text-lg font-bold text-gray-900">{item.period}</h3>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${item.color} text-white`}>
                                  {t(`about.timeline.milestones.${item.milestone}`)}
                                </span>
                              </div>
                            </div>
                            {/* Achievement Badge */}
                            <div className="opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform translate-x-4 group-hover/card:translate-x-0">
                              <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg`}>
                                <Star className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Events List */}
                          <ul className="space-y-3">
                            {item.events.map((event, eventIndex) => (
                              <li key={eventIndex} className="text-gray-700 text-sm leading-relaxed flex items-start group-hover/card:text-gray-900 transition-colors duration-300">
                                <div className={`w-2 h-2 bg-gradient-to-r ${item.color} rounded-full mt-2 mr-3 flex-shrink-0 group-hover/card:scale-125 transition-transform duration-300`}></div>
                                <span className="font-medium">
                                  {t(`about.timeline.events.${item.period.replace('.', '')}.${event}`)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          

                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Timeline Completion Indicator */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-4 z-20">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
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

          {/* AnimatedNumber Component */}
          <AnimatedNumber />
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { period: 'q1q2', value: 30, description: 'q1q2Description', color: 'from-blue-500 to-blue-600' },
              { period: 'q3', value: 60, description: 'q3Description', color: 'from-green-500 to-green-600' },
              { period: 'q4', value: 150, description: 'q4Description', color: 'from-purple-500 to-purple-600' }
            ].map((item, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-2xl hover:border-purple-200 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 text-center">
                <div className={`bg-gradient-to-r ${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t(`about.performance.periods.${item.period}`)}</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
                  <AnimatedNumberDisplay targetValue={item.value} />{t('common.units.tenThousand')}+
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
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-2xl hover:border-purple-200 transform hover:-translate-y-2 transition-all duration-500 text-center h-32 flex flex-col justify-center items-center hover:scale-105">
                  <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                    <img 
                      src={partner.logo} 
                      alt="Partner Logo"
                      className="max-w-full max-h-full object-contain filter hover:brightness-110 transition-all duration-300 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to Building icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg items-center justify-center hidden group-hover:scale-110 transition-transform duration-500">
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
              {/* 分类选择 */}
              <div className="relative category-dropdown z-10" ref={categoryDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('about.contactForm.form.category')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={cn(
                    "w-full p-3 border rounded-xl text-left flex items-center justify-between transition-all duration-200",
                    showCategoryDropdown 
                      ? "border-purple-500 ring-2 ring-purple-500 ring-opacity-20 bg-purple-50" 
                      : "border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  )}
                  disabled={isSubmitting}
                >
                  <span className="text-gray-700">
                    {formData.category ? 
                      (() => {
                        const categoryMap: { [key: string]: string } = {
                          'live-ecommerce': t('about.contactForm.categories.liveEcommerce'),
                          'short-video': t('about.contactForm.categories.shortVideo'),
                          'business-cooperation': t('about.contactForm.categories.businessCooperation'),
                          'influencer-cooperation': t('about.contactForm.categories.influencerCooperation'),
                          'technical-consulting': t('about.contactForm.categories.technicalConsulting'),
                          'product-inquiry': t('about.contactForm.categories.productInquiry'),
                          'media-cooperation': t('about.contactForm.categories.mediaCooperation'),
                          'other': t('about.contactForm.categories.other')
                        };
                        return categoryMap[formData.category] || formData.category;
                      })() : 
                      t('about.contactForm.form.categoryPlaceholder')
                    }
                  </span>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-200",
                    showCategoryDropdown && "rotate-180"
                  )} />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in-0 slide-in-from-top-1 duration-200">
                    <div
                      className="px-4 py-3 hover:bg-purple-50 hover:text-purple-700 cursor-pointer border-b border-gray-100 first:rounded-t-xl transition-colors duration-150"
                      onClick={() => {
                        setFormData({ ...formData, category: '' });
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <span className="text-gray-500 font-medium">{t('about.contactForm.form.categoryPlaceholder')}</span>
                    </div>
                    {[
                      { value: 'live-ecommerce', label: t('about.contactForm.categories.liveEcommerce') },
                      { value: 'short-video', label: t('about.contactForm.categories.shortVideo') },
                      { value: 'business-cooperation', label: t('about.contactForm.categories.businessCooperation') },
                      { value: 'influencer-cooperation', label: t('about.contactForm.categories.influencerCooperation') },
                      { value: 'technical-consulting', label: t('about.contactForm.categories.technicalConsulting') },
                      { value: 'product-inquiry', label: t('about.contactForm.categories.productInquiry') },
                      { value: 'media-cooperation', label: t('about.contactForm.categories.mediaCooperation') },
                      { value: 'other', label: t('about.contactForm.categories.other') }
                    ].map((category) => (
                      <div
                        key={category.value}
                        className="px-4 py-3 hover:bg-purple-50 hover:text-purple-700 cursor-pointer border-b border-gray-100 last:rounded-b-xl last:border-b-0 transition-colors duration-150"
                        onClick={() => {
                          setFormData({ ...formData, category: category.value });
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <span className="text-gray-700 font-medium">{category.label}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                    placeholder={t('about.contactForm.form.namePlaceholder')}
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
                    placeholder={t('about.contactForm.form.companyPlaceholder')}
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
                    placeholder={t('about.contactForm.form.phonePlaceholder')}
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
                    placeholder={t('about.contactForm.form.emailPlaceholder')}
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