export abstract class BaseEvent {
  public readonly createdAt: Date;
  public readonly eventName: string;

  protected constructor(name: string) {
    this.createdAt = new Date();
    this.eventName = name;
  }
}
