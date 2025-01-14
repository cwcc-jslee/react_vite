// src/shared/services/notification.js
/**
 * 기본 알림 서비스
 */
class NotificationService {
  success(message) {
    alert(message); // 추후 toast 등으로 교체 가능
  }

  error(message) {
    alert(`오류: ${message}`);
  }
}

export const notification = new NotificationService();
