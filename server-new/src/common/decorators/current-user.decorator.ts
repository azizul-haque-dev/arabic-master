import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Lets a controller just write @CurrentUser() user instead of digging
// through req.user itself every time.
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  },
);
