import React from 'react';

interface TextAvatarProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TextAvatar: React.FC<TextAvatarProps> = ({ 
  name, 
  className = '', 
  size = 'md' 
}) => {
  const cleanName = (name || 'User').replace(/^@/, '').trim();
  const initials = cleanName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || cleanName[0]?.toUpperCase() || 'U';

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs font-bold',
    md: 'w-9 h-9 text-sm font-extrabold',
    lg: 'w-12 h-12 text-lg font-black',
    xl: 'w-16 h-16 text-2xl font-black'
  }[size];

  // Deterministic gradient based on character codes
  const bgGradients = [
    'from-pink-500 to-rose-600 text-white',
    'from-indigo-500 to-purple-600 text-white',
    'from-violet-500 to-fuchsia-600 text-white',
    'from-pink-600 to-amber-500 text-white',
    'from-emerald-500 to-teal-600 text-white',
    'from-blue-500 to-indigo-600 text-white'
  ];
  const charCodeSum = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgClass = bgGradients[charCodeSum % bgGradients.length];

  return (
    <div 
      className={`rounded-full bg-gradient-to-tr ${bgClass} flex items-center justify-center shrink-0 shadow-sm border border-white/40 select-none font-display ${sizeClasses} ${className}`}
      title={cleanName}
    >
      <span>{initials}</span>
    </div>
  );
};
