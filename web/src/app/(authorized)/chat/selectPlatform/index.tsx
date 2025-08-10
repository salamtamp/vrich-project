import { FacebookMessengerIcon, LineLogoIcon } from '@public/assets/icon';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';

import styles from './selectPlatform.module.scss';

type PlatformType =
  | 'all'
  | 'messenger'
  | 'fb_comments'
  | 'line_oa'
  | 'messenger2'
  | 'fb_comments2'
  | 'fb_comments3'
  | 'fb_comments4'
  | 'fb_comments5';

type SelectPlatformProps = {
  selectedPlatform: PlatformType;
  onSelect: (platform: PlatformType) => void;
};

const platforms: { key: PlatformType; label: string; type?: string; notiCount?: string }[] = [
  { key: 'all', label: 'All Messages' },
  { key: 'messenger', label: 'Messenger' },
  { key: 'fb_comments', label: 'FB Comments' },
];

const fenixPlatforms: { key: PlatformType; label: string; type?: string; notiCount?: string }[] = [
  { key: 'all', label: 'All Messages', notiCount: '99+' },
  { key: 'messenger', label: 'Messenger', type: 'facebook', notiCount: '99+' },
  { key: 'fb_comments', label: 'Line OA', type: 'line', notiCount: '99+' },
  { key: 'messenger2', label: 'HotPrint Screen', type: 'facebook' },
  { key: 'fb_comments2', label: 'Dragon Screen', type: 'facebook', notiCount: '10' },
  { key: 'fb_comments3', label: 'Gustex Screen', type: 'facebook', notiCount: '1' },
  { key: 'fb_comments4', label: 'Fenix Screen', type: 'facebook', notiCount: '7' },
  { key: 'fb_comments5', label: 'Fenix Screen', type: 'line' },
];

const SelectPlatform = ({ selectedPlatform, onSelect }: SelectPlatformProps) => {
  const { data } = useSession();

  const config = data?.user?.email === 'fenix@admin.com' ? fenixPlatforms : platforms;

  return (
    <ul className={styles.selectPlatformContainer}>
      {config.map(({ key, label, type, notiCount }) => (
        <li
          key={key}
          className='relative'
        >
          <Button
            aria-pressed={selectedPlatform === key}
            variant={selectedPlatform === key ? 'default' : 'outline'}
            onClick={() => {
              onSelect(key);
            }}
          >
            {type === 'facebook' && <FacebookMessengerIcon />}
            {type === 'line' && <LineLogoIcon />}
            {label}
          </Button>
          {notiCount ? (
            <div className='absolute -right-2 bottom-0 flex size-4 items-center justify-center rounded-full bg-red-600'>
              <p className={styles.notiText}>{notiCount}</p>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
};

export default SelectPlatform;
