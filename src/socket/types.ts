// src/socket/types.ts

/**
 * Los tipos de alerta permitidos en el sistema de notificaciones
 */
export type AlertType = 'success' | 'error' | 'info' | 'warning'

/**
 * Estructura de una alerta/notificación
 */
export interface Alert {
  id: string
  title?: string
  message: string
  type: AlertType
}

/**
 * Payload para enviar notificaciones desde el cliente
 */
export interface NotificationPayload {
  message: string
  title?: string
  type: AlertType
  targetUserId?: string // Si se especifica, enviar solo a este usuario
  room?: string // Si se especifica, enviar a esta sala
}

/**
 * Payload para crear alertas con ID auto-generado
 */
export type NotificationInput = Omit<Alert, 'id'>
