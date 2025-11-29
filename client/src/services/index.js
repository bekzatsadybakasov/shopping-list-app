import { USE_MOCK_API } from '../config/apiConfig';
import * as mockApi from './mockApi';
import * as realApi from './realApi';

export default USE_MOCK_API ? mockApi : realApi;