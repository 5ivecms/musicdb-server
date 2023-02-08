import axios from 'axios'

import { ZvukParserUrls } from './zvuk-parser.types'

export const zvukApi = axios.create({ baseURL: ZvukParserUrls.BASE_URL })
