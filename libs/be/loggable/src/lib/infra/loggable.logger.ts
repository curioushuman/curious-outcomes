import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggableLogger extends ConsoleLogger {
  public setContext(context: string): void {
    this.context = context;
  }
}
