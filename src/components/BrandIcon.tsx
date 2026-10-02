import React from 'react';
import { 
  Bot, 
  Tv, 
  Sparkles, 
  Music, 
  ShieldCheck, 
  Palette, 
  PlayCircle, 
  Cpu, 
  Film, 
  Code2, 
  Layers, 
  Lock, 
  Zap, 
  Globe 
} from 'lucide-react';

interface BrandIconProps {
  name: string;
  className?: string;
  color?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ name, className = 'w-6 h-6', color }) => {
  const iconMap: Record<string, React.ReactNode> = {
    Bot: <Bot className={className} style={{ color }} />,
    Tv: <Tv className={className} style={{ color }} />,
    Sparkles: <Sparkles className={className} style={{ color }} />,
    Music: <Music className={className} style={{ color }} />,
    ShieldCheck: <ShieldCheck className={className} style={{ color }} />,
    Palette: <Palette className={className} style={{ color }} />,
    PlayCircle: <PlayCircle className={className} style={{ color }} />,
    Cpu: <Cpu className={className} style={{ color }} />,
    Film: <Film className={className} style={{ color }} />,
    Code2: <Code2 className={className} style={{ color }} />,
    Layers: <Layers className={className} style={{ color }} />,
    Lock: <Lock className={className} style={{ color }} />,
    Zap: <Zap className={className} style={{ color }} />,
  };

  return iconMap[name] || <Globe className={className} style={{ color }} />;
};
