import type { Schema } from 'joi'

declare global {
  interface DtoValidateSchema {
    query?: Record<string, Schema>
    body?: Record<string, Schema>
    params?: Record<string, Schema>
  }
}
