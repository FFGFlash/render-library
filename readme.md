## Usage

### Signal

Signals are a powerful tool for state management and DOM manipulation.

```ts
const button = document.getElementById("button")!;

const count = signal(0); // or new Signal(...);

// We subsribe to the signal to listen for when the value changes.
count.subscribe(() => {
  button.innerText = `Count: ${count.value}`;
});

button.addEventListener("click", () => {
  count.value++; // You can set the value of signals just like a normal variable
});
```

### Effect

Effects are callbacks that run as side-effects to signals changing.

```ts
const nextBtn = document.getElementById("next")!;
const prevBtn = document.getElementById("prev")!;
const title = document.getElementById("title")!;
const body = document.getElementById("body")!;

const postId = signal(0);
const post = signal<{
  userId: number;
  id: number;
  title: string;
  body: string;
}>();

post.subscribe(() => {
  title.innerText = post.value.title;
  body.innerText = post.value.body;
});

effect(() => {
  const controller = new AbortController();
  fetch(`https://jsonplaceholder.typicode.com/posts/${postId.value}`, {
    signal: controller.signal,
  })
    .then((r) => r.json())
    .then((post) => (post.value = post));
  return () => controller.abort();
}); // or new Effect(...)

nextBtn.addEventListener("click", () => {
  postId.value++;
});

prevBtn.addEventListener("click", () => {
  postId.value--;
});
```

### Computed

Computed are read-only signals that use the value of other signals to determine it's own value.

```ts
const inputA = document.getElementById("input_a")!;
const inputB = document.getElementById("input_b")!;
const output = document.getElementById("output")!;

const valueA = signal(1);
const valueB = signal(2);
const sum = computed(() => valueA.value + valueB.value); // or new Computed(...);

// Just like signals we can subscribe to listen for when the sum's value changes.
sum.subscribe(() => {
  output.innerText = `${sum.value}`;
});

inputA.addEventListener("change", (e) => {
  const value = Number(e.currentTarget.value);
  if (isNaN(value)) return;
  valueA.value = value;
});

inputB.addEventListener("change", (e) => {
  const value = Number(e.currentTarget.value);
  if (isNaN(value)) return;
  valueB.value = value;
});
```

### Batch

Batching allows us to update multiple signals without immediately triggering side effects, let us more efficiently trigger updates.

```ts
const output = document.getElementById("output")!;
const form = document.getElementById("form")!;

const valueA = signal(1);
const valueB = signal(2);
const sum = computed(() => valueA.value + valueB.value); // or new Computed(...);

// Just like signals we can subscribe to listen for when the sum's value changes.
sum.subscribe(() => {
  output.innerText = `${sum.value}`;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  let _valueA = data.get("a");
  let _valueB = data.get("b");
  if (!_valueA || !_valueB) return;
  _valueA = Number(_valueA);
  _valueB = Number(_valueB);
  if (isNaN(_valueA) || isNaN(_valueB)) return;
  batch(() => {
    valueA.value = _valueA;
    valueB.value = _valueB;
  }); // or Signal.batch(...); or Signal.startBatch();...Signal.endBatch();
});
```

### Signal API

These are API functions and intended for use by libraries, not for applications.

```ts
Signal.oncreate = (signal) => console.log("Signal Created:", signal);
Signal.ontrack = (signal) => console.log("Signal Requested Tracking:", signal);
Signal.ondispose = (signal) => console.log("Signal Disposed:", signal);

function track<T>(fn: () => T): {
  result: T;
  signals: Set<Signal>;
  effects: Set<Effect>;
} {
  const signals = new Set<Signal>();
  const prevCreateSignal = Signal.oncreate;
  Signal.oncreate = (signal) => {
    signals.add(signal);
    signal.ondispose = () => signals.delete(signal);
  };

  const effects = new Set<Effect>();
  const prevCreateEffect = Effect.oncreate;
  Effect.oncreate = (effect) => {
    effects.add(effect);
    effect.ondispose = () => effects.delete(effect);
  };

  const result = fn();

  Signal.oncreate = prevCreateSignal;
  Effect.oncreate = prevCreateEffect;

  return { result, signals, effects };
}

const {
  result: button,
  signals,
  effects,
} = track(() => {
  const count = signal(0);

  const button = document.getElementById("button");

  effect(() => {
    button.innerText = `Count: ${count.value}`;
  });

  button.addEventListener("click", () => {
    count.value++;
  });

  button.innerText = `Count: ${count.value}`;

  return button;
});

console.log(
  button,
  "has the following signals and effects\n",
  signals,
  "\n",
  effects
);
```
