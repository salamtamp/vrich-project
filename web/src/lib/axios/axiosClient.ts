import axios from 'axios';

import { publicEnv } from '@/constants/env/public-env';

const axiosClient = axios.create({
  baseURL: publicEnv.baseApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
