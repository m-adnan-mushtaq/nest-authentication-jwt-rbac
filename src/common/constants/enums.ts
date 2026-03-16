export enum SystemRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum AuditEntity {
  USER = 'user',
  ACCOUNT = 'account',
  ROLE = 'role',
  PRODUCT = 'product',
  AUDIT_LOG = 'audit_log',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  HARD_DELETE = 'hard_delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  EMAIL_VERIFIED = 'email_verified',
}

export enum NotificationChannel {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum OtpType {
  RESET_PASSWORD = 'RESET_PASSWORD',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
}
