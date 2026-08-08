---
title: Three.js, WebGL and WebGPU
published: true
category: three.js
subtitle: The difference between the WebGL and WebGPU that Three.js runs on and comparing the state machine and pipeline approaches
date: 2026-07-22
---

## 개요

---

Three.js는 웹에서 3D 그래픽을 다루기 위한 JavaScript 라이브러리다. 직접 화면에 픽셀을 그리는 것이 아니라, 브라우저가 제공하는 WebGL과 WebGPU라는 저수준 API 위에 올라가 있는 추상화 계층이다.

셰이더를 직접 작성하고 버퍼를 손으로 관리하는 작업을 Scene, Mesh, Material 같은 객체로 감싸주기 때문에, 어떤 API 위에서 동작하는지 몰라도 3D를 그릴 수는 있다. 하지만 성능 문제를 만났을 때 원인이 어디에 있는지 판단하려면 밑에 깔린 두 API의 성격 차이를 알아야 한다.

## WebGL

---

- 오래되었지만 안정적인 웹 3D 표준 API다.
- CPU와 GPU 사이의 통신에 병목 구간이 많다.
- CPU의 응답을 대기하느라 GPU가 놀고 있는 상황이 자주 발생한다.
- **상태 관리 방식**으로 동작한다.

WebGL은 OpenGL ES를 웹으로 가져온 것이라 설계가 2000년대의 것이다. 그리기 직전에 "지금부터 이 버퍼를 쓰고, 이 셰이더를 쓰고, 이 텍스처를 쓴다"를 하나씩 지정하는 구조라서 호출 횟수 자체가 많다.

감을 잡으려고 WebGL2로 삼각형 하나를 직접 그려봤다. 셰이더는 GLSL ES 3.0으로 작성한다.

```jsx
const gl = canvas.getContext('webgl2');

const vsSource = `#version 300 es
  in vec2 a_position;
  in vec3 a_color;

  out vec3 v_color;

  void main() {
    v_color = a_color;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fsSource = `#version 300 es
  precision mediump float;

  in vec3 v_color;
  out vec4 fragColor;

  void main() {
    fragColor = vec4(v_color, 1.0);
  }
`;
```

셰이더는 문자열이라 런타임에 컴파일하고 링크해야 한다. 실패해도 예외가 던져지지 않고 상태 플래그로만 알려주기 때문에, 직접 확인하지 않으면 화면이 까맣게 나오는 이유를 알 수 없다.

```jsx
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('셰이더 컴파일 에러:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
```

정점 데이터는 위치와 색을 한 배열에 섞어 담고, stride와 offset으로 "몇 바이트씩 건너뛰며 읽어라"를 알려준다.

```jsx
// X, Y, R, G, B 순서로 정점 3개
const vertexData = new Float32Array([
   0.0,  0.5,  1.0, 0.0, 0.0, // 상단 (빨강)
  -0.5, -0.5,  0.0, 1.0, 0.0, // 좌하단 (초록)
   0.5, -0.5,  0.0, 0.0, 1.0, // 우하단 (파랑)
]);

const bytesPerElement = Float32Array.BYTES_PER_ELEMENT;
const stride = 5 * bytesPerElement; // 정점 하나당 20바이트

gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, stride, 0);

gl.enableVertexAttribArray(colorLoc);
gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, stride, 2 * bytesPerElement);
```

그리기 직전에 무엇을 쓸지 하나씩 지정하고 draw를 부른다. **이 나열이 곧 상태 관리 방식이다.**

```jsx
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.08, 0.08, 0.08, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);
gl.bindVertexArray(vao);

