/**
 * A lock that can be used to prevent multiple tasks from running at the same time.
 */
export default class TaskLock {
  #lock: Promise<void> = Promise.resolve();
  #locked = false;

  /**
   * Run a task once the lock is available and return the result
   * @param task The task to run
   * @returns The return value of the task
   */
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

  /**
   * Whether the lock is currently locked
   */
  get isLocked() {
    return this.#locked;
  }
}
