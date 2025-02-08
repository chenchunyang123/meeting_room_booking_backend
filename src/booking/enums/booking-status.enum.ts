export enum BookingStatus {
  PENDING = '0', // 申请中
  APPROVED = '1', // 审批通过
  REJECTED = '2', // 审批驳回
  CANCELLED = '3', // 已解除
}

// 用于显示的中文映射
export const BookingStatusLabel = {
  [BookingStatus.PENDING]: '申请中',
  [BookingStatus.APPROVED]: '审批通过',
  [BookingStatus.REJECTED]: '审批驳回',
  [BookingStatus.CANCELLED]: '已解除',
} as const;
