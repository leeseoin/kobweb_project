// AFRAME and THREE mock to prevent errors
if (typeof window !== 'undefined') {
  if (!(window as any).AFRAME) {
    (window as any).AFRAME = {
      registerComponent: () => {},
      registerSystem: () => {},
      registerGeometry: () => {},
      registerShader: () => {},
      registerPrimitive: () => {},
      utils: {
        device: {},
        coordinates: {}
      },
      components: {},
      systems: {}
    };
  }

  // THREE.js를 실제로 import
  if (!(window as any).THREE) {
    import('three').then((THREE) => {
      (window as any).THREE = THREE;
    });
  }
}

export {};
