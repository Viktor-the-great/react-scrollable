export class NoContentApiError extends Error {
  constructor() {
    super('content api is not defined');
  }
}

export class NoScrollableApiError extends Error {
  constructor() {
    super('scrollable api is not defined');
  }
}