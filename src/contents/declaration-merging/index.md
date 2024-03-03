---
title: Declaration Merging
published: true
category: typescript
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-06-19
---

# Declaration Merging

> 선언 병합이란 컴파일러가 같은 이름으로 선언된 두개를 하나의 정의로 합치는 것을 말한다.

| 선언 타입 | 네임스페이스 | 타입 | 값 |
| -------- | ----| --| --- |
| 네임스페이스 | X | | X |
| 클래스|  | X | X |
| 열거형|  | X | X |
| 인터페이스 |  | X |  |
| 타입 alias| | X |  |
| 함수|  | | X |
| 변수 |  | | X |

## Interface merge

- 두 선언의 멤버들을 같은 이름의 단일 인터페이스로 결합한다.
- 같은 이름의 멤버가 다른 타입을 가지고 있으면 error가 발생한다.
- 이후에 선언된 인터페이스가 높은 우선순위를 가진다.

```tsx
interface Cloner {
  clone(animal: Animal): Animal;
}
interface Cloner {
  clone(animal: Sheep): Sheep;
}
interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
}
```

```tsx
interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
  clone(animal: Sheep): Sheep;
  clone(animal: Animal): Animal;
}
```

## namespace merge

- 네임스페이스를 병합하기 위해서, 각 네임스페이스에 선언된 export 된 인터페이스로부터 타입 정의가 병합되며, 내부에 병합된 인터페이스 정의가 있는 단일 네임스페이스가 형성된다.
- 네임스페이스가 네임스페이스와 값 둘 다 만든다.

```tsx
namespace Animals {
  export class Zebra {}
}
namespace Animals {
  export interface Legged {
    numberOfLegs: number;
  }
  export class Dog {}
}
```

```tsx
namespace Animals {
  export interface Legged {
    numberOfLegs: number;
  }
  export class Zebra {}
  export class Dog {}
}
```

export하지 않는 멤버를 내부에서 사용하는 경우 주의점

```tsx
namespace Animal {
  let haveMuscles = true;
  export function animalsHaveMuscles() {
    return haveMuscles;
  }
}
namespace Animal {
  export function doAnimalsHaveMuscles() {
    return haveMuscles; // 오류, haveMuscles가 여기에 접근할 수 없기 때문에
  }
}
```

## Class, Function, enum과 namespace의 merge

> namespace는 다른 타입의 유형과 병합이 가능할 정도로 유연하다.

패턴과 같다. typescript는 선언 병합을 통해서 타입을 안전하게 보존하며 정의할 수 있다.

### merging namespace with class

```tsx
class Album {
  label: Album.AlbumLabel;
}
namespace Album {
  export class AlbumLabel {}
}
```

다른 클래스 내에서 관리되는 클래스. namespace를 사용해서 기존 클래스에 정적 멤버를 추가할 수 있다.

### merging namespace with function

```tsx
function buildLabel(name: string): string {
  return buildLabel.prefix + name + buildLabel.suffix;
}
namespace buildLabel {
  export let suffix = "";
  export let prefix = "Hello, ";
}
console.log(buildLabel("Sam Smith"));
```

### merging namespace with enum

```tsx
enum Color {
  red = 1,
  green = 2,
  blue = 4,
}
namespace Color {
  export function mixColor(colorName: string) {
    if (colorName == "yellow") {
      return Color.red + Color.green;
    } else if (colorName == "white") {
      return Color.red + Color.green + Color.blue;
    } else if (colorName == "magenta") {
      return Color.red + Color.blue;
    } else if (colorName == "cyan") {
      return Color.green + Color.blue;
    }
  }
}
```

## 모듈 보강

```tsx
// observable.ts
export class Observable<T> {
  // ... 연습을 위해 남겨둠 ...
}
// map.ts
import { Observable } from "./observable";

declare module "./observable" {
  interface Observable<T> {
    map<U>(f: (x: T) => U): Observable<U>;
  }
}

Observable.prototype.map = function (f) {
  // ... 연습을 위해 남겨둠
};

// consumer.ts
import { Observable } from "./observable";
import "./map";

let o: Observable<number>;
o.map((x) => x.toFixed());
```

위 상황은 Observable을 import해서 prototype에 map을 추가했을 때 consumer에서 type을 알 수 없다.

따라서 Observable을 merge를 통해서 map을 보강해준다.

## 전역 보강

```tsx
// observable.ts
export class Observable<T> {
  // ... 연습을 위해 남겨둠 ...
}
declare global {
  interface Array<T> {
    toObservable(): Observable<T>;
  }
}
Array.prototype.toObservable = function () {
  // ...
};
```

모듈 내부에서 전역 스코프에 선언을 추가해줄 수 있다.

## disallowed merges

클래스는 다른 클래스나 변수와 병합할 수 없다.