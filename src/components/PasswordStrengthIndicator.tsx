import React from 'react';
import { Check, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: {
    score: number;
    label: string;
    requirements: {
      length: boolean;
      letter: boolean;
      number: boolean;
      special: boolean;
    };
  };
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength
}) => {
  const { t } = useLanguage();

  if (!password) return null;

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'text-red-500';
    if (score === 2) return 'text-yellow-500';
    if (score === 3) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStrengthBgColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-yellow-500';
    if (score === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="mt-2 space-y-2">
      {/* 强度条 */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              getStrengthBgColor(strength.score)
            }`}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          />
        </div>
        {strength.label && (
          <span className={`text-sm font-medium ${getStrengthColor(strength.score)}`}>
            {strength.label}
          </span>
        )}
      </div>

      {/* 要求列表 */}
      <div className="text-sm space-y-1">
        <div className="font-medium text-gray-700">
          {t('auth.password.requirements')}
        </div>
        <div className="space-y-1">
          <div className={`flex items-center space-x-2 ${
            strength.requirements.length ? 'text-green-600' : 'text-gray-500'
          }`}>
            {strength.requirements.length ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{t('auth.password.requirement.length')}</span>
          </div>
          <div className={`flex items-center space-x-2 ${
            strength.requirements.letter ? 'text-green-600' : 'text-gray-500'
          }`}>
            {strength.requirements.letter ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{t('auth.password.requirement.letter')}</span>
          </div>
          <div className={`flex items-center space-x-2 ${
            strength.requirements.number ? 'text-green-600' : 'text-gray-500'
          }`}>
            {strength.requirements.number ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{t('auth.password.requirement.number')}</span>
          </div>
          <div className={`flex items-center space-x-2 ${
            strength.requirements.special ? 'text-green-600' : 'text-gray-500'
          }`}>
            {strength.requirements.special ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{t('auth.password.requirement.special')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};