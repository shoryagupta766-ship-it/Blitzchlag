// src/game/world/Road.js
import * as THREE from 'three';
import { ROAD, PALETTE } from '../config.js';
import { getDeviceTier } from '../utils/perf.js';
import { getRoadFrame } from '../utils/placement.js';

export class Road {
  constructor(scene) {
    this._scene = scene;
    this._meshes = [];
    const knots = ROAD.curvePoints.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    this.curve = new THREE.CatmullRomCurve3(knots, false, ROAD.curveType, ROAD.curveTension);
    
    this._buildRibbon();
    this._buildCentreLine();
    this._buildPosts();
    this._buildGround();
    this._buildPlaza();
  }

  _buildPlaza() {
    const frame = getRoadFrame(this.curve, 0.98);
    const geo = new THREE.CylinderGeometry(25, 25, 0.05, 32);
    const mat = new THREE.MeshLambertMaterial({ color: PALETTE.sandstone });
    const plaza = new THREE.Mesh(geo, mat);
    plaza.position.copy(frame.point);
    plaza.position.y += 0.01;
    this._scene.add(plaza);
    this._meshes.push(plaza);
  }

  /**
   * Flat ribbon following the curve. For every sample point we get
   * the tangent, compute a perpendicular "right" vector (tangent ×
   * world-up), then lay down two vertices at ± halfWidth.
   */
  _buildRibbon() {
    const SEG    = ROAD.segments;
    const HALF_W = ROAD.width / 2;
    const up     = new THREE.Vector3(0, 1, 0);
    const right  = new THREE.Vector3();

    const positions = new Float32Array((SEG + 1) * 2 * 3);
    const normals   = new Float32Array((SEG + 1) * 2 * 3);
    const indices   = [];

    for (let i = 0; i <= SEG; i++) {
      const t       = i / SEG;
      const point   = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t);
      right.crossVectors(tangent, up).normalize();

      const base = i * 6;

      positions[base]     = point.x - right.x * HALF_W;
      positions[base + 1] = point.y + 0.01;
      positions[base + 2] = point.z - right.z * HALF_W;

      positions[base + 3] = point.x + right.x * HALF_W;
      positions[base + 4] = point.y + 0.01;
      positions[base + 5] = point.z + right.z * HALF_W;

      normals[base]     = 0; normals[base + 1] = 1; normals[base + 2] = 0;
      normals[base + 3] = 0; normals[base + 4] = 1; normals[base + 5] = 0;

      if (i < SEG) {
        const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('normal',   new THREE.BufferAttribute(normals,   3));
    geo.setIndex(indices);

    const mat = new THREE.MeshLambertMaterial({ color: PALETTE.road });
    this._ribbon = new THREE.Mesh(geo, mat);
    this._scene.add(this._ribbon);
    this._meshes.push(this._ribbon);
  }

  /**
   * Dashed white line down the road centre.
   * computeLineDistances() is required for dashes to render.
   */
  _buildCentreLine() {
    const SAMPLES = 400;
    const pts = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      const p = this.curve.getPointAt(t);
      pts.push(new THREE.Vector3(p.x, p.y + 0.03, p.z));
    }

    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({
      color: PALETTE.roadLine, dashSize: 2, gapSize: 2,
    });

    this._centreLine = new THREE.Line(geo, mat);
    this._centreLine.computeLineDistances();
    this._scene.add(this._centreLine);
    this._meshes.push(this._centreLine);
  }

  /**
   * InstancedMesh bollards along both edges of the road.
   * One geometry + one material = one draw call for all ~120 posts.
   */
  _buildPosts() {
    const tier    = getDeviceTier();
    const spacing = tier === 'low' ? ROAD.postSpacing * 2 : ROAD.postSpacing;
    const arcLen  = this.curve.getLength();
    const count   = Math.floor(arcLen / spacing);
    const total   = count * 2;

    const geo = new THREE.CylinderGeometry(
      ROAD.postRadius, ROAD.postRadius, ROAD.postHeight, 6,
    );
    const mat = new THREE.MeshLambertMaterial({ color: PALETTE.post });

    this._posts = new THREE.InstancedMesh(geo, mat, total);

    const dummy = new THREE.Object3D();
    const up    = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3();
    const halfW = ROAD.width / 2 + 0.3;

    let idx = 0;
    for (let i = 0; i < count; i++) {
      const t       = i / count;
      const point   = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t);
      right.crossVectors(tangent, up).normalize();

      // Left post
      dummy.position.set(
        point.x - right.x * halfW,
        point.y + ROAD.postHeight / 2,
        point.z - right.z * halfW,
      );
      dummy.updateMatrix();
      this._posts.setMatrixAt(idx++, dummy.matrix);

      // Right post
      dummy.position.set(
        point.x + right.x * halfW,
        point.y + ROAD.postHeight / 2,
        point.z + right.z * halfW,
      );
      dummy.updateMatrix();
      this._posts.setMatrixAt(idx++, dummy.matrix);
    }

    this._posts.instanceMatrix.needsUpdate = true;
    this._scene.add(this._posts);
    this._meshes.push(this._posts);
  }

  /** Large flat plane beneath everything — the desert ground. */
  _buildGround() {
    const geo = new THREE.PlaneGeometry(500, 1200);
    const mat = new THREE.MeshLambertMaterial({ color: PALETTE.ground });

    this._ground = new THREE.Mesh(geo, mat);
    this._ground.rotation.x = -Math.PI / 2;
    this._ground.position.set(0, -0.05, -450);
    this._scene.add(this._ground);
    this._meshes.push(this._ground);
  }

  dispose() {
    this._meshes.forEach(obj => {
      this._scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    this._meshes.length = 0;
  }
}