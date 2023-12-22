export const REQUEST_METHOD = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ALL'] as const

export const CATCH_ALL_ROUTE_REGEXP = /\[\.{3}[^.\]]+]$/

export const GLOB_IGNORE_EXT = '!(**/*.?([cm])[jt]s)'

export const GLOB_IGNORE_NODE_MODULES = 'node_modules/**'
