import { Controller, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() userId: string) {
    return this.notifications.list(userId);
  }

  // Static routes are declared before any `:id` route so they are never shadowed.
  @Get('unread-count')
  unreadCount(@CurrentUser() userId: string) {
    return this.notifications.unreadCount(userId);
  }

  @Post('read-all')
  @HttpCode(200)
  markAllRead(@CurrentUser() userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Patch(':id/read')
  @HttpCode(200)
  markRead(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.notifications.markRead(userId, id);
  }
}
