export default class TaskLock {
  #lock: Promise<void> = Promise.resolve();
  #locked = false;

  async task<T>(task: () => Promise<T>): Promise<T> {
    this.#locked = true;
    const { promise: nextLock, resolve: unlock } =
      Promise.withResolvers<void>();

    const retVal = this.#lock.then(async () => {
      try {
        return await task();
      } finally {
        unlock();
        this.#locked = false;
      }
    });

    this.#lock = nextLock;

    return retVal;
  }

  get isLocked() {
    return this.#locked;
  }
}
