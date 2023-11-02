export abstract class BaseEvent {
  public readonly createdAt: Date;
  public readonly eventName: string;
  public readonly data: Record<string, any>;

  protected constructor(event: string, data: Record<string, any>) {
    this.createdAt = new Date();
    this.eventName = event;
    this.data = data;
  }
}