gl.drawArrays(gl.TRIANGLES, 0, 3);
```

<div align='center'>
<img src="/images/posts/threejs-webgl-webgpu/image.png" width="60%" />
</div>

결과가 이렇게 나온다. 정점 3개에 빨강, 초록, 파랑을 각각 지정했을 뿐인데 그 사이가 부드럽게 섞여 있다.

이게 **attribute의 성질**이다. 색은 정점마다 하나씩만 준 값인데, vertex shader가 `v_color`로 내보낸 값이 fragment shader로 넘어가면서 삼각형 내부의 픽셀마다 자동으로 보간된다. 픽셀 하나하나의 색을 계산한 코드는 어디에도 없고, GPU가 래스터화 과정에서 채워 넣은 것이다.

애니메이션을 붙이면 이 나열이 매 프레임 반복된다는 게 드러난다. 정점을 흔들고 마우스 좌표를 uniform으로 넘기는 예제를 만들어봤는데, 루프 안에서 프로그램과 VAO를 다시 바인딩하고 uniform을 다시 지정한 뒤에야 draw를 부를 수 있다.

```jsx
function render(time) {
  time *= 0.003;

  updatedPositions[0] = Math.sin(time) * 0.3;
  // ... 정점 갱신

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, updatedPositions);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);      // 매 프레임 다시 지정
  gl.bindVertexArray(vao);     // 매 프레임 다시 지정
  gl.uniform2f(mouseUniformLocation, mousePos[0], mousePos[1]);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(render);
}
```

<div align='center'>
<video src="/videos/posts/threejs-webgl-webgpu/web-gpu.mov" height="400" controls></video>
</div>

정점이 흔들리는 것은 `bufferSubData`로 매 프레임 정점 좌표를 덮어쓰기 때문이고, 색이 마우스를 따라 바뀌는 것은 `u_mouse` uniform 때문이다.

앞의 정지 이미지와 나란히 놓고 보면 attribute와 uniform의 차이가 그대로 드러난다.

| | attribute | uniform |
| --- | --- | --- |
| 값의 단위 | 정점마다 다름 | draw call 전체에서 동일 |
| 화면에서의 결과 | 삼각형 안에서 색이 보간됨 | 삼각형 전체가 한 가지 색 |
| 전달 방법 | 버퍼에 담아 GPU가 꺼내감 | `gl.uniform2f`로 매 프레임 지정 |

영상에서 삼각형이 **단색으로만 칠해지는 이유**가 여기 있다. fragment shader가 `u_mouse` 하나만 보고 색을 정하는데, 이 값은 draw call 하나 안에서는 모든 픽셀에 대해 같기 때문이다. 보간될 여지가 없다.

VAO가 그나마 정점 속성 설정을 하나로 묶어주는 장치다. `vertexAttribPointer` 호출들이 VAO에 기록되어 있어서 `bindVertexArray` 한 번으로 복원된다. 하지만 프로그램, uniform, 텍스처 같은 나머지 상태는 여전히 매 프레임 다시 지정해야 한다. WebGPU의 pipeline은 이 묶음을 훨씬 넓게 가져간 것이라고 보면 된다.

버퍼 갱신에서 한 가지 더. 매 프레임 `new Float32Array()`를 만들면 GC 부담이 되므로 배열을 한 번만 만들어두고 값만 덮어썼고, `bufferData` 대신 `bufferSubData`로 내용만 교체했다. 버퍼를 새로 할당하지 않으므로 VAO에 기록된 포인터 설정이 그대로 유효하다.

## WebGPU

---

- WebGL을 대체하는 최신 3D 표준 API다.
- CPU와 GPU 사이의 병목 구간을 최소화한다.
- GPU를 최대한 사용할 수 있다.
- pipeline을 통한 사전 준비가 가능하다.
- worker(멀티스레드)를 사용한 최적화가 가능하다.
- **파이프라인 방식**으로 동작한다.

WebGPU는 Vulkan, Metal, D3D12 같은 현대 그래픽 API의 설계를 웹으로 가져온 것이다. 셰이더 언어도 GLSL이 아닌 WGSL을 사용한다.

Three.js에서는 `WebGPURenderer`를 사용하면 되고, 브라우저가 WebGPU를 지원하지 않으면 내부적으로 WebGL로 폴백하기 때문에 렌더러 교체만으로 양쪽을 모두 커버할 수 있다.

## 상태 관리 방식과 파이프라인 방식

---

두 API의 성능 차이를 만드는 것은 결국 이 설계 차이다.

**상태 관리**

- 렌더링하고자 하는 순간에 여러 가지 상태를 매번 새롭게 지정해서 렌더링하는 방식
- 지정된 상태가 올바른지 매 프레임마다 CPU가 검사해야 한다.

**파이프라인**

- 미리 무엇을 렌더링할 것인지 정의해두고, 렌더링할 때 언제든 재활용할 수 있는 방식
- 미리 정의해 검증된 상태로 재사용되므로 CPU에 추가적인 부하를 주지 않는다.

| | 상태 관리 (WebGL) | 파이프라인 (WebGPU) |
| --- | --- | --- |
| 상태 지정 시점 | draw call 직전에 매번 | 최초 1회 pipeline 생성 시 |
| 유효성 검사 | 매 프레임 CPU가 검사 | 생성 시점에 1회 검사 |
| 재사용 | 어렵다 | pipeline 객체를 그대로 재사용 |
| 멀티스레드 | 사실상 불가능 | worker에서 command 기록 가능 |

핵심은 **검증 비용을 매 프레임에서 최초 1회로 옮겼다**는 것이다. 상태 조합이 유효한지 확인하는 작업은 CPU가 하는데, 이걸 미리 끝내두면 매 프레임에 남는 일은 "이미 검증된 pipeline을 골라서 제출한다"뿐이다.

## WebGPU의 구성 요소

---

- **adapter**: 실제 물리적 GPU 장치
- **device**: 논리적 GPU 인터페이스로, 실제 GPU와 통신하기 위해 사용
- **shader**: WGSL로 정점의 위치 계산 및 픽셀의 색상 결정
- **pipeline**: 어떤 셰이더를 사용하고 데이터는 어떤 형식이며 어떻게 렌더링할 것인가 같은 규칙을 정의한 객체
- **command encoder**: GPU에 보낼 작업 내역들을 기록함
- **command buffer**: command encoder에 기록된 작업들을 GPU가 실제로 실행할 수 있는 형태로 만든 데이터
- **pass**: render pass와 compute pass가 있으며, encoder가 buffer를 만들 때 저장하는 것
- **queue**: buffer에 저장된 작업을 GPU로 전달할 때 사용하는 통로

<div align='center'>
<img src="/images/posts/threejs-webgl-webgpu/1.png" width="45%" />
<img src="/images/posts/threejs-webgl-webgpu/2.png" width="45%" />
</div>

왼쪽이 실제 흐름이고, 오른쪽은 같은 흐름을 식당에 비유한 것이다. adapter로 주방이 있는지 확인하고, device로 계약을 맺고, pipeline으로 레시피와 메뉴판을 확정한다. 그다음 웨이터(command encoder)가 주문서(pass)를 받아 적고, 주문서를 마감(finish)해서 주방(queue)에 접수하면 GPU가 병렬로 조리한다.

이 비유가 잘 들어맞는 이유는 **주문을 받는 것과 조리하는 것이 분리되어 있다**는 점 때문이다. CPU는 주문서를 적기만 하고, 실제 처리는 GPU가 비동기로 한다. WebGL은 웨이터가 주문 하나 받을 때마다 주방까지 뛰어갔다 오는 구조에 가깝다.

## 좌표 변환 순서

---

정점 하나가 화면의 픽셀 좌표가 되기까지는 정해진 변환 단계를 거친다.

```bash
로컬 정점 → Model 변환 → View 변환 → Projection 변환 → 뷰포트 변환 → 화면 2D 좌표
```

- **Model 변환**: 물체 자신의 좌표계 → 월드 좌표계. 물체의 위치, 회전, 크기가 반영된다.
- **View 변환**: 월드 좌표계 → 카메라 좌표계. 카메라를 원점에 두고 세상을 반대로 움직인다고 보면 된다.
- **Projection 변환**: 카메라 좌표계 → 클립 공간. 원근을 여기서 적용한다.
- **뷰포트 변환**: 클립 공간 → 실제 캔버스 픽셀 좌표

Three.js에서 `mesh.position`을 바꾸는 것은 Model 변환 행렬을 바꾸는 것이고, `camera.position`을 바꾸는 것은 View 변환 행렬을 바꾸는 것이다. `PerspectiveCamera`의 `fov`나 `near`, `far`는 Projection 변환에 해당한다.

## WebGPU 렌더링 코드의 흐름

---

Three.js를 쓰면 아래 과정은 전부 라이브러리가 대신 해준다. 하지만 한 번 훑어보면 Three.js가 무엇을 감춰주고 있는지 감이 잡힌다.

1. GPU 사용 가능한지 확인
2. adapter 확인
3. device get
4. canvas에서 WebGPU 컨텍스트 가져오기
5. 컨텍스트에 device와 format 설정
6. 정점 버퍼 생성 → device queue에 버퍼 저장
7. uniform 버퍼 생성 → device queue에 버퍼 저장
8. 모델 행렬 정의 → device queue에 버퍼 저장
9. 뷰 행렬 정의 → device queue에 버퍼 저장
10. perspective 행렬 정의 → device queue에 버퍼 저장
11. vertex shader, fragment shader 작성
12. uniform으로 bind group layout 설정 (어떤 위치에 어떤 종류의 데이터가 들어오는지에 대한 정보)
13. uniform buffer로 bind group layout에 bind group 연결
14. create shader module로 셰이더 컴파일 → vertex 모듈, fragment 모듈
15. render pipeline 객체 생성
16. command encoder 생성
17. render pass 시작
18. render pass에 pipeline set
19. render pass에 bindGroup set
20. render pass에 vertex buffer set
21. draw
22. device queue submit

1번부터 5번까지를 직접 짜보면 이렇다. WebGL의 `getContext` 한 줄과 달리 단계마다 실패할 수 있어서 확인이 계속 들어간다.

```jsx
if (!navigator.gpu) {
  console.error('not support gpu');
  return;
}

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  console.error('gpu 얻기 실패');
  return;
}

