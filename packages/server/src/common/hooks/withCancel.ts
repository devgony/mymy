import { Observable } from 'rxjs';

export function withCancel<T>(
  asyncIterator: AsyncIterator<T | undefined>,
  onCancel: () => void,
): AsyncIterator<T | undefined> {
  if (!asyncIterator.return) {
    asyncIterator.return = () =>
      Promise.resolve({ value: undefined, done: true });
  }

  const savedReturn = asyncIterator.return.bind(asyncIterator);
  asyncIterator.return = () => {
    onCancel();
    return savedReturn();
  };

  return asyncIterator;
}

interface PubSub {
  publish: (trigger: string, data: any) => void;
  asyncIterator: (trigger: string) => AsyncIterator<{}>;
}

export function withObservable<T>(
  observable: Observable<T>,
  pubSub: PubSub,
  trigger: string,
) {
  const subscription = observable.subscribe((data) => {
    pubSub.publish(trigger, {
      [trigger]: data,
    });
  });

  return withCancel(pubSub.asyncIterator(trigger), () => {
    subscription.unsubscribe();
  });
}
