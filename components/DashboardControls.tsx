import React, { useRef } from 'react';
import { TargetType, BedaData } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { EmailIcon, DomainIcon, IpIcon, BedaIcon, NayIcon, FiraIcon, SearchIcon, LoaderIcon } from './icons';
import Tooltip from './Tooltip';

interface DashboardControlsProps {
  targetType: TargetType;
  setTargetType: (type: TargetType) => void;
  onSearch: (input: string) => void;
  onBedaAnalyze: (data: BedaData) => void;
  isLoading: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
}

const TargetButton: React.FC<{
    Icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
      ${isActive
        ? 'bg-purple-500/50 text-white shadow-lg shadow-purple-500/30'
        : 'bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);


const DashboardControls: React.FC<DashboardControlsProps> = ({
  targetType,
  setTargetType,
  onSearch,
  onBedaAnalyze,
  isLoading,
  inputValue,
  setInputValue,
}) => {
  const { t } = useLocalization();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // @ts-ignore - ExifReader is loaded from CDN
    const tags = await ExifReader.load(file);
    
    const exifData: { [key: string]: { description: string } } = {};
    const excludedKeys = new Set(['gps', 'thumbnail', 'Image-Look', 'Image Width', 'Image Height', 'Interop', 'icc', 'MakerNote']);
    for (const key in tags) {
        if (tags[key] && tags[key].description && !excludedKeys.has(key)) {
            exifData[key] = tags[key];
        }
    }

    const bedaResult: BedaData = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        image: {
            'Image Width': tags['Image Width'],
            'Image Height': tags['Image Height'],
        },
        exif: exifData,
        gps: tags.gps
    };
    onBedaAnalyze(bedaResult);
  };
  
  const handleBedaClick = () => {
    fileInputRef.current?.click();
  };

  const placeholders = t('searchPlaceholder') as { [key: string]: string };
  const placeholderText = placeholders[targetType] || "Enter a value...";

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl">
          <TargetButton Icon={DomainIcon} label={TargetType.DOMAIN} isActive={targetType === TargetType.DOMAIN} onClick={() => setTargetType(TargetType.DOMAIN)} />
          <TargetButton Icon={IpIcon} label={TargetType.IP} isActive={targetType === TargetType.IP} onClick={() => setTargetType(TargetType.IP)} />
          <TargetButton Icon={EmailIcon} label={TargetType.EMAIL} isActive={targetType === TargetType.EMAIL} onClick={() => setTargetType(TargetType.EMAIL)} />
        </div>
        <div className="flex items-center gap-3">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg, image/png"
            />
            <Tooltip text={t('bedaTooltip') as string}>
                <button onClick={handleBedaClick} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white transition-colors duration-300">
                    <BedaIcon className="w-5 h-5" /> BEDA
                </button>
            </Tooltip>
            <Tooltip text={t('nayTooltip') as string}>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white transition-colors duration-300">
                    <NayIcon className="w-5 h-5" /> NAY
                </button>
            </Tooltip>
             <Tooltip text={t('firaTooltip') as string}>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white transition-colors duration-300">
                    <FiraIcon className="w-5 h-5" /> FIRA
                </button>
            </Tooltip>
        </div>
      </div>
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <div className="relative flex-grow">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholderText}
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 bg-white/5 border-2 border-transparent focus:border-purple-400 rounded-lg text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-purple-400/50"
        >
          {isLoading ? (
            <><LoaderIcon className="animate-spin w-5 h-5" /> {t('loading') as string}</>
          ) : (
            <><SearchIcon className="w-5 h-5" /> {t('search') as string}</>
          )}
        </button>
      </form>
    </div>
  );
};

export default DashboardControls;