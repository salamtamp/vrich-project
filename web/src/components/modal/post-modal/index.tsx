import Post from '@/app/(authorized)/post/post';
import { PaginationProvider } from '@/contexts';
import type { FacebookPostResponse } from '@/types/api';

import styles from './styles.module.scss';

type PostModalProps = {
  onSelectPost?: (post: FacebookPostResponse) => void;
};

const PostModal: React.FC<PostModalProps> = ({ onSelectPost }) => {
  return (
    <div className={styles.root}>
      <PaginationProvider defaultValue={{ limit: 10 }}>
        <Post
          disableNotificationBell
          disablePeriod
          itemContainerClass='!grid-cols-2'
          limitOptions={[10, 20, 30, 50, 100, 200]}
          onSelectPost={onSelectPost}
        />
      </PaginationProvider>
    </div>
  );
};

export default PostModal;
