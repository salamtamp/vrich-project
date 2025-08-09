import { Button } from '@/components/ui/button';

import styles from './selectPlatform.module.scss';

type PlatformType = 'all' | 'messenger' | 'fb_comments' | 'line_oa';

type SelectPlatformProps = {
  selectedPlatform: PlatformType;
  onSelect: (platform: PlatformType) => void;
};

const platforms: { key: PlatformType; label: string }[] = [
  { key: 'all', label: 'All Messages' },
  { key: 'messenger', label: 'Messenger' },
  { key: 'fb_comments', label: 'FB Comments' },
];

const SelectPlatform = ({ selectedPlatform, onSelect }: SelectPlatformProps) => (
  <ul className={styles.selectPlatformContainer}>
    {platforms.map(({ key, label }) => (
      <li key={key}>
        <Button
          aria-pressed={selectedPlatform === key}
          variant={selectedPlatform === key ? 'default' : 'outline'}
          onClick={() => {
            onSelect(key);
          }}
        >
          {label}
        </Button>
      </li>
    ))}
  </ul>
);

export default SelectPlatform;
