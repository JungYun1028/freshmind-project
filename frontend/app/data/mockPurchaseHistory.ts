// 구매이력 더미 데이터 (개발용 - PostgreSQL 대체)
import { PurchaseHistory } from '../types/purchase';

/**
 * 가상 유저 3명의 구매이력 (최근 6개월)
 * - 유저 1 (김지은): 20대 여성, 간편식 선호
 * - 유저 2 (박민수): 30대 남성, 밀키트·해산물 선호  
 * - 유저 3 (이영희): 40대 여성, 건강식·채소 선호
 */
export const mockPurchaseHistory: PurchaseHistory[] = [
  // 유저 1 (김지은) - 18건
  { userId: 1, productId: 23, quantity: 2, purchasedAt: '2025-12-29T19:47:51' },
  { userId: 1, productId: 24, quantity: 2, purchasedAt: '2025-12-07T21:35:30' },
  { userId: 1, productId: 41, quantity: 2, purchasedAt: '2025-11-29T20:17:24' },
  { userId: 1, productId: 90, quantity: 2, purchasedAt: '2025-11-18T21:06:58' },
  { userId: 1, productId: 42, quantity: 3, purchasedAt: '2025-11-08T21:43:33' },
  { userId: 1, productId: 90, quantity: 3, purchasedAt: '2025-10-26T19:59:44' },
  { userId: 1, productId: 23, quantity: 1, purchasedAt: '2025-10-15T19:07:29' },
  { userId: 1, productId: 42, quantity: 1, purchasedAt: '2025-10-04T21:38:48' },
  { userId: 1, productId: 42, quantity: 1, purchasedAt: '2025-09-25T19:51:10' },
  { userId: 1, productId: 41, quantity: 3, purchasedAt: '2025-09-17T19:17:13' },
  { userId: 1, productId: 41, quantity: 3, purchasedAt: '2025-09-07T19:16:13' },
  { userId: 1, productId: 24, quantity: 3, purchasedAt: '2025-08-28T18:59:56' },
  { userId: 1, productId: 24, quantity: 2, purchasedAt: '2025-08-17T21:08:21' },
  { userId: 1, productId: 42, quantity: 3, purchasedAt: '2025-08-08T18:48:49' },
  { userId: 1, productId: 23, quantity: 2, purchasedAt: '2025-07-29T19:13:35' },
  { userId: 1, productId: 42, quantity: 2, purchasedAt: '2025-07-20T20:44:15' },
  { userId: 1, productId: 23, quantity: 2, purchasedAt: '2025-07-11T21:57:13' },
  { userId: 1, productId: 23, quantity: 1, purchasedAt: '2025-12-17T18:10:13' },

  // 유저 2 (박민수) - 16건
  { userId: 2, productId: 11, quantity: 2, purchasedAt: '2026-01-06T19:36:54' },
  { userId: 2, productId: 25, quantity: 2, purchasedAt: '2025-12-28T18:26:31' },
  { userId: 2, productId: 62, quantity: 1, purchasedAt: '2025-12-15T20:25:09' },
  { userId: 2, productId: 25, quantity: 3, purchasedAt: '2025-12-02T21:23:18' },
  { userId: 2, productId: 11, quantity: 3, purchasedAt: '2025-11-17T19:53:13' },
  { userId: 2, productId: 25, quantity: 3, purchasedAt: '2025-11-02T21:22:34' },
  { userId: 2, productId: 62, quantity: 2, purchasedAt: '2025-10-21T20:15:44' },
  { userId: 2, productId: 42, quantity: 2, purchasedAt: '2025-10-06T21:31:01' },
  { userId: 2, productId: 12, quantity: 1, purchasedAt: '2025-09-23T19:49:15' },
  { userId: 2, productId: 25, quantity: 3, purchasedAt: '2025-09-13T20:12:23' },
  { userId: 2, productId: 12, quantity: 1, purchasedAt: '2025-09-02T20:07:26' },
  { userId: 2, productId: 25, quantity: 1, purchasedAt: '2025-08-23T19:24:10' },
  { userId: 2, productId: 25, quantity: 3, purchasedAt: '2025-08-14T20:28:00' },
  { userId: 2, productId: 12, quantity: 2, purchasedAt: '2025-08-05T20:35:55' },
  { userId: 2, productId: 25, quantity: 3, purchasedAt: '2025-07-26T19:33:08' },
  { userId: 2, productId: 11, quantity: 1, purchasedAt: '2025-07-11T21:28:38' },

  // 유저 3 (이영희) - 21건
  { userId: 3, productId: 25, quantity: 2, purchasedAt: '2025-12-31T19:49:51' },
  { userId: 3, productId: 25, quantity: 4, purchasedAt: '2025-12-23T20:44:20' },
  { userId: 3, productId: 2, quantity: 2, purchasedAt: '2025-12-18T21:27:19' },
  { userId: 3, productId: 41, quantity: 4, purchasedAt: '2025-12-10T19:56:03' },
  { userId: 3, productId: 25, quantity: 4, purchasedAt: '2025-11-30T20:40:19' },
  { userId: 3, productId: 5, quantity: 3, purchasedAt: '2025-11-19T18:02:25' },
  { userId: 3, productId: 41, quantity: 4, purchasedAt: '2025-11-12T20:33:10' },
  { userId: 3, productId: 5, quantity: 2, purchasedAt: '2025-11-02T19:28:59' },
  { userId: 3, productId: 1, quantity: 2, purchasedAt: '2025-10-26T18:41:09' },
  { userId: 3, productId: 25, quantity: 3, purchasedAt: '2025-10-21T21:45:04' },
  { userId: 3, productId: 1, quantity: 3, purchasedAt: '2025-10-16T20:20:09' },
  { userId: 3, productId: 25, quantity: 2, purchasedAt: '2025-10-07T21:30:04' },
  { userId: 3, productId: 25, quantity: 2, purchasedAt: '2025-09-27T20:03:07' },
  { userId: 3, productId: 25, quantity: 4, purchasedAt: '2025-09-16T18:42:05' },
  { userId: 3, productId: 5, quantity: 2, purchasedAt: '2025-09-07T20:21:56' },
  { userId: 3, productId: 1, quantity: 4, purchasedAt: '2025-08-28T19:53:15' },
  { userId: 3, productId: 1, quantity: 4, purchasedAt: '2025-08-18T18:50:52' },
  { userId: 3, productId: 2, quantity: 2, purchasedAt: '2025-08-07T19:44:53' },
  { userId: 3, productId: 1, quantity: 2, purchasedAt: '2025-07-29T18:52:23' },
  { userId: 3, productId: 25, quantity: 3, purchasedAt: '2025-07-19T20:58:34' },
  { userId: 3, productId: 25, quantity: 4, purchasedAt: '2025-07-11T21:23:41' },

  // ========== 새로 추가된 상품 구매이력 (ID: 126-175) ==========
  // 유저 1 (김지은) - 새로 추가된 상품 구매이력 50건 (간편식, 냉동식품, 레토르트 선호)
  { userId: 1, productId: 161, quantity: 1, purchasedAt: '2025-07-14T19:34:37' },
  { userId: 1, productId: 175, quantity: 2, purchasedAt: '2025-07-15T16:36:17' },
  { userId: 1, productId: 168, quantity: 2, purchasedAt: '2025-07-19T19:18:40' },
  { userId: 1, productId: 166, quantity: 1, purchasedAt: '2025-07-22T15:56:51' },
  { userId: 1, productId: 175, quantity: 1, purchasedAt: '2025-07-26T16:45:20' },
  { userId: 1, productId: 164, quantity: 2, purchasedAt: '2025-07-27T15:37:21' },
  { userId: 1, productId: 175, quantity: 2, purchasedAt: '2025-07-28T17:39:56' },
  { userId: 1, productId: 164, quantity: 1, purchasedAt: '2025-07-30T17:19:00' },
  { userId: 1, productId: 161, quantity: 1, purchasedAt: '2025-07-30T19:16:51' },
  { userId: 1, productId: 172, quantity: 1, purchasedAt: '2025-08-04T16:39:03' },
  { userId: 1, productId: 171, quantity: 2, purchasedAt: '2025-08-09T18:19:45' },
  { userId: 1, productId: 175, quantity: 2, purchasedAt: '2025-08-11T17:24:54' },
  { userId: 1, productId: 168, quantity: 2, purchasedAt: '2025-08-15T19:28:26' },
  { userId: 1, productId: 168, quantity: 1, purchasedAt: '2025-08-18T15:18:21' },
  { userId: 1, productId: 153, quantity: 1, purchasedAt: '2025-08-20T15:41:33' },
  { userId: 1, productId: 151, quantity: 2, purchasedAt: '2025-08-26T18:16:13' },
  { userId: 1, productId: 156, quantity: 1, purchasedAt: '2025-09-03T17:07:11' },
  { userId: 1, productId: 153, quantity: 1, purchasedAt: '2025-09-06T15:48:59' },
  { userId: 1, productId: 166, quantity: 2, purchasedAt: '2025-09-06T16:09:07' },
  { userId: 1, productId: 170, quantity: 1, purchasedAt: '2025-09-09T19:28:58' },
  { userId: 1, productId: 161, quantity: 1, purchasedAt: '2025-09-17T17:10:23' },
  { userId: 1, productId: 165, quantity: 2, purchasedAt: '2025-09-21T15:23:43' },
  { userId: 1, productId: 164, quantity: 2, purchasedAt: '2025-09-25T15:31:09' },
  { userId: 1, productId: 173, quantity: 1, purchasedAt: '2025-09-27T15:47:54' },
  { userId: 1, productId: 168, quantity: 1, purchasedAt: '2025-09-28T18:23:08' },
  { userId: 1, productId: 172, quantity: 1, purchasedAt: '2025-10-03T15:57:44' },
  { userId: 1, productId: 167, quantity: 1, purchasedAt: '2025-10-06T18:41:48' },
  { userId: 1, productId: 166, quantity: 2, purchasedAt: '2025-10-09T18:53:21' },
  { userId: 1, productId: 153, quantity: 2, purchasedAt: '2025-10-10T19:22:42' },
  { userId: 1, productId: 151, quantity: 1, purchasedAt: '2025-10-12T18:28:47' },
  { userId: 1, productId: 174, quantity: 1, purchasedAt: '2025-10-20T17:36:41' },
  { userId: 1, productId: 156, quantity: 1, purchasedAt: '2025-10-22T16:49:47' },
  { userId: 1, productId: 173, quantity: 2, purchasedAt: '2025-10-22T18:58:16' },
  { userId: 1, productId: 174, quantity: 2, purchasedAt: '2025-10-24T18:14:56' },
  { userId: 1, productId: 157, quantity: 1, purchasedAt: '2025-10-30T17:13:04' },
  { userId: 1, productId: 151, quantity: 1, purchasedAt: '2025-11-03T18:38:44' },
  { userId: 1, productId: 153, quantity: 2, purchasedAt: '2025-11-07T19:55:40' },
  { userId: 1, productId: 164, quantity: 2, purchasedAt: '2025-11-10T18:36:59' },
  { userId: 1, productId: 165, quantity: 1, purchasedAt: '2025-11-16T15:25:04' },
  { userId: 1, productId: 151, quantity: 2, purchasedAt: '2025-11-24T16:03:52' },
  { userId: 1, productId: 168, quantity: 1, purchasedAt: '2025-12-12T15:18:55' },
  { userId: 1, productId: 164, quantity: 1, purchasedAt: '2025-12-19T18:20:03' },
  { userId: 1, productId: 174, quantity: 2, purchasedAt: '2025-12-23T17:40:14' },
  { userId: 1, productId: 152, quantity: 2, purchasedAt: '2025-12-24T17:04:11' },
  { userId: 1, productId: 171, quantity: 1, purchasedAt: '2025-12-29T16:35:08' },
  { userId: 1, productId: 163, quantity: 2, purchasedAt: '2025-12-29T17:25:22' },
  { userId: 1, productId: 174, quantity: 1, purchasedAt: '2025-12-30T18:13:30' },
  { userId: 1, productId: 161, quantity: 1, purchasedAt: '2025-12-30T18:43:52' },
  { userId: 1, productId: 166, quantity: 1, purchasedAt: '2026-01-01T18:04:11' },
  { userId: 1, productId: 163, quantity: 2, purchasedAt: '2026-01-06T15:59:11' },

  // 유저 2 (박민수) - 새로 추가된 상품 구매이력 50건 (밀키트, 해산물, 찌개류, 볶음류 선호)
  { userId: 2, productId: 132, quantity: 3, purchasedAt: '2025-07-19T16:46:04' },
  { userId: 2, productId: 138, quantity: 2, purchasedAt: '2025-07-19T19:00:22' },
  { userId: 2, productId: 126, quantity: 3, purchasedAt: '2025-07-30T19:43:20' },
  { userId: 2, productId: 134, quantity: 2, purchasedAt: '2025-07-31T18:52:02' },
  { userId: 2, productId: 134, quantity: 3, purchasedAt: '2025-08-01T19:54:28' },
  { userId: 2, productId: 126, quantity: 3, purchasedAt: '2025-08-09T15:39:32' },
  { userId: 2, productId: 155, quantity: 2, purchasedAt: '2025-08-11T16:21:17' },
  { userId: 2, productId: 135, quantity: 3, purchasedAt: '2025-08-13T15:28:17' },
  { userId: 2, productId: 126, quantity: 3, purchasedAt: '2025-08-14T18:33:11' },
  { userId: 2, productId: 128, quantity: 3, purchasedAt: '2025-08-15T17:27:12' },
  { userId: 2, productId: 132, quantity: 3, purchasedAt: '2025-08-15T19:46:42' },
  { userId: 2, productId: 142, quantity: 2, purchasedAt: '2025-08-16T20:13:27' },
  { userId: 2, productId: 149, quantity: 2, purchasedAt: '2025-08-26T16:04:19' },
  { userId: 2, productId: 126, quantity: 2, purchasedAt: '2025-09-03T19:59:04' },
  { userId: 2, productId: 126, quantity: 3, purchasedAt: '2025-09-09T17:55:43' },
  { userId: 2, productId: 152, quantity: 3, purchasedAt: '2025-09-15T16:44:02' },
  { userId: 2, productId: 149, quantity: 3, purchasedAt: '2025-09-15T16:52:58' },
  { userId: 2, productId: 149, quantity: 3, purchasedAt: '2025-09-16T20:12:42' },
  { userId: 2, productId: 129, quantity: 2, purchasedAt: '2025-09-25T18:48:55' },
  { userId: 2, productId: 145, quantity: 3, purchasedAt: '2025-09-28T16:43:06' },
  { userId: 2, productId: 154, quantity: 3, purchasedAt: '2025-09-29T19:59:11' },
  { userId: 2, productId: 141, quantity: 2, purchasedAt: '2025-10-02T19:36:29' },
  { userId: 2, productId: 127, quantity: 3, purchasedAt: '2025-10-13T15:59:42' },
  { userId: 2, productId: 145, quantity: 3, purchasedAt: '2025-10-13T18:20:47' },
  { userId: 2, productId: 129, quantity: 2, purchasedAt: '2025-10-16T15:40:32' },
  { userId: 2, productId: 132, quantity: 2, purchasedAt: '2025-10-17T15:54:37' },
  { userId: 2, productId: 152, quantity: 2, purchasedAt: '2025-10-17T18:46:24' },
  { userId: 2, productId: 144, quantity: 3, purchasedAt: '2025-10-20T18:21:38' },
  { userId: 2, productId: 154, quantity: 2, purchasedAt: '2025-10-23T16:39:03' },
  { userId: 2, productId: 139, quantity: 2, purchasedAt: '2025-10-24T16:22:13' },
  { userId: 2, productId: 132, quantity: 3, purchasedAt: '2025-10-30T15:53:36' },
  { userId: 2, productId: 145, quantity: 2, purchasedAt: '2025-10-30T16:42:29' },
  { userId: 2, productId: 143, quantity: 2, purchasedAt: '2025-10-30T17:02:49' },
  { userId: 2, productId: 130, quantity: 3, purchasedAt: '2025-11-06T16:33:35' },
  { userId: 2, productId: 139, quantity: 2, purchasedAt: '2025-11-14T17:05:00' },
  { userId: 2, productId: 127, quantity: 3, purchasedAt: '2025-11-15T20:08:23' },
  { userId: 2, productId: 152, quantity: 3, purchasedAt: '2025-11-18T20:09:00' },
  { userId: 2, productId: 128, quantity: 3, purchasedAt: '2025-11-24T18:08:38' },
  { userId: 2, productId: 138, quantity: 3, purchasedAt: '2025-11-27T16:37:30' },
  { userId: 2, productId: 133, quantity: 3, purchasedAt: '2025-11-27T18:37:20' },
  { userId: 2, productId: 133, quantity: 3, purchasedAt: '2025-11-30T19:49:57' },
  { userId: 2, productId: 141, quantity: 2, purchasedAt: '2025-12-04T19:44:08' },
  { userId: 2, productId: 149, quantity: 3, purchasedAt: '2025-12-09T15:45:37' },
  { userId: 2, productId: 127, quantity: 2, purchasedAt: '2025-12-13T18:36:42' },
  { userId: 2, productId: 137, quantity: 3, purchasedAt: '2025-12-13T19:35:57' },
  { userId: 2, productId: 149, quantity: 3, purchasedAt: '2025-12-15T17:25:21' },
  { userId: 2, productId: 143, quantity: 3, purchasedAt: '2025-12-22T15:35:58' },
  { userId: 2, productId: 131, quantity: 3, purchasedAt: '2026-01-03T19:19:37' },
  { userId: 2, productId: 132, quantity: 2, purchasedAt: '2026-01-07T18:27:02' },
  { userId: 2, productId: 126, quantity: 2, purchasedAt: '2026-01-10T19:30:32' },

  // 유저 3 (이영희) - 새로 추가된 상품 구매이력 50건 (건강식, 밀키트, 냉동식품, 가족 단위 선호)
  { userId: 3, productId: 133, quantity: 3, purchasedAt: '2025-07-15T18:49:12' },
  { userId: 3, productId: 126, quantity: 4, purchasedAt: '2025-07-17T16:23:07' },
  { userId: 3, productId: 132, quantity: 2, purchasedAt: '2025-07-17T19:13:04' },
  { userId: 3, productId: 129, quantity: 3, purchasedAt: '2025-07-22T16:35:39' },
  { userId: 3, productId: 153, quantity: 2, purchasedAt: '2025-07-25T19:16:41' },
  { userId: 3, productId: 138, quantity: 4, purchasedAt: '2025-07-27T16:38:43' },
  { userId: 3, productId: 152, quantity: 3, purchasedAt: '2025-08-03T15:34:26' },
  { userId: 3, productId: 126, quantity: 2, purchasedAt: '2025-08-08T17:28:36' },
  { userId: 3, productId: 137, quantity: 4, purchasedAt: '2025-08-19T17:16:39' },
  { userId: 3, productId: 138, quantity: 3, purchasedAt: '2025-08-23T16:09:49' },
  { userId: 3, productId: 168, quantity: 2, purchasedAt: '2025-08-26T15:46:44' },
  { userId: 3, productId: 129, quantity: 4, purchasedAt: '2025-09-06T15:47:20' },
  { userId: 3, productId: 168, quantity: 3, purchasedAt: '2025-09-09T18:35:22' },
  { userId: 3, productId: 168, quantity: 2, purchasedAt: '2025-09-11T19:32:28' },
  { userId: 3, productId: 130, quantity: 4, purchasedAt: '2025-09-19T15:25:47' },
  { userId: 3, productId: 153, quantity: 3, purchasedAt: '2025-09-23T17:16:40' },
  { userId: 3, productId: 139, quantity: 2, purchasedAt: '2025-09-24T16:00:31' },
  { userId: 3, productId: 132, quantity: 3, purchasedAt: '2025-09-28T15:18:03' },
  { userId: 3, productId: 168, quantity: 4, purchasedAt: '2025-09-30T15:52:37' },
  { userId: 3, productId: 137, quantity: 3, purchasedAt: '2025-10-05T18:46:21' },
  { userId: 3, productId: 139, quantity: 2, purchasedAt: '2025-10-10T15:37:15' },
  { userId: 3, productId: 138, quantity: 4, purchasedAt: '2025-10-10T19:54:45' },
  { userId: 3, productId: 137, quantity: 4, purchasedAt: '2025-10-15T19:36:07' },
  { userId: 3, productId: 151, quantity: 4, purchasedAt: '2025-10-19T19:40:35' },
  { userId: 3, productId: 139, quantity: 3, purchasedAt: '2025-10-20T15:46:42' },
  { userId: 3, productId: 169, quantity: 4, purchasedAt: '2025-10-31T19:56:39' },
  { userId: 3, productId: 136, quantity: 4, purchasedAt: '2025-11-03T17:45:32' },
  { userId: 3, productId: 137, quantity: 4, purchasedAt: '2025-11-13T15:22:04' },
  { userId: 3, productId: 151, quantity: 4, purchasedAt: '2025-11-14T17:13:46' },
  { userId: 3, productId: 126, quantity: 3, purchasedAt: '2025-11-14T19:12:24' },
  { userId: 3, productId: 139, quantity: 2, purchasedAt: '2025-11-15T17:53:11' },
  { userId: 3, productId: 139, quantity: 3, purchasedAt: '2025-11-16T16:30:08' },
  { userId: 3, productId: 130, quantity: 2, purchasedAt: '2025-11-17T17:03:49' },
  { userId: 3, productId: 136, quantity: 4, purchasedAt: '2025-11-20T19:24:28' },
  { userId: 3, productId: 169, quantity: 2, purchasedAt: '2025-11-23T17:26:21' },
  { userId: 3, productId: 153, quantity: 2, purchasedAt: '2025-11-26T16:38:14' },
  { userId: 3, productId: 153, quantity: 4, purchasedAt: '2025-11-28T18:26:16' },
  { userId: 3, productId: 130, quantity: 4, purchasedAt: '2025-11-29T17:29:25' },
  { userId: 3, productId: 168, quantity: 2, purchasedAt: '2025-11-30T18:16:55' },
  { userId: 3, productId: 137, quantity: 3, purchasedAt: '2025-12-02T17:06:24' },
  { userId: 3, productId: 126, quantity: 2, purchasedAt: '2025-12-02T20:04:04' },
  { userId: 3, productId: 129, quantity: 3, purchasedAt: '2025-12-08T17:06:40' },
  { userId: 3, productId: 137, quantity: 3, purchasedAt: '2025-12-12T17:27:14' },
  { userId: 3, productId: 135, quantity: 2, purchasedAt: '2025-12-13T16:06:38' },
  { userId: 3, productId: 139, quantity: 2, purchasedAt: '2025-12-28T17:43:24' },
  { userId: 3, productId: 129, quantity: 3, purchasedAt: '2026-01-01T16:51:51' },
  { userId: 3, productId: 131, quantity: 3, purchasedAt: '2026-01-03T19:11:40' },
  { userId: 3, productId: 126, quantity: 4, purchasedAt: '2026-01-06T16:03:06' },
  { userId: 3, productId: 168, quantity: 4, purchasedAt: '2026-01-07T18:41:15' },
  { userId: 3, productId: 139, quantity: 3, purchasedAt: '2026-01-08T17:21:14' },
];