const device = await adapter.requestDevice();
device.lost.then((info) => {
  console.log('device 소실:', info.message);
});

const canvas = document.getElementById('gpuCanvas');
const context = canvas.getContext('webgpu');

const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format, alphaMode: 'opaque' });
```

`device.lost`를 걸어둔 이유는 GPU 디바이스가 런타임에 소실될 수 있기 때문이다. 다른 앱이 GPU를 점유하거나 드라이버가 재시작되면 디바이스가 날아가고, 그 뒤의 모든 호출이 조용히 무시된다. 여기서 로그를 남겨두지 않으면 화면만 멈춘 채 원인을 찾기 어렵다.

버퍼는 용도를 미리 선언하고 만든다. WebGL이 `bindBuffer`로 "지금부터 이 버퍼는 정점용"이라고 그때그때 알려주는 것과 달리, WebGPU는 생성 시점에 `usage`로 못박는다.

```jsx
const vertices = new Float32Array([
  0.0, 0.6, 0.0,
  -0.5, -0.4, 0.0,
  0.5, -0.4, 0.0,
]);

const vertexBuffer = device.createBuffer({
  size: vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(vertexBuffer, 0, vertices);
```

`COPY_DST`를 함께 주는 이유는 `writeBuffer`로 데이터를 써넣을 대상이 되기 때문이다. 용도를 빠뜨리면 생성은 되지만 사용 시점에 검증 에러가 난다. **이 검증이 매 프레임이 아니라 생성 시점에 일어난다는 것**이 파이프라인 방식의 핵심이다.

그리고 매 프레임 반복되는 것은 16번부터 22번까지다.

```jsx
const encoder = device.createCommandEncoder();

const pass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
    },
  ],
});

