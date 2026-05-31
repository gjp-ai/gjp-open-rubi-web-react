import { createOpenApiUrl, fetchOpenApiJson } from '../../data/openApi'
import type { ApiListResponse, AppSetting } from '../../data/types'

export const getAppSettings = () => fetchOpenApiJson<ApiListResponse<AppSetting[]>>(createOpenApiUrl('app-settings'))