/**
 * 특정 유저의 구매이력 조회
 */
export const getPurchaseHistoryByUserId = (userId: number): PurchaseHistory[] => {
  return mockPurchaseHistory.filter(p => p.userId === userId);
};

/**
 * 특정 상품의 구매이력 조회
 */
export const getPurchaseHistoryByProductId = (productId: number): PurchaseHistory[] => {
  return mockPurchaseHistory.filter(p => p.productId === productId);
};

/**
 * 최근 N일 내 구매이력 조회 (로컬 버전 호환성 유지)
 */
export const getRecentPurchaseHistory = (userId: number, days: number = 60): PurchaseHistory[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return mockPurchaseHistory.filter(item => {
    if (item.userId !== userId) return false;
    const purchaseDate = new Date(item.purchasedAt);
    return purchaseDate >= cutoffDate;
  });
};

/**
 * 유저가 최근 구매한 상품 ID 목록 (중복 제거)
 */
export const getRecentPurchasedProductIds = (userId: number, limit: number = 10): number[] => {
  const userPurchases = getPurchaseHistoryByUserId(userId)
    .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
  
  const uniqueProductIds = [...new Set(userPurchases.map(p => p.productId))];
  return uniqueProductIds.slice(0, limit);
};

/**
 * 유저가 자주 구매하는 상품 ID 목록 (구매 횟수 순)
 */
export const getFrequentlyPurchasedProductIds = (userId: number, limit: number = 5): number[] => {
  const userPurchases = getPurchaseHistoryByUserId(userId);
  
  // 상품별 구매 횟수 계산
  const productCount = new Map<number, number>();
  userPurchases.forEach(p => {
    productCount.set(p.productId, (productCount.get(p.productId) || 0) + 1);
  });
  
  // 구매 횟수 순으로 정렬
  return Array.from(productCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([productId]) => productId);
};

/**
 * 유저의 총 구매 건수
 */
export const getTotalPurchaseCount = (userId: number): number => {
  return getPurchaseHistoryByUserId(userId).length;
};

/**
 * 유저의 마지막 구매 날짜
 */
export const getLastPurchaseDate = (userId: number): string | null => {
  const userPurchases = getPurchaseHistoryByUserId(userId);
  if (userPurchases.length === 0) return null;
  
  const sorted = userPurchases.sort((a, b) => 
    new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
  );
  
  return sorted[0].purchasedAt;
};

/**
 * 유저가 구매한 적 있는 상품인지 확인
 */
export const hasPurchasedProduct = (userId: number, productId: number): boolean => {
  return mockPurchaseHistory.some(p => p.userId === userId && p.productId === productId);
};