pass.setPipeline(pipeline);
pass.setBindGroup(0, bindGroup);
pass.setVertexBuffer(0, vertexBuffer);
pass.draw(vertexCount);
pass.end();

device.queue.submit([encoder.finish()]);
```

pipeline과 셰이더 컴파일, 버퍼 생성 같은 무거운 초기화는 최초 1회만 수행하고, 애니메이션이 필요할 경우에는 위의 command 기록과 submit만 반복한다. 이것이 파이프라인 방식이 매 프레임 상태를 재지정하는 방식보다 유리한 이유다.

## 정리

---

Three.js를 쓸 때 직접 이 API를 만질 일은 거의 없다. 그래도 알아두면 판단이 되는 지점이 있다.

- draw call 수가 성능을 좌우한다는 말의 근거가 여기에 있다. 물체 하나가 늘어날 때마다 pipeline 설정과 제출이 한 번씩 늘어난다.
- 그래서 [Three.js Optimizing Many Objects](/posts/Three.js%20Optimizing%20Many%20Objects)에서 geometry를 합치거나 인스턴싱을 쓰는 것이 효과가 있다.
- WebGPU를 쓸 수 있는 환경이라면 `WebGPURenderer`로 바꾸는 것만으로도 CPU 병목이 줄어들 여지가 있다.
