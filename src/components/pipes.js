import * as THREE from 'three';
import { membrane } from '../config.js';

export function createPipe(points, color, radius = membrane.pipe.radius, { gaps = [], flangeAt } = {}) {
  if (!Array.isArray(points) || points.length < 2 || points.some((point) => !Array.isArray(point) || point.length !== 3 || !point.every(Number.isFinite)) ||
      !Number.isFinite(radius) || radius <= 0 || points.some((point, index) => index > 0 && point.every((value, axis) => value === points[index - 1][axis]))) {
    throw new TypeError('Pipa memerlukan minimal dua titik XYZ berbeda dan radius positif.');
  }
  const group = new THREE.Group();
  const vertices = points.map((point) => new THREE.Vector3(...point));
  const curve = new THREE.CurvePath();
  let start = vertices[0];
  for (let index = 1; index < vertices.length - 1; index++) {
    const corner = vertices[index];
    const before = vertices[index - 1].clone().sub(corner);
    const after = vertices[index + 1].clone().sub(corner);
    const distance = Math.min(membrane.pipe.bendRadius, before.length() / 2, after.length() / 2);
    const entry = corner.clone().add(before.normalize().multiplyScalar(distance));
    const exit = corner.clone().add(after.normalize().multiplyScalar(distance));
    curve.add(new THREE.LineCurve3(start, entry));
    curve.add(new THREE.QuadraticBezierCurve3(entry, corner, exit));
    start = exit;
  }
  curve.add(new THREE.LineCurve3(start, vertices.at(-1)));
  // CurvePath.getPoint sudah menggunakan fraksi panjang, tanpa pemetaan ulang LUT.
  curve.getPointAt = (u, target) => curve.getPoint(u, target);
  curve.getTangentAt = (u, target) => curve.getTangent(u, target);
  const length = curve.getLength();
  const intervals = gaps.map(({ id, at, span }) => {
    if (!Number.isFinite(at) || !Number.isFinite(span) || span <= 0) throw new TypeError(`Sambungan ${id} tidak valid.`);
    const from = at - span / (2 * length), to = at + span / (2 * length);
    if (from < 0 || to > 1 || Math.abs(curve.getPointAt(from).distanceTo(curve.getPointAt(to)) - span) > 0.0001) {
      throw new RangeError(`Sambungan ${id} harus berada pada bagian lurus pipa.`);
    }
    return { id, from, to };
  }).sort((a, b) => a.from - b.from);
  const material = new THREE.MeshStandardMaterial({ color, roughness: membrane.pipe.roughness, metalness: membrane.pipe.metalness });
  const addSpan = (from, to) => {
    if (to <= from) return;
    const section = new THREE.Curve();
    section.getPoint = (t, target) => curve.getPointAt(from + t * (to - from), target);
    const pipe = new THREE.Mesh(new THREE.TubeGeometry(section, membrane.pipe.tubularSegments, radius, membrane.pipe.radialSegments, false), material);
    pipe.castShadow = pipe.receiveShadow = true;
    pipe.userData.pipeSpan = { from, to };
    group.add(pipe);
  };
  let cursor = 0;
  for (const interval of intervals) {
    if (interval.from < cursor) throw new RangeError(`Sambungan ${interval.id} bertumpuk.`);
    addSpan(cursor, interval.from);
    cursor = interval.to;
  }
  addSpan(cursor, 1);
  if (flangeAt !== undefined) {
    const style = membrane.pipe.flange;
    const flange = new THREE.Mesh(new THREE.TorusGeometry(style.radius, style.tube, style.radialSegments, style.tubularSegments), new THREE.MeshStandardMaterial({ color: membrane.colors.metal, ...membrane.material }));
    flange.position.copy(curve.getPointAt(flangeAt));
    flange.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), curve.getTangentAt(flangeAt));
    flange.castShadow = true;
    group.add(flange);
  }
  group.userData.curve = curve;
  group.userData.gaps = intervals;
  return group;
}
