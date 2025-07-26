import axios from 'axios';

import { publicEnv } from '@/constants/environment/public-environment';

const axiosClient = axios.create({
  baseURL: publicEnv.baseApiUrl,
});

export default axiosClient;
