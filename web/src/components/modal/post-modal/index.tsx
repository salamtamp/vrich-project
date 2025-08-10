import Post from '@/app/(authorized)/post/post';
import { PaginationProvider } from '@/contexts';

import styles from './styles.module.scss';

const PostModal = () => {
  return (
    <div className={styles.root}>
      <PaginationProvider defaultValue={{ limit: 10 }}>
        <Post
          disableNotificationBell
          disablePeriod
          itemContainerClass='!grid-cols-2'
          limitOptions={[10, 20, 30, 50, 100, 200]}
          onSelectPost={() => {}}
        />
      </PaginationProvider>
    </div>
  );
};

export default PostModal;
