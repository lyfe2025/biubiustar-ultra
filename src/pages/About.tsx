import { useState } from 'react';
import { Star, Users, Globe, Heart, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useLanguage } from '../contexts/language';
import { contactService, type ContactFormData } from '../services/ContactService';
import { toast } from 'sonner';
import { usePageTitle } from '../hooks/usePageTitle';

export default function About() {
  const { t } = useLanguage();
  usePageTitle(t('about.title'));
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = contactService.validateContactForm(formData);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await contactService.submitContactForm(formData);
      
      if (result.success) {
        toast.success(result.message || t('about.contact.form.success'));
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error(result.message || t('about.contact.form.error'));
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error(error instanceof Error ? error.message : t('about.contact.form.networkError'));
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
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.mission.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.mission.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{t(`about.values.${value.title}.title`)}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.team.title')}</h2>
            <p className="text-xl text-gray-600">
              {t('about.team.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 text-center">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {member.expertise.map((skill, skillIndex) => (
                    <span key={skillIndex} className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.contact.title')}</h2>
            <p className="text-xl text-gray-600">
              {t('about.contact.description')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('about.contact.info.title')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t('about.contact.info.email')}</p>
                      <p className="text-gray-600">contact@biubiustar.com</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t('about.contact.info.phone')}</p>
                      <p className="text-gray-600">+86 400-123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t('about.contact.info.address')}</p>
                      <p className="text-gray-600">{t('about.contact.info.addressValue')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('about.contact.form.title')}</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('about.contact.form.name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('about.contact.form.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('about.contact.form.email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('about.contact.form.emailPlaceholder')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('about.contact.form.subject')}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={t('about.contact.form.subjectPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('about.contact.form.message')}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder={t('about.contact.form.messagePlaceholder')}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className={`w-5 h-5 mr-2 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  {isSubmitting ? t('about.contact.form.submitting') : t('about.contact.form.submit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}