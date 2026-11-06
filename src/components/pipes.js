import * as THREE from 'three';
import { membrane } from '../config.js';

export function createPipe(points, color, radius = membrane.pipe.radius) {
  if (!Array.isArray(points) || points.length < 2 || points.some((point) => !Array.isArray(point) || point.length !== 3 || !point.every(Number.isFinite)) ||
      !Number.isFinite(radius) || radius <= 0 || points.some((point, index) => index > 0 && point.every((value, axis) => value === points[index - 1][axis]))) {
    throw new TypeError('Pipa memerlukan minimal dua titik XYZ berbeda dan radius positif.');
  }
  const group = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)), false, 'centripetal');
  const pipe = new THREE.Mesh(
    new THREE.TubeGeometry(curve, membrane.pipe.tubularSegments, radius, membrane.pipe.radialSegments, false),
    new THREE.MeshStandardMaterial({ color, roughness: membrane.pipe.roughness, metalness: membrane.pipe.metalness }),
  );
  pipe.castShadow = true;
  pipe.receiveShadow = true;
  group.userData.curve = curve;
  group.add(pipe);
  return group;
}
