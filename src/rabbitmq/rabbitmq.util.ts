export function generateQueueName(
  consumerModule: string,
  producerModule: string,
) {
  return [consumerModule, producerModule, 'event', 'queue'].join('.');
}

export function generateBindingKey(producerModule: string) {
  return [producerModule, 'event', '#'].join('.');
}

export function generateRoutingKey(producerModule: string, eventName: string) {
  return [producerModule, 'event', eventName].join('.');
}
